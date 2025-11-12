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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FindOneAttendanceDto } from './dto/find-one-attendance.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { checkResourceOwnership } from 'src/auth/herlpers/authorization.helper';
import { UserRole } from 'src/users/interfaces/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /*
   * Crear asistencia
   * POST /attendance
   */
  @Post()
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Create attendance' })
  @ApiResponse({ status: 201, description: 'Attendance created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(
    @Body() createAttendanceDto: CreateAttendanceDto,
    @Request() req,
  ) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT está creando su propia asistencia
    checkResourceOwnership(req.user, createAttendanceDto);

    const attendance = await this.attendanceService.create(createAttendanceDto);
    return { message: 'Asistencia creada exitosamente', attendance };
  }

  /*
   * Obtener todas las asistencias de un usuario
   * GET /attendance/user/:id
   */
  @Get('user/:id')
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get all attendance by user' })
  @ApiResponse({ status: 200, description: 'Get all attendance by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAllByUser(@Param('id') id: string, @Request() req) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando su propia asistencia
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

  /*
   * Obtener una asistencia por usuario y mes
   * GET /attendance
   */
  @Get()
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get attendance by user and month' })
  @ApiResponse({ status: 200, description: 'Get attendance by user and month' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(
    @Body() findOneAttendanceDto: FindOneAttendanceDto,
    @Request() req,
  ) {
    const { userId, month } = findOneAttendanceDto;
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando su propia asistencia
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

  /*
   * Obtener una asistencia por id
   * GET /attendance/:id
   */
  @Get(':id')
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Get attendance by id' })
  @ApiResponse({ status: 200, description: 'Get attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findById(@Param('id') id: string, @Request() req) {
    const attendance = await this.attendanceService.findById(id);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando su propia asistencia
    checkResourceOwnership(req.user, attendance);

    return { message: 'Asistencia encontrada', attendance };
  }

  /*
   * Actualizar una asistencia por id
   * PATCH /attendance/:id
   */
  @Patch(':id')
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Update attendance by id' })
  @ApiResponse({ status: 200, description: 'Update attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Request() req,
  ) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta actualizando su propia asistencia
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

  /*
   * Eliminar una asistencia por id
   * DELETE /attendance/:id
   */
  @Delete(':id')
  @ApiTags('Attendance')
  @ApiOperation({ summary: 'Delete attendance by id' })
  @ApiResponse({ status: 200, description: 'Delete attendance by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string, @Request() req) {
    // Revisa previamente a la eliminación, que el usuario del JWT esta eliminando su propia asistencia
    const attendance = await this.attendanceService.findById(id);
    checkResourceOwnership(req.user, attendance);
    if (!attendance) {
      throw new HttpException('Asistencia no encontrada', HttpStatus.NOT_FOUND);
    }

    const attendanceDeleted = await this.attendanceService.remove(id);
    return { message: 'Asistencia eliminada', attendanceDeleted };
  }
}
