import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import type { Request, Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import type { AuthenticatedRequest } from './bearer-auth.guard';
import { LoginCommand } from './use-cases/login.use-case';
import { ConfirmRegistrationCommand, RecoverPasswordCommand, RegisterUserCommand, ResendRegistrationEmailCommand, SetNewPasswordCommand } from './use-cases/auth.use-cases';
import { RefreshTokenGuard } from './refresh-token.guard';
import type { RefreshAuthenticatedRequest } from './refresh-token.guard';
import { LogoutCommand, RefreshSessionCommand } from './use-cases/refresh-session.use-cases';
import {
  LoginDto,
  loginSchema,
  NewPasswordDto,
  newPasswordSchema,
  PasswordRecoveryDto,
  passwordRecoverySchema,
  RegistrationConfirmationDto,
  registrationConfirmationSchema,
  RegistrationDto,
  registrationEmailResendingSchema,
  RegistrationEmailResendingDto,
  registrationSchema,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly commandBus: CommandBus) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const forwarded = request.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : request.ip || 'unknown';
    const result = await this.commandBus.execute(new LoginCommand(dto, ip, request.headers['user-agent'] || 'unknown'));

    if (!result) {
      throw new UnauthorizedException();
    }

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 20 * 1000,
    });
    return { accessToken: result.accessToken };
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: RefreshAuthenticatedRequest, @Res({ passthrough: true }) res: Response) {
    const result = await this.commandBus.execute(new RefreshSessionCommand(req.userId, req.deviceId, req.tokenIssuedAt));
    if (!result) throw new UnauthorizedException();
    res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: true, sameSite: 'none', maxAge: 20_000 });
    return { accessToken: result.accessToken };
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: RefreshAuthenticatedRequest, @Res({ passthrough: true }) res: Response): Promise<void> {
    if (!(await this.commandBus.execute(new LogoutCommand(req.userId, req.deviceId, req.tokenIssuedAt)))) throw new UnauthorizedException();
    res.clearCookie('refreshToken', { httpOnly: true, secure: true, sameSite: 'none' });
  }

  @Get('me')
  @UseGuards(BearerAuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const result = await this.authService.getMe(request.userId);

    if (!result) {
      throw new UnauthorizedException();
    }

    return result;
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(
    @Body(new ZodValidationPipe(registrationSchema))
    dto: RegistrationDto,
  ): Promise<void> {
    await this.commandBus.execute(new RegisterUserCommand(dto));
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body(new ZodValidationPipe(registrationConfirmationSchema))
    dto: RegistrationConfirmationDto,
  ): Promise<void> {
    const isConfirmed = await this.commandBus.execute(new ConfirmRegistrationCommand(dto.code));

    if (!isConfirmed) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message:
              'Confirmation code is incorrect, expired or already applied',
            field: 'code',
          },
        ],
      });
    }
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationEmailResending(
    @Body(new ZodValidationPipe(registrationEmailResendingSchema))
    dto: RegistrationEmailResendingDto,
  ): Promise<void> {
    const isResent = await this.commandBus.execute(new ResendRegistrationEmailCommand(dto.email));

    if (!isResent) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Email is incorrect or already confirmed',
            field: 'email',
          },
        ],
      });
    }
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async passwordRecovery(
    @Body(new ZodValidationPipe(passwordRecoverySchema))
    dto: PasswordRecoveryDto,
  ): Promise<void> {
    await this.commandBus.execute(new RecoverPasswordCommand(dto.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body(new ZodValidationPipe(newPasswordSchema)) dto: NewPasswordDto,
  ): Promise<void> {
    const isUpdated = await this.commandBus.execute(new SetNewPasswordCommand(dto));

    if (!isUpdated) {
      throw new BadRequestException({
        errorsMessages: [
          {
            message: 'Recovery code is incorrect or expired',
            field: 'recoveryCode',
          },
        ],
      });
    }
  }
}
