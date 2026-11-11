import { FindOptionsWhere, IsNull } from 'typeorm';

export function filtroAsignacion<T>(status: string): FindOptionsWhere<T> {
  return {
    deletedAt: IsNull(),
    ...(status === 'TODOS' ? {} : { estado: status }),
  } as FindOptionsWhere<T>;
}
