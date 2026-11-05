import { Injectable } from '@nestjs/common';
import { CreateCuentaBancariaDto } from './dto/create-cuenta-bancaria.dto';
import { UpdateCuentaBancariaDto } from './dto/update-cuenta-bancaria.dto';

@Injectable()
export class CuentaBancariaService {
  create(createCuentaBancariaDto: CreateCuentaBancariaDto) {
    return 'This action adds a new cuentaBancaria';
  }

  findAll() {
    return `This action returns all cuentaBancaria`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cuentaBancaria`;
  }

  update(id: number, updateCuentaBancariaDto: UpdateCuentaBancariaDto) {
    return `This action updates a #${id} cuentaBancaria`;
  }

  remove(id: number) {
    return `This action removes a #${id} cuentaBancaria`;
  }
}
