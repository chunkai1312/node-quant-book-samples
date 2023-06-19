import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Monitor, MonitorDocument } from './monitor.schema';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitorRepository {
  constructor(
    @InjectModel(Monitor.name) private readonly model: Model<MonitorDocument>,
  ) {}

  async create(createMonitorDto: CreateMonitorDto) {
    return this.model.create(createMonitorDto);
  }

  async findAll(filter?: FilterQuery<Monitor>) {
    return this.model.find(filter);
  }

  async findOne(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, updateMonitorDto: UpdateMonitorDto) {
    return this.model.findByIdAndUpdate(id, updateMonitorDto, { new: true });
  }

  async remove(id: string) {
    return this.model.findByIdAndRemove(id);
  }
}
