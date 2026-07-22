import { model, Schema } from 'mongoose';
import { PostDbModel } from './post.entity';

const postLikeSchema = new Schema(
  {
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
    status: { type: String, enum: ['Like', 'Dislike'], required: true },
    addedAt: { type: String, required: true },
  },
  { _id: false },
);

const postSchema = new Schema<PostDbModel>(
  {
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogId: { type: String, required: true },
    blogName: { type: String, required: true },
    createdAt: { type: String, required: true },
    likes: { type: [postLikeSchema], required: true, default: [] },
  },
  {
    collection: 'posts',
    versionKey: false,
  },
);

postSchema.index({ createdAt: -1 });
postSchema.index({ blogId: 1, createdAt: -1 });
postSchema.index({ 'likes.userId': 1 });

export const PostModel = model<PostDbModel>('Post', postSchema);
