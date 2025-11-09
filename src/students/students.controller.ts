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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @ApiTags('Students')
  @ApiOperation({ summary: 'Create student' })
  @ApiResponse({ status: 201, description: 'Student created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Post()
  async create(@Body() body: CreateStudentDto | CreateStudentDto[]) {
    // Si es un array de estudiantes
    if (Array.isArray(body)) {
      if (body.length === 0) {
        throw new HttpException(
          'El array de estudiantes no puede estar vacío',
          HttpStatus.BAD_REQUEST,
        );
      }
      const students = await this.studentsService.createMany({
        students: body,
      });
      return { message: 'Estudiantes creados exitosamente', students };
    }

    // Si es un solo estudiante
    const student = await this.studentsService.create(body);
    return { message: 'Estudiante creado exitosamente', student };
  }

  @ApiTags('Students')
  @ApiOperation({ summary: 'Get all students by user' })
  @ApiResponse({ status: 200, description: 'Get all students by user' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get('user/:id')
  async findAllByUser(@Param('id') id: string) {
    const students = await this.studentsService.findAllByUser(id);
    if (!students) {
      throw new HttpException(
        'Este usuario no tiene estudiantes registrados',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Estudiantes obtenidos exitosamente', students };
  }

  @ApiTags('Students')
  @ApiOperation({ summary: 'Get student by id' })
  @ApiResponse({ status: 200, description: 'Get student by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const student = await this.studentsService.findOne(id);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Estudiante obtenido exitosamente', student };
  }

  @ApiTags('Students')
  @ApiOperation({ summary: 'Update student by id' })
  @ApiResponse({ status: 200, description: 'Update student by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    const student = await this.studentsService.update(id, updateStudentDto);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Estudiante actualizado exitosamente', student };
  }

  @ApiTags('Students')
  @ApiOperation({ summary: 'Delete student by id' })
  @ApiResponse({ status: 200, description: 'Delete student by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const student = await this.studentsService.remove(id);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Estudiante eliminado exitosamente', student };
  }
}
