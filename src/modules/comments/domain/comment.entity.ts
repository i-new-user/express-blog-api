import { ObjectId } from 'mongodb';

export type CommentDbModel = {
  _id: ObjectId;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
};