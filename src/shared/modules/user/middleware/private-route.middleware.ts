import { NextFunction, Request, Response } from 'express';
import { Middleware } from '../../../libs/rest/middleware.interface.js';
import { AuthService } from '../auth.service.js';

export class PrivateRouteMiddleware implements Middleware {
  constructor(private readonly auth: AuthService) {}

  public execute(request: Request, _response: Response, next: NextFunction): void {
    this.auth.getUserId(request);
    next();
  }
}
