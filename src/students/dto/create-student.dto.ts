import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StudentsGender } from '../interfaces/students-gender.enum';

export class CreateStudentDto {
  @IsNotEmpty({ message: 'El name es obligatorio' })
  @IsString({ message: 'El name debe ser una cadena de texto' })
  name: string;

  @IsNotEmpty({ message: 'El birthdate es obligatorio' })
  @Type(() => Date)
  birthdate: Date;

  @IsOptional()
  @IsEnum(StudentsGender, {
    message: () =>
      `El género debe ser uno de los siguientes valores: ${Object.values(StudentsGender).join(', ')}`,
  })
  gender: StudentsGender;

  @IsNotEmpty({ message: 'El order es obligatorio' })
  @IsNumber()
  @Min(1, { message: 'El order debe ser un número mayor o igual a 1' })
  order: number;
}

export class CreateManyStudentsDto {
  @IsArray({ message: 'Se esperaba un array de estudiantes' })
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students: CreateStudentDto[];
}
