import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Config, RestSchema } from '../../libs/config/index.js';
import { Controller } from '../../libs/rest/controller.js';
import { HttpError } from '../../libs/rest/http-error.js';
import { Middleware } from '../../libs/rest/middleware.interface.js';
import { UploadFileMiddleware } from '../../libs/rest/middleware/upload-file.middleware.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { Component } from '../../types/index.js';
import { UserService } from './user-service.interface.js';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { PrivateRouteMiddleware } from './middleware/private-route.middleware.js';
import { toUserRdo } from './rdo/user.rdo.js';

@injectable()
export class UserController extends Controller {
  constructor(
    @inject(Component.UserService) private readonly users: UserService,
    @inject(Component.AuthService) private readonly auth: AuthService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    super();
    const avatarOptions = {
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      maxFileSize: 5 * 1024 * 1024,
    } as const;
    const uploadDirectory = this.config.get('UPLOAD_DIRECTORY');
    const uploadOptionalAvatar = new UploadFileMiddleware(uploadDirectory, 'avatar', {
      ...avatarOptions,
      required: false,
    });
    const registrationGuard: Middleware = {
      execute: async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
        if (await this.auth.getUser(request, false)) {
          next(new HttpError(StatusCodes.FORBIDDEN, 'Already authenticated'));
          return;
        }
        if (request.body.email && await this.users.findByEmail(request.body.email)) {
          next(new HttpError(StatusCodes.CONFLICT, 'User with this email already exists'));
          return;
        }
        next();
      },
    };
    this.addRoute({
      path: '/register',
      method: 'post',
      handler: this.register,
      middleware: [uploadOptionalAvatar, new ValidateDtoMiddleware(CreateUserDto), registrationGuard],
    });
    this.addRoute({
      path: '/login',
      method: 'post',
      handler: this.login,
      middleware: [new ValidateDtoMiddleware(LoginUserDto)],
    });
    const privateRoute = () => new PrivateRouteMiddleware(this.auth);
    this.addRoute({ path: '/login', method: 'get', handler: this.check, middleware: [privateRoute()] });
    this.addRoute({ path: '/logout', method: 'delete', handler: this.logout, middleware: [privateRoute()] });
    this.addRoute({
      path: '/avatar',
      method: 'post',
      handler: this.uploadAvatar,
      middleware: [
        privateRoute(),
        new UploadFileMiddleware(uploadDirectory, 'avatar', avatarOptions),
      ],
    });
  }

  public async register(request: Request<Record<string, string>, unknown, CreateUserDto>, response: Response): Promise<void> {
    const { name, email, password, type } = request.body;
    const avatarUrl = request.file
      ? `/upload/${request.file.filename}`
      : undefined;
    const user = await this.users.create({ name, email, password, type, avatarUrl }, this.config.get('SALT'));
    this.created(response, toUserRdo(user));
  }

  public async login(request: Request<Record<string, string>, unknown, LoginUserDto>, response: Response): Promise<void> {
    const { token, user } = await this.auth.login(request.body);
    this.ok(response, { token, user: toUserRdo(user) });
  }

  public async check(request: Request, response: Response): Promise<void> {
    this.ok(response, toUserRdo(await this.auth.requireUser(request)));
  }

  public async logout(request: Request, response: Response): Promise<void> {
    await this.auth.logout(request);
    this.noContent(response);
  }

  public async uploadAvatar(request: Request, response: Response): Promise<void> {
    const currentUser = await this.auth.requireUser(request);
    const { filename } = request.file as Express.Multer.File;
    const avatarUrl = `/upload/${filename}`;
    const user = await this.users.updateById(currentUser.id, { avatarUrl });
    if (!user) {
      throw new HttpError(StatusCodes.UNAUTHORIZED, 'User no longer exists');
    }
    this.created(response, toUserRdo(user));
  }
}
