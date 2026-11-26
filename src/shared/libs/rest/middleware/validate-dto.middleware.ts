import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../http-error.js';
import { Middleware } from '../middleware.interface.js';

function getMessages(errors: ValidationError[], path = ''): string[] {
  return errors.flatMap((error) => {
    const property = path ? `${path}.${error.property}` : error.property;
    const ownMessages = Object.values(error.constraints ?? {}).map((message) => `${property}: ${message}`);
    return [...ownMessages, ...getMessages(error.children ?? [], property)];
  });
}

export class ValidateDtoMiddleware implements Middleware {
  constructor(private readonly dto: ClassConstructor<object>) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const instance = plainToInstance(this.dto, request.body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      const details = getMessages(errors).join('; ');
      next(new HttpError(StatusCodes.BAD_REQUEST, `Invalid request body${details ? `: ${details}` : ''}`));
      return;
    }

    request.body = instance;
    next();
  }
}
