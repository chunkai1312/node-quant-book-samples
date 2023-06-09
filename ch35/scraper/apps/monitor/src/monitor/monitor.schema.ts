import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose/types';

export type MonitorDocument = HydratedDocument<Monitor>;

@Schema({ timestamps: true })
export class Monitor {
  _id: string;

  @Prop()
  symbol: string;

  @Prop()
  type: string;

  @Prop()
  value: number;

  @Prop(raw({
    title: { type: String },
    message: { type: String },
  }))
  alert: Record<string, any>;

  @Prop(raw({
    stockNo: { type: String },
    buySell: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    apCode: { type: String },
    priceFlag: { type: String },
    bsFlag: { type: String },
    trade: { type: String },
  }))
  order: Record<string, any>;

  @Prop({ default: false })
  triggered: boolean;
}

export const MonitorSchema = SchemaFactory.createForClass(Monitor);
