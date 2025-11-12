import {
  IsString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Month } from '../../common/enums/month.enum';
import { IsDailyAttendance } from '../validators/attendance.validator';
import mongoose from 'mongoose';

// DTO para cada registro diario de estudiante
export class DailyAttendanceDto {
  @IsString({ message: 'El student debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El student es obligatorio' })
  student: string;

  // Objeto dinámico para los días (1-31)
  [key: string]: string;
}

// DTO principal para crear asistencia
export class CreateAttendanceDto {
  @IsMongoId({ message: 'El userId debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: mongoose.Types.ObjectId;

  @IsEnum(Month, { message: 'El mes proporcionado no es válido' })
  @IsNotEmpty({ message: 'El mes es obligatorio' })
  month: Month;

  @IsArray({ message: 'El campo data debe ser un array' })
  @IsNotEmpty({ message: 'El campo data es obligatorio' })
  @IsDailyAttendance({ each: true })
  data: DailyAttendanceDto[];
}
