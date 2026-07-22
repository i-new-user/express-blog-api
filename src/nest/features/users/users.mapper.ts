import { UserViewDto } from '../../../modules/users/dto/user.view-dto';
import { User } from './domain/user.schema';

export const mapUserToView = (user: User): UserViewDto => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});
