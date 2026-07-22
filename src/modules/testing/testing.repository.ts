import { BlogModel } from '../blogs/domain/blog.model';
import { CommentModel } from '../comments/domain/comment.model';
import { PostModel } from '../posts/domain/post.model';
import { UserModel } from '../users/domain/user.model';
import { SecurityDeviceModel } from '../auth/devices/security-device.model';

export const testingRepository = {
  async clearAllData(): Promise<void> {
    await Promise.all([
      BlogModel.deleteMany({}),
      PostModel.deleteMany({}),
      UserModel.deleteMany({}),
      CommentModel.deleteMany({}),
      SecurityDeviceModel.deleteMany({}),
    ]);
  },
};
