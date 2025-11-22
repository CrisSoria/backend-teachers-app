import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsStrongPassword,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 3,
    maxLength: 30,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(30, { message: 'El nombre no puede exceder 30 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(30, { message: 'El email no puede exceder 30 caracteres' })
  email: string;

  @ApiProperty({
    description:
      'Contraseña del usuario (mínimo 8 caracteres, debe incluir mayúsculas, minúsculas, números y símbolos)',
    example: 'MiPassword123!',
    minLength: 8,
  })
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
  password: string;
}
