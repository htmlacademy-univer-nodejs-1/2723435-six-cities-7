import { IsInt, Max, Min } from 'class-validator';
import { OfferRating } from '../offer.constant.js';

export class AddRatingDto {
  @IsInt()
  @Min(OfferRating.Min)
  @Max(OfferRating.Max)
  public rating!: number;
}
