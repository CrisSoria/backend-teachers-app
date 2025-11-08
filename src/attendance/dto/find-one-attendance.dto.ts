import {
  IsEnum,
  IsNotEmpty,
  IsMongoId,
} from 'class-validator';
import { Month } from '../../common/enums/month.enum';
import mongoose from 'mongoose';

// DTO para buscar asistencia por usuario y mes
export class FindOneAttendanceDto {
  @IsMongoId({ message: 'El userid debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El userid es obligatorio' })
  userid: mongoose.Types.ObjectId;

  @IsEnum(Month, { message: 'El mes proporcionado no es válido' })
  @IsNotEmpty({ message: 'El mes es obligatorio' })
  month: Month;
}
