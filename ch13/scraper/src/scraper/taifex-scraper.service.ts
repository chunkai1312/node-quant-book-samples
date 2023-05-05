import * as csvtojson from 'csvtojson';
import * as iconv from 'iconv-lite';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaifexScraperService {
  constructor(private httpService: HttpService) {}

  async fetchInstInvestorsTxfTrades(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');
    const form = new URLSearchParams({
      queryStartDate: queryDate,
      queryEndDate: queryDate,
      commodityId: 'TXF',
    });
    const url = 'https://www.taifex.com.tw/cht/3/futContractsDateDown';

    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    const [ fields, dealers, sitc, fini ] = responseData;
    if (fields[0] !== '日期') return null;

    const raw = [ ...dealers.slice(3), ...sitc.slice(3), ...fini.slice(3) ]
      .map(data => numeral(data).value());

    const [
      dealersLongTradeVolume,
      dealersLongTradeValue,
      dealersShortTradeVolume,
      dealersShortTradeValue,
      dealersNetTradeVolume,
      dealersNetTradeValue,
      dealersLongOiVolume,
      dealersLongOiValue,
      dealersShortOiVolume,
      dealersShortOiValue,
      dealersNetOiVolume,
      dealersNetOiValue,
      sitcLongTradeVolume,
      sitcLongTradeValue,
      sitcShortTradeVolume,
      sitcShortTradeValue,
      sitcNetTradeVolume,
      sitcNetTradeValue,
      sitcLongOiVolume,
      sitcLongOiValue,
      sitcShortOiVolume,
      sitcShortOiValue,
      sitcNetOiVolume,
      sitcNetOiValue,
      finiLongTradeVolume,
      finiLongTradeValue,
      finiShortTradeVolume,
      finiShortTradeValue,
      finiNetTradeVolume,
      finiNetTradeValue,
      finiLongOiVolume,
      finiLongOiValue,
      finiShortOiVolume,
      finiShortOiValue,
      finiNetOiVolume,
      finiNetOiValue,
    ] = raw;

    return {
      date,
      finiLongTradeVolume,
      finiLongTradeValue,
      finiShortTradeVolume,
      finiShortTradeValue,
      finiNetTradeVolume,
      finiNetTradeValue,
      finiLongOiVolume,
      finiLongOiValue,
      finiShortOiVolume,
      finiShortOiValue,
      finiNetOiVolume,
      finiNetOiValue,
      sitcLongTradeVolume,
      sitcLongTradeValue,
      sitcShortTradeVolume,
      sitcShortTradeValue,
      sitcNetTradeVolume,
      sitcNetTradeValue,
      sitcLongOiVolume,
      sitcLongOiValue,
      sitcShortOiVolume,
      sitcShortOiValue,
      sitcNetOiVolume,
      sitcNetOiValue,
      dealersLongTradeVolume,
      dealersLongTradeValue,
      dealersShortTradeVolume,
      dealersShortTradeValue,
      dealersNetTradeVolume,
      dealersNetTradeValue,
      dealersLongOiVolume,
      dealersLongOiValue,
      dealersShortOiVolume,
      dealersShortOiValue,
      dealersNetOiVolume,
      dealersNetOiValue,
    };
  }

  async fetchInstInvestorsTxoTrades(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');
    const form = new URLSearchParams({
      queryStartDate: queryDate,
      queryEndDate: queryDate,
      commodityId: 'TXO',
    });
    const url = 'https://www.taifex.com.tw/cht/3/callsAndPutsDateDown';

    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    const [ fields, dealersCalls, sitcCalls, finiCalls, dealersPuts, sitcPuts, finiPuts ] = responseData;
    if (fields[0] !== '日期') return null;

    const raw = [
      ...dealersCalls.slice(4),
      ...sitcCalls.slice(4),
      ...finiCalls.slice(4),
      ...dealersPuts.slice(4),
      ...sitcPuts.slice(4),
      ...finiPuts.slice(4),
    ].map(data => numeral(data).value());

    const [
      dealersCallsLongTradeVolume,
      dealersCallsLongTradeValue,
      dealersCallsShortTradeVolume,
      dealersCallsShortTradeValue,
      dealersCallsNetTradeVolume,
      dealersCallsNetTradeValue,
      dealersCallsLongOiVolume,
      dealersCallsLongOiValue,
      dealersCallsShortOiVolume,
      dealersCallsShortOiValue,
      dealersCallsNetOiVolume,
      dealersCallsNetOiValue,
      sitcCallsLongTradeVolume,
      sitcCallsLongTradeValue,
      sitcCallsShortTradeVolume,
      sitcCallsShortTradeValue,
      sitcCallsNetTradeVolume,
      sitcCallsNetTradeValue,
      sitcCallsLongOiVolume,
      sitcCallsLongOiValue,
      sitcCallsShortOiVolume,
      sitcCallsShortOiValue,
      sitcCallsNetOiVolume,
      sitcCallsNetOiValue,
      finiCallsLongTradeVolume,
      finiCallsLongTradeValue,
      finiCallsShortTradeVolume,
      finiCallsShortTradeValue,
      finiCallsNetTradeVolume,
      finiCallsNetTradeValue,
      finiCallsLongOiVolume,
      finiCallsLongOiValue,
      finiCallsShortOiVolume,
      finiCallsShortOiValue,
      finiCallsNetOiVolume,
      finiCallsNetOiValue,
      dealersPutsLongTradeVolume,
      dealersPutsLongTradeValue,
      dealersPutsShortTradeVolume,
      dealersPutsShortTradeValue,
      dealersPutsNetTradeVolume,
      dealersPutsNetTradeValue,
      dealersPutsLongOiVolume,
      dealersPutsLongOiValue,
      dealersPutsShortOiVolume,
      dealersPutsShortOiValue,
      dealersPutsNetOiVolume,
      dealersPutsNetOiValue,
      sitcPutsLongTradeVolume,
      sitcPutsLongTradeValue,
      sitcPutsShortTradeVolume,
      sitcPutsShortTradeValue,
      sitcPutsNetTradeVolume,
      sitcPutsNetTradeValue,
      sitcPutsLongOiVolume,
      sitcPutsLongOiValue,
      sitcPutsShortOiVolume,
      sitcPutsShortOiValue,
      sitcPutsNetOiVolume,
      sitcPutsNetOiValue,
      finiPutsLongTradeVolume,
      finiPutsLongTradeValue,
      finiPutsShortTradeVolume,
      finiPutsShortTradeValue,
      finiPutsNetTradeVolume,
      finiPutsNetTradeValue,
      finiPutsLongOiVolume,
      finiPutsLongOiValue,
      finiPutsShortOiVolume,
      finiPutsShortOiValue,
      finiPutsNetOiVolume,
      finiPutsNetOiValue,
    ] = raw;

    return {
      date,
      finiCallsLongTradeVolume,
      finiCallsLongTradeValue,
      finiCallsShortTradeVolume,
      finiCallsShortTradeValue,
      finiCallsNetTradeVolume,
      finiCallsNetTradeValue,
      finiCallsLongOiVolume,
      finiCallsLongOiValue,
      finiCallsShortOiVolume,
      finiCallsShortOiValue,
      finiCallsNetOiVolume,
      finiCallsNetOiValue,
      finiPutsLongTradeVolume,
      finiPutsLongTradeValue,
      finiPutsShortTradeVolume,
      finiPutsShortTradeValue,
      finiPutsNetTradeVolume,
      finiPutsNetTradeValue,
      finiPutsLongOiVolume,
      finiPutsLongOiValue,
      finiPutsShortOiVolume,
      finiPutsShortOiValue,
      finiPutsNetOiVolume,
      finiPutsNetOiValue,
      sitcCallsLongTradeVolume,
      sitcCallsLongTradeValue,
      sitcCallsShortTradeVolume,
      sitcCallsShortTradeValue,
      sitcCallsNetTradeVolume,
      sitcCallsNetTradeValue,
      sitcCallsLongOiVolume,
      sitcCallsLongOiValue,
      sitcCallsShortOiVolume,
      sitcCallsShortOiValue,
      sitcCallsNetOiVolume,
      sitcCallsNetOiValue,
      sitcPutsLongTradeVolume,
      sitcPutsLongTradeValue,
      sitcPutsShortTradeVolume,
      sitcPutsShortTradeValue,
      sitcPutsNetTradeVolume,
      sitcPutsNetTradeValue,
      sitcPutsLongOiVolume,
      sitcPutsLongOiValue,
      sitcPutsShortOiVolume,
      sitcPutsShortOiValue,
      sitcPutsNetOiVolume,
      sitcPutsNetOiValue,
      dealersCallsLongTradeVolume,
      dealersCallsLongTradeValue,
      dealersCallsShortTradeVolume,
      dealersCallsShortTradeValue,
      dealersCallsNetTradeVolume,
      dealersCallsNetTradeValue,
      dealersCallsLongOiVolume,
      dealersCallsLongOiValue,
      dealersCallsShortOiVolume,
      dealersCallsShortOiValue,
      dealersCallsNetOiVolume,
      dealersCallsNetOiValue,
      dealersPutsLongTradeVolume,
      dealersPutsLongTradeValue,
      dealersPutsShortTradeVolume,
      dealersPutsShortTradeValue,
      dealersPutsNetTradeVolume,
      dealersPutsNetTradeValue,
      dealersPutsLongOiVolume,
      dealersPutsLongOiValue,
      dealersPutsShortOiVolume,
      dealersPutsShortOiValue,
      dealersPutsNetOiVolume,
      dealersPutsNetOiValue,
    };
  }

  private async fetchMxfMarketOi(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');
    const form = new URLSearchParams({
      down_type: '1',
      queryStartDate: queryDate,
      queryEndDate: queryDate,
      commodity_id: 'MTX',
    });
    const url = 'https://www.taifex.com.tw/cht/3/futDataDown';

    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    const [fields, ...rows] = responseData;
    if (fields[0] !== '交易日期') return null;

    const mxfMarketOi = rows
      .filter(row => row[17] === '一般' && !row[18])
      .reduce((oi, row) => oi + numeral(row[11]).value(), 0);

    return { date, mxfMarketOi };
  }

  private async fetchInstInvestorsMxfOi(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');
    const form = new URLSearchParams({
      queryStartDate: queryDate,
      queryEndDate: queryDate,
      commodityId: 'MXF',
    });
    const url = 'https://www.taifex.com.tw/cht/3/futContractsDateDown';

    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    const [fields, dealers, sitc, fini] = responseData;
    if (fields[0] !== '日期') return null;

    const raw = [...dealers.slice(3), ...sitc.slice(3), ...fini.slice(3)]
      .map(data => numeral(data).value());

    const [
      dealersLongTradeVolume,
      dealersLongTradeValue,
      dealersShortTradeVolume,
      dealersShortTradeValue,
      dealersNetTradeVolume,
      dealersNetTradeValue,
      dealersLongOiVolume,
      dealersLongOiValue,
      dealersShortOiVolume,
      dealersShortOiValue,
      dealersNetOiVolume,
      dealersNetOiValue,
      sitcLongTradeVolume,
      sitcLongTradeValue,
      sitcShortTradeVolume,
      sitcShortTradeValue,
      sitcNetTradeVolume,
      sitcNetTradeValue,
      sitcLongOiVolume,
      sitcLongOiValue,
      sitcShortOiVolume,
      sitcShortOiValue,
      sitcNetOiVolume,
      sitcNetOiValue,
      finiLongTradeVolume,
      finiLongTradeValue,
      finiShortTradeVolume,
      finiShortTradeValue,
      finiNetTradeVolume,
      finiNetTradeValue,
      finiLongOiVolume,
      finiLongOiValue,
      finiShortOiVolume,
      finiShortOiValue,
      finiNetOiVolume,
      finiNetOiValue,
    ] = raw;

    const instInvestorsMxfLongOi = dealersLongOiVolume + sitcLongOiVolume + finiLongOiVolume;
    const instInvestorsMxfShortOi = dealersShortOiVolume + sitcShortOiVolume + finiShortOiVolume;

    return {
      date,
      instInvestorsMxfLongOi,
      instInvestorsMxfShortOi,
    };
  }

  async fetchRetailMxfPosition(date: string) {
    const [ fetchedMxfMarketOi, fetchedInstInvestorsMxfOi ] = await Promise.all([
      this.fetchMxfMarketOi(date),
      this.fetchInstInvestorsMxfOi(date),
    ]);

    if (!fetchedMxfMarketOi || !fetchedInstInvestorsMxfOi) return null;

    const { mxfMarketOi } = fetchedMxfMarketOi;
    const { instInvestorsMxfLongOi, instInvestorsMxfShortOi } = fetchedInstInvestorsMxfOi;
    const retailMxfLongOi = mxfMarketOi - instInvestorsMxfLongOi;
    const retailMxfShortOi = mxfMarketOi - instInvestorsMxfShortOi;
    const retailMxfNetOi = retailMxfLongOi - retailMxfShortOi;
    const retailMxfLongShortRatio = Math.round(retailMxfNetOi / mxfMarketOi * 10000) / 10000;

    return {
      date,
      retailMxfLongOi,
      retailMxfShortOi,
      retailMxfNetOi,
      retailMxfLongShortRatio,
    };
  }
}
