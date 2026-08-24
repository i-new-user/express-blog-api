import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PostEntity } from './domain/post.schema';
import { LikeStatus } from '../../../modules/comments/domain/comment.entity';

type PostUpdate = Pick<
  PostEntity,
  'title' | 'shortDescription' | 'content' | 'blogId' | 'blogName'
>;

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostEntity.name)
    private readonly postModel: Model<PostEntity>,
  ) {}

  create(post: Omit<PostEntity, '_id'>): Promise<PostEntity> {
    return this.postModel.create(post);
  }

  async exists(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    return Boolean(await this.postModel.exists({ _id: id }));
  }

  async findById(id: string): Promise<PostEntity | null> {
    if (!isValidObjectId(id)) return null;
    return this.postModel.findById(id).lean<PostEntity>();
  }

  async updateById(id: string, update: PostUpdate): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await this.postModel.updateOne({ _id: id }, { $set: update });
    return result.matchedCount === 1;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await this.postModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async updateLikeStatus(postId: string, userId: string, userLogin: string, status: LikeStatus): Promise<boolean> {
    if (!isValidObjectId(postId)) return false;
    if (status === 'None') {
      const result = await this.postModel.updateOne({ _id: postId }, { $pull: { likes: { userId } } });
      return result.matchedCount === 1;
    }
    const like = { userId, userLogin, status, addedAt: new Date().toISOString() };
    const updated = await this.postModel.updateOne(
      { _id: postId, 'likes.userId': userId },
      { $set: { 'likes.$.status': status, 'likes.$.userLogin': userLogin, 'likes.$.addedAt': like.addedAt } },
    );
    if (updated.matchedCount === 1) return true;
    const inserted = await this.postModel.updateOne(
      { _id: postId, 'likes.userId': { $ne: userId } },
      { $push: { likes: like } },
    );
    return inserted.matchedCount === 1;
  }
}
