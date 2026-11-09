import { Controller, Post, Body, UnauthorizedException, UseGuards, Request, Logger, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AdUser, AdGroup } from './interfaces/ad.interface';
import { PaginationDto } from '../common/pagination.dto';
import { JwtOrApiTokenGuard } from './guards/jwt-or-api-token.guard';
import { RolesGuard } from './guards/roles.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

class AdUsersQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  includeGroups?: boolean;
}

class AdGroupsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;
}

@ApiTags('Seguridad / Autenticación')
@ApiBearerAuth('JWT')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  
  constructor(private authService: AuthService) {}

  // ✅ Login SIN UseGuards - autenticación manual
  @ApiResponse({ status: 201, description: 'Usuario autenticado y token generado exitosamente' })  
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })  
  @ApiResponse({ status: 403, description: 'Acceso denegado' })  
  @ApiOperation({ summary: 'Autenticación de usuario y generación de token JWT' })
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Body() body: LoginDto) {
    this.logger.log(`📥 Body recibido: ${JSON.stringify(body)}`);

    try {
      const { username, password } = body;

      if (!username || !password) {
        this.logger.warn('⚠️ Usuario o contraseña faltantes');
        throw new UnauthorizedException('Usuario y contraseña requeridos');
      }

      this.logger.log(`🔍 Validando usuario: ${username}`);

      const user = await this.authService.validateUser(username, password);

      if (!user) {
        this.logger.warn(`❌ Usuario no autenticado: ${username}`);
        throw new UnauthorizedException('Credenciales inválidas');
      }

      this.logger.log(`✅ Usuario autenticado: ${username}`);

      const result = await this.authService.login(user);
      this.logger.log(`🔐 Token generado para: ${username}`);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en login: ${message}`);
      throw error instanceof UnauthorizedException ? error : new UnauthorizedException(message);
    }
  }

  // ✅ Ruta protegida con JWT - usa UseGuards
  @Post('validate-token')
  @ApiOperation({ summary: 'Validación de token JWT' })
  @ApiResponse({ status: 200, description: 'Token válido' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  @UseGuards(AuthGuard('jwt'))
  async validateToken(@Request() req) {
    this.logger.log(`🔍 Validando token para: ${req.user?.username}`);
    return {
      valid: true,
      user: req.user,
    };
  }

  // ✅ Ejemplo de ruta protegida
  @Post('profile')
  @ApiOperation({ summary: 'Obtener perfil de usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil de usuario obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return {
      user: req.user,
      message: 'Perfil de usuario',
    };
  }

  // ✅ Ejemplo de ruta protegida con roles
  @Post('admin')
  @ApiOperation({ summary: 'Ruta protegida para administradores' })
  @ApiResponse({ status: 200, description: 'Acceso permitido para administradores' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @UseGuards(AuthGuard('jwt'))
  async adminOnly(@Request() req) {
    // Verificar roles manualmente
    if (!req.user.roles.includes('admin')) {
      throw new UnauthorizedException('Acceso denegado: se requiere rol admin');
    }
    return {
      message: 'Acceso admin permitido',
      user: req.user,
    };
  }
  
  @Get('ldap/diagnostic')
  @ApiOperation({ summary: 'Ejecutar diagnóstico LDAP' })
  @ApiResponse({ status: 200, description: 'Diagnóstico LDAP ejecutado correctamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 500, description: 'Error al ejecutar el diagnóstico LDAP' })
  @UseGuards(AuthGuard('jwt'))
  async ldapDiagnostic() {
    this.logger.log('📊 Ejecutando diagnóstico LDAP');
    return this.authService.diagnoseLdap();
  }

  // ✅ Obtener lista de usuarios de AD  
  @Get('users_ad')
  @ApiOperation({ summary: 'Obtener lista de usuarios de Active Directory' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'search', required: false, description: 'Texto de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 500, example: 100 })
  @ApiQuery({ name: 'offset', required: false, type: Number, minimum: 0, example: 0 })
  @ApiQuery({ name: 'includeGroups', required: false, type: Boolean, description: 'Incluir grupos' })
  @UseGuards(AuthGuard('jwt'))
  async getAdUsers(
    @Query() query?: AdUsersQueryDto,
  ) {
    this.logger.log(`📥 Solicitando lista de usuarios de AD`);
    
    try {
      // ✅ Limitar el límite máximo a 500 para evitar error
      const maxLimit = 500;
      const parsedLimit = query?.limit ?? 100;
      const finalLimit = Math.min(parsedLimit, maxLimit);
      
      // ✅ Convertir includeGroups a booleano correctamente
      let includeGroupsBoolean = false;
      includeGroupsBoolean = query?.includeGroups ?? false;

      const finalOffset = query?.offset ?? 0;
      this.logger.log(`📊 Parámetros: search=${query?.search}, limit=${finalLimit}, offset=${finalOffset}, includeGroups=${includeGroupsBoolean}`);

      const users: AdUser[] = await this.authService.getAdUsers({
        search: query?.search || '',
        limit: finalLimit,
        offset: finalOffset,
        includeGroups: includeGroupsBoolean,
      });
      
      return {
        success: true,
        data: users,
        count: users.length,
        limit: finalLimit,
        offset: finalOffset,
        message: 'Usuarios obtenidos correctamente',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error al obtener usuarios: ${message}`);
      throw new UnauthorizedException(`Error al obtener usuarios de AD: ${message}`);
    }
  }

  // ✅ Obtener grupos de AD
  @Get('groups')
  @ApiOperation({ summary: 'Obtener lista de grupos de Active Directory' })
  @ApiResponse({ status: 200, description: 'Lista de grupos obtenida correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiQuery({ name: 'search', required: false, description: 'Texto de búsqueda' })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 500, example: 100 })
  @UseGuards(AuthGuard('jwt'))
  async getGroups(
    @Query() query?: AdGroupsQueryDto,
  ) {
    this.logger.log(`📥 Solicitando grupos de AD`);
    
    try {
      // ✅ Limitar el límite máximo a 500
      const maxLimit = 500;
      const parsedLimit = query?.limit ?? 100;
      const finalLimit = Math.min(parsedLimit, maxLimit);

      const groups: AdGroup[] = await this.authService.getAdGroups({
        search: query?.search || '',
        limit: finalLimit,
      });
      
      return {
        success: true,
        data: groups,
        count: groups.length,
        limit: finalLimit,
        message: 'Grupos obtenidos correctamente',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error al obtener grupos: ${message}`);
      throw new UnauthorizedException(`Error al obtener grupos de AD: ${message}`);
    }
  }

  // ✅ Obtener usuario por username (exacto)  
  @Get('user/:username')
  @ApiOperation({ summary: 'Obtener usuario  Active Directory por username' })
  @ApiParam({ name: 'username', description: 'Nombre de usuario de Active Directory' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  //@UseGuards(AuthGuard('jwt'))
   @UseGuards(JwtOrApiTokenGuard, RolesGuard)
  async getUserByUsername(@Param('username') username: string) {
    this.logger.log(`📥 Solicitando usuario por username: ${username}`);
    
    try {
      const user = await this.authService.getAdUserByUsername(username);
      
      if (!user) {
        /*return {
          success: false,
          message: `Usuario ${username} no encontrado en AD`,
          data: null,
        };*/
        throw new NotFoundException(
          `Usuario ${username} no encontrado en AD`,
        );
      }
      
      return {
        success: true,
        data: user,
        message: 'Usuario obtenido correctamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error al obtener usuario: ${error.message}`);
      throw new NotFoundException('Error al obtener usuario de AD');
    }
  }

  // ✅ Obtener usuario por número de teléfono
  @Get('user/ci/:phone')
  @ApiOperation({ summary: 'Obtener usuario Active Directory por número de teléfono (CI)' })
  @ApiParam({ name: 'phone', description: 'Número de teléfono o CI' })
  @ApiResponse({ status: 200, description: 'Usuario obtenido correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  //@UseGuards(AuthGuard('jwt'))
  @UseGuards(JwtOrApiTokenGuard, RolesGuard) // // JWT o API token, luego autorización
  async getUserByPhone(@Param('phone') phone: string) {
    this.logger.log(`📥 Solicitando usuario por teléfono: ${phone}`);
    
    try {
      const user = await this.authService.getAdUserByPhone(phone);
      
      if (!user) {
        return {
          success: false,
          message: `No se encontró usuario con teléfono ${phone}`,
          data: null,
        };
      }
      
      return {
        success: true,
        data: user,
        message: 'Usuario obtenido correctamente',
      };
    } catch (error) {
      this.logger.error(`❌ Error al obtener usuario: ${error.message}`);
      throw new UnauthorizedException('Error al obtener usuario de AD');
    }
  }
  
}