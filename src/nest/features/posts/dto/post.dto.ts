export class CreatePostDto {
  title!: string;
  shortDescription!: string;
  content!: string;
  blogId!: string;
}

export class CreateBlogPostDto {
  title!: string;
  shortDescription!: string;
  content!: string;
}
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(30),
  shortDescription: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(1000),
  blogId: z.string().trim().min(1),
});
export const createBlogPostSchema = createPostSchema.omit({ blogId: true });
