import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class CommentatorInfo {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userLogin!: string;
}

const CommentatorInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ _id: false })
export class CommentLike {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  userLogin!: string;

  @Prop({ required: true, enum: ['Like', 'Dislike'], type: String })
  status!: 'Like' | 'Dislike';

  @Prop({ required: true })
  addedAt!: string;
}

const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

@Schema({ collection: 'comments', versionKey: false })
export class CommentEntity {
  readonly _id!: Types.ObjectId;

  @Prop({ required: true })
  postId!: string;

  @Prop({ required: true })
  content!: string;

  @Prop({ required: true, type: CommentatorInfoSchema })
  commentatorInfo!: CommentatorInfo;

  @Prop({ required: true })
  createdAt!: string;

  @Prop({ required: true, default: [], type: [CommentLikeSchema] })
  likes!: CommentLike[];
}

export type CommentDocument = HydratedDocument<CommentEntity>;
export const CommentSchema = SchemaFactory.createForClass(CommentEntity);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ 'likes.userId': 1 });
