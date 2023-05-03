import * as cheerio from 'cheerio';
import * as iconv from 'iconv-lite';
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
}
