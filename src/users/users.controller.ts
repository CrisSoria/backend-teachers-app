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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import {
  checkResourceOwnership,
  isAdmin,
} from 'src/auth/herlpers/authorization.helper';
import { UserRole } from './interfaces/user-role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiTags('Users')
  @ApiOperation({ summary: 'Create user' })
  @ApiResponse({ status: 201, description: 'User created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return {
      message: 'Usuario creado exitosamente',
      user: this.usersService.create(createUserDto),
    };
  }

  @ApiTags('Users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Get all users' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Roles(UserRole.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiTags('Users')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200, description: 'Get user by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findOne(@Param('id') id: string, @Request() req) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta buscando su propio usuario
    checkResourceOwnership(req.user, { userId: id.toString() });
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Usuario obtenido exitosamente', user };
  }

  @Patch(':id')
  @ApiTags('Users')
  @ApiOperation({ summary: 'Update user by id' })
  @ApiResponse({ status: 200, description: 'Update user by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    // Compara en memoria (no hace query a BD) que el usuario del JWT esta actualizando su propio usuario
    checkResourceOwnership(req.user, { userId: id.toString() });
    // Valida que no se cambie el rol de un usuario
    if (updateUserDto.role && req.user.role !== UserRole.ADMIN) {
      throw new HttpException(
        'No se puede cambiar el rol de un usuario',
        HttpStatus.BAD_REQUEST,
      );
    }
    const updateUser = await this.usersService.update(id, updateUserDto);
    if (!updateUser) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Usuario actualizado exitosamente', updateUser };
  }

  @Delete(':id')
  @ApiTags('Users')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiResponse({ status: 200, description: 'Delete user by id' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async remove(@Param('id') id: string, @Request() req) {
    // Valida que solo el admin pueda eliminar usuarios
    if (!isAdmin(req.user)) {
      throw new HttpException(
        'No tienes permiso para eliminar usuarios',
        HttpStatus.FORBIDDEN,
      );
    }

    const deletedUser = await this.usersService.remove(id);
    if (!deletedUser) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return { message: 'Usuario eliminado exitosamente', deletedUser };
  }
}
