import { UserDbModel } from './domain/user.entity';
import { UserViewDto } from './dto/user.view-dto';

export const mapUserToView = (user: UserDbModel): UserViewDto => ({
  id: user._id.toString(),
  login: user.login,
  email: user.email,
  createdAt: user.createdAt,
});