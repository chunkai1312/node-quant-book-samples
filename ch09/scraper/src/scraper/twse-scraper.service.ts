import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TwseScraperService {
  constructor(private httpService: HttpService) {}

  async fetchListedStocks(options?: { market: 'TSE' | 'OTC' }) {
    const tse = 'https://isin.twse.com.tw/isin/class_main.jsp?market=1&issuetype=1';
    const otc = 'https://isin.twse.com.tw/isin/class_main.jsp?market=2&issuetype=4';
    const url = (options?.market === 'OTC') ? otc : tse;

    const page = await firstValueFrom(
      this.httpService.get(url, { responseType: 'arraybuffer' }),
    ).then((response) => iconv.decode(response.data, 'big5'));

    const $ = cheerio.load(page);

    return $('.h4 tr').slice(1).map((_, el) => {
      const td = $(el).find('td');
      return {
        symbol: td.eq(2).text().trim(),
        name: td.eq(3).text().trim(),
        market: td.eq(4).text().trim(),
        industry: td.eq(6).text().trim(),
      };
    }).toArray();
  }

  async fetchMarketTrades(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/FMTQIK?${query}`;

    const data = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') && response.data);

    return data?.data
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
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/MI_INDEX?${query}`;

    const data = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') && response.data);

    const raw = data?.tables[7]?.data?.map(row => row[2]);
    const [ up, limitUp ] = raw[0].replace(')', '').split('(').map(value => numeral(value).value());
    const [ down, limitDown ] = raw[1].replace(')', '').split('(').map(value => numeral(value).value());
    const [ unchanged, unmatched, notApplicable ] = raw.slice(2).map(value => numeral(value).value());

    return {
      date,
      up,
      limitUp,
      down,
      limitDown,
      unchanged,
      unmatched: (unmatched + notApplicable),
    };
  }

  async fetchInstInvestorsTrades(date: string) {
    const dayDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ dayDate, type: 'day', response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/fund/BFI82U?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') && response.data);

    if (!responseData) return null;

    const raw = responseData.data
      .map(data => data.slice(1)).flat()
      .map(data => numeral(data).value() || +data);

    const [
      dealersProprietaryBuy,
      dealersProprietarySell,
      dealersProprietaryNetBuySell,
      dealersHedgeBuy,
      dealersHedgeSell,
      dealersHedgeNetBuySell,
      sitcBuy,
      sitcSell,
      sitcNetBuySell,
      foreignDealersExcludedBuy,
      foreignDealersExcludedSell,
      foreignDealersExcludedNetBuySell,
      foreignDealersBuy,
      foreignDealersSell,
      foreignDealersNetBuySell,
    ] = raw;

    const foreignInvestorsBuy = foreignDealersExcludedBuy + foreignDealersBuy;
    const foreignInvestorsSell = foreignDealersExcludedSell + foreignDealersSell;
    const foreignInvestorsNetBuySell = foreignDealersExcludedNetBuySell + foreignDealersNetBuySell;
    const dealersBuy = dealersProprietaryBuy + dealersHedgeBuy;
    const dealersSell = dealersProprietarySell + dealersHedgeSell;
    const dealersNetBuySell = dealersProprietaryNetBuySell + dealersHedgeNetBuySell;

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
