import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateOtpDto {
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsString({ message: 'El token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El token es obligatorio' })
  @Length(6, 6, { message: 'El token debe tener 6 caracteres' })
  token: string;
}
