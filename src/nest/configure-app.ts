import { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'hometask_13/api';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
}
