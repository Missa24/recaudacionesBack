/**
 * Módulo: Catálogo - UFV
 * Archivo: ufv-api.service.ts
 * Descripción:
 * Servicio encargado de consultar la API externa de UFV,
 * procesar los datos obtenidos y sincronizarlos con la base de datos.
 * También administra la ejecución automática mediante tareas programadas.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

import { UfvService } from './ufv.service';
import { UfvApiResponse } from './interface/ufv-api.interface';
import { convertirFechaEspanol } from '../../shared/util/fecha.util';
import { CreateUfvApiDto } from './dto/create-ufv-api.dto';

/**
 * Servicio: UfvApiService
 * Descripción:
 * Gestiona la integración con la fuente externa de valores UFV
 * y la sincronización automática de sus registros.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class UfvApiService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(UfvApiService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly ufvService: UfvService,
  ) {}

  /**
   * Consulta la API externa, valida los datos recibidos,
   * convierte la fecha al formato requerido y registra el valor UFV.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async sincronizar() {
    // Obtiene la dirección de la API desde las variables de entorno.
    const url = this.configService.get<string>('UFV_API_URL');

    if (!url) {
      this.logger.error(
        'No se puede sincronizar UFV: UFV_API_URL no está configurada',
      );
      throw new Error('UFV_API_URL no está configurada');
    }

    this.logger.log(`Iniciando consulta a la API externa de UFV. URL: ${url}`);

    // Usuario técnico temporal responsable del registro.
    const userId = '8b461287-8416-412e-84e7-b5c77615ea2a';

    // Realiza la solicitud HTTP con un tiempo máximo de espera de 15 segundos.
    let response: AxiosResponse<UfvApiResponse>;

    try {
      response = await firstValueFrom(
        this.httpService.get<UfvApiResponse>(url, {
          timeout: 15000,
        }),
      );

      this.logger.debug(
        `Respuesta recibida de la API UFV. Status: ${response.status}`,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Error al consultar la API externa de UFV. URL: ${url}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }

    const resultado = response.data;

    // Comprueba que la API haya devuelto una respuesta válida.
    if (!resultado.ok || !resultado.datos) {
      this.logger.error(
        `La API de UFV no devolvió datos válidos. ok: ${resultado.ok}, datos: ${resultado.datos ? 'presente' : 'ausente'}`,
      );
      throw new Error('La API no devolvió datos válidos');
    }

    const { fecha_ufv, ufv_bob } = resultado.datos;

    this.logger.debug(
      `Datos recibidos de la API UFV. Fecha: ${fecha_ufv}, Valor: ${ufv_bob}`,
    );

    // Verifica que los datos necesarios para registrar la UFV estén disponibles.
    if (!fecha_ufv || !Number.isFinite(ufv_bob)) {
      this.logger.error(
        `Datos de UFV incompletos desde la API. Fecha: ${fecha_ufv ?? 'N/A'}, Valor: ${ufv_bob ?? 'N/A'}`,
      );
      throw new Error('Los datos de UFV están incompletos');
    }

    // Convierte la fecha recibida al formato AAAA-MM-DD.
    const fecha = convertirFechaEspanol(fecha_ufv);

    this.logger.debug(`Fecha convertida al formato AAAA-MM-DD: ${fecha}`);

    // Prepara los datos para el registro mediante el servicio UFV.
    const dto: CreateUfvApiDto = {
      fecha,
      valor: ufv_bob,
      userId,
    };

    const ufv = await this.ufvService.crearDesdeApi(dto);

    this.logger.log(
      `UFV sincronizada correctamente. Fecha: ${fecha}, Valor: ${ufv_bob}, UserID: ${userId}`,
    );

    return ufv;
  }

  /**
   * Ejecuta automáticamente la sincronización de UFV todos los días
   * a las 00:00 horas, utilizando la zona horaria de Bolivia.
   * Registra los errores sin interrumpir la ejecución de la aplicación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @Cron('0 0 0 * * *', {
    timeZone: 'America/La_Paz',
  })
  async ejecutarCron() {
    this.logger.log(
      'Cron UFV disparado. Iniciando sincronización automática...',
    );

    const inicio = Date.now();

    try {
      const resultado = await this.sincronizar();

      const duracion = Date.now() - inicio;

      this.logger.log(
        `Cron UFV finalizado correctamente. Duración: ${duracion}ms`,
      );

      return resultado;
    } catch (error: unknown) {
      const mensaje = error instanceof Error ? error.message : String(error);
      const duracion = Date.now() - inicio;

      this.logger.error(
        `Cron UFV finalizó con error. Duración: ${duracion}ms, Mensaje: ${mensaje}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
