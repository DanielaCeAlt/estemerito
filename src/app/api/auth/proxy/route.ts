// =============================================
// PROXY: AUTENTICACIÓN CON AZURE API
// =============================================

import { NextRequest, NextResponse } from 'next/server';

function createAuthHeaders() {
  const username = process.env.API_USERNAME || 'gostcam';
  const password = process.env.API_PASSWORD || 'Altamirano92';
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  
  return {
    'Authorization': `Basic ${credentials}`,
    'Content-Type': 'application/json',
  };
}

export async function POST(request: NextRequest) {
  console.log('[AUTH-PROXY] Recibida solicitud de autenticación');
  
  try {
    const body = await request.json();
    const { correo, contraseña } = body;

    console.log('[AUTH-PROXY] Datos recibidos:', { correo, contraseña: '***' });

    // Validar campos requeridos
    if (!correo || !contraseña) {
      console.log('[AUTH-PROXY] Error: Campos faltantes');
      return NextResponse.json({
        success: false,
        message: 'Email y contraseña son requeridos'
      }, { status: 400 });
    }

    const azureBaseUrl = process.env.PYTHON_API_URL || 'https://apigostcam-apgfajh6c5cpgxc4.mexicocentral-01.azurewebsites.net';
    
    console.log(`[AUTH-PROXY] Intentando autenticación para: ${correo}`);
    console.log(`[AUTH-PROXY] URL de Azure: ${azureBaseUrl}`);

    // Intentar autenticación con Azure API usando las credenciales del usuario
    const userCredentials = Buffer.from(`${correo}:${contraseña}`).toString('base64');
    
    console.log('[AUTH-PROXY] Realizando petición a Azure...');
    
    // Hacer una petición de prueba a Azure para validar las credenciales
    const response = await fetch(`${azureBaseUrl}/catalogos/sucursales`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${userCredentials}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`[AUTH-PROXY] Respuesta de Azure: ${response.status} ${response.statusText}`);

    if (response.ok) {
      // Las credenciales son válidas
      console.log(`[AUTH-PROXY] Autenticación exitosa para: ${correo}`);
      
      // Generar un JWT token simple (sin usar la base de datos)
      const token = Buffer.from(JSON.stringify({
        userId: 1,
        email: correo,
        nivel: 1,
        nivelNombre: 'Administrador',
        timestamp: Date.now()
      })).toString('base64');

      // Preparar respuesta de usuario
      const userResponse = {
        idUsuarios: 1,
        NombreUsuario: correo.split('@')[0], // Usar la parte antes del @ como nombre
        NivelUsuario: 1,
        Correo: correo,
        Estatus: 1,
        NivelNombre: 'Administrador'
      };

      return NextResponse.json({
        success: true,
        user: userResponse,
        token,
        message: 'Login exitoso con Azure API'
      }, { status: 200 });

    } else {
      console.log(`[AUTH-PROXY] Autenticación fallida para: ${correo} - Status: ${response.status}`);
      return NextResponse.json({
        success: false,
        message: 'Credenciales inválidas'
      }, { status: 401 });
    }

  } catch (error) {
    console.error('[AUTH-PROXY] Error en autenticación:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}