import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ValidMongoIdMiddleware } from '../common/middleware/valid-mongoid.middleware';

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService],
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
  ],
})
export class AttendanceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidMongoIdMiddleware)
      .exclude(
        { path: 'attendance', method: RequestMethod.POST },
        { path: 'attendance', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: 'attendance/:id', method: RequestMethod.ALL },
        { path: 'attendance/user/:id', method: RequestMethod.ALL },
      );
  }
}
