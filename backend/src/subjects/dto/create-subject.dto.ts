import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubjectStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSubjectDto {
  @ApiProperty({ description: 'Nombre de la materia' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Código de la materia (ej: I101)' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ enum: SubjectStatus, description: 'Estado actual' })
  @IsEnum(SubjectStatus)
  @IsNotEmpty()
  status!: SubjectStatus;

  @ApiPropertyOptional({ description: 'Nota final' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  grade?: number;

  @ApiProperty({ description: 'Créditos de la materia' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  credits!: number;

  @ApiPropertyOptional({ description: 'Año de cursada' })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: 'Cuatrimestre' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(2)
  period?: number;

  @ApiProperty({ description: 'ID del usuario' })
  @IsString()
  @IsNotEmpty()
  userId!: string;
}
