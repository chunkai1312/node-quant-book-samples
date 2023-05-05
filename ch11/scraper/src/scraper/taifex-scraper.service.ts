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
}
