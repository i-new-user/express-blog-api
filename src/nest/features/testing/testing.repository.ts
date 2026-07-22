import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async clearAllData(): Promise<void> {
    const collections = Object.values(this.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  }
}
