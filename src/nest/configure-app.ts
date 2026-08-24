import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';

export const API_PREFIX = 'hometask_15/api';

export function configureApp(app: INestApplication): void {
  app.use(cookieParser());
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
}
