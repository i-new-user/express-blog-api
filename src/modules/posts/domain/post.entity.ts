import { HydratedDocument, Types } from 'mongoose';
import { LikeStatus } from '../../comments/domain/comment.entity';

export type PostLikeDbModel = {
  userId: string;
  userLogin: string;
  status: Exclude<LikeStatus, 'None'>;
  addedAt: string;
};

export type PostDbModel = {
  _id: Types.ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likes: PostLikeDbModel[];
};

export type PostDocument = HydratedDocument<PostDbModel>;
