import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class EmailConfirmation {
  @Prop({ required: true })
  confirmationCode!: string;

  @Prop({ required: true, type: Date })
  expirationDate!: Date;

  @Prop({ required: true, default: true })
  isConfirmed!: boolean;

  @Prop({ default: null, type: String })
  recoveryCode?: string | null;

  @Prop({ default: null, type: Date })
  recoveryCodeExpirationDate?: Date | null;
}

export const EmailConfirmationSchema =
  SchemaFactory.createForClass(EmailConfirmation);

@Schema({ collection: 'users', versionKey: false })
export class User {
  readonly _id!: Types.ObjectId;

  @Prop({ required: true, unique: true })
  login!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true, type: EmailConfirmationSchema })
  emailConfirmation!: EmailConfirmation;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
