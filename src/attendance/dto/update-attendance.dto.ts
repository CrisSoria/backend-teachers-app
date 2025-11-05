import { PartialType } from '@nestjs/swagger';
import {
  CreateAttendanceDto,
  DailyAttendanceDto,
} from './create-attendance.dto';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Month } from '../../common/enums/month.enum';
import { IsDailyAttendance } from '../validators/attendance.validator';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @IsMongoId({ message: 'El userid debe ser un MongoID válido' })
  userid: string;

  @IsEnum(Month, { message: 'El mes proporcionado no es válido' })
  month: Month;

  @IsArray({ message: 'El campo data debe ser un array' })
  @ValidateNested({ each: true })
  @IsObject({
    each: true,
    message: 'Cada elemento del array debe ser un objeto',
  })
  @IsDailyAttendance({})
  @Type(() => DailyAttendanceDto)
  data: DailyAttendanceDto[];
}
