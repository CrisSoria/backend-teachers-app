import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { 
  IsOptional, 
  IsString, 
  IsEnum, 
  IsEmail,
  IsStrongPassword,
  MinLength,
  MaxLength
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from "../interfaces/user-role.enum";
import { UserStatus } from "../interfaces/user-status-enum";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez Actualizado',
    minLength: 2,
    maxLength: 100
  })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Correo electrónico del usuario',
    example: 'nuevo-email@ejemplo.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña del usuario',
    example: 'NuevoPassword123!',
    minLength: 8
  })
  @IsOptional()
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
    }
  )
  password?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.TEACHER
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol proporcionado no es válido' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Estado actual del usuario',
    enum: UserStatus,
    example: UserStatus.ACTIVE
  })
  @IsOptional()
  @IsEnum(UserStatus, { message: 'El estado proporcionado no es válido' })
  status?: UserStatus;
}