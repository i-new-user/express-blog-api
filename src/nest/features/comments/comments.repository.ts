import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CommentEntity } from './domain/comment.schema';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(CommentEntity.name) private readonly model: Model<CommentEntity>) {}
  create(comment: Omit<CommentEntity, '_id'>): Promise<CommentEntity> { return this.model.create(comment); }
  findById(id: string): Promise<CommentEntity | null> {
    return isValidObjectId(id) ? this.model.findById(id).lean<CommentEntity>() : Promise.resolve(null);
  }
  async updateContent(id: string, content: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    return (await this.model.updateOne({ _id: id }, { $set: { content } })).matchedCount === 1;
  }
  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) return false;
    return (await this.model.deleteOne({ _id: id })).deletedCount === 1;
  }
  async updateLikeStatus(commentId: string, userId: string, userLogin: string, status: 'None' | 'Like' | 'Dislike'): Promise<boolean> {
    if (!isValidObjectId(commentId)) return false;
    if (status === 'None') return (await this.model.updateOne({ _id: commentId }, { $pull: { likes: { userId } } })).matchedCount === 1;
    const like = { userId, userLogin, status, addedAt: new Date().toISOString() };
    const updated = await this.model.updateOne({ _id: commentId, 'likes.userId': userId },
      { $set: { 'likes.$.status': status, 'likes.$.userLogin': userLogin, 'likes.$.addedAt': like.addedAt } });
    if (updated.matchedCount === 1) return true;
    return (await this.model.updateOne({ _id: commentId, 'likes.userId': { $ne: userId } }, { $push: { likes: like } })).matchedCount === 1;
  }
}
