
# 🎵 MusicGuess - Adivina la Canción

Una aplicación web moderna y elegante para adivinar canciones. Los jugadores escuchan 10 segundos de una canción real y deben elegir el título correcto entre varias opciones. El audio se reproduce directamente en la app, sin abrir YouTube ni otras ventanas.

## ✨ Características

 - 🎧 **Audio real** - Usa previews de Spotify, YouTube y Deezer para reproducir fragmentos de canciones reales directamente en la app
- 📱 **Mobile-first** - Diseñado especialmente para dispositivos móviles
- 🎨 **Interfaz elegante** - Diseño moderno con efectos glassmorphism y animaciones suaves
- 📊 **Estadísticas** - Guarda tu progreso y estadísticas de juego
 - 🎯 **Elige la fuente de música** - Puedes seleccionar entre Spotify, YouTube o Deezer como fuente de previews
- 🎵 **Artistas populares** - Canciones de artistas internacionales y nacionales
- 🏆 **Sistema de puntuación** - Guarda tu mejor puntuación y precisión

## 🚀 Instalación y Configuración


### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn


### 1. Configurar APIs (Spotify, YouTube y Deezer)

No necesitas claves de Last.fm. Para obtener previews de Spotify, puedes configurar las variables de entorno con tus credenciales de Spotify (opcional, solo si quieres más canciones y previews de 30s). Para YouTube, asegúrate de tener una clave de API si quieres más variedad. Deezer no requiere clave para previews, pero puede estar limitado por región.

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
   cp .env.example .env.local
   ```


4. Edita el archivo `.env.local` y agrega tus claves si las tienes:
   ```env
   # Opcional: Spotify API (para previews de 30s)
   VITE_SPOTIFY_CLIENT_ID=tu_spotify_client_id
   VITE_SPOTIFY_CLIENT_SECRET=tu_spotify_client_secret

   # Opcional: YouTube API (para previews de YouTube)
   VITE_YOUTUBE_API_KEY=tu_youtube_api_key

   # Deezer no requiere clave de API
   ```


### 3. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`


## 🌐 Despliegue en Netlify

1. Configura tus variables de entorno en Netlify si usas Spotify o YouTube API.
2. Despliega normalmente (`npm run build`).
3. La app usará previews de Spotify, YouTube o Deezer directamente en la interfaz, según la fuente seleccionada.


## 🎮 Cómo Jugar

1. **Configura el juego**: Elige la fuente de música (Spotify, YouTube o Deezer)
2. **Presiona "Empezar a jugar"**: La aplicación cargará canciones reales de la fuente seleccionada
3. **Escucha**: Pulsa el botón de reproducir para escuchar el preview de la canción directamente en la app
4. **Adivina**: Selecciona la respuesta correcta entre las 4 opciones
5. **Continúa**: Completa todas las rondas y ve tu puntuación final


## 🎵 Nota sobre el Audio y las Fuentes

La aplicación reproduce previews de canciones reales directamente en la interfaz, usando Spotify, YouTube o Deezer como fuentes de audio. No se abre YouTube ni otras ventanas externas.

**Importante:** La disponibilidad de previews depende de la fuente seleccionada y de la canción. Si no se encuentran previews en una fuente, prueba con otra (por ejemplo, Deezer suele tener más previews para música española y latina).


## 🎵 Artistas Incluidos

La aplicación incluye canciones de artistas populares internacionales y nacionales (según disponibilidad de previews en Spotify, YouTube o Deezer).

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
├── hooks/              # Custom hooks (useGameState)
├── services/           # Servicios para APIs (Spotify, YouTube, Deezer)
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
- **Spotify API**, **YouTube API** y **Deezer API** - Previews de audio
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


### Integración con APIs de música
- Spotify, YouTube y Deezer para obtener previews de audio
- Fallback inteligente si alguna búsqueda falla
- Cache de 24 horas para optimizar rendimiento

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

- Previews musicales por [Spotify API](https://developer.spotify.com/), [YouTube API](https://developers.google.com/youtube) y [Deezer API](https://developers.deezer.com/)
- Iconos por [Lucide](https://lucide.dev/)
- Inspiración de diseño: Spotify, Apple Music, y otras apps musicales modernas

---

¡Disfruta adivinando canciones! 🎶
