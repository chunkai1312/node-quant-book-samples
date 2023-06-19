import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MonitorDocument = HydratedDocument<Monitor>;

@Schema({ timestamps: true })
export class Monitor {
  _id: string;

  @Prop()
  title: string;

  @Prop()
  symbol: string;

  @Prop()
  type: string;

  @Prop()
  value: number;

  @Prop({ default: false })
  triggered: boolean;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
