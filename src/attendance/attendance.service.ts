import { Injectable } from '@nestjs/common';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Attendance } from './schemas/attendance.schema';
import { Model } from 'mongoose';
import { Month } from '../common/enums/month.enum';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
  ) {}

  create(createAttendanceDto: CreateAttendanceDto) {
    const createdAttendance = new this.attendanceModel(createAttendanceDto);
    return createdAttendance.save();
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
      console.error(`Error finding attendances for user ${userid}:`, error);
      throw new Error('Error retrieving attendance records');
    }
  }
  findById(id: string) {
    return this.attendanceModel.findOne({ _id: id }).exec();
  }
  findOne(id: string, month: Month) {
    return this.attendanceModel.findOne({ userid: id, month }).exec();
  }

  update(id: string, updateAttendanceDto: UpdateAttendanceDto) {
    return this.attendanceModel
      .findOneAndUpdate({ _id: id }, updateAttendanceDto, { new: true })
      .exec();
  }

  remove(id: string) {
    return this.attendanceModel.findOneAndDelete({ _id: id }).exec();
  }
}
