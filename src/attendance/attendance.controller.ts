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
  Request,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FindOneAttendanceDto } from './dto/find-one-attendance.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { checkResourceOwnership } from 'src/auth/herlpers/authorization.helper';
import { UserRole } from 'src/users/interfaces/user-role.enum';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiCreateAttendance,
  ApiFindAllByUser,
  ApiFindOneAttendance,
  ApiFindByIdAttendance,
  ApiUpdateAttendance,
  ApiDeleteAttendance,
} from './decorators/swagger.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @ApiCreateAttendance()
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Request() req,
  ) {
    checkResourceOwnership(req.user, createAttendanceDto);
    const attendance = await this.attendanceService.create(createAttendanceDto);
    return { message: 'Asistencia creada exitosamente', attendance };
  }

  @Get('user/:id')
  @ApiFindAllByUser()
  async findAllByUser(@Param('id') id: string, @Request() req) {
    checkResourceOwnership(req.user, { userId: id.toString() });

    const attendance = await this.attendanceService.findAllByUser(id);
    if (!attendance) {
      throw new HttpException(
        'Este usuario no tiene asistencias registradas',
        HttpStatus.NOT_FOUND,
      );
    }

    return { message: 'Asistencias encontradas', attendance };
  }

  @Get()
  @ApiFindOneAttendance()
  async findOne(
    @Body() findOneAttendanceDto: FindOneAttendanceDto,
    @Request() req,
  ) {
    const { userId, month } = findOneAttendanceDto;
    checkResourceOwnership(req.user, { userId: userId.toString() });

    const attendance = await this.attendanceService.findOne(
      userId.toString(),
      month,
    );
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return { message: 'Asistencia encontrada', attendance };
  }

  @Get(':id')
  @ApiFindByIdAttendance()
  async findById(@Param('id') id: string, @Request() req) {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    checkResourceOwnership(req.user, attendance);

    return { message: 'Asistencia encontrada', attendance };
  }

  @Patch(':id')
  @ApiUpdateAttendance()
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Request() req,
  ) {
    checkResourceOwnership(req.user, updateAttendanceDto);

    const attendance = await this.attendanceService.update(
      id,
      updateAttendanceDto,
    );
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    return { message: 'Asistencia actualizada', attendance };
  }

  @Delete(':id')
  @ApiDeleteAttendance()
  async remove(@Param('id') id: string, @Request() req) {
    const attendance = await this.attendanceService.findById(id);
    checkResourceOwnership(req.user, attendance);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }

    const attendanceDeleted = await this.attendanceService.remove(id);
    return { message: 'Asistencia eliminada', attendanceDeleted };
  }
}