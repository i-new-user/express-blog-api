import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PostEntity } from './domain/post.schema';

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
}
