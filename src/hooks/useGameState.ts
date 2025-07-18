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

  // Cargar canciones REALES de artistas específicos usando YouTube
  const loadSongs = useCallback(async () => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    console.log('🎵 CARGANDO CANCIONES DE ARTISTAS ESPECÍFICOS')
    console.log('🎯 Buscando canciones de artistas seleccionados...')
    
    try {
      // Verificar si tenemos API key de YouTube
      if (!youtubeMusicService.hasApiKey()) {
        console.log('⚠️ No hay API key de YouTube, usando fallback')
        throw new Error('No YouTube API key configured')
      }

      // Lista de artistas específicos que quieres
      const artistasEspecificos = [
        'ARDE BOGOTÁ',
        'SHINOVA', 
        'SILOE',
        'VIVA SUECIA',
        'HERDEIROS DA CRUZ',
        'VETUSTA MORLA',
        'IZAL',
        'DORIAN',
        'SIDONIE',
        'PARACETAFOLK',
        'FILLAS DE CASANDRA',
        'TANXUGUEIRAS',
        'LOQUILLO'
      ]

      let tracks: any[] = []
      
      // Buscar canciones de cada artista específico
      for (const artist of artistasEspecificos) {
        try {
          console.log(`🎤 Buscando las mejores canciones de: ${artist}`)
          const artistTracks = await youtubeMusicService.searchByArtist(artist, 10) // 10 canciones por artista
          tracks = [...tracks, ...artistTracks]
          
          console.log(`✅ Encontradas ${artistTracks.length} canciones de ${artist}`)
          
          // Pequeña pausa para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 200))
          
        } catch (error) {
          console.log(`❌ Error buscando ${artist}:`, error)
          
          // Intentar búsqueda alternativa si falla
          try {
            console.log(`🔄 Intentando búsqueda alternativa para ${artist}`)
            const alternativeTracks = await youtubeMusicService.searchTracks(`${artist} mejor canción`, 5)
            tracks = [...tracks, ...alternativeTracks]
          } catch (altError) {
            console.log(`❌ También falló la búsqueda alternativa para ${artist}`)
          }
        }
      }

      console.log('📊 Total de tracks encontrados:', tracks.length)
      
      if (tracks.length === 0) {
        throw new Error('No se encontraron canciones de los artistas especificados')
      }

      // Convertir a nuestro formato
      const songs = tracks.map(convertYouTubeTrack)
      
      // Filtrar duplicados por título y artista
      const uniqueSongs = songs.filter((song, index, self) => 
        index === self.findIndex(s => 
          s.title.toLowerCase() === song.title.toLowerCase() && 
          s.artist.toLowerCase() === song.artist.toLowerCase()
        )
      )
      
      console.log(`✅ Canciones únicas encontradas: ${uniqueSongs.length}`)
      console.log('📋 Muestra de canciones encontradas:')
      uniqueSongs.slice(0, 10).forEach((song, i) => {
        console.log(`${i + 1}. ${song.title} - ${song.artist}`)
      })

      if (uniqueSongs.length < 4) {
        throw new Error(`Solo ${uniqueSongs.length} canciones encontradas, necesitamos al menos 4`)
      }

      // Mezclar las canciones - tomar todas las encontradas (sin límite específico)
      const shuffledSongs = uniqueSongs.sort(() => Math.random() - 0.5)
      
      setAvailableSongs(shuffledSongs)
      console.log(`✅ ÉXITO: ${shuffledSongs.length} canciones de tus artistas favoritos cargadas`)
      
      // Mostrar estadísticas por artista
      const artistStats = artistasEspecificos.map(artist => {
        const count = shuffledSongs.filter(song => 
          song.artist.toLowerCase().includes(artist.toLowerCase())
        ).length
        return `${artist}: ${count} canciones`
      })
      console.log('📊 Canciones por artista:')
      artistStats.forEach(stat => console.log(`   ${stat}`))
      
    } catch (error) {
      console.error('❌ Error cargando canciones de artistas específicos:', error)
      
      // Fallback: Usar canciones conocidas de algunos de estos artistas
      console.log('🔄 Usando fallback con canciones conocidas de tus artistas...')
      
      const fallbackSongs: Song[] = [
        {
          id: 'sample1',
          title: 'Los Perros',
          artist: 'Vetusta Morla',
          previewUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        },
        {
          id: 'sample2',
          title: 'Copacabana',
          artist: 'Izal',
          previewUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg'
        },
        {
          id: 'sample3',
          title: 'Caballero',
          artist: 'Dorian',
          previewUrl: 'https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg'
        },
        {
          id: 'sample4',
          title: 'Fascinado',
          artist: 'Sidonie',
          previewUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg'
        },
        {
          id: 'sample5',
          title: 'Terra',
          artist: 'Tanxugueiras',
          previewUrl: 'https://www.youtube.com/embed/60ItHLz5WEA?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/60ItHLz5WEA/maxresdefault.jpg'
        },
        {
          id: 'sample6',
          title: 'Cadenas',
          artist: 'Loquillo',
          previewUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg'
        },
        {
          id: 'sample7',
          title: 'Antartida',
          artist: 'Shinova',
          previewUrl: 'https://www.youtube.com/embed/hTWKbfoikeg?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg'
        },
        {
          id: 'sample8',
          title: 'Otros Aires',
          artist: 'Viva Suecia',
          previewUrl: 'https://www.youtube.com/embed/YQHsXMglC9A?autoplay=1&start=30&end=60&controls=0',
          albumCover: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg'
        }
      ]
      
      console.log('📝 Usando canciones conocidas de tus artistas:', fallbackSongs.length)
      setAvailableSongs(fallbackSongs)
    }
    
    setGameState(prev => ({ ...prev, isLoading: false }))
  }, [])

  // Iniciar juego
  const startGame = useCallback(async (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    if (availableSongs.length === 0) {
      await loadSongs()
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
      difficulty
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
