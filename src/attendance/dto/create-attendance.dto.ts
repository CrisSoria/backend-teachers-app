import {
  IsString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Month } from '../../common/enums/month.enum';
import { IsDailyAttendance } from '../validators/attendance.validator';

// DTO para cada registro diario de estudiante
export class DailyAttendanceDto {
  @IsString()
  @IsNotEmpty()
  student: string;

  // Objeto dinámico para los días (1-31)
  [key: string]: string;
}

// DTO principal para crear asistencia
export class CreateAttendanceDto {
  @IsMongoId()
  @IsNotEmpty()
  userid: string;

  @IsEnum(Month)
  @IsNotEmpty()
  month: Month;

  @IsArray()
  @IsNotEmpty()
  @IsDailyAttendance({ each: true })
  data: DailyAttendanceDto[];
}
