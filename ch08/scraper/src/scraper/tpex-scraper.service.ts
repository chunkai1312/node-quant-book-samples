import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TpexScraperService {
  constructor(private httpService: HttpService) {}

  async fetchMarketTrades(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_index/st41_result.php?${query}`;

    const data = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    return data?.aaData
      ?.map(row => {
        const [ date, ...values ] = row;
        const [ year, month, day ] = date.split('/');
        const formattedDate = `${+year + 1911}-${month}-${day}`;

        const [ tradeVolume, tradeValue, transaction, price, change ]
          = values.map(value => numeral(value).value());

        return {
          date: formattedDate,
          tradeVolume,
          tradeValue,
          transaction,
          price,
          change,
        };
      })
      ?.find(data => data.date === date) ?? null;
  }

  async fetchMarketBreadth(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/market_highlight/highlight_result.php?${query}`;

    const data = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    return data ? {
      date,
      up: numeral(data.upNum).value(),
      limitUp: numeral(data.upStopNum).value(),
      down: numeral(data.downNum).value(),
      limitDown: numeral(data.downStopNum).value(),
      unchanged: numeral(data.noChangeNum).value(),
      unmatched: numeral(data.noTradeNum).value(),
    } : null;
  }
}
