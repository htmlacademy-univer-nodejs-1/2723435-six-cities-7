import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { inject, injectable } from 'inversify';
import { Controller } from '../../libs/rest/controller.js';
import { HttpError } from '../../libs/rest/http-error.js';
import { ValidateDtoMiddleware } from '../../libs/rest/middleware/validate-dto.middleware.js';
import { ValidateObjectIdMiddleware } from '../../libs/rest/middleware/validate-object-id.middleware.js';
import { Component } from '../../types/index.js';
import { OfferService } from '../offer/offer-service.interface.js';
import { AuthService } from '../user/auth.service.js';
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
    this.addRoute({
      path: '/:offerId/comments', method: 'get', handler: this.index,
      middleware: [objectId()],
    });
    this.addRoute({
      path: '/:offerId/comments', method: 'post', handler: this.create,
      middleware: [objectId(), new ValidateDtoMiddleware(CreateCommentDto)],
    });
  }

  public async index(request: Request<CommentParams>, response: Response): Promise<void> {
    await this.ensureOffer(request.params.offerId);
    const comments = await this.comments.findByOfferId(request.params.offerId);
    this.ok(response, comments.map(toCommentRdo));
  }

  public async create(request: Request<CommentParams, unknown, CommentBody>, response: Response): Promise<void> {
    const user = await this.auth.requireUser(request);
    await this.ensureOffer(request.params.offerId);
    const comment = await this.comments.create({
      text: request.body.text,
      rating: request.body.rating,
      authorId: user.id,
      offerId: request.params.offerId,
    });
    this.created(response, toCommentRdo(comment));
  }

  private async ensureOffer(offerId: string): Promise<void> {
    if (!await this.offers.findById(offerId)) {
      throw new HttpError(StatusCodes.NOT_FOUND, 'Offer not found');
    }
  }
}
