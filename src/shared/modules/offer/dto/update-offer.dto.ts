import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsBoolean, IsIn, IsInt, IsISO8601,
  IsNumber, IsOptional, IsString, IsUrl, Length, Max, Min, ValidateNested,
} from 'class-validator';
import type { Amenity, CityName, HousingType } from '../../../../types.js';
import { AMENITIES, CITY_NAMES, HOUSING_TYPES } from '../../../../types.js';
import {
  Latitude, Longitude, OFFER_IMAGES_COUNT, OfferBedrooms, OfferDescriptionLength,
  OfferMaxAdults, OfferPrice, OfferTitleLength,
} from '../offer.constant.js';

class UpdateLocationDto {
  @IsNumber()
  @Min(Latitude.Min)
  @Max(Latitude.Max)
  public latitude!: number;

  @IsNumber()
  @Min(Longitude.Min)
  @Max(Longitude.Max)
  public longitude!: number;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  @Length(OfferTitleLength.Min, OfferTitleLength.Max)
  public title?: string;

  @IsOptional()
  @IsString()
  @Length(OfferDescriptionLength.Min, OfferDescriptionLength.Max)
  public description?: string;

  @IsOptional()
  @IsISO8601()
  public publishedAt?: Date;

  @IsOptional()
  @IsIn(CITY_NAMES)
  public city?: CityName;

  @IsOptional()
  @IsUrl({ 'require_protocol': true })
  public previewImage?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(OFFER_IMAGES_COUNT)
  @ArrayMaxSize(OFFER_IMAGES_COUNT)
  @IsUrl({ 'require_protocol': true }, { each: true })
  public images?: string[];

  @IsOptional()
  @IsBoolean()
  public isPremium?: boolean;

  @IsOptional()
  @IsIn(HOUSING_TYPES)
  public type?: HousingType;

  @IsOptional()
  @IsInt()
  @Min(OfferBedrooms.Min)
  @Max(OfferBedrooms.Max)
  public bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(OfferMaxAdults.Min)
  @Max(OfferMaxAdults.Max)
  public maxAdults?: number;

  @IsOptional()
  @IsInt()
  @Min(OfferPrice.Min)
  @Max(OfferPrice.Max)
  public price?: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(AMENITIES, { each: true })
  public goods?: Amenity[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateLocationDto)
  public location?: UpdateLocationDto;
}
