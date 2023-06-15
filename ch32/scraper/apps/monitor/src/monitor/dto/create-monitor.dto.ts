import { IsString, IsNumber, IsEnum } from 'class-validator';
import { MonitorType } from '../enums';

export class CreateMonitorDto {
  @IsString()
  title: string;

  @IsString()
  symbol: string;

  @IsEnum(MonitorType)
  type: string;

  @IsNumber()
  value: number;
}
