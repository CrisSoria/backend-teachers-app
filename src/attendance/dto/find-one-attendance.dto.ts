import { IsEnum, IsNotEmpty, IsMongoId } from 'class-validator';
import { Month } from '../../common/enums/month.enum';
import mongoose from 'mongoose';

// DTO para buscar asistencia por usuario y mes
export class FindOneAttendanceDto {
  @IsMongoId({ message: 'El userId debe ser un MongoID válido' })
  @IsNotEmpty({ message: 'El userId es obligatorio' })
  userId: mongoose.Types.ObjectId;

  @IsEnum(Month, { message: 'El mes proporcionado no es válido' })
  @IsNotEmpty({ message: 'El mes es obligatorio' })
  month: Month;
}
