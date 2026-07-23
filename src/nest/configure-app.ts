import { INestApplication } from '@nestjs/common';

export const API_PREFIX = 'hometask_14/api';

export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();
}
