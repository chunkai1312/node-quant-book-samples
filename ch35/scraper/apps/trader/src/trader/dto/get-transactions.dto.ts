import { IsIn } from 'class-validator/types';

type Range = '0d' | '3d' | '1m' | '3m';

export class GetTransactionsDto {
  @IsIn(['0d', '3d', '1m', '3m'])
  range: Range;
}
