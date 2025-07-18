import { useState, useCallback, useEffect } from 'react'
import { Song, GameState, GameStats } from '../types/xogo'

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

  // Cargar canciones (solo ejemplos por ahora)
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    console.log('🎵 SOLUCIÓN TEMPORAL: Usando canciones de ejemplo')
    console.log('🎯 Categoría seleccionada:', category)
    
    // Canciones de ejemplo con URLs de audio que funcionan
    const exampleSongs: Song[] = [
      {
        id: '1',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b27396ca2b2ac0e4ad5e2f8c4c10'
      },
      {
        id: '2',
        title: 'Shape of You',
        artist: 'Ed Sheeran',
        previewUrl: 'https://sample-videos.com/zip/10/mp3/mp3-15s/SampleAudio_0.4mb_mp3.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'
      },
      {
        id: '3',
        title: 'Bad Guy',
        artist: 'Billie Eilish',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273a8cc2d73b5ddaa5e8b2e7b9f'
      },
      {
        id: '4',
        title: 'Watermelon Sugar',
        artist: 'Harry Styles',
        previewUrl: 'https://sample-videos.com/zip/10/mp3/mp3-15s/SampleAudio_0.4mb_mp3.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273adce9b0e8b889f4d8f1aa'
      },
      {
        id: '5',
        title: 'Levitating',
        artist: 'Dua Lipa',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273c1b7dc6c6a8b4e6e88a2a7d4'
      },
      {
        id: '6',
        title: 'Stay',
        artist: 'The Kid LAROI & Justin Bieber',
        previewUrl: 'https://sample-videos.com/zip/10/mp3/mp3-15s/SampleAudio_0.4mb_mp3.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273b1b7dc6c6a8b4e6e88a2a7d4'
      },
      {
        id: '7',
        title: 'Peaches',
        artist: 'Justin Bieber',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b273a1b7dc6c6a8b4e6e88a2a7d4'
      },
      {
        id: '8',
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        previewUrl: 'https://sample-videos.com/zip/10/mp3/mp3-15s/SampleAudio_0.4mb_mp3.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b27391b7dc6c6a8b4e6e88a2a7d4'
      },
      {
        id: '9',
        title: 'Industry Baby',
        artist: 'Lil Nas X',
        previewUrl: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b27381b7dc6c6a8b4e6e88a2a7d4'
      },
      {
        id: '10',
        title: 'Heat Waves',
        artist: 'Glass Animals',
        previewUrl: 'https://sample-videos.com/zip/10/mp3/mp3-15s/SampleAudio_0.4mb_mp3.mp3',
        albumCover: 'https://i.scdn.co/image/ab67616d0000b27371b7dc6c6a8b4e6e88a2a7d4'
      }
    ]
    
    console.log('✅ Canciones de ejemplo cargadas:', exampleSongs.length)
    setAvailableSongs(exampleSongs)
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
      
      // Resetear el juego
      setGameState(INITIAL_STATE)
      return
    }

    // Siguiente ronda
    const songs = availableSongs
    const randomSong = songs[Math.floor(Math.random() * songs.length)]
    const wrongOptions = songs
      .filter(s => s.id !== randomSong.id)
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
  const selectAnswer = useCallback((selectedSong: Song) => {
    if (gameState.showAnswer) return
    
    const isCorrect = selectedSong.id === gameState.currentSong?.id
    
    setGameState(prev => ({
      ...prev,
      selectedAnswer: selectedSong,
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
  const togglePlayback = useCallback(() => {
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

  return {
    gameState,
    stats,
    availableSongs,
    startGame,
    nextRound,
    selectAnswer,
    resetGame,
    togglePlayback,
    updateSettings,
    loadSongs
  }
}
