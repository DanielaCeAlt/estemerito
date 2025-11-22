# 🚀 GostCAM - Deployment Guide to Vercel

## Variables de Entorno para Vercel

Configura estas variables de entorno en tu proyecto de Vercel:

### 🔧 Configuración de API Backend (Azure App Service)
```
PYTHON_API_URL=https://apigostcam-apgfajh6c5cpgxc4.mexicocentral-01.azurewebsites.net
NEXT_PUBLIC_PYTHON_API_URL=https://apigostcam-apgfajh6c5cpgxc4.mexicocentral-01.azurewebsites.net
```

### 🔐 Autenticación Azure App Service
```
API_USERNAME=gostcam
API_PASSWORD=Altamirano92
```

### ⚙️ Configuración de Aplicación
```
NEXT_PUBLIC_API_MODE=python
NEXT_PUBLIC_USE_PYTHON_API=true
NODE_ENV=production
```

### 🔑 Seguridad
```
JWT_SECRET=gostcam_production_secret_key_vercel_2024_CHANGE_ME
```

### 🗄️ Base de datos (opcional si solo usas API Python)
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=GostCAM
```

## 📋 Pasos para Deploy en Vercel

1. **Importar Proyecto**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio `estemerito`

2. **Configurar Variables de Entorno**
   - En tu proyecto de Vercel, ve a Settings → Environment Variables
   - Agrega todas las variables listadas arriba

3. **Deploy**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El build y deploy será automático

## 🔗 URLs Importantes

- **Frontend (Vercel)**: `https://[tu-app].vercel.app`
- **API Backend (Azure)**: `https://apigostcam-apgfajh6c5cpgxc4.mexicocentral-01.azurewebsites.net`

## 🛠️ Configuración de Autenticación

Tu aplicación está configurada para:
- Usar autenticación básica con Azure App Service
- Credenciales: `gostcam` / `Altamirano92`
- Modo API: Principalmente Python API con fallback a Next.js API

## 📊 Monitoreo

Una vez desplegado, podrás monitorear:
- Performance de la aplicación en Vercel Analytics
- Logs de requests y errores
- Métricas de usage

## ⚡ Deployments Automáticos

Cada push a la rama `main` activará automáticamente un nuevo deployment en Vercel.

---

### 🔧 Comandos útiles para desarrollo local

```bash
# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Ejecutar versión de producción localmente
npm start
```