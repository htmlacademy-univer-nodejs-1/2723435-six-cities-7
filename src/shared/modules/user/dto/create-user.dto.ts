import { IsEmail, IsIn, IsOptional, IsString, Length, Matches } from 'class-validator';
import type { UserType } from '../../../../types.js';
import { USER_TYPES } from '../../../../types.js';
import { AVATAR_REGEXP, UserNameLength, UserPasswordLength } from '../user.constant.js';

export class CreateUserDto {
  @IsString()
  @Length(UserNameLength.Min, UserNameLength.Max)
  public name!: string;

  @IsEmail()
  public email!: string;

  @IsOptional()
  @Matches(AVATAR_REGEXP, { message: 'avatarUrl must be a JPG or PNG image' })
  public avatarUrl?: string;

  @IsString()
  @Length(UserPasswordLength.Min, UserPasswordLength.Max)
  public password!: string;

  @IsIn(USER_TYPES)
  public type!: UserType;
}
