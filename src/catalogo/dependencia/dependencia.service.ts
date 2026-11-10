/**
 * Módulo: Catálogo - Dependencia
 * Archivo: dependencia.service.ts
 * Descripción:
 * Contiene la lógica de negocio para la gestión de los valores de Dependencia.
 * Gestiona registros manuales, sincronización externa, consultas,
 * actualizaciones y cambios de estado, incluyendo el control de auditoría.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import {
  DependenciaMessageResponse,
  DependenciaResponse,
} from './interface/dependencia-response.interface';
import { Brackets, Repository } from 'typeorm';
import { Dependencia } from './entities/dependencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { esErrorDuplicado } from 'src/shared/util/errores-duplicados.util';
import { mapearRespuesta } from './util/map-response-dependencia.util';
import { QueryDependenciaDto } from './dto/query-dependencia.dto';
import { PaginatedResponse } from 'src/shared/interface/paginated-response.interface';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Usuario } from 'src/seguridad/usuario/entities/usuario.entity';

/**
 * Servicio: DependenciaService
 * Descripción:
 * Implementa las operaciones de negocio para administrar los registros de Dependencia,
 * utilizando TypeORM para interactuar con la base de datos.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
@Injectable()
export class DependenciaService {
  /**
   * Logger del servicio para trazabilidad de operaciones.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  private readonly logger = new Logger(DependenciaService.name);

  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
  ) {}

  /**
   * Registra manualmente un nuevo valor de Dependencia.
   * Verifica que no exista otro registro para el mismo código
   * y asocia al usuario responsable de la creación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async crear(
    dto: CreateDependenciaDto,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    this.logger.log(
      `Iniciando creación de Dependencia. Código: ${dto.codigo}, Usuario: ${idUsuario}`,
    );

    // Comprueba si ya existe un registro con el código proporcionado.
    const existe = await this.dependenciaRepository.findOne({
      where: {
        codigo: dto.codigo,
      },
    });

    if (existe) {
      this.logger.warn(
        `Conflicto al crear Dependencia: ya existe registro con código ${dto.codigo}`,
      );
      throw new ConflictException('Ya existe una Dependencia con ese código');
    }

    // Prepara la entidad asociando los datos del usuario creador.
    const dependencia = this.dependenciaRepository.create({
      ...dto,
      usuario_creador: { idUsuario },
    });

    try {
      const guardada = await this.dependenciaRepository.save(dependencia);

      this.logger.log(
        `Dependencia creada correctamente. ID: ${guardada.id}, Código: ${guardada.codigo}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Dependencia registrada correctamente',
      };
    } catch (error: unknown) {
      // Controla posibles duplicados producidos durante el guardado.
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al crear Dependencia. Código: ${dto.codigo}`,
        );
        throw new ConflictException(
          'Ya existe una Dependencia para ese código',
        );
      }

      this.logger.error(
        `Error al crear una dependencia. Código: ${dto.codigo}, Usuario: ${idUsuario}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException('No se pudo guardar el registro');
    }
  }

  /**
   * Obtiene los registros de Dependencia aplicando filtros, búsqueda,
   * ordenamiento y paginación.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async listar(
    query: QueryDependenciaDto,
  ): Promise<PaginatedResponse<DependenciaResponse>> {
    this.logger.log(
      `Listando Dependencias. Página: ${query.page}, Límite: ${query.limit}, Search: ${query.search ?? 'N/A'}, Código: ${query.codigo ?? 'N/A'}, Estado: ${query.status ?? 'ACTIVO'}`,
    );

    const {
      page,
      limit,
      search,
      codigo,
      abreviacion,
      es_unidad_desconcentrada,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder,
    } = query;

    const camposOrdenamiento: Record<string, string> = {
      createdAt: 'dependencia._created_at',
    };

    const campoOrdenamiento =
      camposOrdenamiento[sortBy] ?? 'dependencia._created_at';

    const queryBuilder = this.dependenciaRepository
      .createQueryBuilder('dependencia')
      .leftJoinAndSelect('dependencia.usuario_creador', 'usuario_creador')
      .leftJoinAndSelect(
        'dependencia.usuario_actualizador',
        'usuario_actualizador',
      );

    if (search) {
      this.logger.debug(`Aplicando filtro de búsqueda: "${search}"`);
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('dependencia.codigo ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('dependencia.nombre ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (codigo) {
      this.logger.debug(`Aplicando filtro código: ${codigo}`);
      queryBuilder.andWhere('dependencia.codigo = :codigo', {
        codigo,
      });
    }
    // Aplicar filtro de estado, mostrando activos por defecto.
    if (status && status !== 'TODOS') {
      this.logger.debug(`Aplicando filtro estado: ${status}`);
      queryBuilder.andWhere('dependencia.estado = :estado', {
        estado: status,
      });
    } else if (!status) {
      this.logger.debug('Aplicando filtro estado por defecto: ACTIVO');
      queryBuilder.andWhere('dependencia.estado = :estado', {
        estado: 'ACTIVO',
      });
    } else {
      this.logger.debug('Consultando la Dependencia de todos los estados');
    }

    if (abreviacion) {
      this.logger.debug(`Aplicando filtro abreviación: ${abreviacion}`);
      queryBuilder.andWhere('dependencia.abreviacion = :abreviacion', {
        abreviacion,
      });
    }

    if (es_unidad_desconcentrada) {
      this.logger.debug(
        `Aplicando filtro es_unidad_desconcentrada: ${es_unidad_desconcentrada}`,
      );
      queryBuilder.andWhere(
        'dependencia.es_unidad_desconcentrada = :es_unidad_desconcentrada',
        {
          es_unidad_desconcentrada,
        },
      );
    }

    if (startDate) {
      this.logger.debug(`Aplicando filtro startDate: ${startDate}`);
      queryBuilder.andWhere('dependencia._created_at >= :startDate', {
        startDate: `${startDate} 00:00:00`,
      });
    }

    if (endDate) {
      this.logger.debug(`Aplicando filtro endDate: ${endDate}`);
      queryBuilder.andWhere('dependencia._created_at <= :endDate', {
        endDate: `${endDate} 23:59:59.999`,
      });
    }

    try {
      const [dependencias, total] = await queryBuilder
        .orderBy(campoOrdenamiento, sortOrder ?? 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Listado de Dependencias obtenido. Total: ${total}, Página: ${page}/${totalPages || 1}, Items devueltos: ${dependencias.length}`,
      );

      return {
        items: dependencias.map((dependencia) => mapearRespuesta(dependencia)),
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error al listar Dependencias. Página: ${page}, Límite: ${limit}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Busca un registro de Dependencia mediante su identificador único.
   * Incluye los nombres de usuario asociados a su creación y actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorId(id: string): Promise<DependenciaResponse> {
    this.logger.log(`Buscando Dependencia por ID: ${id}`);

    const dependencia = await this.dependenciaRepository
      .createQueryBuilder('dependencia')
      .leftJoin('dependencia.usuario_creador', 'creador')
      .leftJoin('dependencia.usuario_actualizador', 'actualizador')
      .select([
        'dependencia.id',
        'dependencia.codigo',
        'dependencia.nombre',
        'dependencia.abreviacion',
        'dependencia.estado',
        'dependencia.es_unidad_desconcentrada',
        'creador.username',
        'actualizador.username',
      ])
      .where('dependencia.id = :id', { id })
      .getOne();

    if (!dependencia) {
      this.logger.warn(`Dependencia no encontrada con ID: ${id}`);
      throw new NotFoundException('No existe una Dependencia con ese Id');
    }

    this.logger.log(`Dependencia encontrada. ID: ${id}`);
    return mapearRespuesta(dependencia);
  }

  /**
   * Busca un registro de Dependencia por un código específico.
   * Solo considera registros activos y que no hayan sido eliminados.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async buscarPorCodigo(codigo: string): Promise<DependenciaResponse> {
    this.logger.log(`Buscando Dependencia por código: ${codigo}`);

    const dependencia = await this.dependenciaRepository
      .createQueryBuilder('dependencia')
      .leftJoin('dependencia.usuario_creador', 'creador')
      .leftJoin('dependencia.usuario_actualizador', 'actualizador')
      .select([
        'dependencia.id',
        'dependencia.codigo',
        'dependencia.nombre',
        'dependencia.abreviacion',
        'dependencia.es_unidad_desconcentrada',
        'creador.username',
        'actualizador.username',
      ])
      .where('dependencia.codigo = :codigo', { codigo })
      .andWhere('dependencia.estado = :estado', { estado: 'ACTIVO' })
      .andWhere('dependencia._deleted_at IS NULL')
      .getOne();

    if (!dependencia) {
      this.logger.warn(
        `Dependencia activa no encontrada para el código: ${codigo}`,
      );
      throw new NotFoundException(
        'No existe una Dependencia activa para ese codigo',
      );
    }

    this.logger.log(`Dependencia encontrada por código: ${codigo}`);
    return mapearRespuesta(dependencia);
  }

  /**
   * Actualiza parcialmente un registro de Dependencia existente.
   * Verifica su existencia, estado y posibles duplicados de código.
   * También actualiza los campos de auditoría correspondientes.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async actualizar(
    id: string,
    dto: UpdateDependenciaDto,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    this.logger.log(
      `Iniciando actualización de Dependencia. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id },
    });

    if (!dependencia) {
      this.logger.warn(`No se encontró Dependencia para actualizar. ID: ${id}`);
      throw new NotFoundException('No se encontro la dependencia solicitada.');
    }

    if (dependencia.estado !== 'ACTIVO') {
      this.logger.warn(
        `Intento de actualización sobre Dependencia inactiva. ID: ${id}, Estado: ${dependencia.estado}`,
      );
      throw new BadRequestException(
        'No se puede actualizar una dependencia inactiva.',
      );
    }

    Object.assign(dependencia, dto);
    dependencia._updated_at = new Date();
    dependencia._user_update = idUsuario;
    dependencia.usuario_actualizador = { idUsuario } as Usuario;

    try {
      await this.dependenciaRepository.save(dependencia);

      this.logger.log(
        `Dependencia actualizada correctamente. ID: ${id}, Usuario: ${idUsuario}`,
      );

      return {
        message: 'Dependencia actualizada correctamente.',
      };
    } catch (error) {
      if (esErrorDuplicado(error)) {
        this.logger.warn(
          `Error de duplicado al actualizar Dependencia. ID: ${id}, Código: ${dto.codigo ?? dependencia.codigo}`,
        );
        throw new ConflictException('Ya existe una dependencia con ese código');
      }

      this.logger.error(
        `Error al actualizar Dependencia. ID: ${id}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Cambia el estado de un registro de una Dependencia
   * entre ACTIVO e INACTIVO.
   * Al desactivar, registra los datos de eliminación lógica.
   * Al reactivar, limpia dichos datos y registra la actualización.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  async cambiarEstado(
    id: string,
    idUsuario: string,
  ): Promise<DependenciaMessageResponse> {
    this.logger.log(
      `Iniciando cambio de estado de Dependencia. ID: ${id}, Usuario: ${idUsuario}`,
    );

    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id },
    });

    if (!dependencia) {
      this.logger.warn(
        `No se encontró Dependencia para cambiar estado. ID: ${id}`,
      );
      throw new NotFoundException(
        'No existe una Dependencia con esa identificación',
      );
    }

    const estadoAnterior = dependencia.estado;
    // Determina el estado contrario al estado actual.
    const nuevoEstado = dependencia.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';

    dependencia.estado = nuevoEstado;

    if (nuevoEstado === 'INACTIVO') {
      dependencia._user_delete = idUsuario;
      dependencia._deleted_at = new Date();
      dependencia._user_update = null;
      dependencia._updated_at = null;
    } else {
      dependencia._user_update = idUsuario;
      dependencia._updated_at = new Date();
      dependencia._user_delete = null;
      dependencia._deleted_at = null;
    }

    try {
      await this.dependenciaRepository.save(dependencia);

      this.logger.log(
        `Estado de Dependencia cambiado correctamente. ID: ${id}, Estado anterior: ${estadoAnterior}, Estado nuevo: ${nuevoEstado}, Usuario: ${idUsuario}`,
      );

      return {
        message: `Registro de la dependencia ${dependencia.estado === 'ACTIVO' ? 'activado' : 'inactivado'} correctamente.`,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Error al cambiar el estado de la Dependencia. ID: ${id}, Estado anterior: ${estadoAnterior}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new InternalServerErrorException(
        'No se pudo cambiar el estado del registro',
      );
    }
  }

  async validarDependencia(id_dependencia: string): Promise<void> {
    const dependencia = await this.dependenciaRepository.findOne({
      where: { id: id_dependencia },
    });

    if (!dependencia) {
      throw new NotFoundException('No se encontró la dependencia solicitada.');
    }

    if (dependencia.estado !== 'ACTIVO') {
      throw new BadRequestException(
        'La dependencia seleccionada se encuentra inactiva.',
      );
    }
  }
}
