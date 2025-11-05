import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentsController } from './students.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Student, StudentSchema } from './schemas/students.schema';
import { ValidMongoIdMiddleware } from 'src/common/middleware/valid-mongoid.middleware';

@Module({
  controllers: [StudentsController],
  providers: [StudentsService],
  imports: [MongooseModule.forFeature([{ name: Student.name, schema: StudentSchema }])],
})
export class StudentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidMongoIdMiddleware)
      .exclude(
        { path: 'students', method: RequestMethod.POST },
        { path: 'students', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: 'students/:id', method: RequestMethod.ALL },
        { path: 'students/user/:id', method: RequestMethod.ALL },
      );
  }
}
