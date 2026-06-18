import { z } from 'zod';

export const commentLikeStatusSchema = z.object({
  likeStatus: z.enum(['None', 'Like', 'Dislike']),
});

export type CommentLikeStatusInputDto = z.infer<
  typeof commentLikeStatusSchema
>;