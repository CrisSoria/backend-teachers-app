import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString({ message: 'El name debe ser una cadena de texto' })
  @IsOptional()
  name?: string;

  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsOptional()
  email?: string;

  @IsString({ message: 'El password debe ser una cadena de texto' })
  @IsOptional()
  password?: string;

  @IsString({ message: 'El role debe ser una cadena de texto' })
  @IsOptional()
  //todo: enum
  role?: string;

  @IsString({ message: 'El status debe ser una cadena de texto' })
  @IsOptional()
  //todo: enum
  status?: string;
}
