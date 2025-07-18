import { useState, useCallback, useEffect } from 'react'
import { Song, GameState, GameStats } from '../types/xogo'
import { spotifyService } from '../services/spotifyService'

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

  // Función para convertir SpotifyTrack a Song
  const convertSpotifyTrack = (track: any): Song => ({
    id: track.id,
    title: track.name,
    artist: track.artists?.[0]?.name || 'Unknown Artist',
    previewUrl: track.preview_url || '',
    albumCover: track.album?.images?.[0]?.url || ''
  })

  // Cargar canciones REALES de Spotify
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    console.log('🎵 CARGANDO CANCIONES REALES DE SPOTIFY')
    console.log('🎯 Categoría seleccionada:', category)
    
    try {
      // Estrategia 1: Usar búsquedas dirigidas por artistas populares
      const popularArtistsByCategory = {
        'pop': [
          'Taylor Swift', 'Ed Sheeran', 'Ariana Grande', 'Harry Styles', 'Dua Lipa',
          'Billie Eilish', 'The Weeknd', 'Olivia Rodrigo', 'Adele', 'Bruno Mars'
        ],
        'hits': [
          'Drake', 'Post Malone', 'The Weeknd', 'Dua Lipa', 'Billie Eilish',
          'Justin Bieber', 'Ariana Grande', 'Taylor Swift', 'Ed Sheeran'
        ],
        'indie': [
          'Arctic Monkeys', 'The Strokes', 'Tame Impala', 'Foster the People',
          'Vampire Weekend', 'The 1975', 'Glass Animals', 'Alt-J'
        ],
        'rock': [
          'Imagine Dragons', 'OneRepublic', 'Coldplay', 'Maroon 5',
          'The Killers', 'Red Hot Chili Peppers', 'Foo Fighters'
        ],
        'latin': [
          'Bad Bunny', 'Rosalía', 'Karol G', 'Ozuna', 'J Balvin',
          'Daddy Yankee', 'Maluma', 'Anuel AA', 'Rauw Alejandro'
        ],
        'electronic': [
          'Calvin Harris', 'David Guetta', 'Tiësto', 'Avicii', 'Marshmello',
          'Martin Garrix', 'Skrillex', 'Deadmau5', 'The Chainsmokers'
        ]
      }

      const artists = popularArtistsByCategory[category as keyof typeof popularArtistsByCategory] || popularArtistsByCategory.pop

      let allTracks: any[] = []

      // Buscar canciones por cada artista
      for (const artist of artists) {
        try {
          console.log(`🔍 Buscando canciones de: ${artist}`)
          const tracks = await spotifyService.getRandomTracks(artist, 10)
          
          if (tracks.length > 0) {
            allTracks = [...allTracks, ...tracks]
            console.log(`✅ Agregadas ${tracks.length} canciones de ${artist}`)
          } else {
            console.log(`⚠️ No se encontraron canciones de ${artist}`)
          }
          
          // Evitar demasiadas solicitudes
          if (allTracks.length >= 100) break
          
        } catch (error) {
          console.log(`❌ Error buscando ${artist}:`, error)
        }
      }

      console.log('📊 Total de tracks obtenidos:', allTracks.length)
      
      if (allTracks.length === 0) {
        throw new Error('No se pudieron obtener canciones de ningún artista')
      }

      // Convertir tracks a formato Song
      const songs = allTracks.map(convertSpotifyTrack)
      
      // Filtrar solo canciones que tienen preview
      const songsWithPreview = songs.filter(song => song.previewUrl)
      console.log(`🎵 Canciones con preview: ${songsWithPreview.length}/${songs.length}`)
      
      // Mostrar muestra de las canciones obtenidas
      console.log('📋 Muestra de canciones obtenidas:')
      songsWithPreview.slice(0, 5).forEach((song, i) => {
        console.log(`${i + 1}. ${song.title} - ${song.artist}`)
        console.log(`   Preview: ${song.previewUrl ? '✅' : '❌'}`)
      })

      if (songsWithPreview.length < 4) {
        throw new Error(`Solo ${songsWithPreview.length} canciones tienen preview, necesitamos al menos 4`)
      }

      // Mezclar las canciones para mayor variedad
      const shuffledSongs = songsWithPreview.sort(() => Math.random() - 0.5)
      
      setAvailableSongs(shuffledSongs)
      console.log(`✅ ÉXITO: ${shuffledSongs.length} canciones reales de Spotify cargadas`)
      
    } catch (error) {
      console.error('❌ Error cargando canciones de Spotify:', error)
      
      // Fallback: Usar canciones populares con URLs de audio que SÍ funcionan
      console.log('🔄 Usando fallback con canciones populares y audio real...')
      
      const fallbackSongs: Song[] = [
        {
          id: 'fallback1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          previewUrl: 'https://file-examples.com/storage/fe86e7b6b54c9b3dce6a4c4/2017/11/file_example_MP3_700KB.mp3',
          albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback2',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
          albumCover: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback3',
          title: 'Bad Guy',
          artist: 'Billie Eilish',
          previewUrl: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
          albumCover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback4',
          title: 'Watermelon Sugar',
          artist: 'Harry Styles',
          previewUrl: 'https://file-examples.com/storage/fe86e7b6b54c9b3dce6a4c4/2017/11/file_example_MP3_1MG.mp3',
          albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback5',
          title: 'Levitating',
          artist: 'Dua Lipa',
          previewUrl: 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
          albumCover: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback6',
          title: 'As It Was',
          artist: 'Harry Styles',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
          albumCover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback7',
          title: 'Stay',
          artist: 'The Kid LAROI & Justin Bieber',
          previewUrl: 'https://file-examples.com/storage/fe86e7b6b54c9b3dce6a4c4/2017/11/file_example_MP3_700KB.mp3',
          albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback8',
          title: 'Heat Waves',
          artist: 'Glass Animals',
          previewUrl: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
          albumCover: 'https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback9',
          title: 'Anti-Hero',
          artist: 'Taylor Swift',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
          albumCover: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop'
        },
        {
          id: 'fallback10',
          title: 'Flowers',
          artist: 'Miley Cyrus',
          previewUrl: 'https://file-examples.com/storage/fe86e7b6b54c9b3dce6a4c4/2017/11/file_example_MP3_1MG.mp3',
          albumCover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop'
        }
      ]
      
      console.log('📝 Usando canciones populares fallback:', fallbackSongs.length)
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
      isPlaying: false
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
