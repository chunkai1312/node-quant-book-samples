import * as _ from 'lodash';
import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { getTwseIndexSymbolByName } from '@speculator/common';

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

  async fetchMarginTransactions(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, selectType: 'MS', response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/marginTrading/MI_MARGN?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const raw = responseData.tables[0].data
      .map(data => data.slice(1)).flat()
      .map(data => numeral(data).value() || +data);

    const [
      marginPurchase,
      marginSale,
      cashRedemption,
      marginBalancePrev,
      marginBalance,
      shortCovering,
      shortSale,
      stockRedemption,
      shortBalancePrev,
      shortBalance,
      marginPurchaseValue,
      marginSaleValue,
      cashRedemptionValue,
      marginBalanceValuePrev,
      marginBalanceValue,
    ] = raw;

    const marginBalanceChange = marginBalance - marginBalancePrev;
    const marginBalanceValueChange = marginBalanceValue - marginBalanceValuePrev;
    const shortBalanceChange = shortBalance - shortBalancePrev;

    return {
      date,
      marginBalance,
      marginBalanceChange,
      marginBalanceValue,
      marginBalanceValueChange,
      shortBalance,
      shortBalanceChange,
    };
  }

  async fetchIndicesQuotes(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/TAIEX/MI_5MINS_INDEX?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const quotes = responseData.data.reduce((quotes, row) => {
      const [
        time,
        IX0001,
        IX0007,
        IX0008,
        IX0009,
        IX0010,
        IX0011,
        IX0012,
        IX0016,
        IX0017,
        IX0018,
        IX0019,
        IX0020,
        IX0021,
        IX0022,
        IX0023,
        IX0024,
        IX0025,
        IX0026,
        IX0027,
        IX0028,
        IX0029,
        IX0030,
        IX0031,
        IX0032,
        IX0033,
        IX0034,
        IX0035,
        IX0036,
        IX0037,
        IX0038,
        IX0039,
        IX0040,
        IX0041,
        IX0042,
      ] = row;

      return [
        ...quotes,
        { date, time, symbol: 'IX0001', name: '發行量加權股價指數', price: numeral(IX0001).value()},
        { date, time, symbol: 'IX0007', name: '未含金融保險股指數', price: numeral(IX0007).value()},
        { date, time, symbol: 'IX0008', name: '未含電子股指數', price: numeral(IX0008).value()},
        { date, time, symbol: 'IX0009', name: '未含金融電子股指數', price: numeral(IX0009).value()},
        { date, time, symbol: 'IX0010', name: '水泥類指數', price: numeral(IX0010).value()},
        { date, time, symbol: 'IX0011', name: '食品類指數', price: numeral(IX0011).value()},
        { date, time, symbol: 'IX0012', name: '塑膠類指數', price: numeral(IX0012).value()},
        { date, time, symbol: 'IX0016', name: '紡織纖維類指數', price: numeral(IX0016).value()},
        { date, time, symbol: 'IX0017', name: '電機機械類指數', price: numeral(IX0017).value()},
        { date, time, symbol: 'IX0018', name: '電器電纜類指數', price: numeral(IX0018).value()},
        { date, time, symbol: 'IX0019', name: '化學生技醫療類指數', price: numeral(IX0019).value()},
        { date, time, symbol: 'IX0020', name: '化學類指數', price: numeral(IX0020).value()},
        { date, time, symbol: 'IX0021', name: '生技醫療類指數', price: numeral(IX0021).value()},
        { date, time, symbol: 'IX0022', name: '玻璃陶瓷類指數', price: numeral(IX0022).value()},
        { date, time, symbol: 'IX0023', name: '造紙類指數', price: numeral(IX0023).value()},
        { date, time, symbol: 'IX0024', name: '鋼鐵類指數', price: numeral(IX0024).value()},
        { date, time, symbol: 'IX0025', name: '橡膠類指數', price: numeral(IX0025).value()},
        { date, time, symbol: 'IX0026', name: '汽車類指數', price: numeral(IX0026).value()},
        { date, time, symbol: 'IX0027', name: '電子工業類指數', price: numeral(IX0027).value()},
        { date, time, symbol: 'IX0028', name: '半導體類指數', price: numeral(IX0028).value()},
        { date, time, symbol: 'IX0029', name: '電腦及週邊設備類指數', price: numeral(IX0029).value()},
        { date, time, symbol: 'IX0030', name: '光電類指數', price: numeral(IX0030).value()},
        { date, time, symbol: 'IX0031', name: '通信網路類指數', price: numeral(IX0031).value()},
        { date, time, symbol: 'IX0032', name: '電子零組件類指數', price: numeral(IX0032).value()},
        { date, time, symbol: 'IX0033', name: '電子通路類指數', price: numeral(IX0033).value()},
        { date, time, symbol: 'IX0034', name: '資訊服務類指數', price: numeral(IX0034).value()},
        { date, time, symbol: 'IX0035', name: '其他電子類指數', price: numeral(IX0035).value()},
        { date, time, symbol: 'IX0036', name: '建材營造類指數', price: numeral(IX0036).value()},
        { date, time, symbol: 'IX0037', name: '航運類指數', price: numeral(IX0037).value()},
        { date, time, symbol: 'IX0038', name: '觀光類指數', price: numeral(IX0038).value()},
        { date, time, symbol: 'IX0039', name: '金融保險類指數', price: numeral(IX0039).value()},
        { date, time, symbol: 'IX0040', name: '貿易百貨類指數', price: numeral(IX0040).value()},
        { date, time, symbol: 'IX0041', name: '油電燃氣類指數', price: numeral(IX0041).value()},
        { date, time, symbol: 'IX0042', name: '其他類指數', price: numeral(IX0042).value()},
      ];
    }, []);

    const data = _(quotes)
      .groupBy('symbol')
      .map((data: any[]) => {
        const [ prev, ...quotes ] = data;
        const { date, symbol, name } = prev;
        const openPrice = _.minBy(quotes, 'time').price;
        const highPrice = _.maxBy(quotes, 'price').price;
        const lowPrice = _.minBy(quotes, 'price').price;
        const closePrice = _.maxBy(quotes, 'time').price;
        const referencePrice = prev.price;
        const change = numeral(closePrice).subtract(referencePrice).value();
        const changePercent = +numeral(change).divide(referencePrice).multiply(100).format('0.00');

        return {
          date,
          symbol,
          name,
          openPrice,
          highPrice,
          lowPrice,
          closePrice,
          change,
          changePercent,
        };
      })
      .value();

    return data;
  }

  async fetchIndicesTrades(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, response: 'json' });
    const url = `https://www.twse.com.tw/rwd/zh/afterTrading/BFIAMU?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const market = await this.fetchMarketTrades(date);

    const data = responseData.data.map(row => {
      const [
        name,
        tradeVolume,
        tradeValue,
        transaction,
        change,
      ] = row;
      return {
        date,
        symbol: getTwseIndexSymbolByName(name.trim()),
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        tradeWeight: +numeral(tradeValue).divide(market.tradeValue).multiply(100).format('0.00'),
      };
    });

    return data;
  }

  async fetchEquitiesQuotes(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, type: 'ALLBUT0999', response: 'json' });
    const url = `https://www.twse.com.tw/exchangeReport/MI_INDEX?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.stat === 'OK') ? response.data : null);

    if (!responseData) return null;

    const data = responseData.data9.map(row => {
      const [ symbol, name, ...values ] = row;
      const [
        tradeVolume,
        transaction,
        tradeValue,
        openPrice,
        highPrice,
        lowPrice,
        closePrice,
      ] = values.slice(0, 7).map(value => numeral(value).value());

      const change = values[7].includes('green')
        ? numeral(values[8]).multiply(-1).value()
        : numeral(values[8]).value();

      const referencePrice = closePrice && numeral(closePrice).subtract(change).value();
      const changePercent = closePrice  && +numeral(change).divide(referencePrice).multiply(100).format('0.00');

      return {
        date,
        symbol,
        name,
        openPrice,
        highPrice,
        lowPrice,
        closePrice,
        change,
        changePercent,
        tradeVolume,
        tradeValue,
        transaction,
      };
    });

    return data;
  }

  async fetchEquitiesInstInvestorsTrades(date: string) {
    const formattedDate = DateTime.fromISO(date).toFormat('yyyyMMdd');
    const query = new URLSearchParams({ date: formattedDate, response: 'json', selectType: 'ALLBUT0999' });
    const url = `https://www.twse.com.tw/rwd/zh/fund/T86?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then((response) => (response.data.stat === 'OK' ? response.data : null));

    if (!responseData) return null;

    const data = responseData.data.reduce((tickers, row) => {
      const [ symbol, name, ...values ] = row;
      const [
        foreignDealersExcludedBuy,
        foreignDealersExcludedSell,
        foreignDealersExcludedNetBuySell,
        foreignDealersBuy,
        foreignDealersSell,
        foreignDealersNetBuySell,
        sitcBuy,
        sitcSell,
        sitcNetBuySell,
        dealersNetBuySell,
        dealersProprietaryBuy,
        dealersProprietarySell,
        dealersProprietaryNetBuySell,
        dealersHedgeBuy,
        dealersHedgeSell,
        dealersHedgeNetBuySell,
        instInvestorsNetBuySell,
      ] = values.map(value => numeral(value).value());

      const foreignInvestorsBuy = foreignDealersExcludedBuy + foreignDealersBuy;
      const foreignInvestorsSell = foreignDealersExcludedSell + foreignDealersSell;
      const foreignInvestorsNetBuySell = foreignDealersExcludedNetBuySell + foreignDealersNetBuySell;
      const dealersBuy = dealersProprietaryBuy + dealersHedgeBuy;
      const dealersSell = dealersProprietarySell + dealersHedgeSell;

      const ticker = {
        date,
        symbol,
        name: name.trim(),
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
      return [ ...tickers, ticker ];
    }, []);

    return data;
  }
}
