import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { appConfig } from '../../config/app.config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException();
    }

    const [type, encodedCredentials] = authorization.split(' ');

    if (type !== 'Basic' || !encodedCredentials) {
      throw new UnauthorizedException();
    }

    let decodedCredentials: string;

    try {
      decodedCredentials = Buffer.from(encodedCredentials, 'base64').toString(
        'utf8',
      );
    } catch {
      throw new UnauthorizedException();
    }

    const separatorIndex = decodedCredentials.indexOf(':');

    if (separatorIndex < 0) {
      throw new UnauthorizedException();
    }

    const login = decodedCredentials.slice(0, separatorIndex);
    const password = decodedCredentials.slice(separatorIndex + 1);

    if (
      login !== appConfig.adminLogin ||
      password !== appConfig.adminPassword
    ) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
