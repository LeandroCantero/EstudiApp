import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateCreditDto {
  @ApiProperty({
    example: 'CR1_033: Espacio de Integración Curricular / Proyecto de software',
    description: 'Categoría del crédito'
  })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({
    example: 'Curso de React Avanzado',
    description: 'Descripción de la actividad'
  })
  @IsString()
  @IsNotEmpty()
  activity: string;

  @ApiProperty({
    example: 5,
    description: 'Cantidad de puntos/créditos'
  })
  @IsNumber()
  @Min(1)
  @Max(35)
  credits: number;
}
