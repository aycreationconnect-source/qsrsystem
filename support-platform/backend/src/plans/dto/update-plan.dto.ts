import { IsString, IsEnum, IsInt, Min, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { PlanType } from '../../common/enums';

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(PlanType)
  @IsOptional()
  planType?: PlanType;

  @IsInt()
  @Min(1)
  @IsOptional()
  durationDays?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  maxTerminals?: number;

  @IsArray()
  @IsOptional()
  allowedModules?: string[];

  @IsString()
  @IsOptional()
  description?: string;
}
