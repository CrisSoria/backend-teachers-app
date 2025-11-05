import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StudentsGender } from '../interfaces/students-gender.enum';
import * as mongoose from 'mongoose';

@Schema()
export class Student {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  birthdate: Date;

  @Prop({ 
    required: false, 
    enum: {
      values: Object.values(StudentsGender),
      message: 'El género debe ser uno de los siguientes valores: ' + Object.values(StudentsGender).join(', ')
    },
    type: String 
  })
  gender: StudentsGender;

  @Prop({ required: true })
  order: number;
}

export const StudentSchema = SchemaFactory.createForClass(Student);