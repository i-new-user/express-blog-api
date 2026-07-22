import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './nest/app.module';
import { configureApp } from './nest/configure-app';
import { appConfig } from './nest/config/app.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  await app.listen(appConfig.port);
  console.log(`Nest application started on port ${appConfig.port}`);
}

void bootstrap();
