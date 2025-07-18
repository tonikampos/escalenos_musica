# 🎵 Music Guessing Game - Configuración de APIs

## ✅ Problema Resuelto: Cuota de YouTube API Excedida

La aplicación ahora utiliza un **servicio híbrido** que combina **Last.fm + Spotify** para eliminar las limitaciones de cuota de YouTube API.

## 🔧 Configuración de APIs (Recomendada)

### 1. Last.fm API (RECOMENDADO)
- **Cuota**: 5,000 solicitudes/hora (muy generosa)
- **Función**: Obtener metadatos de canciones y artistas
- **Obtener API key**: https://www.last.fm/api/account/create
- **Gratuito**: Sí, sin restricciones severas

### 2. Spotify Web API (RECOMENDADO)
- **Cuota**: 1,000 solicitudes/hora (suficiente)
- **Función**: Obtener previews de audio de alta calidad
- **Obtener credenciales**: https://developer.spotify.com/dashboard/applications
- **Gratuito**: Sí, para desarrollo

### 3. YouTube Data API v3 (OPCIONAL)
- **Cuota**: 10,000 unidades/día (limitada)
- **Función**: Fallback para audio cuando no hay preview de Spotify
- **Obtener API key**: https://console.cloud.google.com/apis/library/youtube.googleapis.com
- **Nota**: Ya no es necesaria, solo como respaldo

## 🚀 Configuración Rápida

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env.local
   ```

2. **Configura las API keys en `.env.local`**:
   ```env
   # RECOMENDADO: Last.fm + Spotify (sin límites de cuota)
   VITE_LASTFM_API_KEY=tu_lastfm_api_key_aqui
   VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
   VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
   
   # OPCIONAL: YouTube como fallback
   VITE_YOUTUBE_API_KEY=tu_youtube_api_key_aqui
   ```

3. **Instala dependencias y ejecuta**:
   ```bash
   npm install
   npm run dev
   ```

## 🎯 Ventajas del Nuevo Servicio Híbrido

### ✅ Beneficios
- **Sin límites de cuota**: Last.fm es muy generoso
- **Mejor calidad de audio**: Spotify ofrece previews de 30 segundos
- **Mayor variedad**: Más canciones disponibles
- **Mejor experiencia**: No más repetición de canciones
- **Redundancia**: Múltiples fuentes de datos

### 🔄 Flujo de Funcionamiento
1. **Last.fm**: Obtiene metadatos de canciones populares del artista
2. **Spotify**: Busca previews de audio para esas canciones
3. **YouTube**: Fallback solo si no hay preview de Spotify
4. **Cache**: Almacena resultados 24 horas para optimizar

## 📊 Comparación de APIs

| API | Cuota | Calidad Audio | Metadatos | Costo |
|-----|-------|---------------|-----------|--------|
| Last.fm | 5,000/hora | - | ⭐⭐⭐⭐⭐ | Gratis |
| Spotify | 1,000/hora | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Gratis |
| YouTube | 10,000/día | ⭐⭐⭐ | ⭐⭐⭐ | Gratis |

## 🛠️ Resolución de Problemas

### Problema: "Canciones repetidas" o "Fallback data"
**Solución**: Configurar Last.fm API key - elimina este problema completamente

### Problema: "No preview available"
**Solución**: Configurar Spotify API credentials - mejora la disponibilidad de audio

### Problema: "403 Forbidden" o "Quota exceeded"
**Solución**: Ya no ocurre con el nuevo servicio híbrido

## 🎮 Características de la Aplicación

- **17 artistas específicos** configurados
- **Interface en galego** (títulos de canciones en idioma original)
- **20 segundos de reproducción** por canción
- **Sistema de cache** de 24 horas
- **Optimizado para móviles**
- **Desplegado en Netlify**

## 🌐 Despliegue

La aplicación está configurada para Netlify con variables de entorno:
- `VITE_LASTFM_API_KEY`
- `VITE_SPOTIFY_CLIENT_ID`
- `VITE_SPOTIFY_CLIENT_SECRET`
- `VITE_YOUTUBE_API_KEY` (opcional)

## 📝 Notas Técnicas

- El servicio híbrido prioriza Spotify para audio
- Last.fm proporciona metadatos confiables
- YouTube solo se usa como último recurso
- Cache localStorage evita llamadas innecesarias
- Compilación optimizada con Vite

## ✨ Resultado Final

Con esta configuración, la aplicación ya no tiene problemas de cuota y ofrece una experiencia de juego consistente con canciones variadas de todos los artistas configurados.
