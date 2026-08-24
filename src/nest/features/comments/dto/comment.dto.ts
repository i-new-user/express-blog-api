import { z } from 'zod';

export const commentSchema = z.object({
  content: z.string().trim().min(20).max(300),
});
export class CommentDto { content!: string; }

export const likeStatusSchema = z.object({ likeStatus: z.enum(['None', 'Like', 'Dislike']) });
export class LikeStatusDto { likeStatus!: 'None' | 'Like' | 'Dislike'; }
