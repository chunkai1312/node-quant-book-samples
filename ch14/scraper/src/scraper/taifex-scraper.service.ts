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

  async fetchLargeTradersTxfPosition(date: string) {
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');
    const form = new URLSearchParams({
      queryStartDate: queryDate,
      queryEndDate: queryDate,
    });
    const url = 'https://www.taifex.com.tw/cht/3/largeTraderFutDown';

    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    const [fields, ...rows] = responseData;
    if (fields[0] !== '日期') return null;

    const txRows = rows.filter(row => row[1] === 'TX');
    const [
      weekRow,
      weekSpecificRow,
      frontMonthRow,
      frontMonthSpecificRow,
      allMonthsRow,
      allMonthsSpecificRow,
    ] = txRows;

    const frontMonth = frontMonthRow.slice(5, -1).map(data => numeral(data).value());
    const frontMonthSpecific = frontMonthSpecificRow.slice(5, -1).map(data => numeral(data).value());
    const frontMonthNonSpecific = frontMonth.map((data, i) => data - frontMonthSpecific[i]);
    const allMonths = allMonthsRow.slice(5, -1).map(data => numeral(data).value());
    const allMonthsSpecific = allMonthsSpecificRow.slice(5, -1).map(data => numeral(data).value());
    const allMonthsNonSpecific = allMonths.map((data, i) => data - allMonthsSpecific[i]);
    const backMonths = allMonths.map((data, i) => data - frontMonth[i]);
    const backMonthsSpecific = allMonthsSpecific.map((data, i) => data - frontMonthSpecific[i]);
    const backMonthsNonSpecific = backMonths.map((data, i) => data - backMonthsSpecific[i]);
    const frontMonthMarketOi = numeral(frontMonthRow.slice(-1)).value();
    const allMonthsMarketOi = numeral(allMonthsRow.slice(-1)).value();
    const backMonthsMarketOi = allMonthsMarketOi - frontMonthMarketOi;

    const raw = [
      ...frontMonth,
      ...frontMonthSpecific,
      ...frontMonthNonSpecific,
      ...allMonths,
      ...allMonthsSpecific,
      ...allMonthsNonSpecific,
      ...backMonths,
      ...backMonthsSpecific,
      ...backMonthsNonSpecific,
    ];

    const [
      top5FrontMonthLongOi,
      top5FrontMonthShortOi,
      top10FrontMonthLongOi,
      top10FrontMonthShortOi,
      top5SpecificFrontMonthLongOi,
      top5SpecificFrontMonthShortOi,
      top10SpecificFrontMonthLongOi,
      top10SpecificFrontMonthShortOi,
      top5NonSpecificFrontMonthLongOi,
      top5NonSpecificFrontMonthShortOi,
      top10NonSpecificFrontMonthLongOi,
      top10NonSpecificFrontMonthShortOi,
      top5AllMonthsLongOi,
      top5AllMonthsShortOi,
      top10AllMonthsLongOi,
      top10AllMonthsShortOi,
      top5SpecificAllMonthsLongOi,
      top5specificAllMonthsShortOi,
      top10SpecificAllMonthsLongOi,
      top10SpecificAllMonthsShortOi,
      top5NonSpecificAllMonthsLongOi,
      top5NonSpecificAllMonthsShortOi,
      top10NonSpecificAllMonthsLongOi,
      top10NonSpecificAllMonthsShortOi,
      top5BackMonthsLongOi,
      top5BackMonthsShortOi,
      top10BackMonthsLongOi,
      top10BackMonthsShortOi,
      top5SpecificBackMonthsLongOi,
      top5SpecificBackMonthsShortOi,
      top10SpecificBackMonthsLongOi,
      top10SpecificBackMonthsShortOi,
      top5NonSpecificBackMonthsLongOi,
      top5NonSpecificBackMonthsShortOi,
      top10NonSpecificBackMonthsLongOi,
      top10NonSpecificBackMonthsShortOi,
    ] = raw;

    const top5FrontMonthNetOi = top5FrontMonthLongOi - top5FrontMonthShortOi;
    const top10FrontMonthNetOi = top10FrontMonthLongOi - top10FrontMonthShortOi;
    const top5SpecificFrontMonthNetOi = top5SpecificFrontMonthLongOi - top5SpecificFrontMonthShortOi;
    const top10SpecificFrontMonthNetOi = top10SpecificFrontMonthLongOi - top10SpecificFrontMonthShortOi;
    const top5NonSpecificFrontMonthNetOi = top5NonSpecificFrontMonthLongOi - top5NonSpecificFrontMonthShortOi;
    const top10NonSpecificFrontMonthNetOi = top10NonSpecificFrontMonthLongOi - top10NonSpecificFrontMonthShortOi;

    const top5AllMonthsNetOi = top5AllMonthsLongOi - top5AllMonthsShortOi;
    const top10AllMonthsNetOi = top10AllMonthsLongOi - top10AllMonthsShortOi;
    const top5SpecificAllMonthsNetOi = top5SpecificAllMonthsLongOi - top5specificAllMonthsShortOi;
    const top10SpecificAllMonthsNetOi = top10SpecificAllMonthsLongOi - top10SpecificAllMonthsShortOi;
    const top5NonSpecificAllMonthsNetOi = top5NonSpecificAllMonthsLongOi - top5NonSpecificAllMonthsShortOi;
    const top10NonSpecificAllMonthsNetOi = top10NonSpecificAllMonthsLongOi - top10NonSpecificAllMonthsShortOi;

    const top5BackMonthsNetOi = top5BackMonthsLongOi - top5BackMonthsShortOi;
    const top10BackMonthsNetOi = top10BackMonthsLongOi - top10BackMonthsShortOi;
    const top5SpecificBackMonthsNetOi = top5SpecificBackMonthsLongOi - top5SpecificBackMonthsShortOi;
    const top10SpecificBackMonthsNetOi = top10SpecificBackMonthsLongOi - top10SpecificBackMonthsShortOi;
    const top5NonSpecificBackMonthsNetOi = top5NonSpecificBackMonthsLongOi - top5NonSpecificBackMonthsShortOi;
    const top10NonSpecificBackMonthsNetOi = top10NonSpecificBackMonthsLongOi - top10NonSpecificBackMonthsShortOi;

    return {
      date,
      top5SpecificFrontMonthLongOi,
      top5SpecificFrontMonthShortOi,
      top5SpecificFrontMonthNetOi,
      top5SpecificBackMonthsLongOi,
      top5SpecificBackMonthsShortOi,
      top5SpecificBackMonthsNetOi,
      top5NonSpecificFrontMonthLongOi,
      top5NonSpecificFrontMonthShortOi,
      top5NonSpecificFrontMonthNetOi,
      top5NonSpecificBackMonthsLongOi,
      top5NonSpecificBackMonthsShortOi,
      top5NonSpecificBackMonthsNetOi,
      top10SpecificFrontMonthLongOi,
      top10SpecificFrontMonthShortOi,
      top10SpecificFrontMonthNetOi,
      top10SpecificBackMonthsLongOi,
      top10SpecificBackMonthsShortOi,
      top10SpecificBackMonthsNetOi,
      top10NonSpecificFrontMonthLongOi,
      top10NonSpecificFrontMonthShortOi,
      top10NonSpecificFrontMonthNetOi,
      top10NonSpecificBackMonthsLongOi,
      top10NonSpecificBackMonthsShortOi,
      top10NonSpecificBackMonthsNetOi,
      frontMonthMarketOi,
      backMonthsMarketOi,
    };
  }

  async fetchLargeTradersTxoPosition(date: string) {
    // 將 `date` 轉換成 `yyyy/MM/dd` 格式
    const queryDate = DateTime.fromISO(date).toFormat('yyyy/MM/dd');

    // 建立 FormData
    const form = new URLSearchParams({
      queryStartDate: queryDate,  // 日期(起)
      queryEndDate: queryDate,    // 日期(迄)
    });
    const url = 'https://www.taifex.com.tw/cht/3/largeTraderOptDown';

    // 取得回應資料並將 CSV 轉換成 JSON 格式及正確編碼
    const responseData = await firstValueFrom(this.httpService.post(url, form, { responseType: 'arraybuffer' }))
      .then(response => csvtojson({ noheader: true, output: 'csv' }).fromString(iconv.decode(response.data, 'big5')));

    // 若該日期非交易日或尚無資料則回傳 null
    const [fields, ...rows] = responseData;
    if (fields[0] !== '日期') return null;

    const txoRows = rows.filter(row => row[1] === 'TXO'); // 只取臺指選擇權數據
    const [
      txoCallWeekRow,                // 臺指選擇權買權週契約-大額交易人
      txoCallWeekSpecificRow,        // 臺指選擇權買權週契約-特定法人
      txoCallFrontMonthRow,          // 臺指選擇權買權近月契約-大額交易人
      txoCallFrontMonthSpecificRow,  // 臺指選擇權買權近月契約-特定法人
      txoCallAllMonthsRow,           // 臺指選擇權買權所有契約-大額交易人
      txoCallAllMonthsSpecificRow,   // 臺指選擇權買權所有契約-特定法人
      txoPutWeekRow,                 // 臺指選擇權賣權週契約-大額交易人
      txoPutWeekSpecificRow,         // 臺指選擇權賣權週契約-特定法人
      txoPutFrontMonthRow,           // 臺指選擇權賣權近月契約-大額交易人
      txoPutFrontMonthSpecificRow,   // 臺指選擇權賣權近月契約-特定法人
      txoPutAllMonthsRow,            // 臺指選擇權賣權所有契約-大額交易人
      txoPutAllMonthsSpecificRow,    // 臺指選擇權賣權所有契約-特定法人
    ] = txoRows;

    // 將 string 型別數字轉換成 number 並計算出非特定人及遠月契約
    const txoCallFrontMonth = txoCallFrontMonthRow.slice(6, -1).map(data => numeral(data).value());
    const txoCallFrontMonthSpecific = txoCallFrontMonthSpecificRow.slice(6, -1).map(data => numeral(data).value());
    const txoCallFrontMonthNonSpecific = txoCallFrontMonth.map((data, i) => data - txoCallFrontMonthSpecific[i]);
    const txoCallAllMonths = txoCallAllMonthsRow.slice(6, -1).map(data => numeral(data).value());
    const txoCallAllMonthsSpecific = txoCallAllMonthsSpecificRow.slice(6, -1).map(data => numeral(data).value());
    const txoCallAllMonthsNonSpecific = txoCallAllMonths.map((data, i) => data - txoCallAllMonthsSpecific[i]);
    const txoCallBackMonths = txoCallAllMonths.map((data, i) => data - txoCallFrontMonth[i]);
    const txoCallBackMonthsSpecific = txoCallAllMonthsSpecific.map((data, i) => data - txoCallFrontMonthSpecific[i]);
    const txoCallBackMonthsNonSpecific = txoCallBackMonths.map((data, i) => data - txoCallBackMonthsSpecific[i]);
    const txoCallFrontMonthMarketOi = numeral(txoCallFrontMonthRow.slice(-1)).value();
    const txoCallAllMonthsMarketOi = numeral(txoCallAllMonthsRow.slice(-1)).value();
    const txoCallBackMonthsMarketOi = txoCallAllMonthsMarketOi - txoCallFrontMonthMarketOi;
    const txoPutFrontMonth = txoPutFrontMonthRow.slice(6, -1).map(data => numeral(data).value());
    const txoPutFrontMonthSpecific = txoPutFrontMonthSpecificRow.slice(6, -1).map(data => numeral(data).value());
    const txoPutFrontMonthNonSpecific = txoPutFrontMonth.map((data, i) => data - txoPutFrontMonthSpecific[i]);
    const txoPutAllMonths = txoPutAllMonthsRow.slice(6, -1).map(data => numeral(data).value());
    const txoPutAllMonthsSpecific = txoPutAllMonthsSpecificRow.slice(6, -1).map(data => numeral(data).value());
    const txoPutAllMonthsNonSpecific = txoPutAllMonths.map((data, i) => data - txoPutAllMonthsSpecific[i]);
    const txoPutBackMonths = txoPutAllMonths.map((data, i) => data - txoPutFrontMonth[i]);
    const txoPutBackMonthsSpecific = txoPutAllMonthsSpecific.map((data, i) => data - txoPutFrontMonthSpecific[i]);
    const txoPutBackMonthsNonSpecific = txoPutBackMonths.map((data, i) => data - txoPutBackMonthsSpecific[i]);
    const txoPutFrontMonthMarketOi = numeral(txoPutFrontMonthRow.slice(-1)).value();
    const txoPutAllMonthsMarketOi = numeral(txoPutAllMonthsRow.slice(-1)).value();
    const txoPutBackMonthsMarketOi = txoPutAllMonthsMarketOi - txoPutFrontMonthMarketOi;

    // 合併所有數據
    const raw = [
      ...txoCallFrontMonth,
      ...txoCallFrontMonthSpecific,
      ...txoCallFrontMonthNonSpecific,
      ...txoCallAllMonths,
      ...txoCallAllMonthsSpecific,
      ...txoCallAllMonthsNonSpecific,
      ...txoCallBackMonths,
      ...txoCallBackMonthsSpecific,
      ...txoCallBackMonthsNonSpecific,
      ...txoPutFrontMonth,
      ...txoPutFrontMonthSpecific,
      ...txoPutFrontMonthNonSpecific,
      ...txoPutAllMonths,
      ...txoPutAllMonthsSpecific,
      ...txoPutAllMonthsNonSpecific,
      ...txoPutBackMonths,
      ...txoPutBackMonthsSpecific,
      ...txoPutBackMonthsNonSpecific,
    ];

    const [
      top5TxoCallFrontMonthLongOi,
      top5TxoCallFrontMonthShortOi,
      top10TxoCallFrontMonthLongOi,
      top10TxoCallFrontMonthShortOi,
      top5SpecificTxoCallFrontMonthLongOi,
      top5SpecificTxoCallFrontMonthShortOi,
      top10SpecificTxoCallFrontMonthLongOi,
      top10SpecificTxoCallFrontMonthShortOi,
      top5NonSpecificTxoCallFrontMonthLongOi,
      top5NonSpecificTxoCallFrontMonthShortOi,
      top10NonSpecificTxoCallFrontMonthLongOi,
      top10NonSpecificTxoCallFrontMonthShortOi,
      top5TxoCallAllMonthsLongOi,
      top5TxoCallAllMonthsShortOi,
      top10TxoCallAllMonthsLongOi,
      top10TxoCallAllMonthsShortOi,
      top5SpecificTxoCallAllMonthsLongOi,
      top5SpecificTxoCallAllMonthsShortOi,
      top10SpecificTxoCallAllMonthsLongOi,
      top10SpecificTxoCallAllMonthsShortOi,
      top5NonSpecificTxoCallAllMonthsLongOi,
      top5NonSpecificTxoCallAllMonthsShortOi,
      top10NonSpecificTxoCallAllMonthsLongOi,
      top10NonSpecificTxoCallAllMonthsShortOi,
      top5TxoCallBackMonthsLongOi,
      top5TxoCallBackMonthsShortOi,
      top10TxoCallBackMonthsLongOi,
      top10TxoCallBackMonthsShortOi,
      top5SpecificTxoCallBackMonthsLongOi,
      top5SpecificTxoCallBackMonthsShortOi,
      top10SpecificTxoCallBackMonthsLongOi,
      top10SpecificTxoCallBackMonthsShortOi,
      top5NonSpecificTxoCallBackMonthsLongOi,
      top5NonSpecificTxoCallBackMonthsShortOi,
      top10NonSpecificTxoCallBackMonthsLongOi,
      top10NonSpecificTxoCallBackMonthsShortOi,
      top5TxoPutFrontMonthLongOi,
      top5TxoPutFrontMonthShortOi,
      top10TxoPutFrontMonthLongOi,
      top10TxoPutFrontMonthShortOi,
      top5SpecificTxoPutFrontMonthLongOi,
      top5SpecificTxoPutFrontMonthShortOi,
      top10SpecificTxoPutFrontMonthLongOi,
      top10SpecificTxoPutFrontMonthShortOi,
      top5NonSpecificTxoPutFrontMonthLongOi,
      top5NonSpecificTxoPutFrontMonthShortOi,
      top10NonSpecificTxoPutFrontMonthLongOi,
      top10NonSpecificTxoPutFrontMonthShortOi,
      top5TxoPutAllMonthsLongOi,
      top5TxoPutAllMonthsShortOi,
      top10TxoPutAllMonthsLongOi,
      top10TxoPutAllMonthsShortOi,
      top5SpecificTxoPutAllMonthsLongOi,
      top5SpecificTxoPutAllMonthsShortOi,
      top10SpecificTxoPutAllMonthsLongOi,
      top10SpecificTxoPutAllMonthsShortOi,
      top5NonSpecificTxoPutAllMonthsLongOi,
      top5NonSpecificTxoPutAllMonthsShortOi,
      top10NonSpecificTxoPutAllMonthsLongOi,
      top10NonSpecificTxoPutAllMonthsShortOi,
      top5TxoPutBackMonthsLongOi,
      top5TxoPutBackMonthsShortOi,
      top10TxoPutBackMonthsLongOi,
      top10TxoPutBackMonthsShortOi,
      top5SpecificTxoPutBackMonthsLongOi,
      top5SpecificTxoPutBackMonthsShortOi,
      top10SpecificTxoPutBackMonthsLongOi,
      top10SpecificTxoPutBackMonthsShortOi,
      top5NonSpecificTxoPutBackMonthsLongOi,
      top5NonSpecificTxoPutBackMonthsShortOi,
      top10NonSpecificTxoPutBackMonthsLongOi,
      top10NonSpecificTxoPutBackMonthsShortOi,
    ] = raw;

    const top5TxoCallFrontMonthNetOi = top5TxoCallFrontMonthLongOi - top5TxoCallFrontMonthShortOi;
    const top10TxoCallFrontMonthNetOi = top10TxoCallFrontMonthLongOi - top10TxoCallFrontMonthShortOi;
    const top5SpecificTxoCallFrontMonthNetOi = top5SpecificTxoCallFrontMonthLongOi - top5SpecificTxoCallFrontMonthShortOi;
    const top10SpecificTxoCallFrontMonthNetOi = top10SpecificTxoCallFrontMonthLongOi - top10SpecificTxoCallFrontMonthShortOi;
    const top5NonSpecificTxoCallFrontMonthNetOi = top5NonSpecificTxoCallFrontMonthLongOi - top5NonSpecificTxoCallFrontMonthShortOi;
    const top10NonSpecificTxoCallFrontMonthNetOi = top10NonSpecificTxoCallFrontMonthLongOi - top10NonSpecificTxoCallFrontMonthShortOi;

    const top5TxoCallAllMonthsNetOi = top5TxoCallAllMonthsLongOi - top5TxoCallAllMonthsShortOi;
    const top10TxoCallAllMonthsNetOi = top10TxoCallAllMonthsLongOi - top10TxoCallAllMonthsShortOi;
    const top5SpecificTxoCallAllMonthsNetOi = top5SpecificTxoCallAllMonthsLongOi - top5SpecificTxoCallAllMonthsShortOi;
    const top10SpecificTxoCallAllMonthsNetOi = top10SpecificTxoCallAllMonthsLongOi - top10SpecificTxoCallAllMonthsShortOi;
    const top5NonSpecificTxoCallAllMonthsNetOi = top5NonSpecificTxoCallAllMonthsLongOi - top5NonSpecificTxoCallAllMonthsShortOi;
    const top10NonSpecificTxoCallAllMonthsNetOi = top10NonSpecificTxoCallAllMonthsLongOi - top10NonSpecificTxoCallAllMonthsShortOi;

    const top5TxoCallBackMonthsNetOi = top5TxoCallBackMonthsLongOi - top5TxoCallBackMonthsShortOi;
    const top10TxoCallBackMonthsNetOi = top10TxoCallBackMonthsLongOi - top10TxoCallBackMonthsShortOi;
    const top5SpecificTxoCallBackMonthsNetOi = top5SpecificTxoCallBackMonthsLongOi - top5SpecificTxoCallBackMonthsShortOi;
    const top10SpecificTxoCallBackMonthsNetOi = top10SpecificTxoCallBackMonthsLongOi - top10SpecificTxoCallBackMonthsShortOi;
    const top5NonSpecificTxoCallBackMonthsNetOi = top5NonSpecificTxoCallBackMonthsLongOi - top5NonSpecificTxoCallBackMonthsShortOi;
    const top10NonSpecificTxoCallBackMonthsNetOi = top10NonSpecificTxoCallBackMonthsLongOi - top10NonSpecificTxoCallBackMonthsShortOi;

    const top5TxoPutFrontMonthNetOi = top5TxoPutFrontMonthLongOi - top5TxoPutFrontMonthShortOi;
    const top10TxoPutFrontMonthNetOi = top10TxoPutFrontMonthLongOi - top10TxoPutFrontMonthShortOi;
    const top5SpecificTxoPutFrontMonthNetOi = top5SpecificTxoPutFrontMonthLongOi - top5SpecificTxoPutFrontMonthShortOi;
    const top10SpecificTxoPutFrontMonthNetOi = top10SpecificTxoPutFrontMonthLongOi - top10SpecificTxoPutFrontMonthShortOi;
    const top5NonSpecificTxoPutFrontMonthNetOi = top5NonSpecificTxoPutFrontMonthLongOi - top5NonSpecificTxoPutFrontMonthShortOi;
    const top10NonSpecificTxoPutFrontMonthNetOi = top10NonSpecificTxoPutFrontMonthLongOi - top10NonSpecificTxoPutFrontMonthShortOi;

    const top5TxoPutAllMonthsNetOi = top5TxoPutAllMonthsLongOi - top5TxoPutAllMonthsShortOi;
    const top10TxoPutAllMonthsNetOi = top10TxoPutAllMonthsLongOi - top10TxoPutAllMonthsShortOi;
    const top5SpecificTxoPutAllMonthsNetOi = top5SpecificTxoPutAllMonthsLongOi - top5SpecificTxoPutAllMonthsShortOi;
    const top10SpecificTxoPutAllMonthsNetOi = top10SpecificTxoPutAllMonthsLongOi - top10SpecificTxoPutAllMonthsShortOi;
    const top5NonSpecificTxoPutAllMonthsNetOi = top5NonSpecificTxoPutAllMonthsLongOi - top5NonSpecificTxoPutAllMonthsShortOi;
    const top10NonSpecificTxoPutAllMonthsNetOi = top10NonSpecificTxoPutAllMonthsLongOi - top10NonSpecificTxoPutAllMonthsShortOi;

    const top5TxoPutBackMonthsNetOi = top5TxoPutBackMonthsLongOi - top5TxoPutBackMonthsShortOi;
    const top10TxoPutBackMonthsNetOi = top10TxoPutBackMonthsLongOi - top10TxoPutBackMonthsShortOi;
    const top5SpecificTxoPutBackMonthsNetOi = top5SpecificTxoPutBackMonthsLongOi - top5SpecificTxoPutBackMonthsShortOi;
    const top10SpecificTxoPutBackMonthsNetOi = top10SpecificTxoPutBackMonthsLongOi - top10SpecificTxoPutBackMonthsShortOi;
    const top5NonSpecificTxoPutBackMonthsNetOi = top5NonSpecificTxoPutBackMonthsLongOi - top5NonSpecificTxoPutBackMonthsShortOi;
    const top10NonSpecificTxoPutBackMonthsNetOi = top10NonSpecificTxoPutBackMonthsLongOi - top10NonSpecificTxoPutBackMonthsShortOi;

    return {
      date,
      top5SpecificTxoCallFrontMonthLongOi,
      top5SpecificTxoCallFrontMonthShortOi,
      top5SpecificTxoCallFrontMonthNetOi,
      top5SpecificTxoCallBackMonthsLongOi,
      top5SpecificTxoCallBackMonthsShortOi,
      top5SpecificTxoCallBackMonthsNetOi,
      top5NonSpecificTxoCallFrontMonthLongOi,
      top5NonSpecificTxoCallFrontMonthShortOi,
      top5NonSpecificTxoCallFrontMonthNetOi,
      top5NonSpecificTxoCallBackMonthsLongOi,
      top5NonSpecificTxoCallBackMonthsShortOi,
      top5NonSpecificTxoCallBackMonthsNetOi,
      top10SpecificTxoCallFrontMonthLongOi,
      top10SpecificTxoCallFrontMonthShortOi,
      top10SpecificTxoCallFrontMonthNetOi,
      top10SpecificTxoCallBackMonthsLongOi,
      top10SpecificTxoCallBackMonthsShortOi,
      top10SpecificTxoCallBackMonthsNetOi,
      top10NonSpecificTxoCallFrontMonthLongOi,
      top10NonSpecificTxoCallFrontMonthShortOi,
      top10NonSpecificTxoCallFrontMonthNetOi,
      top10NonSpecificTxoCallBackMonthsLongOi,
      top10NonSpecificTxoCallBackMonthsShortOi,
      top10NonSpecificTxoCallBackMonthsNetOi,
      top5SpecificTxoPutFrontMonthLongOi,
      top5SpecificTxoPutFrontMonthShortOi,
      top5SpecificTxoPutFrontMonthNetOi,
      top5SpecificTxoPutBackMonthsLongOi,
      top5SpecificTxoPutBackMonthsShortOi,
      top5SpecificTxoPutBackMonthsNetOi,
      top5NonSpecificTxoPutFrontMonthLongOi,
      top5NonSpecificTxoPutFrontMonthShortOi,
      top5NonSpecificTxoPutFrontMonthNetOi,
      top5NonSpecificTxoPutBackMonthsLongOi,
      top5NonSpecificTxoPutBackMonthsShortOi,
      top5NonSpecificTxoPutBackMonthsNetOi,
      top10SpecificTxoPutFrontMonthLongOi,
      top10SpecificTxoPutFrontMonthShortOi,
      top10SpecificTxoPutFrontMonthNetOi,
      top10SpecificTxoPutBackMonthsLongOi,
      top10SpecificTxoPutBackMonthsShortOi,
      top10SpecificTxoPutBackMonthsNetOi,
      top10NonSpecificTxoPutFrontMonthLongOi,
      top10NonSpecificTxoPutFrontMonthShortOi,
      top10NonSpecificTxoPutFrontMonthNetOi,
      top10NonSpecificTxoPutBackMonthsLongOi,
      top10NonSpecificTxoPutBackMonthsShortOi,
      top10NonSpecificTxoPutBackMonthsNetOi,
      txoCallFrontMonthMarketOi,
      txoCallBackMonthsMarketOi,
      txoPutFrontMonthMarketOi,
      txoPutBackMonthsMarketOi,
    };
  }
}
