import { Request, Response } from 'express';
import { UserInputDto } from './dto/user.input-dto';
import { usersQueryRepository } from './users.query-repository';
import { usersService } from './users.service';

export const usersController = {
  async getUsers(req: Request, res: Response): Promise<void> {
    const result = await usersQueryRepository.findUsers(req.query);

    res.status(200).json(result);
  },

  async createUser(
    req: Request<object, object, UserInputDto>,
    res: Response,
  ): Promise<void> {
    const createdUser = await usersService.createUser(req.body);

    if (!createdUser) {
      res.status(400).json({
        errorsMessages: [
          {
            message: 'Login or email already exists',
            field: 'loginOrEmail',
          },
        ],
      });

      return;
    }

    res.status(201).json(createdUser);
  },

  async deleteUser(req: Request<{ id: string }>, res: Response): Promise<void> {
    const isDeleted = await usersService.deleteUser(req.params.id);

    if (!isDeleted) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },
};