import { Injectable, UnauthorizedException, Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as ldap from 'ldapjs';
import { ConfigService } from '@nestjs/config';
import { AdUser, AdGroup, AdUserOptions, AdGroupOptions } from './interfaces/ad.interface';


@Injectable()
export class AuthService implements OnModuleInit {
  private ldapClient: ldap.Client | undefined;
  private readonly logger = new Logger(AuthService.name);
  private isInitialized = false;
  private isBound = false; // ✅ Nuevo: indica si ya estamos autenticados
  private reconnectTimer: NodeJS.Timeout | undefined ;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectAttempts = 0;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private getServiceUserCandidates(): string[] {
    const configuredUser = this.configService.get<string>('LDAP_SERVICE_USER')?.trim();
    const domain = this.configService.get<string>('LDAP_DOMAIN')?.trim();
    const candidates = new Set<string>();

    if (configuredUser) {
      candidates.add(configuredUser);
      if (!configuredUser.includes('@') && !configuredUser.includes('\\') && domain) {
        candidates.add(`${configuredUser}@${domain}`);
        candidates.add(`${domain}\\${configuredUser}`);
      }
    }

    if (domain) {
      const fallbackUser = this.configService.get<string>('LDAP_SERVICE_DN')?.trim();
      if (fallbackUser) {
        candidates.add(fallbackUser);
      }
    }

    return [...candidates];
  }

  private getSearchBaseCandidates(): string[] {
    const candidates = new Set<string>();
    const configuredBase = this.configService.get<string>('LDAP_BASE_DN')?.trim();
    const configuredSearchBase = this.configService.get<string>('LDAP_SEARCH_BASE_DN')?.trim();

    if (configuredBase) candidates.add(configuredBase);
    if (configuredSearchBase) candidates.add(configuredSearchBase);

    const domain = this.configService.get<string>('LDAP_DOMAIN')?.trim();
    if (domain) {
      const domainParts = domain.split('.').filter(Boolean);
      if (domainParts.length > 0) {
        const dcBase = domainParts.map(part => `DC=${part}`).join(',');
        candidates.add(dcBase);
      }
    }

    return [...candidates].filter(Boolean);
  }

  onModuleInit() {
    this.initializeLdapClient();
  }

  private initializeLdapClient() {
    try {
      const ldapUrl = this.configService.get<string>('LDAP_URL');
      
      if (!ldapUrl) {
        this.logger.error('❌ LDAP_URL no está definida');
        throw new Error('LDAP_URL no está configurada');
      }

      if (this.ldapClient) {
        try {
          this.ldapClient.destroy();
        } catch (e) {
          // Ignorar error al destruir
        }
      }

      this.logger.log(`🔗 Conectando a LDAP: ${ldapUrl}`);

      this.ldapClient = ldap.createClient({
        url: ldapUrl,
        timeout: 60000,
        connectTimeout: 60000,
        tlsOptions: {
          rejectUnauthorized: false,
        },
        idleTimeout: 0,
        reconnect: {
          initialDelay: 1000,
          maxDelay: 30000,
          failAfter: 10,
        },
      });

      this.isInitialized = true;
      this.reconnectAttempts = 0;

      this.ldapClient.on('connect', () => {
        this.logger.log('✅ Cliente LDAP conectado exitosamente');
        this.reconnectAttempts = 0;
        // ✅ Autenticar con cuenta de servicio al conectar
        this.bindServiceAccount();
        this.startKeepAlive();
      });

      this.ldapClient.on('connectTimeout', () => {
        this.logger.warn('⚠️ Timeout de conexión LDAP');
      });

      this.ldapClient.on('error', (error) => {
        this.logger.error(`❌ Error en cliente LDAP: ${error.message}`);
        this.isInitialized = false;
        this.isBound = false;
        this.handleReconnection();
      });

      this.ldapClient.on('close', () => {
        this.logger.warn('⚠️ Conexión LDAP cerrada');
        this.isInitialized = false;
        this.stopKeepAlive();
        this.handleReconnection();
      });

      this.logger.log(`✅ Cliente LDAP inicializado con URL: ${ldapUrl}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error al inicializar cliente LDAP: ${message}`);
      this.isInitialized = false;
    }
  }

  private bindServiceAccount(): Promise<void> {
    return new Promise(async (resolve) => {
      const servicePassword = this.configService.get<string>('LDAP_SERVICE_PASSWORD');
      const serviceUsers = this.getServiceUserCandidates();

      if (serviceUsers.length === 0 || !servicePassword) {
        this.logger.warn('⚠️ Credenciales de servicio no configuradas. Las búsquedas pueden fallar.');
        this.isBound = false;
        resolve();
        return;
      }

      const ldapClient = this.ldapClient;
      if (!ldapClient) {
        this.logger.warn('⚠️ Cliente LDAP no inicializado. No se puede autenticar la cuenta de servicio.');
        this.isBound = false;
        resolve();
        return;
      }

      const bindResult = await this.tryBindServiceAccount(serviceUsers, servicePassword, ldapClient);
      this.isBound = bindResult.ok;

      if (!bindResult.ok) {
        this.logger.error('❌ Ningún formato válido para la cuenta de servicio LDAP funcionó.');
      }

      resolve();
    });
  }

  private tryBindServiceAccount(
    serviceUsers: string[],
    servicePassword: string,
    ldapClient: ldap.Client,
  ): Promise<{ ok: boolean; used: string | null; tried: string[]; error?: string }> {
    return new Promise((resolve) => {
      const tried: string[] = [];

      const tryBind = (index: number) => {
        const serviceUser = serviceUsers[index];
        if (!serviceUser) {
          resolve({ ok: false, used: null, tried, error: 'No se pudo bindear la cuenta de servicio.' });
          return;
        }

        tried.push(serviceUser);
        this.logger.log(`🔑 Intentando autenticar cuenta de servicio con: ${serviceUser}`);

        ldapClient.bind(serviceUser, servicePassword, (err) => {
          if (err) {
            this.logger.warn(`⚠️ Falló bind con ${serviceUser}: ${err.message}`);
            tryBind(index + 1);
            return;
          }

          this.logger.log(`✅ Cuenta de servicio autenticada exitosamente con: ${serviceUser}`);
          resolve({ ok: true, used: serviceUser, tried });
        });
      };

      tryBind(0);
    });
  }

  // ✅ Re-autenticar si es necesario
  private async ensureBound(): Promise<void> {
    if (!this.isBound) {
      this.logger.log('🔄 Re-autenticando con cuenta de servicio...');
      await this.bindServiceAccount();

      if (!this.isBound) {
        this.logger.warn('⚠️ No se pudo autenticar con cuenta de servicio');
        throw new Error('No se pudo autenticar con la cuenta de servicio LDAP');
      }
    }
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      this.logger.error(`❌ Máximo de intentos de reconexión (${this.MAX_RECONNECT_ATTEMPTS}) alcanzado`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.logger.log(`🔄 Reintentando conexión en ${delay}ms (Intento ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isInitialized) {
        this.initializeLdapClient();
      }
    }, delay);
  }

  private keepAliveTimer: NodeJS.Timeout | undefined;

  private startKeepAlive() {
    this.stopKeepAlive();
    this.keepAliveTimer = setInterval(async () => {
      if (!this.ldapClient || !this.isInitialized) {
        return;
      }

      try {
        this.logger.debug('🔄 Manteniendo conexión LDAP activa...');
        await this.bindServiceAccount();
      } catch (error) {
        this.logger.warn(`⚠️ Keep-alive falló: ${(error as Error).message}`);
        this.isInitialized = false;
        this.isBound = false;
        this.handleReconnection();
      }
    }, 300000);
  }

  private stopKeepAlive() {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = undefined;
    }
  }

  private getLdapClient(): ldap.Client {
    if (!this.isInitialized || !this.ldapClient) {
      this.logger.warn('⚠️ Cliente LDAP no disponible, intentando reconectar...');
      this.initializeLdapClient();
      
      if (!this.isInitialized || !this.ldapClient) {
        this.logger.error('❌ Cliente LDAP no disponible después de reconexión');
        throw new Error('Cliente LDAP no disponible');
      }
    }
    return this.ldapClient;
  }

  private async ensureConnection(): Promise<void> {
    if (!this.isInitialized || !this.ldapClient) {
      this.logger.log('🔄 Verificando conexión LDAP...');
      this.initializeLdapClient();

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (!this.isInitialized || !this.ldapClient) {
        throw new Error('No se pudo establecer conexión LDAP');
      }
    }

    await this.ensureBound();
  }

  async diagnoseLdap(): Promise<any> {
    const ldapUrl = this.configService.get<string>('LDAP_URL');
    const domain = this.configService.get<string>('LDAP_DOMAIN');
    const baseDNs = this.getSearchBaseCandidates();
    const serviceUsers = this.getServiceUserCandidates();
    const servicePassword = this.configService.get<string>('LDAP_SERVICE_PASSWORD');

    const result: any = {
      ldapUrl: ldapUrl || null,
      domain: domain || null,
      baseDNs,
      serviceUserCandidates: serviceUsers,
      serviceBind: null,
      searchProbe: null,
      error: null,
    };

    try {
      if (!this.ldapClient || !this.isInitialized) {
        this.initializeLdapClient();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!this.ldapClient || !this.isInitialized) {
        throw new Error('Cliente LDAP no disponible');
      }

      const client = this.getLdapClient();
      const bindResult = servicePassword
        ? await this.tryBindServiceAccount(serviceUsers, servicePassword, client)
        : { ok: false, used: null, tried: serviceUsers, error: 'LDAP_SERVICE_PASSWORD no configurada' };

      result.serviceBind = bindResult;

      if (baseDNs.length > 0) {
        const probe = await new Promise((resolve) => {
          const baseDN = baseDNs[0];
          const opts: ldap.SearchOptions = {
            filter: '(objectClass=user)',
            scope: 'sub',
            attributes: ['sAMAccountName'],
            sizeLimit: 1,
            timeLimit: 30,
          };

          client.search(baseDN, opts, (searchErr, res) => {
            if (searchErr) {
              resolve({ ok: false, baseDN, error: searchErr.message });
              return;
            }

            let found = false;
            res.on('searchEntry', () => {
              found = true;
            });

            res.on('error', (error) => {
              resolve({ ok: false, baseDN, error: error.message });
            });

            res.on('end', () => {
              resolve({ ok: true, baseDN, count: found ? 1 : 0 });
            });
          });
        });

        result.searchProbe = probe;
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Diagnóstico LDAP falló: ${message}`);
      result.error = message;
      return result;
    }
  }

  async validateUser(username: string, password: string): Promise<any> {
    try {
      await this.ensureConnection();

      this.logger.log(`🔍 Intentando autenticar usuario: ${username}`);

      const domain = this.configService.get<string>('LDAP_DOMAIN');
      if (!domain) {
        this.logger.error('❌ Configuración LDAP incompleta');
        throw new Error('Configuración LDAP incompleta');
      }

      const candidates = [
        `${username}@${domain}`,
        `${domain}\\${username}`,
        username,
      ];

      return new Promise((resolve, reject) => {
        const tryBind = (index: number) => {
          const userDN = candidates[index];
          if (!userDN) {
            reject(new UnauthorizedException('Credenciales inválidas'));
            return;
          }

          this.logger.log(`👤 Intentando bind con: ${userDN}`);

          try {
            const client = this.getLdapClient();

            client.bind(userDN, password, (err) => {
              if (err) {
                this.logger.error(`❌ Error en bind LDAP con ${userDN}: ${err.message}`);

                if (err.message.includes('ECONNRESET')) {
                  this.logger.warn('⚠️ Error de conexión en bind, reintentando...');
                  this.initializeLdapClient();
                  this.validateUser(username, password)
                    .then(resolve)
                    .catch(reject);
                  return;
                }

                if (index < candidates.length - 1) {
                  this.logger.warn(`⚠️ Reintentando bind con formato alternativo...`);
                  tryBind(index + 1);
                  return;
                }

                reject(new UnauthorizedException('Credenciales inválidas'));
                return;
              }

              this.logger.log(`✅ Bind exitoso para: ${username}`);

              const searchBaseCandidates = this.getSearchBaseCandidates();
              const baseDN = searchBaseCandidates[0];
              if (!baseDN) {
                reject(new UnauthorizedException('Configuración LDAP incompleta: base DN no encontrada'));
                return;
              }

              const opts: ldap.SearchOptions = {
                filter: `(sAMAccountName=${username})`,
                scope: 'sub',
                attributes: ['displayName', 'mail', 'givenName', 'sn', 'memberOf'],
              };

              client.search(baseDN, opts, (searchErr, res) => {
                if (searchErr) {
                  this.logger.error(`❌ Error en búsqueda LDAP: ${searchErr.message}`);
                  reject(new UnauthorizedException('Error en la autenticación'));
                  return;
                }

                let userData: any = null;

                res.on('searchEntry', (entry) => {
                  const getAttribute = (attrName: string): string => {
                    const attr = entry.attributes.find(a => a.type === attrName);
                    return attr ? (attr as any).values?.[0] || '' : '';
                  };

                  const getAttributeArray = (attrName: string): string[] => {
                    const attr = entry.attributes.find(a => a.type === attrName);
                    return attr ? (attr as any).values || [] : [];
                  };

                  userData = {
                    username: username,
                    name: getAttribute('displayName') || username,
                    email: getAttribute('mail') || `${username}@${domain}`,
                    firstName: getAttribute('givenName') || username,
                    lastName: getAttribute('sn') || '',
                    groups: getAttributeArray('memberOf'),
                  };

                  this.logger.log(`👤 Usuario encontrado: ${userData.name}`);
                  this.logger.log(`📧 Email: ${userData.email}`);
                });

                res.on('error', (searchError) => {
                  this.logger.error(`❌ Error en búsqueda LDAP: ${searchError.message}`);
                  reject(new UnauthorizedException('Error en la autenticación'));
                });

                res.on('end', () => {
                  if (userData) {
                    this.logger.log(`✅ Usuario autenticado exitosamente: ${username}`);
                    resolve(userData);
                  } else {
                    this.logger.warn(`⚠️ Usuario no encontrado: ${username}`);
                    reject(new UnauthorizedException('Usuario no encontrado'));
                  }
                });
              });
            });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            this.logger.error(`❌ Error en autenticación: ${message}`);
            reject(new UnauthorizedException('Error en el servicio de autenticación'));
          }
        };

        tryBind(0);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error(`❌ Error en validateUser: ${message}`);
      throw new UnauthorizedException('Error en el servicio de autenticación');
    }
  }

  async login(user: any) {
    this.logger.log(`🔐 Generando token para: ${user.username}`);
    
    const roles = this.extractRoles(user.groups);
    this.logger.log(`👥 Roles asignados: ${roles.join(', ')}`);

    const payload = {
      username: user.username,
      sub: user.username,
      name: user.name,
      email: user.email,
      roles: roles,
    };

    const token = this.jwtService.sign(payload);
    
    // Obtener tiempo de expiración desde la configuración
    const expiresInConfig = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
    const decoded = this.jwtService.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    // Calcular minutos restantes
    const now = Math.floor(Date.now() / 1000);
    const expiresInMinutes = Math.floor((decoded.exp - now) / 60);
   
    return {
      access_token: token,
      expires_in: expiresInMinutes, // Minutos hasta expirar
      expires_at: expiresAt.toISOString(), // Fecha de expiración en formato ISO
      token_type: 'Bearer',
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        roles: roles,
      },
    };
  }

  private extractRoles(groups: string[]): string[] {
    if (!groups || groups.length === 0) {
      return ['admin'];
    }
    
    const roles: string[] = [];
    
    for (const group of groups) {
      const cnMatch = group.match(/CN=([^,]+)/);
      if (cnMatch) {
        const groupName = cnMatch[1];
        if (groupName.includes('Admin') || groupName.includes('Administradores')) {
          roles.push('admin');
        } else if (groupName.includes('Manager') || groupName.includes('Gerentes')) {
          roles.push('manager');
        } else if (groupName.includes('User') || groupName.includes('Usuarios')) {
          roles.push('admin');
        }
      }
    }
    return roles.length > 0 ? [...new Set(roles)] : ['admin'];
  }

  // ✅ Método principal para obtener usuarios - SOLO CON BÚSQUEDA
  async getAdUsers(options: AdUserOptions): Promise<AdUser[]> {
    try {
      await this.ensureConnection();

      this.logger.log(`🔍 Obteniendo usuarios de AD con opciones: ${JSON.stringify(options)}`);
      
      const domain = this.configService.get<string>('LDAP_DOMAIN');
      const baseDNs = this.getSearchBaseCandidates();

      if (baseDNs.length === 0 || !domain) {
        this.logger.error('❌ Configuración LDAP incompleta');
        throw new Error('Configuración LDAP incompleta');
      }

      const { search = '', limit = 100, offset = 0, includeGroups = false } = options;

      // ✅ Siempre usar búsqueda (con o sin filtro)
      return this.searchAdUsers(search, limit, offset, includeGroups, baseDNs, domain);
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      if (message.includes('ECONNRESET') || message.includes('Client LDAP no disponible')) {
        this.logger.warn('⚠️ Error de conexión, reintentando...');
        this.initializeLdapClient();
        return this.getAdUsers(options);
      }
      throw error;
    }
  }

  // ✅ Búsqueda optimizada con paginación manual
  private async searchAdUsers(
    search: string,
    limit: number,
    offset: number,
    includeGroups: boolean,
    baseDNs: string[],
    domain: string,
  ): Promise<AdUser[]> {
    // ✅ Construir filtro según si hay búsqueda o no
    let filter: string;
    if (search) {
      filter = `(&(objectCategory=person)(objectClass=user)(|(sAMAccountName=*${search}*)(displayName=*${search}*)(mail=*${search}*)))`;
    } else {
      // ✅ Sin búsqueda: solo usuarios (filtro simple)
      filter = '(&(objectCategory=person)(objectClass=user))';
    }
    
    this.logger.log(`🔍 Buscando usuarios con filtro: ${filter}`);
    
    const attributes = ['sAMAccountName', 'displayName', 'mail', 'givenName', 'sn', 'title', 'department', 'telephoneNumber', 'mobile', 'company', 'manager'];
    if (includeGroups) {
      attributes.push('memberOf');
    }

    const allUsers = await this.executeSearch(filter, attributes, 1000, 0, includeGroups, baseDNs);
    
    // ✅ Paginar en memoria
    const start = Math.min(offset, allUsers.length);
    const end = Math.min(offset + limit, allUsers.length);
    
    this.logger.log(`✅ Total usuarios encontrados: ${allUsers.length}, devolviendo ${end - start} (offset: ${offset}, limit: ${limit})`);
    
    return allUsers.slice(start, end);
  }
  

  private executeSearch(
    filter: string,
    attributes: string[],
    limit: number,
    offset: number,
    includeGroups: boolean,
    baseDNs: string[],
  ): Promise<AdUser[]> {
    this.logger.log(`🔍 Ejecutando búsqueda con filtro: ${filter} sobre bases: ${baseDNs.join(' | ')}`);

    const attemptSearch = (baseIndex: number): Promise<AdUser[]> => {
      const baseDN = baseDNs[baseIndex];
      if (!baseDN) {
        return Promise.reject(new Error('No se encontró una base DN válida para la búsqueda LDAP.'));
      }

      return new Promise((resolve, reject) => {
        const client = this.getLdapClient();

        const opts: ldap.SearchOptions = {
          filter: filter,
          scope: 'sub',
          attributes: attributes,
          sizeLimit: limit,
          timeLimit: 60,
        };

        client.search(baseDN, opts, (searchErr, res) => {
          if (searchErr) {
            this.logger.error(`❌ Error en búsqueda LDAP sobre ${baseDN}: ${searchErr.message}`);
            if (baseIndex < baseDNs.length - 1) {
              this.logger.warn(`⚠️ Reintentando búsqueda con la siguiente base DN...`);
              resolve(attemptSearch(baseIndex + 1));
              return;
            }
            reject(new Error(`Error al buscar usuarios: ${searchErr.message}`));
            return;
          }

          const users: AdUser[] = [];
          let count = 0;

          res.on('searchEntry', (entry) => {
            count++;

            if (count <= offset) return;

            const getAttribute = (attrName: string): string => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values?.[0] || '' : '';
            };

            const getAttributeArray = (attrName: string): string[] => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values || [] : [];
            };

            const user: AdUser = {
              username: getAttribute('sAMAccountName'),
              displayName: getAttribute('displayName') || getAttribute('givenName') || '',
              email: getAttribute('mail') || '',
              firstName: getAttribute('givenName') || '',
              lastName: getAttribute('sn') || '',
              title: getAttribute('title') || '',
              department: getAttribute('department') || '',
              phone: getAttribute('telephoneNumber') || '',
              mobile: getAttribute('mobile') || '',
              company: getAttribute('company') || '',
              manager: getAttribute('manager') || '',
              dn: entry.dn,
            };

            if (includeGroups) {
              user.groups = getAttributeArray('memberOf').map(group => {
                const cnMatch = group.match(/CN=([^,]+)/);
                return cnMatch ? cnMatch[1] : group;
              });
              user.groupsFull = getAttributeArray('memberOf');
            }

            users.push(user);
          });

          res.on('error', (err) => {
            this.logger.error(`❌ Error en búsqueda LDAP sobre ${baseDN}: ${err.message}`);
            if (baseIndex < baseDNs.length - 1) {
              this.logger.warn(`⚠️ Reintentando búsqueda con la siguiente base DN...`);
              resolve(attemptSearch(baseIndex + 1));
              return;
            }
            reject(new Error(`Error en búsqueda LDAP: ${err.message}`));
          });

          res.on('end', () => {
            this.logger.log(`✅ ${users.length} usuarios encontrados en ${baseDN} (total procesados: ${count})`);
            resolve(users);
          });
        });
      });
    };

    return attemptSearch(0);
  }

  

  async getAdUser(username: string): Promise<AdUser> {
    try {
      await this.ensureConnection();

      this.logger.log(`🔍 Obteniendo usuario: ${username}`);
      
      const baseDN = this.configService.get<string>('LDAP_BASE_DN');

      if (!baseDN) {
        this.logger.error('❌ Configuración LDAP incompleta');
        throw new Error('Configuración LDAP incompleta');
      }

      return new Promise((resolve, reject) => {
        const client = this.getLdapClient();
        
        const opts: ldap.SearchOptions = {
          filter: `(&(objectCategory=person)(objectClass=user)(sAMAccountName=${username}))`,
          scope: 'sub',
          attributes: ['sAMAccountName', 'displayName', 'mail', 'givenName', 'sn', 'title', 'department', 'telephoneNumber', 'mobile', 'company', 'manager', 'memberOf', 'description', 'whenCreated', 'whenChanged', 'objectGUID'],
          sizeLimit: 1,
        };

        client.search(baseDN, opts, (searchErr, res) => {
          if (searchErr) {
            this.logger.error(`❌ Error en búsqueda LDAP: ${searchErr.message}`);
            reject(new Error(`Error al buscar usuario: ${searchErr.message}`));
            return;
          }

          let userData: AdUser | null = null;
          
          res.on('searchEntry', (entry) => {
            const getAttribute = (attrName: string): string => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values?.[0] || '' : '';
            };

            const getAttributeArray = (attrName: string): string[] => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values || [] : [];
            };

            userData = {
              username: getAttribute('sAMAccountName'),
              displayName: getAttribute('displayName') || getAttribute('givenName') || '',
              email: getAttribute('mail') || '',
              firstName: getAttribute('givenName') || '',
              lastName: getAttribute('sn') || '',
              title: getAttribute('title') || '',
              department: getAttribute('department') || '',
              phone: getAttribute('telephoneNumber') || '',
              mobile: getAttribute('mobile') || '',
              company: getAttribute('company') || '',
              manager: getAttribute('manager') || '',
              description: getAttribute('description') || '',
              whenCreated: getAttribute('whenCreated') || '',
              whenChanged: getAttribute('whenChanged') || '',
              objectGUID: getAttribute('objectGUID') || '',
              dn: entry.dn,
              groups: getAttributeArray('memberOf').map(group => {
                const cnMatch = group.match(/CN=([^,]+)/);
                return cnMatch ? cnMatch[1] : group;
              }),
              groupsFull: getAttributeArray('memberOf'),
            };
          });

          res.on('error', (err) => {
            this.logger.error(`❌ Error en búsqueda LDAP: ${err.message}`);
            reject(new Error(`Error en búsqueda LDAP: ${err.message}`));
          });

          res.on('end', () => {
            if (userData) {
              this.logger.log(`✅ Usuario ${username} encontrado`);
              resolve(userData);
            } else {
              this.logger.warn(`⚠️ Usuario ${username} no encontrado`);
              reject(new Error(`Usuario ${username} no encontrado`));
            }
          });
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      if (message.includes('ECONNRESET') || message.includes('Client LDAP no disponible')) {
        this.logger.warn('⚠️ Error de conexión, reintentando...');
        this.initializeLdapClient();
        return this.getAdUser(username);
      }
      throw error;
    }
  }

  async getAdGroups(options?: AdGroupOptions): Promise<AdGroup[]> {
    try {
      await this.ensureConnection();

      this.logger.log('🔍 Obteniendo grupos de AD');
      
      const baseDN = this.configService.get<string>('LDAP_BASE_DN');

      if (!baseDN) {
        this.logger.error('❌ Configuración LDAP incompleta');
        throw new Error('Configuración LDAP incompleta');
      }

      const search = options?.search || '';
      const limit = Math.min(options?.limit || 100, 500);

      let filter = '(objectClass=group)';
      if (search) {
        filter = `(&(objectClass=group)(|(cn=*${search}*)(name=*${search}*)))`;
      }

      return new Promise((resolve, reject) => {
        const client = this.getLdapClient();
        
        const opts: ldap.SearchOptions = {
          filter: filter,
          scope: 'sub',
          attributes: ['cn', 'name', 'description', 'member', 'groupType'],
          sizeLimit: limit,
          timeLimit: 60,
        };

        client.search(baseDN, opts, (searchErr, res) => {
          if (searchErr) {
            this.logger.error(`❌ Error en búsqueda LDAP: ${searchErr.message}`);
            reject(new Error(`Error al buscar grupos: ${searchErr.message}`));
            return;
          }

          const groups: AdGroup[] = [];
          
          res.on('searchEntry', (entry) => {
            const getAttribute = (attrName: string): string => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values?.[0] || '' : '';
            };

            const getAttributeArray = (attrName: string): string[] => {
              const attr = entry.attributes.find(a => a.type === attrName);
              return attr ? (attr as any).values || [] : [];
            };

            groups.push({
              name: getAttribute('cn') || getAttribute('name') || '',
              description: getAttribute('description') || '',
              members: getAttributeArray('member'),
              groupType: getAttribute('groupType') || '',
              dn: entry.dn,
            });
          });

          res.on('error', (err) => {
            this.logger.error(`❌ Error en búsqueda LDAP: ${err.message}`);
            reject(new Error(`Error en búsqueda LDAP: ${err.message}`));
          });

          res.on('end', () => {
            this.logger.log(`✅ ${groups.length} grupos encontrados`);
            resolve(groups);
          });
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      if (message.includes('ECONNRESET') || message.includes('Client LDAP no disponible')) {
        this.logger.warn('⚠️ Error de conexión, reintentando...');
        this.initializeLdapClient();
        return this.getAdGroups(options);
      }
      throw error;
    }
  }
  

  /**
   * Buscar un usuario específico en AD por username
   * @param username - Nombre de usuario exacto (sAMAccountName)
   */
  async getAdUserByUsername(username: string): Promise<AdUser | null> {
    this.logger.log(`🔍 Buscando usuario por username exacto: ${username}`);
    
    const baseDN = this.configService.get<string>('LDAP_BASE_DN');

    if (!baseDN) {
      this.logger.error('❌ Configuración LDAP incompleta');
      throw new Error('Configuración LDAP incompleta');
    }

    return new Promise((resolve, reject) => {
      const client = this.getLdapClient();
      
      const opts: ldap.SearchOptions = {
        filter: `(&(objectCategory=person)(objectClass=user)(sAMAccountName=${username}))`,
        scope: 'sub',
        attributes: [
          'sAMAccountName', 'displayName', 'mail', 'givenName', 'sn', 
          'title', 'department', 'telephoneNumber', 'mobile', 'company', 
          'manager', 'memberOf', 'description', 'whenCreated', 'whenChanged', 
          'objectGUID', 'employeeNumber'
        ],
        sizeLimit: 1,
      };

      client.search(baseDN, opts, (searchErr, res) => {
        if (searchErr) {
          this.logger.error(`❌ Error en búsqueda LDAP: ${searchErr.message}`);
          reject(new Error(`Error al buscar usuario: ${searchErr.message}`));
          return;
        }

        let userData: AdUser | null = null;
        
        res.on('searchEntry', (entry) => {
          this.logger.log(`📄 Usuario encontrado: ${entry.dn}`);
          
          const getAttribute = (attrName: string): string => {
            const attr = entry.attributes.find(a => a.type === attrName);
            return attr ? (attr as any).values?.[0] || '' : '';
          };

          const getAttributeArray = (attrName: string): string[] => {
            const attr = entry.attributes.find(a => a.type === attrName);
            return attr ? (attr as any).values || [] : [];
          };

          userData = {
            username: getAttribute('sAMAccountName'),
            displayName: getAttribute('displayName') || getAttribute('givenName') || '',
            email: getAttribute('mail') || '',
            firstName: getAttribute('givenName') || '',
            lastName: getAttribute('sn') || '',
            title: getAttribute('title') || '',
            department: getAttribute('department') || '',
            phone: getAttribute('telephoneNumber') || '',
            mobile: getAttribute('mobile') || '',
            company: getAttribute('company') || '',
            manager: getAttribute('manager') || '',
            description: getAttribute('description') || '',
            whenCreated: getAttribute('whenCreated') || '',
            whenChanged: getAttribute('whenChanged') || '',
            objectGUID: getAttribute('objectGUID') || '',
            //employeeNumber: getAttribute('employeeNumber') || '',
            dn: entry.dn,
            groups: getAttributeArray('memberOf').map(group => {
              const cnMatch = group.match(/CN=([^,]+)/);
              return cnMatch ? cnMatch[1] : group;
            }),
            groupsFull: getAttributeArray('memberOf'),
          };
        });

        res.on('error', (err) => {
          this.logger.error(`❌ Error en búsqueda LDAP: ${err.message}`);
          reject(new Error(`Error en búsqueda LDAP: ${err.message}`));
        });

        res.on('end', () => {
          if (userData) {
            this.logger.log(`✅ Usuario ${username} encontrado`);
            resolve(userData);
          } else {
            this.logger.warn(`⚠️ Usuario ${username} no encontrado`);
            resolve(null);
          }
        });
      });
    });
  }

  /**
   * Buscar un usuario específico en AD por número de teléfono que es el CI
   * @param phone - Número de teléfono a buscar
   */
  async getAdUserByPhone(phone: string): Promise<AdUser | null> {
    this.logger.log(`🔍 Buscando usuario por teléfono: ${phone}`);
    
    const baseDN = this.configService.get<string>('LDAP_BASE_DN');

    if (!baseDN) {
      this.logger.error('❌ Configuración LDAP incompleta');
      throw new Error('Configuración LDAP incompleta');
    }

    // ✅ Buscar por telephoneNumber o mobile
    const filter = `(&(objectCategory=person)(objectClass=user)(|(telephoneNumber=${phone})(mobile=${phone})))`;

    return new Promise((resolve, reject) => {
      const client = this.getLdapClient();
      
      const opts: ldap.SearchOptions = {
        filter: filter,
        scope: 'sub',
        attributes: [
          'sAMAccountName', 'displayName', 'mail', 'givenName', 'sn', 
          'title', 'department', 'telephoneNumber', 'mobile', 'company', 
          'manager', 'memberOf', 'description', 'whenCreated', 'whenChanged', 
          'objectGUID', 'employeeNumber'
        ],
        sizeLimit: 1,
      };

      client.search(baseDN, opts, (searchErr, res) => {
        if (searchErr) {
          this.logger.error(`❌ Error en búsqueda LDAP: ${searchErr.message}`);
          reject(new Error(`Error al buscar usuario: ${searchErr.message}`));
          return;
        }

        let userData: AdUser | null = null;
        
        res.on('searchEntry', (entry) => {
          this.logger.log(`📄 Usuario encontrado por teléfono: ${entry.dn}`);
          
          const getAttribute = (attrName: string): string => {
            const attr = entry.attributes.find(a => a.type === attrName);
            return attr ? (attr as any).values?.[0] || '' : '';
          };

          const getAttributeArray = (attrName: string): string[] => {
            const attr = entry.attributes.find(a => a.type === attrName);
            return attr ? (attr as any).values || [] : [];
          };

          userData = {
            username: getAttribute('sAMAccountName'),
            displayName: getAttribute('displayName') || getAttribute('givenName') || '',
            email: getAttribute('mail') || '',
            firstName: getAttribute('givenName') || '',
            lastName: getAttribute('sn') || '',
            title: getAttribute('title') || '',
            department: getAttribute('department') || '',
            phone: getAttribute('telephoneNumber') || '',
            mobile: getAttribute('mobile') || '',
            company: getAttribute('company') || '',
            manager: getAttribute('manager') || '',
            description: getAttribute('description') || '',
            whenCreated: getAttribute('whenCreated') || '',
            whenChanged: getAttribute('whenChanged') || '',
            objectGUID: getAttribute('objectGUID') || '',
            //employeeNumber: getAttribute('employeeNumber') || '',
            dn: entry.dn,
            groups: getAttributeArray('memberOf').map(group => {
              const cnMatch = group.match(/CN=([^,]+)/);
              return cnMatch ? cnMatch[1] : group;
            }),
            groupsFull: getAttributeArray('memberOf'),
          };
        });

        res.on('error', (err) => {
          this.logger.error(`❌ Error en búsqueda LDAP: ${err.message}`);
          reject(new Error(`Error en búsqueda LDAP: ${err.message}`));
        });

        res.on('end', () => {
          if (userData) {
            this.logger.log(`✅ Usuario encontrado por teléfono: ${userData.username}`);
            resolve(userData);
          } else {
            this.logger.warn(`⚠️ No se encontró usuario con teléfono: ${phone}`);
            resolve(null);
          }
        });
      });
    });
  }  
}