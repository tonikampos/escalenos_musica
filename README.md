# 🎵 MusicGuess - Adivina la Canción

Una aplicación web moderna y elegante para adivinar canciones. Los jugadores escuchan 20 segundos de una canción y deben elegir el título correcto entre múltiples opciones.

## ✨ Características

- 🎧 **Metadatos reales** - Usa la API de Last.fm para obtener información de canciones reales
- 📱 **Mobile-first** - Diseñado especialmente para dispositivos móviles
- 🎨 **Interfaz elegante** - Diseño moderno con efectos glassmorphism y animaciones suaves
- 📊 **Estadísticas** - Guarda tu progreso y estadísticas de juego
- 🎯 **Múltiples dificultades** - Fácil (5 rondas), Medio (10 rondas), Difícil (15 rondas)
- 🎵 **Artistas específicos** - Canciones de 17 artistas cuidadosamente seleccionados
- 🏆 **Sistema de puntuación** - Guarda tu mejor puntuación y precisión
- 🌐 **Sin límites de cuota** - Usa Last.fm que tiene límites muy generosos

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js (v18 o superior)
- npm o yarn
- Una cuenta de Last.fm API (gratuita)

### 1. Configurar Last.fm API

1. Ve a [Last.fm API Account Creation](https://www.last.fm/api/account/create)
2. Inicia sesión o crea una cuenta
3. Completa el formulario:
   - **Application name**: MusicGuess
   - **Application description**: Aplicación para adivinar canciones
   - **Application homepage URL**: Tu URL de la aplicación
   - **Contact email**: Tu email
4. Guarda tu **API Key**

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

4. Edita el archivo `.env.local` y agrega tu API key de Last.fm:
   ```env
   # OBLIGATORIO: Last.fm API (sin límites estrictos de cuota)
   VITE_LASTFM_API_KEY=tu_lastfm_api_key_aqui
   ```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🌐 Despliegue en Netlify

### 1. Configurar Last.fm API

1. Ve a [Last.fm API Account Creation](https://www.last.fm/api/account/create)
2. Completa el formulario con los datos de tu aplicación
3. Guarda tu **API Key**

### 2. Configurar Variables en Netlify

1. **Accede a tu proyecto en Netlify**
2. **Ve a**: `Site settings` → `Environment variables`
3. **Agrega esta variable**:

```env
# OBLIGATORIA para funcionalidad básica
VITE_LASTFM_API_KEY=tu_api_key_de_lastfm
```

4. **Redeploy**: `Deploys` → `Trigger deploy` → `Deploy site`

### 3. Verificar el Despliegue

La aplicación usará automáticamente:
- **Last.fm** para obtener metadatos de canciones de los 17 artistas
- **Cache** para optimizar el rendimiento (24 horas)
- **Fallback** inteligente si alguna búsqueda falla

## 🎮 Cómo Jugar

1. **Configura el juego**: Elige la dificultad
2. **Presiona "Empezar a jugar"**: La aplicación cargará canciones usando Last.fm
3. **Escucha**: Presiona reproducir para escuchar 20 segundos de la canción
4. **Adivina**: Selecciona la respuesta correcta entre las 4 opciones
5. **Continúa**: Completa todas las rondas y ve tu puntuación final

## 🎵 Artistas Incluidos

La aplicación incluye canciones de 17 artistas cuidadosamente seleccionados:

**Españoles**: ARDE BOGOTÁ, SHINOVA, SILOE, VIVA SUECIA, HERDEIROS DA CRUZ, VETUSTA MORLA, IZAL, DORIAN, SIDONIE, PARACETAFOLK, FILLAS DE CASANDRA, TANXUGUEIRAS, LOQUILLO

**Internacionales**: Bad Bunny, Taylor Swift, The Weeknd, Billie Eilish

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
- **Last.fm API** - Fuente de metadatos musicales
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

### Integración con Last.fm API
- API de Last.fm para obtener metadatos musicales
- Límites generosos: 5,000 solicitudes por hora
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

- Metadatos musicales por [Last.fm API](https://www.last.fm/api)
- Iconos por [Lucide](https://lucide.dev/)
- Inspiración de diseño: Spotify, Apple Music, y otras apps musicales modernas

---

¡Disfruta adivinando canciones! 🎶
