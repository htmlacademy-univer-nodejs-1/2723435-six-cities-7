import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { Controller } from '../../libs/rest/controller.js';
import { DocumentExistsMiddleware } from '../../libs/rest/middleware/document-exists.middleware.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-object-id.middleware.js';
import { Component } from '../../types/index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { AuthService } from '../user/auth.service.js';
import { PrivateRouteMiddleware } from '../user/middleware/private-route.middleware.js';
import { CommentService } from './comment-service.interface.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { toCommentRdo } from './rdo/comment.rdo.js';

type CommentParams = { offerId: string };
type CommentBody = Omit<CreateCommentDto, 'authorId' | 'offerId'>;

@injectable()
export class CommentController extends Controller {
  constructor(
    @inject(Component.CommentService) private readonly comments: CommentService,
    @inject(Component.OfferService) private readonly offers: OfferService,
    @inject(Component.AuthService) private readonly auth: AuthService,
  ) {
    super();
    const objectId = () => new ValidateObjectIdMiddleware('offerId');
    const offerExists = () => new DocumentExistsMiddleware(this.offers, 'Offer', 'offerId');
    const privateRoute = () => new PrivateRouteMiddleware(this.auth);
    this.addRoute({
      path: '/:offerId/comments', method: 'get', handler: this.index,
      middleware: [objectId(), offerExists()],
    });
    this.addRoute({
      path: '/:offerId/comments', method: 'post', handler: this.create,
      middleware: [objectId(), new ValidateDtoMiddleware(CreateCommentDto), privateRoute(), offerExists()],
    });
  }

  public async index(request: Request<CommentParams>, response: Response): Promise<void> {
    const comments = await this.comments.findByOfferId(request.params.offerId);
    this.ok(response, comments.map(toCommentRdo));
  }

  public async create(request: Request<CommentParams, unknown, CommentBody>, response: Response): Promise<void> {
    const user = await this.auth.requireUser(request);
    const comment = await this.comments.create({
      text: request.body.text,
      rating: request.body.rating,
      authorId: user.id,
      offerId: request.params.offerId,
    });
    this.created(response, toCommentRdo(comment));
  }
}
