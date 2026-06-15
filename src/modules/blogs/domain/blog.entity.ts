import { ObjectId } from 'mongodb';

/**
 * BlogDbModel — как блог хранится в MongoDB.
 *
 * В базе используем _id: ObjectId.
 * Наружу клиенту отдаём id: string.
 */
export type BlogDbModel = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};