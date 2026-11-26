import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsISO8601,
  IsNumber, IsString, IsUrl, Length, Max, Min, ValidateNested,
} from 'class-validator';
import type { Amenity, CityName, HousingType } from '../../../../types.js';
import { AMENITIES, CITY_NAMES, HOUSING_TYPES } from '../../../../types.js';
import {
  Latitude, Longitude, OFFER_IMAGES_COUNT, OfferBedrooms, OfferDescriptionLength,
  OfferMaxAdults, OfferPrice, OfferTitleLength,
} from '../offer.constant.js';

export class LocationDto {
  @IsNumber()
  @Min(Latitude.Min)
  @Max(Latitude.Max)
  public latitude!: number;

  @IsNumber()
  @Min(Longitude.Min)
  @Max(Longitude.Max)
  public longitude!: number;
}

export class CreateOfferDto {
  @IsString()
  @Length(OfferTitleLength.Min, OfferTitleLength.Max)
  public title!: string;

  @IsString()
  @Length(OfferDescriptionLength.Min, OfferDescriptionLength.Max)
  public description!: string;

  @IsISO8601()
  public publishedAt!: Date;

  @IsIn(CITY_NAMES)
  public city!: CityName;

  @IsUrl({ 'require_protocol': true })
  public previewImage!: string;

  @IsArray()
  @ArrayMinSize(OFFER_IMAGES_COUNT)
  @ArrayMaxSize(OFFER_IMAGES_COUNT)
  @IsUrl({ 'require_protocol': true }, { each: true })
  public images!: string[];

  @IsBoolean()
  public isPremium!: boolean;

  @IsIn(HOUSING_TYPES)
  public type!: HousingType;

  @IsInt()
  @Min(OfferBedrooms.Min)
  @Max(OfferBedrooms.Max)
  public bedrooms!: number;

  @IsInt()
  @Min(OfferMaxAdults.Min)
  @Max(OfferMaxAdults.Max)
  public maxAdults!: number;

  @IsInt()
  @Min(OfferPrice.Min)
  @Max(OfferPrice.Max)
  public price!: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsIn(AMENITIES, { each: true })
  public goods!: Amenity[];

  public authorId!: string;

  @ValidateNested()
  @Type(() => LocationDto)
  public location!: LocationDto;
}
