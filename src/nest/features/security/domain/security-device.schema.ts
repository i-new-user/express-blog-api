import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'securityDevices', versionKey: false })
export class SecurityDevice {
  readonly _id!: Types.ObjectId;
  @Prop({ required: true }) userId!: string;
  @Prop({ required: true, unique: true }) deviceId!: string;
  @Prop({ required: true }) ip!: string;
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) lastActiveDate!: string;
  @Prop({ required: true, type: Date }) expiresAt!: Date;
}
export const SecurityDeviceSchema = SchemaFactory.createForClass(SecurityDevice);
SecurityDeviceSchema.index({ userId: 1 });
SecurityDeviceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
