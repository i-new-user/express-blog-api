import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const errorsByField = new Map<string, string>();

      for (const issue of result.error.issues) {
        const field = String(issue.path[0]);
        if (!errorsByField.has(field)) {
          errorsByField.set(field, issue.message);
        }
      }

      throw new BadRequestException({
        errorsMessages: Array.from(errorsByField, ([field, message]) => ({
          message,
          field,
        })),
      });
    }

    return result.data;
  }
}
