import * as _ from 'lodash';
import * as numeral from 'numeral';
import * as csvtojson from 'csvtojson';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TdccScraperService {
  constructor(private httpService: HttpService) {}

  async fetchEquitiesHolders() {
    const url = 'https://smart.tdcc.com.tw/opendata/getOD.ashx?id=1-5';

    const responseData = await firstValueFrom(this.httpService.post(url))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(response.data));

    const [ fields, ...rows ] = responseData;
    if (fields[0] !== '資料日期') return null;

    const distributions = rows.map(row => {
      const [ date, symbol, level, holders, shares, proportion ] = row;
      return {
        date,
        symbol,
        level: numeral(level).value(),
        holders: numeral(holders).value(),
        shares: numeral(shares).value(),
        proportion: numeral(proportion).value(),
      };
    });

    const data = _(distributions)
      .groupBy('symbol')
      .map((rows: any[]) => {
        const { date, symbol } = rows[0];
        const data = rows.map(row => _.omit(row, ['date', 'symbol']));
        return { date, symbol, data };
      })
      .value();

    return data;
  }
}
