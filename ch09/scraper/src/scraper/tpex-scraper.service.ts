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

  async fetchInstInvestorsTrades(date: string) {
    const dt = DateTime.fromISO(date);
    const d = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d, t: 'D', o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/3insti/3insti_summary/3itrdsum_result.php?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    if (!responseData) return null;

    const raw = responseData.aaData
      .map(data => data.slice(1)).flat()
      .map(data => numeral(data).value() || +data);

    const [
      foreignInvestorsBuy,
      foreignInvestorsSell,
      foreignInvestorsNetBuySell,
      foreignDealersExcludedBuy,
      foreignDealersExcludedSell,
      foreignDealersExcludedNetBuySell,
      foreignDealersBuy,
      foreignDealersSell,
      foreignDealersNetBuySell,
      sitcBuy,
      sitcSell,
      sitcNetBuySell,
      dealersBuy,
      dealersSell,
      dealersNetBuySell,
      dealersProprietaryBuy,
      dealersProprietarySell,
      dealersProprietaryNetBuySell,
      dealersHedgeBuy,
      dealersHedgeSell,
      dealersHedgeNetBuySell,
    ] = raw;

    return {
      date,
      foreignDealersExcludedBuy,
      foreignDealersExcludedSell,
      foreignDealersExcludedNetBuySell,
      foreignDealersBuy,
      foreignDealersSell,
      foreignDealersNetBuySell,
      foreignInvestorsBuy,
      foreignInvestorsSell,
      foreignInvestorsNetBuySell,
      sitcBuy,
      sitcSell,
      sitcNetBuySell,
      dealersProprietaryBuy,
      dealersProprietarySell,
      dealersProprietaryNetBuySell,
      dealersHedgeBuy,
      dealersHedgeSell,
      dealersHedgeNetBuySell,
      dealersBuy,
      dealersSell,
      dealersNetBuySell,
    };
  }
}
