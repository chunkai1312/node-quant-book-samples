import * as _ from 'lodash';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Index, getTpexIndexSymbolByName, isWarrant } from '@speculator/common';

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

  async fetchMarginTransactions(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/margin_trading/margin_balance/margin_bal_result.php?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) && response.data);

    if (!responseData) return null;

    const raw = [
      ...responseData.tfootData_one,
      ...responseData.tfootData_two
    ]
      .map(data => numeral(data).value())
      .filter(data => data);

    const [
      marginBalancePrev,
      marginPurchase,
      marginSale,
      cashRedemption,
      marginBalance,
      shortBalancePrev,
      shortCovering,
      shortSale,
      stockRedemption,
      shortBalance,
      marginBalanceValuePrev,
      marginPurchaseValue,
      marginSaleValue,
      cashRedemptionValue,
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
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/iNdex_info/minute_index/1MIN_result.php?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const quotes = responseData.aaData.reduce((quotes, row) => {
      const [
        time,
        IX0044,
        IX0045,
        IX0046,
        IX0048,
        IX0049,
        IX0050,
        IX0100,
        IX0051,
        IX0052,
        IX0053,
        IX0054,
        IX0055,
        IX0056,
        IX0057,
        IX0058,
        IX0059,
        IX0099,
        IX0075,
        IX0047,
        IX0043,
        tradeValue,
        tradeVolume,
        transaction,
        bidOrders,
        askOrders,
        bidVolume,
        askVolume,
      ] = row;

      return [
        ...quotes,
        { date, time, symbol: 'IX0044', name: '櫃檯紡纖類指數', price: numeral(IX0044).value() },
        { date, time, symbol: 'IX0045', name: '櫃檯機械類指數', price: numeral(IX0045).value() },
        { date, time, symbol: 'IX0046', name: '櫃檯鋼鐵類指數', price: numeral(IX0046).value() },
        { date, time, symbol: 'IX0048', name: '櫃檯營建類指數', price: numeral(IX0048).value() },
        { date, time, symbol: 'IX0049', name: '櫃檯航運類指數', price: numeral(IX0049).value() },
        { date, time, symbol: 'IX0050', name: '櫃檯觀光類指數', price: numeral(IX0050).value() },
        { date, time, symbol: 'IX0100', name: '櫃檯其他類指數', price: numeral(IX0100).value() },
        { date, time, symbol: 'IX0051', name: '櫃檯化工類指數', price: numeral(IX0051).value() },
        { date, time, symbol: 'IX0052', name: '櫃檯生技醫療類指數', price: numeral(IX0052).value() },
        { date, time, symbol: 'IX0053', name: '櫃檯半導體類指數', price: numeral(IX0053).value() },
        { date, time, symbol: 'IX0054', name: '櫃檯電腦及週邊類指數', price: numeral(IX0054).value() },
        { date, time, symbol: 'IX0055', name: '櫃檯光電業類指數', price: numeral(IX0055).value() },
        { date, time, symbol: 'IX0056', name: '櫃檯通信網路類指數', price: numeral(IX0056).value() },
        { date, time, symbol: 'IX0057', name: '櫃檯電子零組件類指數', price: numeral(IX0057).value() },
        { date, time, symbol: 'IX0058', name: '櫃檯電子通路類指數', price: numeral(IX0058).value() },
        { date, time, symbol: 'IX0059', name: '櫃檯資訊服務類指數', price: numeral(IX0059).value() },
        { date, time, symbol: 'IX0099', name: '櫃檯其他電子類指數', price: numeral(IX0099).value() },
        { date, time, symbol: 'IX0075', name: '櫃檯文化創意業類指數', price: numeral(IX0075).value() },
        { date, time, symbol: 'IX0047', name: '櫃檯電子類指數', price: numeral(IX0047).value() },
        { date, time, symbol: 'IX0043', name: '櫃檯指數', price: numeral(IX0043).value() },
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
    const dt = DateTime.fromISO(date);
    const year = dt.get('year') - 1911;
    const formattedDate = `${year}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/historical/trading_vol_ratio/sectr_result.php?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const indices = responseData.aaData.map(row => {
      const [
        name,
        tradeValue,
        tradeValueWeight,
        tradeVolume,
        tradeVolumeWeight,
      ] = row;
      return {
        date,
        symbol: getTpexIndexSymbolByName(name),
        tradeVolume: numeral(tradeVolume).value(),
        tradeValue: numeral(tradeValue).value(),
        tradeWeight: numeral(tradeValueWeight).value(),
      };
    });

    const electronic = indices.reduce((trades, data) => {
      return [
        Index.TPExSemiconductors,
        Index.TPExComputerAndPeripheralEquipment,
        Index.TPExOptoelectronic,
        Index.TPExCommunicationsAndInternet,
        Index.TPExElectronicPartsComponents,
        Index.TPExElectronicProductsDistribution,
        Index.TPExInformationService,
        Index.TPExOtherElectronic,
      ].includes(data.symbol)
        ? { ...trades,
          tradeVolume: trades.tradeVolume + data.tradeVolume,
          tradeValue: trades.tradeValue + data.tradeValue,
          tradeWeight: trades.tradeWeight + data.tradeWeight,
        } : trades;
    }, { date, symbol: Index.TPExElectronic, tradeVolume: 0, tradeValue: 0, tradeWeight: 0 });

    indices.push(electronic);

    const data = indices.filter(index => index.symbol);

    return data;
  }

  async fetchEquitiesQuotes(date: string) {
    const dt = DateTime.fromISO(date);
    const formattedDate = `${dt.get('year') - 1911}/${dt.toFormat('MM/dd')}`;
    const query = new URLSearchParams({ d: formattedDate, o: 'json' });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_close_quotes/stk_quote_result.php?${query}`;

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => (response.data.iTotalRecords > 0) ? response.data : null);

    if (!responseData) return null;

    const data = responseData.aaData
      .filter(row => !isWarrant(row[0]))
      .map(row => {
        const [ symbol, name, ...values ] = row;
        const [
          closePrice,
          change,
          openPrice,
          highPrice,
          lowPrice,
          avgPrice,
          tradeVolume,
          tradeValue,
          transaction,
        ] = values.slice(0, 9).map(value => numeral(value).value());

        const referencePrice = (closePrice && change !== null) && numeral(closePrice).subtract(change).value() || null;
        const changePercent = (closePrice && change !== null) && +numeral(change).divide(referencePrice).multiply(100).format('0.00') || null;

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
}
