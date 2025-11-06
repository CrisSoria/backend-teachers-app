import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Error as MongooseError } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import {
  UserNotFoundException,
  UserEmailAlreadyExistsException,
  InvalidUserDataException,
  UserUpdateFailedException,
  UserDeletionFailedException,
} from './exceptions/user.exceptions';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      this.logger.log(
        `Intentando crear usuario con email: ${createUserDto.email}`,
      );
      // Encriptar la contraseña
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
      createUserDto.password = hashedPassword;

      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();

      this.logger.log(`Usuario creado exitosamente con ID: ${savedUser._id}`);
      return this.removePassword(savedUser.toObject());
    } catch (error) {
      this.logger.error(
        `Error al crear usuario: ${error.message}`,
        error.stack,
      );

      // Error de validación de Mongoose
      if (error instanceof MongooseError.ValidationError) {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new InvalidUserDataException(messages);
      }

      // Error de duplicado (email único)
      if (error.code === 11000) {
        const email = createUserDto.email;
        throw new UserEmailAlreadyExistsException(email);
      }

      // Error de cast (tipo de dato incorrecto)
      if (error instanceof MongooseError.CastError) {
        throw new InvalidUserDataException([
          `Tipo de dato inválido para el campo: ${error.path}`,
        ]);
      }

      // Cualquier otro error
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error interno al crear el usuario',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(): Promise<User[]> {
    try {
      this.logger.log('Obteniendo todos los usuarios');
      const users = await this.userModel.find().exec();
      this.logger.log(`Se encontraron ${users.length} usuarios`);
      return users.map((user) => this.removePassword(user.toObject()));
    } catch (error) {
      this.logger.error(
        `Error al obtener usuarios: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al obtener la lista de usuarios',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<User> {
    try {
      this.logger.log(`Buscando usuario con ID: ${id}`);

      const user = await this.userModel.findById(id).exec();

      if (!user) {
        this.logger.warn(`Usuario no encontrado con ID: ${id}`);
        throw new UserNotFoundException(id);
      }

      this.logger.log(`Usuario encontrado: ${user.email}`);
      return this.removePassword(user.toObject());
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      // Error de cast (ID inválido)
      if (error instanceof MongooseError.CastError) {
        this.logger.warn(`ID inválido proporcionado: ${id}`);
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ID de usuario inválido',
            error: `El ID proporcionado no tiene un formato válido`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.error(
        `Error al buscar usuario: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al buscar el usuario',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      this.logger.log(`Actualizando usuario con ID: ${id}`);

      // Verificar si el usuario existe
      const existingUser = await this.userModel.findById(id).exec();
      if (!existingUser) {
        throw new UserNotFoundException(id);
      }

      // Si se está actualizando el email, verificar que no exista
      if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
        const emailExists = await this.userModel
          .findOne({ email: updateUserDto.email })
          .exec();

        if (emailExists) {
          throw new UserEmailAlreadyExistsException(updateUserDto.email);
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, {
          new: true,
          runValidators: true, // Ejecutar validaciones en la actualización
        })
        .exec();

      if (!updatedUser) {
        throw new UserUpdateFailedException(id);
      }

      this.logger.log(`Usuario actualizado exitosamente con ID: ${id}`);
      return this.removePassword(updatedUser.toObject());
    } catch (error) {
      if (
        error instanceof UserNotFoundException ||
        error instanceof UserEmailAlreadyExistsException ||
        error instanceof UserUpdateFailedException
      ) {
        throw error;
      }

      // Error de validación
      if (error instanceof MongooseError.ValidationError) {
        const messages = Object.values(error.errors).map(
          (err: any) => err.message,
        );
        throw new InvalidUserDataException(messages);
      }

      // Error de duplicado
      if (error.code === 11000) {
        throw new UserEmailAlreadyExistsException(
          updateUserDto.email || 'no se proporciono email',
        );
      }

      this.logger.error(
        `Error al actualizar usuario: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al actualizar el usuario',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<User> {
    try {
      this.logger.log(`Eliminando usuario con ID: ${id}`);

      const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

      if (!deletedUser) {
        throw new UserNotFoundException(id);
      }

      this.logger.log(`Usuario eliminado exitosamente con ID: ${id}`);
      return this.removePassword(deletedUser.toObject());
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }

      // Error de cast (ID inválido)
      if (error instanceof MongooseError.CastError) {
        throw new HttpException(
          {
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'ID de usuario inválido',
            error: `El ID proporcionado no tiene un formato válido`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.error(
        `Error al eliminar usuario: ${error.message}`,
        error.stack,
      );
      throw new UserDeletionFailedException(id, error.message);
    }
  }

  // Métodos adicionales útiles

  async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.log(`Buscando usuario por email: ${email}`);
      const user = await this.userModel.findOne({ email }).exec();
      return user ? this.removePassword(user.toObject()) : null;
    } catch (error) {
      this.logger.error(
        `Error al buscar usuario por email: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al buscar usuario por email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.userModel.countDocuments({ email }).exec();
      return count > 0;
    } catch (error) {
      this.logger.error(
        `Error al verificar existencia de email: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Error al verificar email',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private removePassword(user: any): User {
    const { password, ...result } = user;
    return result as User;
  }
}
