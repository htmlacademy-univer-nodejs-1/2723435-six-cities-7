import { RequestHandler } from 'express';
import { Middleware } from './middleware.interface.js';

export interface Route<Params = Record<string, string>, Body = unknown> {
  path: string;
  method: 'get' | 'post' | 'patch' | 'put' | 'delete';
  handler: RequestHandler<Params, unknown, Body>;
  middleware?: Middleware[];
}
