import { HydratedDocument, Types } from 'mongoose';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

export type CommentLikeDbModel = {
  userId: string;
  userLogin: string;
  status: Exclude<LikeStatus, 'None'>;
  addedAt: string;
};

export type CommentDbModel = {
  _id: Types.ObjectId;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likes: CommentLikeDbModel[];
};

export type CommentDocument = HydratedDocument<CommentDbModel>;
