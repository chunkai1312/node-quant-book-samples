import { IsString, IsNumber, IsEnum, IsJSON } from 'class-validator/types';
import { MonitorType } from '../enums';

export class CreateAlertDto {
  @IsString()
  symbol: string;

  @IsEnum(MonitorType)
  type: string;

  @IsNumber()
  value: number;

  @IsJSON()
  alert: string;
}
