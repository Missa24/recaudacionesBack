import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Módulo: Seguridad / Usuario
 * Archivo: create-usuario.dto.ts
 *
 * Descripción:
 * Valida los datos utilizados para registrar
 * un nuevo usuario en el sistema.
 *
 * No permite enviar el estado ni los campos
 * de auditoría desde el frontend.
 *
 * Fecha de creación: 2026-11-10
 * Autor: Oscar Canchari
 */
export class CreateUsuarioDto {
  /**
   * Username del usuario.
   *
   * Validaciones:
   * - Obligatorio.
   * - Solo letras minúsculas de la a a la z.
   * - Permite puntos entre palabras.
   * - No permite números, espacios ni otros símbolos.
   * - No puede comenzar ni terminar con un punto.
   * - No admite puntos consecutivos.
   * - Longitud entre 3 y 50 caracteres.
   *
   * Ejemplo permitido: oscar.henry
   */
  @ApiProperty({
    description:
      'Username único. Solo letras minúsculas y puntos entre palabras.',
    example: 'oscar.henry',
    minLength: 3,
    maxLength: 50,
    pattern: '^[a-z]+(\\.[a-z]+)*$',
  })
  @IsString({
    message: 'El username debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El username es obligatorio.',
  })
  @MinLength(3, {
    message: 'El username debe tener al menos 3 caracteres.',
  })
  @MaxLength(50, {
    message: 'El username no debe superar los 50 caracteres.',
  })
  @Matches(/^[a-z]+(\.[a-z]+)*$/, {
    message:
      'El username solo permite letras minúsculas y puntos entre palabras.',
  })
  username!: string;

  /**
   * Correo electrónico del usuario.
   *
   * Validaciones:
   * - Obligatorio.
   * - Debe tener formato de correo electrónico.
   * - No admite letras mayúsculas.
   * - No admite espacios.
   * - Longitud máxima de 254 caracteres.
   *
   * La unicidad se verifica en UsuarioService.
   */
  @ApiProperty({
    description: 'Correo electrónico válido, en minúsculas y sin espacios.',
    example: 'oscar.henry@gmail.com',
    maxLength: 254,
  })
  @IsString({
    message: 'El correo debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El correo electrónico es obligatorio.',
  })
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no es válido.',
    },
  )
  @MaxLength(254, {
    message: 'El correo no debe superar los 254 caracteres.',
  })
  @Matches(/^[^A-Z\s]+$/, {
    message: 'El correo debe estar en minúsculas y sin espacios.',
  })
  email!: string;

  /**
   * Carnet de identidad.
   *
   * Validaciones:
   * - Obligatorio.
   * - Solo números del 0 al 9.
   * - No admite letras, espacios ni guiones.
   * - Longitud máxima de 30 caracteres.
   *
   * Se guarda como string para conservar
   * posibles ceros al inicio del número.
   */

  @ApiProperty({
    description: 'Carnet de identidad, solamente números.',
    example: '12345678',
    maxLength: 30,
    pattern: '^[0-9]+$',
  })
  @IsString({
    message: 'El CI debe enviarse como texto.',
  })
  @IsNotEmpty({
    message: 'El CI es obligatorio.',
  })
  @MaxLength(30, {
    message: 'El CI no debe superar los 30 caracteres.',
  })
  @Matches(/^[0-9]+$/, {
    message: 'El carnet de identidad solo debe contener números.',
  })
  ci!: string;

  /**
   * Nombres del usuario.
   *
   * Validaciones:
   * - Obligatorio.
   * - Permite letras, tildes y ñ.
   * - Permite nombres compuestos.
   * - No permite números.
   * - Longitud máxima de 100 caracteres.
   *
   * Ejemplo: Oscar Henry
   */
  @ApiProperty({
    description: 'Nombres del usuario. Permite letras y nombres compuestos.',
    example: 'Oscar Henry',
    maxLength: 100,
  })
  @IsString({
    message: 'Los nombres deben ser un texto.',
  })
  @IsNotEmpty({
    message: 'Los nombres son obligatorios.',
  })
  @MaxLength(100, {
    message: 'Los nombres no deben superar los 100 caracteres.',
  })
  @Matches(/^\p{L}+(?:[ '-]\p{L}+)*$/u, {
    message: 'Los nombres solo permiten letras y separadores entre palabras.',
  })
  nombres!: string;

  /**
   * Apellido paterno.
   *
   * Validaciones:
   * - Obligatorio.
   * - Permite letras, tildes y ñ.
   * - Permite apellidos compuestos.
   * - Longitud máxima de 100 caracteres.
   */
  @ApiProperty({
    description: 'Apellido paterno del usuario.',
    example: 'Canchari',
    maxLength: 100,
  })
  @IsString({
    message: 'El apellido paterno debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El apellido paterno es obligatorio.',
  })
  @MaxLength(100, {
    message: 'El apellido paterno no debe superar los 100 caracteres.',
  })
  @Matches(/^\p{L}+(?:[ '-]\p{L}+)*$/u, {
    message:
      'El apellido paterno solo permite letras y separadores entre palabras.',
  })
  apellido_paterno!: string;

  /**
   * Apellido materno.
   *
   * Validaciones:
   * - Opcional.
   * - Permite letras, tildes y ñ.
   * - Permite apellidos compuestos.
   * - Longitud máxima de 100 caracteres.
   */
  @ApiPropertyOptional({
    description: 'Apellido materno del usuario.',
    example: 'Huayna',
    maxLength: 100,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'El apellido materno debe ser un texto.',
  })
  @MaxLength(100, {
    message: 'El apellido materno no debe superar los 100 caracteres.',
  })
  @Matches(/^\p{L}+(?:[ '-]\p{L}+)*$/u, {
    message:
      'El apellido materno solo permite letras y separadores entre palabras.',
  })
  apellido_materno?: string | null;

  /**
   * Número de celular.
   *
   * Validaciones:
   * - Opcional.
   * - Tipo de dato string.
   * - Solo números.
   * - Entre 8 y 15 dígitos.
   * - No permite letras, espacios ni guiones.
   * - Permite null.
   */
  @ApiPropertyOptional({
    description: 'Número de celular, entre 8 y 15 dígitos.',
    type: String,
    example: '712345670',
    minLength: 8,
    maxLength: 15,
    pattern: '^[0-9]{8,15}$',
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: 'El celular debe ser un texto.',
  })
  @Matches(/^[0-9]{8,15}$/, {
    message: 'El celular debe contener entre 8 y 15 números.',
  })
  celular?: string | null;
}
