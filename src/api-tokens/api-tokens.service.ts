import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, LessThan, IsNull } from 'typeorm';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ApiToken } from './entities/api-token.entity';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { QueryApiTokenDto } from './dto/query-api-token.dto';

@Injectable()
export class ApiTokensService {
  constructor(
    @InjectRepository(ApiToken)
    private apiTokenRepository: Repository<ApiToken>,
  ) {}

  // 🔹 Generar token JWT
  private generateToken(): string {
    return jwt.sign(
      {
        random: crypto.randomBytes(32).toString('hex'),
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '365d' },
    );
  }

  // 🔹 CREATE
  async create(createDto: CreateApiTokenDto, userCreated?: string): Promise<ApiToken> {
    const token = this.generateToken();

    const apiToken = this.apiTokenRepository.create({
      sistemaId: createDto.sistemaId,
      token,
      descripcion: createDto.descripcion ?? null,
      permisos: createDto.permisos ?? [],
      fechaExpiracion: createDto.fechaExpiracion
        ? new Date(createDto.fechaExpiracion)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      ipOrigen: createDto.ipOrigen ?? null,
      userAgent: createDto.userAgent ?? null,
      activo: true,
      _userCreated: userCreated ?? null,
    });

    return await this.apiTokenRepository.save(apiToken);
  }

  // 🔹 FIND ALL
  async findAll(): Promise<ApiToken[]> {
    return await this.apiTokenRepository.find({      
      order: { _createdAt: 'DESC' },
    });
  }

  // 🔹 SEARCH
  async search(query: QueryApiTokenDto): Promise<ApiToken[]> {
    const qb = this.apiTokenRepository
      .createQueryBuilder('apiToken')
      .leftJoin('apiToken.sistema', 'sistema')
      .addSelect(['sistema.id', 'sistema.nombre', 'sistema.codigo']);

    if (query.sistemaId) {
      qb.andWhere('apiToken.sistemaId = :sistemaId', {
        sistemaId: query.sistemaId,
      });
    }

    if (query.activo !== undefined) {
      qb.andWhere('apiToken.activo = :activo', { activo: query.activo });
    }

    if (query.search?.trim()) {
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('apiToken.descripcion ILIKE :search', {
              search: `%${query.search}%`,
            })
            .orWhere('sistema.nombre ILIKE :search', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    qb.orderBy('apiToken._createdAt', 'DESC');

    return await qb.getMany();
  }

  // 🔹 FIND ONE
  async findOne(id: string): Promise<ApiToken> {
    const token = await this.apiTokenRepository.findOne({
      where: { id },      
    });
    if (!token) {
      throw new NotFoundException(`Token con ID ${id} no encontrado`);
    }
    return token;
  }

  // 🔹 FIND BY TOKEN (para validación)
  async findByToken(token: string): Promise<ApiToken> {
    const apiToken = await this.apiTokenRepository.findOne({
      where: { token },      
    });
    if (!apiToken) {
      throw new UnauthorizedException('Token no válido');
    }
    return apiToken;
  }

  // 🔹 VALIDAR TOKEN
  async validateToken(token: string): Promise<ApiToken> {
    const apiToken = await this.findByToken(token);

    if (!apiToken.activo) {
      throw new UnauthorizedException('Token inactivo');
    }

    if (
      apiToken.fechaExpiracion &&
      new Date(apiToken.fechaExpiracion) < new Date()
    ) {
      throw new UnauthorizedException('Token expirado');
    }

    // Actualizar último uso
    apiToken.fechaUltimoUso = new Date();
    await this.apiTokenRepository.save(apiToken);

    return apiToken;
  }

  // 🔹 UPDATE
  async update(
    id: string,
    updateDto: UpdateApiTokenDto,
    userUpdate?: string,
  ): Promise<ApiToken> {
    const token = await this.findOne(id);

    if (updateDto.fechaExpiracion) {
      token.fechaExpiracion = new Date(updateDto.fechaExpiracion);
    }

    Object.assign(token, {
      ...updateDto,
      fechaExpiracion: token.fechaExpiracion,
    });

    token._userUpdate = userUpdate ?? null;

    return await this.apiTokenRepository.save(token);
  }

  // 🔹 DELETE (soft)
  async remove(id: string, userDelete?: string): Promise<void> {
    const token = await this.findOne(id);
    token.activo = false;
    token._userDelete = userDelete ?? null;
    await this.apiTokenRepository.save(token);
    await this.apiTokenRepository.softDelete(id);
  }

  // 🔹 RESTORE
  async restore(id: string, userUpdate?: string): Promise<void> {
    const token = await this.apiTokenRepository.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!token) {
      throw new NotFoundException(`Token con ID ${id} no encontrado`);
    }

    token._deletedAt = null;
    token.activo = true;
    token._userUpdate = userUpdate ?? null;
    token._userDelete = null;

    await this.apiTokenRepository.save(token);
  }

  // 🔹 ACTUALIZAR ÚLTIMO USO
  async updateLastUsage(tokenId: string): Promise<void> {
    await this.apiTokenRepository.update(tokenId, {
      fechaUltimoUso: new Date(),
    });
  }

  // 🔹 LIMPIAR TOKENS EXPIRADOS
  async cleanupExpired(): Promise<number> {
    const result = await this.apiTokenRepository
      .createQueryBuilder()
      .update(ApiToken)
      .set({ activo: false })
      .where('fecha_expiracion < :now', { now: new Date() })
      .andWhere('activo = true')
      .andWhere('_deleted_at IS NULL')
      .execute();

    return result.affected ?? 0;
  }
}