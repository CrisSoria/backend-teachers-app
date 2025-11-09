import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { Model } from 'mongoose';
import { Month } from '../common/enums/month.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto) {
    try {
      const createdAttendance = new this.attendanceModel(createAttendanceDto);
      const newAttendance = await createdAttendance.save();
      return newAttendance;
    } catch (error) {
      // Error de duplicado (userid y month únicos)
      if (error.code === 11000) {
        throw new HttpException(
          {
            message: 'Ya existe una asistencia para este usuario y mes',
            error: error.message,
          },
          HttpStatus.CONFLICT,
        );
      }
      console.error(
        `Error creando asistencia para el usuario ${createAttendanceDto.userid}:`,
        error,
      );
      throw new HttpException(
        { message: 'Error creando asistencia', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
    return this.attendanceModel.find().exec();
  }

  async findAllByUser(userid: string) {
    try {
      return await this.attendanceModel
        .find({ userid })
        .sort({ month: 1 }) // Sorts by month in ascending order
        .exec();
    } catch (error) {
      // Log the error for debugging
      console.error(
        `Error encontrando registros de asistencia para el usuario ${userid}:`,
        error,
      );
      throw new HttpException(
        {
          message: 'Error encontrando registros de asistencia',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findById(id: string) {
    try {
      return await this.attendanceModel.findOne({ _id: id }).exec();
    } catch (error) {
      // Log the error for debugging
      console.error(
        `Error encontrando asistencia para el usuario ${id}:`,
        error,
      );
      throw new HttpException(
        { message: 'Error encontrando asistencia', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async findOne(id: string, month: Month) {
    try {
      return await this.attendanceModel.findOne({ userid: id, month }).exec();
    } catch (error) {
      // Log the error for debugging
      console.error(
        `Error encontrando asistencia para el usuario ${id}:`,
        error,
      );
      throw new HttpException(
        { message: 'Error encontrando asistencia', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    try {
      return await this.attendanceModel
        .findOneAndUpdate({ _id: id }, updateAttendanceDto, { new: true })
        .exec();
    } catch (error) {
      // Log the error for debugging
      console.error(
        `Error actualizando asistencia para el usuario ${id}:`,
        error,
      );
      throw new HttpException(
        { message: 'Error actualizando asistencia', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.attendanceModel.findOneAndDelete({ _id: id }).exec();
    } catch (error) {
      // Log the error for debugging
      console.error(
        `Error eliminando asistencia para el usuario ${id}:`,
        error,
      );
      throw new HttpException(
        { message: 'Error eliminando asistencia', error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
