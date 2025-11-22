// =============================================
// SERVICIO: UNIFIED API SERVICE OPTIMIZADO
// =============================================

import { pythonApiClient } from './pythonApiClient';
import { logger } from './logger';
import { 
  DashboardStats, 
  VistaEquipoCompleto, 
  VistaMovimientoDetallado,
  ApiResponse,
  LoginResponse,
  EquipoCreateRequest,
  MovimientoCreateRequest,
  FiltrosEquipos,
  FiltrosMovimientos
} from '@/types/database';

export type ApiMode = 'nextjs' | 'python';

// Cache para mejorar performance
interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class ApiService {
  private currentMode: ApiMode = 'nextjs';
  private token: string | null = null;
  private cache = new Map<string, CacheEntry>();
  private requestQueue = new Map<string, Promise<unknown>>();

  // Configurar modo de API
  setMode(mode: ApiMode): void {
    this.currentMode = mode;
    this.clearCache(); // Limpiar cache al cambiar modo
    logger.info(`API Service mode changed to: ${mode}`, { mode });
  }

  // Configurar token
  setToken(token: string | null): void {
    this.token = token;
    if (token && this.currentMode === 'python') {
      pythonApiClient.setToken(token);
    }
  }

  // Cache management
  private getCacheKey(url: string, params?: Record<string, unknown>): string {
    return `${url}_${JSON.stringify(params || {})}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl = 300000): void { // 5 min default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private clearCache(): void {
    this.cache.clear();
    logger.debug('API cache cleared');
  }

  // Request deduplication para evitar requests duplicados
  private async requestWithDeduplication<T>(
    key: string, 
    requestFn: () => Promise<ApiResponse<T>>
  ): Promise<ApiResponse<T>> {
    if (this.requestQueue.has(key)) {
      return this.requestQueue.get(key) as Promise<ApiResponse<T>>;
    }

    const promise = requestFn().finally(() => {
      this.requestQueue.delete(key);
    });

    this.requestQueue.set(key, promise);
    return promise;
  }

  // Retry logic para requests fallidos
  private async withRetry<T>(
    operation: () => Promise<ApiResponse<T>>,
    maxRetries = 3,
    delay = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Request failed (attempt ${attempt}/${maxRetries}): ${lastError.message}`);
        
        if (attempt === maxRetries) break;
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    logger.error(`Request failed after all retries: ${lastError?.message}`);
    throw lastError;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // ========================
  // MÉTODO DE AUTENTICACIÓN
  // ========================
  async login(email: string, password: string): Promise<LoginResponse> {
    console.log('[ApiService] Iniciando login con proxy de Azure...');
    try {
      // Usar el proxy de autenticación que conecta con Azure
      const response = await fetch('/api/auth/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contraseña: password
        })
      });

      console.log('[ApiService] Respuesta del proxy:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[ApiService] Login response:', data);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Error de conexión'
      };
    }
  }

  // ========================
  // MÉTODOS GENÉRICOS OPTIMIZADOS
  // ========================
  async get<T>(
    url: string, 
    useCache = false, 
    cacheTtl = 300000
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(url);
    
    // Verificar cache si está habilitado
    if (useCache) {
      const cached = this.getFromCache<ApiResponse<T>>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${url}`);
        return cached;
      }
    }

    // Usar deduplication para evitar requests duplicados
    return this.requestWithDeduplication(cacheKey, async () => {
      try {
        let response: Response;

        if (this.currentMode === 'python') {
          // Por ahora usar fetch directamente para simplificar
          response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          if (useCache) {
            this.setCache(cacheKey, data, cacheTtl);
          }

          return data;
        } else {
          response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders(),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // Guardar en cache si está habilitado
          if (useCache) {
            this.setCache(cacheKey, data, cacheTtl);
          }

          return data;
        }
      } catch (error) {
        logger.error(`GET request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Request failed'
        } as ApiResponse<T>;
      }
    });
  }

  async post<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`POST request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      } as ApiResponse<T>;
    }
  }

  async put<T>(url: string, data: unknown): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`PUT request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      } as ApiResponse<T>;
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error(`DELETE request failed for ${url}: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed'
      } as ApiResponse<T>;
    }
  }

  // ========================
  // MÉTODOS DE DATOS ESPECÍFICOS
  // ========================
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.get<DashboardStats>('/api/dashboard', true, 60000); // Cache por 1 minuto
  }

  async getEquipos(filtros?: FiltrosEquipos): Promise<ApiResponse<VistaEquipoCompleto[]>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const url = `/api/equipos${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get<VistaEquipoCompleto[]>(url);
  }

  async getMovimientos(filtros?: FiltrosMovimientos): Promise<ApiResponse<VistaMovimientoDetallado[]>> {
    const params = new URLSearchParams();
    if (filtros) {
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const url = `/api/movimientos${params.toString() ? `?${params.toString()}` : ''}`;
    return this.get<VistaMovimientoDetallado[]>(url);
  }

  async createEquipo(equipo: EquipoCreateRequest): Promise<ApiResponse<any>> {
    return this.post('/api/equipos/alta', equipo);
  }

  async createMovimiento(movimiento: MovimientoCreateRequest): Promise<ApiResponse<any>> {
    return this.post('/api/movimientos', movimiento);
  }

  // ========================
  // MÉTODOS DE UTILIDAD
  // ========================
  getCurrentMode(): ApiMode {
    return this.currentMode;
  }

  isUsingPythonApi(): boolean {
    return this.currentMode === 'python';
  }

  isUsingNextjsApi(): boolean {
    return this.currentMode === 'nextjs';
  }
}

// Exportar instancia singleton
export const apiService = new ApiService();