import { useState, useCallback, useEffect } from 'react'
import { Song, GameState, GameStats } from '../types/xogo'
import { youtubeMusicService } from '../services/youtubeMusicService'

// Estado inicial del juego
const INITIAL_STATE: GameState = {
  gameStarted: false,
  currentSong: null,
  options: [],
  selectedAnswer: null,
  showAnswer: false,
  score: 0,
  round: 1,
  maxRounds: 10,
  isPlaying: false,
  isLoading: false,
  difficulty: 'medium',
  category: 'pop'
}

// Estadísticas iniciales
const INITIAL_STATS: GameStats = {
  totalGames: 0,
  bestScore: 0,
  averageScore: 0,
  correctAnswers: 0,
  totalAnswers: 0
}

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('musicguess-stats')
    return saved ? JSON.parse(saved) : INITIAL_STATS
  })

  // Función para convertir YouTubeTrack a Song
  const convertYouTubeTrack = (track: any): Song => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    previewUrl: youtubeMusicService.getEmbedAudioUrl(track.id),
    albumCover: track.thumbnailUrl
  })

  // Cargar canciones REALES de YouTube Music
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    console.log('🎵 CARGANDO CANCIONES DE YOUTUBE MUSIC')
    console.log('🎯 Categoría seleccionada:', category)
    
    try {
      // Verificar si tenemos API key de YouTube
      if (!youtubeMusicService.hasApiKey()) {
        console.log('⚠️ No hay API key de YouTube, usando fallback')
        throw new Error('No YouTube API key configured')
      }

      // Estrategia 1: Buscar por categoría
      console.log('🔍 Buscando por categoría:', category)
      let tracks = await youtubeMusicService.searchByCategory(category, 30)
      
      if (tracks.length < 10) {
        console.log('🔄 Pocos resultados, buscando por artistas populares...')
        
        // Estrategia 2: Buscar por artistas populares
        const popularArtistsByCategory = {
          'pop': ['Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Harry Styles', 'Dua Lipa'],
          'hits': ['Drake', 'The Weeknd', 'Billie Eilish', 'Justin Bieber', 'Post Malone'],
          'indie': ['Arctic Monkeys', 'The Strokes', 'Tame Impala', 'Glass Animals'],
          'rock': ['Imagine Dragons', 'Coldplay', 'Maroon 5', 'OneRepublic'],
          'latin': ['Bad Bunny', 'Rosalía', 'J Balvin', 'Karol G'],
          'electronic': ['Calvin Harris', 'David Guetta', 'Marshmello', 'The Chainsmokers']
        }

        const artists = popularArtistsByCategory[category as keyof typeof popularArtistsByCategory] || popularArtistsByCategory.pop
        
        for (const artist of artists) {
          try {
            console.log(`🎤 Buscando canciones de: ${artist}`)
            const artistTracks = await youtubeMusicService.searchByArtist(artist, 5)
            tracks = [...tracks, ...artistTracks]
            
            if (tracks.length >= 25) break
          } catch (error) {
            console.log(`❌ Error buscando ${artist}:`, error)
          }
        }
      }

      console.log('📊 Total de tracks de YouTube:', tracks.length)
      
      if (tracks.length === 0) {
        throw new Error('No se encontraron canciones en YouTube Music')
      }

      // Convertir a nuestro formato
      const songs = tracks.map(convertYouTubeTrack)
      
      // Filtrar duplicados por título
      const uniqueSongs = songs.filter((song, index, self) => 
        index === self.findIndex(s => s.title.toLowerCase() === song.title.toLowerCase())
      )
      
      console.log(`✅ Canciones únicas de YouTube: ${uniqueSongs.length}`)
      console.log('📋 Muestra de canciones:')
      uniqueSongs.slice(0, 5).forEach((song, i) => {
        console.log(`${i + 1}. ${song.title} - ${song.artist}`)
      })

      if (uniqueSongs.length < 4) {
        throw new Error(`Solo ${uniqueSongs.length} canciones encontradas, necesitamos al menos 4`)
      }

      // Mezclar las canciones
      const shuffledSongs = uniqueSongs.sort(() => Math.random() - 0.5).slice(0, 50)
      
      setAvailableSongs(shuffledSongs)
      console.log(`✅ ÉXITO: ${shuffledSongs.length} canciones reales de YouTube Music cargadas`)
      
    } catch (error) {
      console.error('❌ Error cargando de YouTube Music:', error)
      
      // Fallback: Usar canciones populares con información real
      console.log('🔄 Usando fallback con canciones populares conocidas...')
      
      const fallbackSongs: Song[] = [
        {
          id: 'dQw4w9WgXcQ',
          title: 'Never Gonna Give You Up',
          artist: 'Rick Astley',
          previewUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        },
        {
          id: 'kJQP7kiw5Fk',
          title: 'Despacito',
          artist: 'Luis Fonsi ft. Daddy Yankee',
          previewUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg'
        },
        {
          id: '9bZkp7q19f0',
          title: 'Gangnam Style',
          artist: 'PSY',
          previewUrl: 'https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg'
        },
        {
          id: 'fJ9rUzIMcZQ',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          previewUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg'
        },
        {
          id: '60ItHLz5WEA',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          previewUrl: 'https://www.youtube.com/embed/60ItHLz5WEA?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/60ItHLz5WEA/maxresdefault.jpg'
        },
        {
          id: 'JGwWNGJdvx8',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          previewUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg'
        },
        {
          id: 'hTWKbfoikeg',
          title: 'Smells Like Teen Spirit',
          artist: 'Nirvana',
          previewUrl: 'https://www.youtube.com/embed/hTWKbfoikeg?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg'
        },
        {
          id: 'YQHsXMglC9A',
          title: 'Hello',
          artist: 'Adele',
          previewUrl: 'https://www.youtube.com/embed/YQHsXMglC9A?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg'
        },
        {
          id: 'RgKAFK5djSk',
          title: 'Waka Waka',
          artist: 'Shakira',
          previewUrl: 'https://www.youtube.com/embed/RgKAFK5djSk?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/RgKAFK5djSk/maxresdefault.jpg'
        },
        {
          id: 'LOZuxwVk7TU',
          title: 'Señorita',
          artist: 'Shawn Mendes & Camila Cabello',
          previewUrl: 'https://www.youtube.com/embed/LOZuxwVk7TU?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/LOZuxwVk7TU/maxresdefault.jpg'
        }
      ]
      
      console.log('📝 Usando canciones YouTube conocidas:', fallbackSongs.length)
      setAvailableSongs(fallbackSongs)
    }
    
    setGameState(prev => ({ ...prev, isLoading: false }))
  }, [])

  // Iniciar juego
  const startGame = useCallback(async (difficulty: 'easy' | 'medium' | 'hard' = 'medium', category: string = 'pop') => {
    if (availableSongs.length === 0) {
      await loadSongs(category)
    }

    const songs = availableSongs.length > 0 ? availableSongs : []
    if (songs.length < 4) {
      console.error('Not enough songs to start game')
      return
    }

    const randomSong = songs[Math.floor(Math.random() * songs.length)]
    const wrongOptions = songs
      .filter(s => s.id !== randomSong.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [randomSong, ...wrongOptions].sort(() => Math.random() - 0.5)

    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      currentSong: randomSong,
      options: allOptions,
      selectedAnswer: null,
      showAnswer: false,
      difficulty,
      category
    }))
  }, [availableSongs, loadSongs])

  // Seleccionar respuesta
  const selectAnswer = useCallback((songId: string) => {
    setGameState(prev => ({
      ...prev,
      selectedAnswer: songId,
      showAnswer: true
    }))
  }, [])

  // Siguiente ronda
  const nextRound = useCallback(() => {
    if (gameState.round >= gameState.maxRounds) {
      endGame()
      return
    }

    const songs = availableSongs
    const randomSong = songs[Math.floor(Math.random() * songs.length)]
    const wrongOptions = songs
      .filter(s => s.id !== randomSong.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    const allOptions = [randomSong, ...wrongOptions].sort(() => Math.random() - 0.5)

    const isCorrect = gameState.selectedAnswer === gameState.currentSong?.id
    const newScore = isCorrect ? gameState.score + 1 : gameState.score

    setGameState(prev => ({
      ...prev,
      currentSong: randomSong,
      options: allOptions,
      selectedAnswer: null,
      showAnswer: false,
      score: newScore,
      round: prev.round + 1,
      isPlaying: true // ✅ Reproducir automáticamente la siguiente canción
    }))
  }, [gameState, availableSongs])

  // Finalizar juego
  const endGame = useCallback(() => {
    const isCorrect = gameState.selectedAnswer === gameState.currentSong?.id
    const finalScore = isCorrect ? gameState.score + 1 : gameState.score

    // Actualizar estadísticas
    const newStats = {
      totalGames: stats.totalGames + 1,
      bestScore: Math.max(stats.bestScore, finalScore),
      averageScore: ((stats.averageScore * stats.totalGames) + finalScore) / (stats.totalGames + 1),
      correctAnswers: stats.correctAnswers + finalScore,
      totalAnswers: stats.totalAnswers + gameState.maxRounds
    }

    setStats(newStats)
    localStorage.setItem('musicguess-stats', JSON.stringify(newStats))

    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      score: finalScore,
      isPlaying: false
    }))
  }, [gameState, stats])

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE)
  }, [])

  // Controlar reproducción
  const togglePlay = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  // Cargar canciones al montar el componente
  useEffect(() => {
    loadSongs()
  }, [loadSongs])

  return {
    gameState,
    availableSongs,
    stats,
    startGame,
    selectAnswer,
    nextRound,
    endGame,
    resetGame,
    togglePlay,
    loadSongs
  }
}
