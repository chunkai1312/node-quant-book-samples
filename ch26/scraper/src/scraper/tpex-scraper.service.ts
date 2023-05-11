import * as _ from 'lodash';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Index, getIndexName, isWarrant } from '@speculator/common';

@Injectable()
export class TpexScraperService {
  constructor(private httpService: HttpService) {}

  async fetchMarketTrades(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_index/st41_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    return json.aaData.map(row => {
      const [year, month, day] = row[0].split('/');
      return {
        date: `${+year + 1911}-${month}-${day}`,
        tradeVolume: numeral(row[1]).value(),
        tradeValue: numeral(row[2]).value(),
        transaction: numeral(row[3]).value(),
        price: numeral(row[4]).value(),
        change: numeral(row[5]).value(),
      };
    }).find(data => data.date === date);
  }

  async fetchMarketBreadth(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/market_highlight/highlight_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    return {
      date,
      up: numeral(json.upNum).value(),
      limitUp: numeral(json.upStopNum).value(),
      down: numeral(json.downNum).value(),
      limitDown: numeral(json.downStopNum).value(),
      unchanged: numeral(json.noChangeNum).value(),
      unmatched: numeral(json.noTradeNum).value(),
    };
  }

  async fetchInstInvestorsTrades(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      t: 'D',
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/3insti/3insti_summary/3itrdsum_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    const data = json.aaData
      .map(row => row.slice(1)).flat()
      .map(row => numeral(row).value());

    return {
      date,
      finiNetBuySell: data[2],
      sitcNetBuySell: data[11],
      dealersNetBuySell: data[14],
    };
  }

  async fetchMarginTransactions(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/margin_trading/margin_balance/margin_bal_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    const data = [...json.tfootData_one, ...json.tfootData_two]
      .map(row => numeral(row).value())
      .filter(row => row);

    return {
      date,
      marginBalance: data[4],
      marginBalanceChange: data[4] - data[0],
      marginBalanceValue: data[14],
      marginBalanceValueChange: data[14] - data[10],
      shortBalance: data[9],
      shortBalanceChange: data[9] - data[5],
    };
  }

  async fetchIndicesQuotes(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/iNdex_info/minute_index/1MIN_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    const quotes = json.aaData.flatMap(row => {
      const [time, ...values] = row;
      const indices = values.slice(0, -7).map(index => numeral(index).value());
      return [
        { date, time, symbol: 'IX0044', name: '櫃檯紡纖類指數', price: indices[0] },
        { date, time, symbol: 'IX0045', name: '櫃檯機械類指數', price: indices[1] },
        { date, time, symbol: 'IX0046', name: '櫃檯鋼鐵類指數', price: indices[2] },
        { date, time, symbol: 'IX0048', name: '櫃檯營建類指數', price: indices[3] },
        { date, time, symbol: 'IX0049', name: '櫃檯航運類指數', price: indices[4] },
        { date, time, symbol: 'IX0050', name: '櫃檯觀光類指數', price: indices[5] },
        { date, time, symbol: 'IX0100', name: '櫃檯其他類指數', price: indices[6] },
        { date, time, symbol: 'IX0051', name: '櫃檯化工類指數', price: indices[7] },
        { date, time, symbol: 'IX0052', name: '櫃檯生技醫療類指數', price: indices[8] },
        { date, time, symbol: 'IX0053', name: '櫃檯半導體類指數', price: indices[9] },
        { date, time, symbol: 'IX0054', name: '櫃檯電腦及週邊類指數', price: indices[10] },
        { date, time, symbol: 'IX0055', name: '櫃檯光電業類指數', price: indices[11] },
        { date, time, symbol: 'IX0056', name: '櫃檯通信網路類指數', price: indices[12] },
        { date, time, symbol: 'IX0057', name: '櫃檯電子零組件類指數', price: indices[13] },
        { date, time, symbol: 'IX0058', name: '櫃檯電子通路類指數', price: indices[14] },
        { date, time, symbol: 'IX0059', name: '櫃檯資訊服務類指數', price: indices[15] },
        { date, time, symbol: 'IX0099', name: '櫃檯其他電子類指數', price: indices[16] },
        { date, time, symbol: 'IX0075', name: '櫃檯文化創意業類指數', price: indices[17] },
        { date, time, symbol: 'IX0047', name: '櫃檯電子類指數', price: indices[18] },
        { date, time, symbol: 'IX0043', name: '櫃檯指數', price: indices[19] },
      ];
    });

    return _(quotes).groupBy('symbol')
      .map((quotes: any[]) => {
        const [prev, ...rows] = quotes;
        const { date, symbol, name } = prev;
        const data: Record<string, any> = { date, symbol, name};
        data.openPrice = _.minBy(rows, 'time').price;
        data.highPrice = _.maxBy(rows, 'price').price;
        data.lowPrice = _.minBy(rows, 'price').price;
        data.closePrice = _.maxBy(rows, 'time').price;
        data.change = numeral(data.closePrice).subtract(prev.price).value();
        data.changePercent = +numeral(data.change).divide(prev.price).multiply(100).format('0.00');
        return data;
      }).value();
  }

