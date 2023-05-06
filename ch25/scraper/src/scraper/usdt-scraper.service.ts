import * as csvtojson from 'csvtojson';
import * as numeral from 'numeral';
import { DateTime } from 'luxon';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsdtScraperService {
  constructor(private httpService: HttpService) {}

  async fetchUsTreasuryYields(date: string) {
    const dt = DateTime.fromISO(date);
    const month = dt.toFormat('yyyyMM');
    const url = `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/daily-treasury-rates.csv/all/${month}?type=daily_treasury_yield_curve&field_tdr_date_value_month=${month}&page&_format=csv`

    const responseData = await firstValueFrom(this.httpService.get(url))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(response.data));

    const [ fields, ...rows ] = responseData;
    if (fields[0] !== 'Date') return null;

    const data = rows.map(row => {
      const date = DateTime.fromFormat(row[0], 'MM/dd/yyyy').toISODate()
      const raw = row.slice(1).map(data => numeral(data).value());
      const [ us1m, us2m, us3m, us6m, us1y, us2y, us3y, us5y, us7y, us10y, us20y, us30y ] = raw;
      return { date, us1m, us2m, us3m, us6m, us1y, us2y, us3y, us5y, us7y, us10y, us20y, us30y };
    }).find(data => data.date === date);

    return data;
  }
}
