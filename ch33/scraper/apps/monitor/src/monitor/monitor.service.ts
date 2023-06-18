import { Injectable, Logger, NotFoundException, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { InjectWebSocketClient } from '@fugle/marketdata-nest';
import { InjectLineNotify, LineNotify } from 'nest-line-notify';
import { Redis } from 'ioredis';
import { DateTime } from 'luxon';
import { WebSocketClient } from '@fugle/marketdata';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';
import { MonitorRepository } from './monitor.repository';
import { Monitor } from './monitor.schema';

@Injectable()
export class MonitorService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly subscriptions = new Set<string>();

  constructor(
    @InjectRedis() private readonly redis: Redis,
    @InjectWebSocketClient() private readonly client: WebSocketClient,
    @InjectLineNotify() private readonly lineNotify: LineNotify,
    private readonly monitorRepository: MonitorRepository,
  ) {}

  async onApplicationBootstrap() {
    this.client.stock.connect()
      .then(() => this.monitorRepository.findAll({ triggered: false }))
      .then(monitors => monitors.map(monitor => this.monitor(monitor)));
  }

  async onApplicationShutdown() {
    this.client.stock.disconnect();
  }

  async create(createMonitorDto: CreateMonitorDto) {
    const monitor = await this.monitorRepository.create(createMonitorDto);
    await this.monitor(monitor);
    return monitor;
  }

  async findAll() {
    return this.monitorRepository.findAll();
  }

  async findOne(id: string) {
    return this.monitorRepository.findOne(id);
  }

  async update(id: string, updateMonitorDto: UpdateMonitorDto) {
    const monitor = await this.monitorRepository.update(id, updateMonitorDto);
    if (!monitor) throw new NotFoundException('monitor not found');
    return monitor;
  }

  async remove(id: string) {
    const monitor = await this.monitorRepository.remove(id);
    if (!monitor) throw new NotFoundException('monitor not found');
    await this.unmonitor(monitor);
    return monitor;
  }

  private async monitor(monitor: Monitor) {
    const { _id, symbol, type, value } = monitor;
    const key = `monitors:${_id}`;
    const monitable = `monitors:${symbol}:${type}`;

    await this.redis.multi()
      .set(key, JSON.stringify(monitor))
      .zadd(monitable, value, key)
      .exec();

    if (this.subscriptions.has(symbol)) return;

    this.client.stock.subscribe({ channel: 'aggregates', symbol });

    this.client.stock.on('message', (message) => {
      const { event, data } = JSON.parse(message);
      if (event === 'data' || event === 'snapshot') this.checkMatches(data);
    });

    this.subscriptions.add(symbol);
  }

  private async unmonitor(monitor: Monitor) {
    const { _id, symbol, type } = monitor;
    const key = `monitors:${_id}`;
    const monitable = `monitors:${symbol}:${type}`;

    await this.redis.multi()
      .zrem(monitable, key)
      .del(key)
      .exec();
  }

  private async checkMatches(data: any) {
    const { symbol, lastTrade, lastUpdated } = data;
    if (lastTrade?.time !== lastUpdated) return;

    const matches = await Promise.all([
      this.redis.zrange(`monitors:${symbol}:price:gt`, '-inf', lastTrade.price, 'BYSCORE'),
      this.redis.zrange(`monitors:${symbol}:price:lt`, lastTrade.price, '+inf', 'BYSCORE'),
    ]).then(members => [].concat.apply([], members));

    if (!matches.length) return;

    const monitors = await this.redis.mget(matches)
      .then(results => results.map(data => JSON.parse(data)));

    for (const monitor of monitors) {
      await this.unmonitor(monitor);
      await this.sendNotification(monitor, data);
    }
  }

  private async sendNotification(monitor: Monitor, data: Record<string, any>) {
    const { _id, title } = monitor;
    const { symbol, name, lastTrade, total } = data;
    const time = DateTime
      .fromMillis(Math.floor(lastTrade.time / 1000))
      .toFormat('yyyy/MM/dd HH:mm:ss');

    const message = [''].concat([
      `<<${title}>>`,
      `${name} (${symbol})`,
      `成交價: ${lastTrade.price}`,
      `成交量: ${total.tradeVolume}`,
      `時間: ${time}`,
    ]).join('\n');

    await this.lineNotify.send({ message })
      .then(() => this.monitorRepository.update(_id, { ...monitor, triggered: true }))
      .catch((err) => Logger.error(err.message, err.stack, MonitorService.name));
  }
}
