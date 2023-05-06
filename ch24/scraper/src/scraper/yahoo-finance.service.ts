import { default as yahooFinance } from 'yahoo-finance2';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class YahooFinanceService {

  async fetchUsStockMarketIndices(date: string) {
    const dt = DateTime.fromISO(date).endOf('day');
    const symbols = ['^DJI', '^GSPC', '^IXIC', '^SOX'];

    try {
      const results = await Promise.all(symbols.map(symbol => (
        yahooFinance.historical(symbol, {
          period1: dt.toISODate(),
          period2: dt.plus({ day: 1 }).toISODate(),
        })
        .then(result => result.find(data => DateTime.fromJSDate(data.date).toISODate() === date))
      )));
      const [ dow30, sp500, nasdaq, sox ] = results;
      return { date, dow30, sp500, nasdaq, sox };
    } catch (err) {
      return null;
    }
  }
}
