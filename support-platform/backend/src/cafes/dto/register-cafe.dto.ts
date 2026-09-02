import { IsString, IsNotEmpty, IsOptional, IsEmail, Matches } from 'class-validator';

export class RegisterCafeDto {
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsString()
  @IsNotEmpty()
  ownerPhone: string;

  @IsEmail()
  @IsOptional()
  ownerEmail?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  planId?: string; // If omitted, uses default plan (e.g. Free 3 Months)

  @IsString()
  @IsOptional()
  customCafeCode?: string; // e.g. CF-MUM-001

  @IsString()
  @IsOptional()
  notes?: string;
}
