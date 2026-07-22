import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class PostLike {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userLogin!: string;

  @Prop({ required: true, enum: ['Like', 'Dislike'], type: String })
  status!: 'Like' | 'Dislike';

  @Prop({ required: true })
  addedAt!: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

@Schema({ collection: 'posts', versionKey: false })
export class PostEntity {
  readonly _id!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true })
  blogId!: string;

  @Prop({ required: true })
  blogName!: string;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true, default: [], type: [PostLikeSchema] })
  likes!: PostLike[];
}

export type PostDocument = HydratedDocument<PostEntity>;
export const PostSchema = SchemaFactory.createForClass(PostEntity);

PostSchema.index({ createdAt: -1 });
PostSchema.index({ blogId: 1, createdAt: -1 });
PostSchema.index({ 'likes.userId': 1 });
