import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AuthService } from './auth.service';
import { BearerAuthGuard } from './bearer-auth.guard';
import type { AuthenticatedRequest } from './bearer-auth.guard';
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
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) dto: LoginDto,
  ) {
    const result = await this.authService.login(dto);

    if (!result) {
      throw new UnauthorizedException();
    }

    return result;
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
    await this.authService.register(dto);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrationConfirmation(
    @Body(new ZodValidationPipe(registrationConfirmationSchema))
    dto: RegistrationConfirmationDto,
  ): Promise<void> {
    const isConfirmed = await this.authService.confirmRegistration(dto.code);

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
    const isResent = await this.authService.resendRegistrationEmail(dto.email);

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
    await this.authService.passwordRecovery(dto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async newPassword(
    @Body(new ZodValidationPipe(newPasswordSchema)) dto: NewPasswordDto,
  ): Promise<void> {
    const isUpdated = await this.authService.setNewPassword(dto);

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
