import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

@Injectable()
export class ValidMongoIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;
    if (!Types.ObjectId.isValid(id)) {
      throw new HttpException('ID no válido: ' + id, HttpStatus.BAD_REQUEST);
    }
    next();
  }
}
