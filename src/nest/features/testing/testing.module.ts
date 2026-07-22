import { Module } from '@nestjs/common';
import { TestingController } from './testing.controller';
import { TestingRepository } from './testing.repository';

@Module({
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
