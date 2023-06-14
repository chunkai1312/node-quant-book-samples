import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FugleMarketDataModule } from '@fugle/marketdata-nest';

@Module({
  imports: [
    ConfigModule.forRoot(),
    FugleMarketDataModule.forRoot({
      apiKey: process.env.FUGLE_MARKETDATA_API_KEY,
    }),
  ],
})
export class AppModule {}
