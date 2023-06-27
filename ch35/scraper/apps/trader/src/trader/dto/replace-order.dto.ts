import { IsNumber } from 'class-validator/types';

export class ReplaceOrderDto {
  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;
}
