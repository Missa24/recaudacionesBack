import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Tarifa } from '../entities/tarifa.entity';

export async function validarSuperposicion(
  tarifaRepository: Repository<Tarifa>,
  arancelDetalleId: string,
  vigenteDesde: string,
  vigenteHasta: string | null,
  excluirId?: string,
): Promise<void> {
  const query = tarifaRepository
    .createQueryBuilder('tarifa')
    .where('tarifa.arancel_det_id = :arancelDetalleId', {
      arancelDetalleId,
    })
    .andWhere(
      '(tarifa.vigente_hasta IS NULL OR tarifa.vigente_hasta > :vigenteDesde)',
      { vigenteDesde },
    );

  if (vigenteHasta !== null) {
    query.andWhere('tarifa.vigente_desde < :vigenteHasta', {
      vigenteHasta,
    });
  }

  if (excluirId) {
    query.andWhere('tarifa.id != :excluirId', {
      excluirId,
    });
  }

  const existente = await query.getOne();

  if (existente) {
    throw new ConflictException(
      'Ya existe una tarifa para este arancel con una vigencia superpuesta.',
    );
  }
}
