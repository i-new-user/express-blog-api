import { ObjectId } from 'mongodb';

export type LikeStatus = 'None' | 'Like' | 'Dislike';

export type CommentLikeDbModel = {
  userId: string;
  userLogin: string;
  status: Exclude<LikeStatus, 'None'>;
  addedAt: string;
};

export type CommentDbModel = {
  _id: ObjectId;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likes: CommentLikeDbModel[];
};