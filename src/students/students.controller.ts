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
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { checkResourceOwnership } from 'src/auth/herlpers/authorization.helper';
import { UserRole } from 'src/users/interfaces/user-role.enum';
import {
  ApiCreateStudent,
  ApiDeleteStudent,
  ApiFindAllByUser,
  ApiFindMyStudents,
  ApiFindOneStudent,
  ApiUpdateStudent,
} from './decorators/swagger.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TEACHER)
@ApiBearerAuth()
@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @ApiCreateStudent()
  async create(
    @Body() body: CreateStudentDto | CreateStudentDto[],
    @Request() req,
  ) {
    // Si es un array de estudiantes
    if (Array.isArray(body)) {
      if (body.length === 0) {
        throw new HttpException(
          'El array de estudiantes no puede estar vacío',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Asignar el userId del token a cada estudiante
      const studentsWithUserId = body.map((student) => ({
        ...student,
        userId: req.user.userId,
      }));

      const students = await this.studentsService.createMany({
        students: studentsWithUserId,
      });
      return { message: 'Estudiantes creados exitosamente', students };
    }

    // Si es un solo estudiante, asignar el userId del token
    const studentData = {
      ...body,
      userId: req.user.userId,
    };

    const student = await this.studentsService.create(studentData);
    return { message: 'Estudiante creado exitosamente', student };
  }

  @Get('user/:id')
  @ApiFindAllByUser()
  async findAllByUser(@Param('id') id: string, @Request() req) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando sus propios estudiantes
    checkResourceOwnership(req.user, { userId: id.toString() });

    const students = await this.studentsService.findAllByUser(id);
    if (!students) {
      throw new HttpException(
        'Este usuario no tiene estudiantes registrados',
        HttpStatus.NOT_FOUND,
      );
    }
    return { message: 'Estudiantes obtenidos exitosamente', students };
  }

  @Get('my/students')
  @ApiFindMyStudents()
  async findMyStudents(@Request() req) {
    const students = await this.studentsService.findAllByUser(req.user.userId);
    return { message: 'Estudiantes obtenidos exitosamente', students };
  }

  @Get(':id')
  @ApiFindOneStudent()
  async findOne(@Param('id') id: string, @Request() req) {
    const student = await this.studentsService.findOne(id);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando su propio estudiante
    checkResourceOwnership(req.user, student);

    return { message: 'Estudiante obtenido exitosamente', student };
  }

  @Patch(':id')
  @ApiUpdateStudent()
  async update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Request() req,
  ) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta actualizando su propio estudiante
    checkResourceOwnership(req.user, updateStudentDto);

    const student = await this.studentsService.update(id, updateStudentDto);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Estudiante actualizado exitosamente', student };
  }

  @Delete(':id')
  @ApiDeleteStudent()
  async remove(@Param('id') id: string, @Request() req) {
    // Revisa previamente a la eliminación, que el usuario del JWT esta eliminando su propio estudiante
    const student = await this.studentsService.findOne(id);
    checkResourceOwnership(req.user, student);
    if (!student) {
      throw new HttpException('Estudiante no encontrado', HttpStatus.NOT_FOUND);
    }

    const studentDeleted = await this.studentsService.remove(id);
    return { message: 'Estudiante eliminado exitosamente', studentDeleted };
  }
}
