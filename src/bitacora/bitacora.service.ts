import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere, ILike } from 'typeorm';
import { Bitacora } from './entities/bitacora.entity';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { QueryBitacoraDto } from './dto/query-bitacora.dto';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(Bitacora)
    private bitacoraRepository: Repository<Bitacora>,
  ) {}

  async create(createBitacoraDto: CreateBitacoraDto): Promise<Bitacora> {
    const bitacora = this.bitacoraRepository.create(createBitacoraDto);
    return await this.bitacoraRepository.save(bitacora);
  }

  async createFromRequest(
    data: {
      tablaAfectada: string;
      registroId: string;
      accion: string;
      datosAnteriores?: any;
      datosNuevos?: any;
      sistemaId?: string;
    },
    req: any,
  ): Promise<Bitacora> {
    const createBitacoraDto: CreateBitacoraDto = {
      ...data,
      ipOrigen: this.getClientIp(req),
      userAgent: req.headers?.['user-agent'],
      usuarioId: req.user?.id || req.user?.sub,
      sistemaId: data.sistemaId || req.sistemaId || req.body?.sistemaId,
    };

    return this.create(createBitacoraDto);
  }

  async findAll(query: QueryBitacoraDto): Promise<{
    data: Bitacora[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 20, ...filters } = query;

    const where: FindOptionsWhere<Bitacora> = {};

    if (filters.sistemaId) {
      where.sistemaId = filters.sistemaId;
    }

    if (filters.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters.tablaAfectada) {
      where.tablaAfectada = ILike(`%${filters.tablaAfectada}%`);
    }

    if (filters.accion) {
      where.accion = filters.accion;
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      where.fecha = Between(
        new Date(filters.fechaDesde),
        new Date(filters.fechaHasta),
      );
    } else if (filters.fechaDesde) {
      where.fecha = Between(
        new Date(filters.fechaDesde),
        new Date(),
      );
    } else if (filters.fechaHasta) {
      where.fecha = Between(
        new Date('1970-01-01'),
        new Date(filters.fechaHasta),
      );
    }

    const [data, total] = await this.bitacoraRepository.findAndCount({
      where,
      relations: { usuario: true },
      order: { fecha: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Bitacora> {
    const bitacora = await this.bitacoraRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });

    if (!bitacora) {
      throw new NotFoundException(`Registro de bitácora con ID ${id} no encontrado`);
    }

    return bitacora;
  }

  async findByRegistro(
    tablaAfectada: string,
    registroId: string,
  ): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { tablaAfectada, registroId },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
  }

  async findByUsuario(usuarioId: string): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { usuarioId },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
  }

  async findBySistema(sistemaId: string): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { sistemaId },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
  }

  async findByAccion(accion: string): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { accion },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
  }

  async getAuditTrail(
    tablaAfectada: string,
    registroId: string,
  ): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { tablaAfectada, registroId },
      relations: { usuario: true },
      order: { fecha: 'ASC' },
    });
  }

  async getRecentActivity(limit: number = 10): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      relations: { usuario: true },
      order: { fecha: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<any> {
    const total = await this.bitacoraRepository.count();

    const acciones = await this.bitacoraRepository
      .createQueryBuilder('bitacora')
      .select('bitacora.accion, COUNT(*) as count')
      .groupBy('bitacora.accion')
      .getRawMany();

    const sistemas = await this.bitacoraRepository
      .createQueryBuilder('bitacora')
      .select('s.nombre as sistema_nombre, COUNT(*) as count')
      .leftJoin('bitacora.sistema', 's')
      .where('bitacora.sistemaId IS NOT NULL')
      .groupBy('s.nombre')
      .getRawMany();

    const usuarios = await this.bitacoraRepository
      .createQueryBuilder('bitacora')
      .select(
        "CONCAT_WS(' ', u.nombres, u.apellido_paterno, u.apellido_materno) as usuario_nombre, COUNT(*) as count",
      )
      .leftJoin('bitacora.usuario', 'u')
      .where('bitacora.usuarioId IS NOT NULL')
      .groupBy(
        "CONCAT_WS(' ', u.nombres, u.apellido_paterno, u.apellido_materno)",
      )
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const hoyCount = await this.bitacoraRepository.count({
      where: { fecha: Between(hoy, new Date()) },
    });

    // Últimas 24 horas
    const ayer = new Date();
    ayer.setHours(ayer.getHours() - 24);
    const ultimas24h = await this.bitacoraRepository.count({
      where: { fecha: Between(ayer, new Date()) },
    });

    return {
      total,
      hoy: hoyCount,
      ultimas24h,
      porAccion: acciones,
      porSistema: sistemas,
      usuariosMasActivos: usuarios,
    };
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Bitacora[]> {
    return await this.bitacoraRepository.find({
      where: { fecha: Between(startDate, endDate) },
      relations: { usuario: true },
      order: { fecha: 'DESC' },
    });
  }

  private getClientIp(req: any): string {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      req.ip ||
      '0.0.0.0';

    // Si es un array (por si hay múltiples proxies), tomar el primero
    const ipAddress = Array.isArray(ip) ? ip[0] : ip;
    
    // Limpiar IPv6 localhost
    return ipAddress === '::1' ? '127.0.0.1' : ipAddress;
  }
}