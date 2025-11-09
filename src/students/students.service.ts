import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateStudentDto, CreateManyStudentsDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student, StudentDocument } from 'src/students/schemas/students.schema';

@Injectable()
export class StudentsService {
  constructor(@InjectModel(Student.name) private studentModel: Model<StudentDocument>) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      const createdStudent = new this.studentModel(createStudentDto);
      return await createdStudent.save();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new HttpException({
          message: 'Error de validación',
          errors: messages
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        message: 'Error al crear el estudiante',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createMany(createStudentsDto: CreateManyStudentsDto) {
    if (!createStudentsDto.students || !Array.isArray(createStudentsDto.students)) {
      throw new HttpException('Se esperaba un array de estudiantes', HttpStatus.BAD_REQUEST);
    }
    
    try {
      return await this.studentModel.insertMany(createStudentsDto.students);
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new HttpException({
          message: 'Error de validación',
          errors: messages
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        message: 'Error al crear los estudiantes',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findAllByUser(userId: string) {
    return this.studentModel.find({ userId: userId }).exec();
  }

  findOne(id: string) {
    return this.studentModel.findById(id).exec();
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    try {
      return await this.studentModel
        .findByIdAndUpdate(id, updateStudentDto, { new: true, runValidators: true })
        .exec();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        throw new HttpException({
          message: 'Error de validación',
          errors: messages
        }, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException({
        message: 'Error al actualizar el estudiante',
        error: error.message,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  remove(id: string) {
    return this.studentModel.findByIdAndDelete(id).exec();
  }
}