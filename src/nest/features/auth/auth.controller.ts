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
import type { Response } from 'express';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import type { AuthenticatedRequest } from './bearer-auth.guard';
import { LoginCommand } from './use-cases/login.use-case';
import { ConfirmRegistrationCommand, RecoverPasswordCommand, RegisterUserCommand, ResendRegistrationEmailCommand, SetNewPasswordCommand } from './use-cases/auth.use-cases';
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
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.commandBus.execute(new LoginCommand(dto));

    if (!result) {
      throw new UnauthorizedException();
    }

    response.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
    return { accessToken: result.accessToken };
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
