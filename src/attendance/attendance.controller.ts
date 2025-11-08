import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FindOneAttendanceDto } from './dto/find-one-attendance.dto';

@UseGuards(JwtAuthGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Create attendance' })
  @ApiResponse({ status: 201, description: 'Attendance created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    const attendance = await this.attendanceService.create(createAttendanceDto);
    console.log(attendance);
    if (attendance) {
      throw new HttpException(
        'Ya existe una asistencia para este usuario y mes',
        HttpStatus.BAD_REQUEST,
      );
    }
    return attendance;
  }

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get all attendance by user' })
  @ApiResponse({ status: 200, description: 'Get all attendance by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('user/:id')
  async findAllByUser(@Param('id') id: string) {
    const attendance = await this.attendanceService.findAllByUser(id);
    if (!attendance) {
      throw new HttpException('Este usuario no tiene asistencias registradas', HttpStatus.NOT_FOUND);
    }
    return attendance;
  }

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get attendance by user and month' })
  @ApiResponse({ status: 200, description: 'Get attendance by user and month' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async findOne(@Body() findOneAttendanceDto: FindOneAttendanceDto) {
    const { userid, month } = findOneAttendanceDto;
    const attendance = await this.attendanceService.findOne(userid.toString(), month);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return attendance;
  }

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get attendance by id' })
  @ApiResponse({ status: 200, description: 'Get attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async findById(@Param('id') id: string) {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return attendance;
  }

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Update attendance by id' })
  @ApiResponse({ status: 200, description: 'Update attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const attendance = await this.attendanceService.update(
      id,
      updateAttendanceDto,
    );
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return attendance;
  }

  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Delete attendance by id' })
  @ApiResponse({ status: 200, description: 'Delete attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const attendance = await this.attendanceService.remove(id);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return attendance;
  }
}
