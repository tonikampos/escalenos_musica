# 🎵 MusicGuess - Adivina la Canción

Una aplicación web moderna y elegante para adivinar canciones. Los jugadores escuchan 10 segundos de una canción y deben elegir el título correcto entre múltiples opciones.

## ✨ Características

- 🎧 **Previews reales** - Usa la API de Spotify para obtener previews de 30 segundos de canciones reales
- 📱 **Mobile-first** - Diseñado especialmente para dispositivos móviles
- 🎨 **Interfaz elegante** - Diseño moderno con efectos glassmorphism y animaciones suaves
- 📊 **Estadísticas** - Guarda tu progreso y estadísticas de juego
- 🎯 **Múltiples dificultades** - Fácil (5 rondas), Medio (10 rondas), Difícil (15 rondas)
- 🎵 **Categorías variadas** - Pop, Top Hits, Rock, Latino, Electrónica
- 🏆 **Sistema de puntuación** - Guarda tu mejor puntuación y precisión

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Una cuenta de desarrollador de Spotify

### 1. Configurar Spotify Web API

1. Ve a [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Inicia sesión o crea una cuenta
3. Haz clic en "Create App"
4. Completa los datos:
   - **App name**: MusicGuess
   - **App description**: Aplicación para adivinar canciones
   - **Redirect URI**: `http://localhost:3000`
5. Guarda tu **Client ID** y **Client Secret**

### 2. Configurar el proyecto

1. Clona el repositorio:
   ```bash
   git clone [url-del-repo]
   cd escalenos_musica
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   ```

4. Edita el archivo `.env` y agrega tus credenciales de Spotify:
   ```env
   VITE_SPOTIFY_CLIENT_ID=tu_client_id_aqui
   VITE_SPOTIFY_CLIENT_SECRET=tu_client_secret_aqui
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000
   ```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🎮 Cómo Jugar

1. **Configura el juego**: Elige la dificultad y categoría musical
2. **Presiona "Empezar a jugar"**: La aplicación cargará canciones de Spotify
3. **Escucha**: Presiona reproducir para escuchar 10 segundos de la canción
4. **Adivina**: Selecciona la respuesta correcta entre las 4 opciones
5. **Continúa**: Completa todas las rondas y ve tu puntuación final

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
├── hooks/              # Custom hooks (useGameState)
├── services/           # Servicios para APIs (Spotify)
├── types/              # Definiciones de tipos TypeScript
├── App.tsx             # Componente principal
├── main.tsx            # Punto de entrada
└── index.css           # Estilos globales con Tailwind
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos SVG
- **Spotify Web API** - Fuente de música
- **Local Storage** - Persistencia de estadísticas

## 📈 Características Técnicas

### Responsive Design
- Diseño mobile-first optimizado para pantallas táctiles
- Interfaz adaptable a diferentes tamaños de pantalla
- Gestos táctiles intuitivos

### Gestión de Estado
- Custom hook `useGameState` para centralizar la lógica del juego
- Persistencia de estadísticas en localStorage
- Estado reactive con React hooks

### Integración con Spotify
- Autenticación OAuth 2.0 con Client Credentials Flow
- Manejo de tokens de acceso automático
- Fallback a canciones de ejemplo si Spotify no está disponible

### Performance
- Lazy loading de recursos
- Optimización de imágenes
- Debounce en operaciones de red

## 🔧 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Vista previa de la build de producción

## 📱 PWA (Próximamente)

En futuras versiones, la aplicación incluirá:
- Instalación como PWA
- Funcionamiento offline
- Notificaciones push
- Sync en background

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -am 'Agrega nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🎵 Créditos

- Música proporcionada por [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- Iconos por [Lucide](https://lucide.dev/)
- Inspiración de diseño: Spotify, Apple Music, y otras apps musicales modernas

---

¡Disfruta adivinando canciones! 🎶
