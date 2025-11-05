import { IsNotEmpty, IsString, isStrongPassword } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: 'El name es obligatorio' })
  @IsString({ message: 'El name debe ser una cadena de texto' })
  name: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsString({ message: 'El email debe ser una cadena de texto' })
  email: string;

  @IsNotEmpty({ message: 'El password es obligatorio' })
  @IsString({ message: 'El password debe ser una cadena de texto' })
  password: string;

  @IsNotEmpty({ message: 'El role es obligatorio' })
  @IsString({ message: 'El role debe ser una cadena de texto' })
  //todo: enum
  role: string;

  @IsNotEmpty({ message: 'El status es obligatorio' })
  @IsString({ message: 'El status debe ser una cadena de texto' })
  //todo: enum
  status: string;
}
