import { useState, useCallback, useEffect } from 'react'
import { Song, GameState, GameStats } from '../types/xogo'
import { youtubeMusicService } from '../services/youtubeMusicService'
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

  // Cargar canciones desde YouTube y Spotify
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    let songs: Song[] = []
    try {
      // 1. Buscar canciones populares en Spotify
      const spotifyTracks = await spotifyService.getRandomTracks(category, 10)
      const spotifySongs: Song[] = spotifyTracks
        .filter(track => !!track.preview_url)
        .map(track => ({
          id: track.id,
          title: track.name,
          artist: track.artists[0]?.name || '',
          previewUrl: track.preview_url || '',
          albumCover: track.album.images[0]?.url || ''
        }))

      // 2. Buscar canciones populares en YouTube
      const youtubeTracks = await youtubeMusicService.searchByCategory(category, 10)
      const youtubeSongs: Song[] = youtubeTracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        previewUrl: track.audioUrl || '',
        albumCover: track.thumbnailUrl || ''
      }))

      // 3. Unir y filtrar duplicados
      songs = [...spotifySongs, ...youtubeSongs].filter(song => song.previewUrl)
      songs = songs.filter((song, idx, arr) =>
        arr.findIndex(s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase()) === idx
      )

      // 4. Si no hay suficientes canciones, usar fallback
      if (songs.length < 4) {
        throw new Error('Non se encontraron cancións suficientes en Spotify/YouTube')
      }

      // 5. Mezclar canciones
      const shuffledSongs = songs.sort(() => Math.random() - 0.5)
      setAvailableSongs(shuffledSongs)
      localStorage.setItem('musicguess-songs-cache', JSON.stringify(shuffledSongs))
      localStorage.setItem('musicguess-cache-timestamp', Date.now().toString())
      console.log(`✅ ${shuffledSongs.length} cancións cargadas de Spotify/YouTube`)
    } catch (error) {
      // Fallback: canciones de ejemplo
      console.error('❌ Error cargando cancións:', error)
      const fallbackSongs: Song[] = [
        {
          id: 'sample1',
          title: 'Los Perros',
          artist: 'Vetusta Morla',
          previewUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        },
        {
          id: 'sample2',
          title: 'Copacabana',
          artist: 'Izal',
          previewUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/kJQP7kiw5Fk/maxresdefault.jpg'
        },
        {
          id: 'sample3',
          title: 'Caballero',
          artist: 'Dorian',
          previewUrl: 'https://www.youtube.com/embed/9bZkp7q19f0?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg'
        },
        {
          id: 'sample4',
          title: 'Fascinado',
          artist: 'Sidonie',
          previewUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg'
        },
        {
          id: 'sample5',
          title: 'Terra',
          artist: 'Tanxugueiras',
          previewUrl: 'https://www.youtube.com/embed/60ItHLz5WEA?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/60ItHLz5WEA/maxresdefault.jpg'
        },
        {
          id: 'sample6',
          title: 'Cadenas',
          artist: 'Loquillo',
          previewUrl: 'https://www.youtube.com/embed/JGwWNGJdvx8?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg'
        },
        {
          id: 'sample7',
          title: 'Antartida',
          artist: 'Shinova',
          previewUrl: 'https://www.youtube.com/embed/hTWKbfoikeg?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/hTWKbfoikeg/maxresdefault.jpg'
        },
        {
          id: 'sample8',
          title: 'Otros Aires',
          artist: 'Viva Suecia',
          previewUrl: 'https://www.youtube.com/embed/YQHsXMglC9A?autoplay=1&start=30&end=50&controls=0',
          albumCover: 'https://img.youtube.com/vi/YQHsXMglC9A/maxresdefault.jpg'
        }
      ]
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
      .filter((s: Song) => s.id !== randomSong.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const shuffledOptions = [randomSong, ...wrongOptions].sort(() => Math.random() - 0.5)
    const maxRounds = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15
    setGameState({
      ...INITIAL_STATE,
      currentSong: randomSong,
      options: shuffledOptions,
      round: 1,
      gameStarted: true,
      maxRounds,
      difficulty,
      category
    })
  }, [availableSongs, loadSongs])

  // Siguiente ronda
  const nextRound = useCallback(() => {
    if (gameState.round >= gameState.maxRounds) {
      // Fin del juego - actualizar estadísticas
      const newStats = {
        ...stats,
        totalGames: stats.totalGames + 1,
        bestScore: Math.max(stats.bestScore, gameState.score),
        correctAnswers: stats.correctAnswers + gameState.score,
        totalAnswers: stats.totalAnswers + gameState.maxRounds,
        averageScore: Math.round(((stats.averageScore * stats.totalGames) + gameState.score) / (stats.totalGames + 1))
      }
      setStats(newStats)
      localStorage.setItem('musicguess-stats', JSON.stringify(newStats))
      setGameState(INITIAL_STATE)
      return
    }
    const songs = availableSongs
    const randomSong = songs[Math.floor(Math.random() * songs.length)]
    const wrongOptions = songs
      .filter((s: Song) => s.id !== randomSong.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const shuffledOptions = [randomSong, ...wrongOptions].sort(() => Math.random() - 0.5)
    setGameState(prev => ({
      ...prev,
      currentSong: randomSong,
      options: shuffledOptions,
      selectedAnswer: null,
      showAnswer: false,
      round: prev.round + 1,
      isPlaying: false
    }))
  }, [gameState.round, gameState.maxRounds, gameState.score, stats, availableSongs])

  // Seleccionar respuesta
  const selectAnswer = useCallback((songId: string) => {
    if (gameState.showAnswer) return
    const isCorrect = songId === gameState.currentSong?.id
    setGameState(prev => ({
      ...prev,
      selectedAnswer: songId,
      showAnswer: true,
      score: isCorrect ? prev.score + 1 : prev.score,
      isPlaying: false
    }))
  }, [gameState.showAnswer, gameState.currentSong?.id])

  // Resetear juego
  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE)
  }, [])

  // Alternar reproducción
  const togglePlay = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  // Actualizar configuración
  const updateSettings = useCallback((difficulty: 'easy' | 'medium' | 'hard', category: string) => {
    setGameState(prev => ({
      ...prev,
      difficulty,
      category
    }))
  }, [])

  // Cargar canciones al montar el componente
  useEffect(() => {
    if (availableSongs.length === 0) {
      loadSongs('pop')
    }
  }, [availableSongs.length, loadSongs])

  // Limpiar caché manualmente
  const clearCache = useCallback(() => {
    localStorage.removeItem('musicguess-songs-cache')
    localStorage.removeItem('musicguess-cache-timestamp')
    setAvailableSongs([])
    setGameState(INITIAL_STATE)
  }, [])

  return {
    gameState,
    stats,
    availableSongs,
    startGame,
    nextRound,
    selectAnswer,
    resetGame,
    togglePlay,
    loadSongs,
    clearCache,
    updateSettings
  }
}
