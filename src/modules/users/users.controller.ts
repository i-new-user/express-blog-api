import { Request, Response } from 'express';
import { usersService } from './users.service';
import { usersQueryRepository } from './users.query-repository';


export const usersController = {
  async createUser(req: Request, res: Response): Promise<void> {
    const createdUser = await usersService.createUser(req.body);

    if (!createdUser) {
      res.status(400).send({
        errorsMessages: [
          {
            message: 'User with this login or email already exists',
            field: 'login',
          },
        ],
      });
      return;
    }

    res.status(201).send(createdUser);
  },

  async getUsers(req: Request, res: Response): Promise<void> {
  const result = await usersQueryRepository.findUsers(req.query);

  res.status(200).send(result);
},

  async deleteUser(req: Request, res: Response): Promise<void> {
     const userId = String(req.params.id);
    const isDeleted = await usersService.deleteUser(userId);

    if (!isDeleted) {
      res.sendStatus(404);
      return;
    }

    res.sendStatus(204);
  },
};