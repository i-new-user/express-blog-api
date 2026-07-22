import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { TestingRepository } from './testing.repository';

@Controller('testing')
export class TestingController {
  constructor(private readonly testingRepository: TestingRepository) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllData(): Promise<void> {
    await this.testingRepository.clearAllData();
  }
}
