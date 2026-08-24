import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfig } from './config/app.config';
import { AuthModule } from './features/auth/auth.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { CommentsModule } from './features/comments/comments.module';
import { PostsModule } from './features/posts/posts.module';
import { TestingModule } from './features/testing/testing.module';
import { UsersModule } from './features/users/users.module';
import { SecurityModule } from './features/security/security.module';
import { RateLimitMiddleware } from './common/middlewares/rate-limit.middleware';

@Module({
  imports: [
    CqrsModule.forRoot(),
    MongooseModule.forRoot(appConfig.mongoUrl, {
      dbName: appConfig.dbName,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 10,
      autoIndex: true,
      retryAttempts: process.env.NODE_ENV === 'test' ? 0 : 3,
      retryDelay: 1000,
    }),
    UsersModule,
    AuthModule,
    BlogsModule,
    PostsModule,
    CommentsModule,
    TestingModule,
    SecurityModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RateLimitMiddleware).forRoutes(
      { path: 'auth/login', method: RequestMethod.POST },
      { path: 'auth/registration', method: RequestMethod.POST },
      { path: 'auth/registration-confirmation', method: RequestMethod.POST },
      { path: 'auth/registration-email-resending', method: RequestMethod.POST },
      { path: 'auth/password-recovery', method: RequestMethod.POST },
      { path: 'auth/new-password', method: RequestMethod.POST },
    );
  }
}
