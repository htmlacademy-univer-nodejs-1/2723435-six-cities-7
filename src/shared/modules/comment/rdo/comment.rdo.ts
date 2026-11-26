import { DocumentType } from '@typegoose/typegoose';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { UserEntity } from '../../user/user.entity.js';
import { toUserRdo, UserRdo } from '../../user/rdo/user.rdo.js';
import { CommentEntity } from '../comment.entity.js';

export class CommentRdo {
  @Expose() public id!: string;
  @Expose() public text!: string;
  @Expose() public rating!: number;
  @Expose() public publishedAt!: Date;
  @Expose() @Type(() => UserRdo) public author!: UserRdo;
}

export function toCommentRdo(comment: DocumentType<CommentEntity>): CommentRdo {
  return plainToInstance(CommentRdo, {
    ...comment.toObject(),
    id: comment.id,
    author: toUserRdo(comment.author as DocumentType<UserEntity>),
  }, { excludeExtraneousValues: true });
}
