import { LikeStatus } from '../../comments/domain/comment.entity';

export type NewestLikeViewDto = {
  addedAt: string;
  userId: string;
  login: string;
};

export type ExtendedLikesInfoViewDto = {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikeStatus;
  newestLikes: NewestLikeViewDto[];
};

export type PostViewDto = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoViewDto;
};
