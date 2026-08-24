import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { NewPasswordDto, RegistrationDto } from '../dto/auth.dto';

export class RegisterUserCommand { constructor(public readonly dto: RegistrationDto) {} }
export class ConfirmRegistrationCommand { constructor(public readonly code: string) {} }
export class ResendRegistrationEmailCommand { constructor(public readonly email: string) {} }
export class RecoverPasswordCommand { constructor(public readonly email: string) {} }
export class SetNewPasswordCommand { constructor(public readonly dto: NewPasswordDto) {} }

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<RegisterUserCommand> {
  constructor(private readonly auth: AuthService) {}
  execute({ dto }: RegisterUserCommand) { return this.auth.register(dto); }
}
@CommandHandler(ConfirmRegistrationCommand)
export class ConfirmRegistrationUseCase implements ICommandHandler<ConfirmRegistrationCommand> {
  constructor(private readonly auth: AuthService) {}
  execute({ code }: ConfirmRegistrationCommand) { return this.auth.confirmRegistration(code); }
}
@CommandHandler(ResendRegistrationEmailCommand)
export class ResendRegistrationEmailUseCase implements ICommandHandler<ResendRegistrationEmailCommand> {
  constructor(private readonly auth: AuthService) {}
  execute({ email }: ResendRegistrationEmailCommand) { return this.auth.resendRegistrationEmail(email); }
}
@CommandHandler(RecoverPasswordCommand)
export class RecoverPasswordUseCase implements ICommandHandler<RecoverPasswordCommand> {
  constructor(private readonly auth: AuthService) {}
  execute({ email }: RecoverPasswordCommand) { return this.auth.passwordRecovery(email); }
}
@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase implements ICommandHandler<SetNewPasswordCommand> {
  constructor(private readonly auth: AuthService) {}
  execute({ dto }: SetNewPasswordCommand) { return this.auth.setNewPassword(dto); }
}

export const AUTH_COMMAND_HANDLERS = [RegisterUserUseCase, ConfirmRegistrationUseCase, ResendRegistrationEmailUseCase, RecoverPasswordUseCase, SetNewPasswordUseCase];
