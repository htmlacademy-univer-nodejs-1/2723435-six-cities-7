import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DocumentExists } from '../document-exists.interface.js';
import { HttpError } from '../http-error.js';
import { Middleware } from '../middleware.interface.js';

export class DocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentExists,
    private readonly entityName: string,
    private readonly parameter: string,
  ) {}

  public async execute(request: Request, _response: Response, next: NextFunction): Promise<void> {
    const document = await this.service.findById(request.params[this.parameter]);

    if (!document) {
      next(new HttpError(StatusCodes.NOT_FOUND, `${this.entityName} not found`));
      return;
    }

    next();
  }
}
