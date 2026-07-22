import { model, Schema } from 'mongoose';
import { CommentDbModel } from './comment.entity';

const commentLikeSchema = new Schema(
  {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
    status: { type: String, enum: ['Like', 'Dislike'], required: true },
    addedAt: { type: String, required: true },
  },
  { _id: false },
);

const commentatorInfoSchema = new Schema(
  {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
  },
  { _id: false },
);

const commentSchema = new Schema<CommentDbModel>(
  {
    postId: { type: String, required: true },
    content: { type: String, required: true },
    commentatorInfo: { type: commentatorInfoSchema, required: true },
    createdAt: { type: String, required: true },
    likes: { type: [commentLikeSchema], required: true, default: [] },
  },
  {
    collection: 'comments',
    versionKey: false,
  },
);

commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ 'likes.userId': 1 });

export const CommentModel = model<CommentDbModel>('Comment', commentSchema);
