import { HydratedDocument, Types } from 'mongoose';

export type BlogDbModel = {
  _id: Types.ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogDocument = HydratedDocument<BlogDbModel>;
