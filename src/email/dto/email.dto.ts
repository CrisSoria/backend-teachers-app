import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEmail,
  IsArray,
} from 'class-validator';

export class EmailDto {
  @IsEmail(
    {},
    { message: 'Los destinatarios deben ser emails validos', each: true },
  )
  @IsNotEmpty({ message: 'Los destinatarios son obligatorios' })
  @IsArray({ message: 'Los destinatarios deben ser un array de emails' })
  recipients: string[];

  @IsString({ message: 'El asunto debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El asunto es obligatorio' })
  subject: string;

  @IsString({ message: 'El contenido HTML debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido HTML es obligatorio' })
  html: string;

  @IsOptional()
  @IsString({ message: 'El contenido texto debe ser una cadena de texto' })
  text?: string;
}
