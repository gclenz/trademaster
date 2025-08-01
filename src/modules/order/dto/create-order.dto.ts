import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(11)
  phone: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  value: number;
}
