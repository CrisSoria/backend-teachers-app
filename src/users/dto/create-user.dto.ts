import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsStrongPassword,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../interfaces/user-role.enum';
import { UserStatus } from '../interfaces/user-status-enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
    minLength: 2,
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
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

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.TEACHER, // Ajusta según tu enum
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(UserRole, { message: 'El rol proporcionado no es válido' })
  role: UserRole;

  @ApiProperty({
    description: 'Estado actual del usuario',
    enum: UserStatus,
    example: UserStatus.ACTIVE, // Ajusta según tu enum
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(UserStatus, { message: 'El estado proporcionado no es válido' })
  status: UserStatus;
}
