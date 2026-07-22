import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/nest/app.module';
import { configureApp } from '../src/nest/configure-app';

const expressServer = express();
let initializationPromise: Promise<void> | null = null;

const initialize = (): Promise<void> => {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressServer),
      );
      configureApp(app);
      await app.init();
    })();
  }

  return initializationPromise;
};

export default async function handler(req: Request, res: Response) {
  await initialize();
  return expressServer(req, res);
}
