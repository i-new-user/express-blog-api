import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreateBlogDto } from './dto/blog.dto';
import { Blog } from './domain/blog.schema';

@Injectable()
export class BlogsRepository {
  constructor(
    @InjectModel(Blog.name)
    private readonly blogModel: Model<Blog>,
  ) {}

  create(blog: Omit<Blog, '_id'>): Promise<Blog> {
    return this.blogModel.create(blog);
  }

  async findById(id: string): Promise<Blog | null> {
    if (!isValidObjectId(id)) {
      return null;
    }

    return this.blogModel.findById(id).lean<Blog>();
  }

  async updateById(id: string, dto: CreateBlogDto): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await this.blogModel.updateOne(
      { _id: id },
      { $set: { name: dto.name, description: dto.description, websiteUrl: dto.websiteUrl } },
    );

    return result.matchedCount === 1;
  }

  async deleteById(id: string): Promise<boolean> {
    if (!isValidObjectId(id)) {
      return false;
    }

    const result = await this.blogModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
