import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class RenewCafeDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  customDays?: number; // Override duration if needed

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  adminName?: string;
}
