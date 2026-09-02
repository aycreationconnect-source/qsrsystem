import { IsString, IsNotEmpty, IsEnum, IsInt, Min, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { PlanType } from '../../common/enums';

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  planCode: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType = PlanType.FREE_TRIAL;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsNumber()
  @IsOptional()
  price?: number = 0;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;

  @IsInt()
  @IsOptional()
  maxTerminals?: number = 10;

  @IsArray()
  @IsOptional()
  allowedModules?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