  async fetchIndicesTrades(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/historical/trading_vol_ratio/sectr_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    const symbolMappings = {
      '光電業': Index.TPExOptoelectronic,
      '其他': Index.TPExOther,
      '其他電子業': Index.TPExOtherElectronic,
      '化學工業': Index.TPExChemical,
      '半導體業': Index.TPExSemiconductors,
      '建材營造': Index.TPExBuildingMaterialsAndConstruction,
      '文化創意業': Index.TPExCulturalAndCreative,
      '生技醫療': Index.TPExBiotechnologyAndMedicalCare,
      '紡織纖維': Index.TPExTextiles,
      '航運業': Index.TPExShippingAndTransportation,
      '觀光事業': Index.TPExTourism,
      '資訊服務業': Index.TPExInformationService,
      '通信網路業': Index.TPExCommunicationsAndInternet,
      '鋼鐵工業': Index.TPExIronAndSteel,
      '電子通路業': Index.TPExElectronicProductsDistribution,
      '電子零組件業': Index.TPExElectronicPartsComponents,
      '電機機械': Index.TPExElectricMachinery,
      '電腦及週邊設備業': Index.TPExComputerAndPeripheralEquipment,
    };

    const electronicSymbols = [
      Index.TPExSemiconductors,
      Index.TPExComputerAndPeripheralEquipment,
      Index.TPExOptoelectronic,
      Index.TPExCommunicationsAndInternet,
      Index.TPExElectronicPartsComponents,
      Index.TPExElectronicProductsDistribution,
      Index.TPExInformationService,
      Index.TPExOtherElectronic,
    ];

    const data = json.aaData.map(row => {
      const [name, ...values]= row;
      const symbol = symbolMappings[name];
      const [tradeValue, tradeWeight] = values.map(value => numeral(value).value());
      return { date, symbol, name: getIndexName(symbol), tradeValue, tradeWeight };
    });

    const [electronic] = _(data)
      .filter(data => electronicSymbols.includes(data.symbol))
      .groupBy(_ => Index.TPExElectronic)
      .map((data, symbol) => ({
        date,
        symbol,
        name: getIndexName(symbol),
        tradeValue: _.sumBy(data, 'tradeValue'),
        tradeWeight: +numeral(_.sumBy(data, 'tradeWeight')).format('0.00'),
      }))
      .value();

    return [...data, electronic].filter(index => index.symbol);
  }

  async fetchEquitiesQuotes(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_close_quotes/stk_quote_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    return json.aaData
      .filter(row => !isWarrant(row[0]))
      .map(row => {
        const [symbol, name, ...values] = row;
        const data: Record<string, any> = { date, symbol, name };
        data.closePrice = numeral(values[0]).value();
        data.openPrice = numeral(values[2]).value();
        data.highPrice = numeral(values[3]).value();
        data.lowPrice = numeral(values[4]).value();
        data.tradeVolume = numeral(values[6]).value();
        data.tradeValue = numeral(values[7]).value();
        data.transaction = numeral(values[8]).value();
        data.change = numeral(values[1]).value();
        data.changePercent = (data.closePrice && data.change !== null)
          ? +numeral(data.change).divide(data.closePrice - data.change).multiply(100).format('0.00')
          : 0;
        return data;
      });
  }

  async fetchEquitiesInstInvestorsTrades(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      se: 'EW',
      t: 'D',
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/3insti/daily_trade/3itrade_hedge_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    return json.aaData.map((row) => {
      const [symbol, name, ...values] = row;
      const data: Record<string, any> = { date, symbol, name };
      data.finiNetBuySell = numeral(values[8]).value();
      data.sitcNetBuySell = numeral(values[11]).value();
      data.dealersNetBuySell = numeral(values[20]).value();
      return data;
    });
  }

  async fetchEquitiesValues(options?: { date: string }) {
    const date = options?.date ?? DateTime.local().toISODate();
    const [year, month, day] = date.split('-');
    const query = new URLSearchParams({
      d: `${+year - 1911}/${month}/${day}`,
      o: 'json',
    });
    const url = `https://www.tpex.org.tw/web/stock/aftertrading/peratio_analysis/pera_result.php?${query}`;

    const response = await firstValueFrom(this.httpService.get(url));
    const json = response.data.iTotalRecords > 0 && response.data;
    if (!json) return null;

    return json.aaData.map((row) => {
      const [symbol, name, ...values] = row;
      const data: Record<string, any> = { date, symbol, name };
      data.peRatio = numeral(values[0]).value();
      data.pbRatio = numeral(values[4]).value();
      data.dividendYield = numeral(values[3]).value();
      data.dividendYear = numeral(values[2]).value();
      return data;
    });
  }
}
