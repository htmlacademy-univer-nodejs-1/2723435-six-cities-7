import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import { HttpError } from '../http-error.js';
import { Middleware } from '../middleware.interface.js';

export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private readonly parameter: string) {}

  public execute(request: Request, _response: Response, next: NextFunction): void {
    const value = request.params[this.parameter];

    if (!value || !Types.ObjectId.isValid(value)) {
      next(new HttpError(StatusCodes.BAD_REQUEST, `Invalid ${this.parameter}`));
      return;
    }

    next();
  }
}
