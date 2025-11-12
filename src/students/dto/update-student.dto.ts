import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import {
  IsOptional,
  IsString,
  IsMongoId,
  IsEnum,
  IsDate,
  IsNumber,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { StudentsGender } from '../interfaces/students-gender.enum';
import * as mongoose from 'mongoose';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @IsMongoId({ message: 'El userId debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId?: mongoose.Types.ObjectId;

  @IsString({ message: 'El name debe ser una cadena de texto' })
  @IsOptional()
  name?: string;

  @IsDate({ message: 'El birthdate debe ser una fecha' })
  @IsOptional()
  birthdate?: Date;

  @IsOptional()
  @IsEnum(StudentsGender, {
    message:
      'El gender debe ser un género válido: ' +
      Object.values(StudentsGender).join(', '),
  })
  gender?: StudentsGender;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'El order debe ser un número mayor o igual a 1' })
  order?: number;
}
