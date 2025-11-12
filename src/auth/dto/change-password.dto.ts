import {
  IsNotEmpty,
  IsEmail,
  IsString,
  IsStrongPassword,
  Length,
} from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @Length(6, 6, { message: 'El token debe tener 6 caracteres' })
  token: string;

  @IsNotEmpty({ message: 'El password es obligatorio' })
  @IsString({ message: 'El password debe ser una cadena de texto' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'El password debe tener al menos 8 caracteres e incluir: mayúsculas, minúsculas, números y caracteres especiales',
    },
  )
  newPassword: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;
}
