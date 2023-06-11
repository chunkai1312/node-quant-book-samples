import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TwseScraperService } from './twse-scraper.service';
import { TpexScraperService } from './tpex-scraper.service';
import { TaifexScraperService } from './taifex-scraper.service';
import { MopsScraperService } from './mops-scraper.service';
import { TdccScraperService } from './tdcc-scraper.service';
import { UsdtScraperService } from './usdt-scraper.service';
import { YahooFinanceService } from './yahoo-finance.service';


@Module({
  imports: [HttpModule],
  providers: [
    TwseScraperService,
    TpexScraperService,
    TaifexScraperService,
    MopsScraperService,
    TdccScraperService,
    UsdtScraperService,
    YahooFinanceService,
  ],
  exports: [
    TwseScraperService,
    TpexScraperService,
    TaifexScraperService,
    MopsScraperService,
    TdccScraperService,
    UsdtScraperService,
    YahooFinanceService,
  ],
})
export class ScraperModule {}
