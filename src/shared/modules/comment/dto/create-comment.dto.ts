import { IsInt, IsString, Length, Max, Min } from 'class-validator';

const CommentTextLength = { Min: 5, Max: 1024 } as const;
const CommentRating = { Min: 1, Max: 5 } as const;

export class CreateCommentDto {
  @IsString()
  @Length(CommentTextLength.Min, CommentTextLength.Max)
  public text!: string;

  @IsInt()
  @Min(CommentRating.Min)
  @Max(CommentRating.Max)
  public rating!: number;

  public authorId!: string;

  public offerId!: string;
}
