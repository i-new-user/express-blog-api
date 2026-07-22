import { mongo } from 'mongoose';

export const isDuplicateKeyError = (error: unknown): boolean => {
  return error instanceof mongo.MongoServerError && error.code === 11000;
};

export const getDuplicateKeyField = (error: unknown): string | null => {
  if (!(error instanceof mongo.MongoServerError)) {
    return null;
  }

  const keyPattern = error.keyPattern as Record<string, unknown> | undefined;

  if (!keyPattern) {
    return null;
  }

  return Object.keys(keyPattern)[0] ?? null;
};
