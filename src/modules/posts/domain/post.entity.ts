import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../comments/domain/comment.entity';

export type PostLikeDbModel = {
  userId: string;
  userLogin: string;
  status: Exclude<LikeStatus, 'None'>;
  addedAt: string;
};

export type PostDbModel = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likes: PostLikeDbModel[];
};
