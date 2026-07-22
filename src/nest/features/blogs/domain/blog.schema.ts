import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'blogs', versionKey: false })
export class Blog {
  readonly _id!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  websiteUrl!: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true, default: false })
  isMembership!: boolean;
}

export type BlogDocument = HydratedDocument<Blog>;
export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.index({ name: 1 });
BlogSchema.index({ createdAt: -1 });
