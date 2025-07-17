import { useState, useCallback, useEffect } from 'react'
import { SpotifyTrack, spotifyService } from '../services/spotifyService'

export interface Song {
  id: string
  title: string
  artist: string
  previewUrl: string
  albumCover: string
  spotifyUrl?: string
}

export interface GameState {
  currentSong: Song | null
  options: Song[]
  score: number
  round: number
  maxRounds: number
  isPlaying: boolean
  showAnswer: boolean
  gameStarted: boolean
  selectedAnswer: Song | null
  isLoading: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface GameStats {
  totalGames: number
  bestScore: number
  averageScore: number
  correctAnswers: number
  totalAnswers: number
}

const INITIAL_STATE: GameState = {
  currentSong: null,
  options: [],
  score: 0,
  round: 0,
  maxRounds: 10,
  isPlaying: false,
  showAnswer: false,
  gameStarted: false,
  selectedAnswer: null,
  isLoading: false,
  difficulty: 'medium',
  category: 'pop'
}

// Convertir SpotifyTrack a Song
const convertSpotifyTrack = (track: SpotifyTrack): Song => ({
  id: track.id,
  title: track.name,
  artist: track.artists.map(a => a.name).join(', '),
  previewUrl: track.preview_url || '',
  albumCover: track.album.images[0]?.url || 'https://via.placeholder.com/300x300/1DB954/ffffff?text=🎵',
  spotifyUrl: track.external_urls.spotify
})

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [stats, setStats] = useState<GameStats>(() => {
    const saved = localStorage.getItem('musicguess-stats')
    return saved ? JSON.parse(saved) : {
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      correctAnswers: 0,
      totalAnswers: 0
    }
  })

  // Cargar canciones de Spotify
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    
    try {
      let tracks: SpotifyTrack[] = []
      
      // Intentar diferentes fuentes según la categoría
      if (category === 'hits') {
        // Playlist de Top 50 Global de Spotify
        tracks = await spotifyService.getPlaylistTracks('37i9dQZEVXbMDoHDwVN2tF')
      } else if (category === 'rock') {
        tracks = await spotifyService.getRandomTracks('rock', 50)
      } else if (category === 'latin') {
        tracks = await spotifyService.getRandomTracks('latin', 50)
      } else if (category === 'electronic') {
        tracks = await spotifyService.getRandomTracks('electronic', 50)
      } else {
        // Por defecto, canciones populares
        tracks = await spotifyService.getRandomTracks('pop', 50)
      }

      const songs = tracks.map(convertSpotifyTrack)
      setAvailableSongs(songs)
      
    } catch (error) {
      console.error('Error loading songs from Spotify:', error)
      
      // Fallback a canciones de ejemplo si Spotify falla
      const fallbackSongs: Song[] = [
        {
          id: '1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          albumCover: 'https://via.placeholder.com/300x300/1DB954/ffffff?text=🎵'
        },
        {
          id: '2',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          albumCover: 'https://via.placeholder.com/300x300/FF6B6B/ffffff?text=🎤'
        },
        {
          id: '3',
          title: 'Bad Guy',
          artist: 'Billie Eilish',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          albumCover: 'https://via.placeholder.com/300x300/4ECDC4/ffffff?text=🎶'
        },
        {
          id: '4',
          title: 'Watermelon Sugar',
          artist: 'Harry Styles',
          previewUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
          albumCover: 'https://via.placeholder.com/300x300/45B7D1/ffffff?text=🍉'
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
      
      setGameState(prev => ({
        ...prev,
        gameStarted: false,
        showAnswer: false
      }))
      return
    }

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
      round: prev.round + 1,
      showAnswer: false,
      isPlaying: false,
      selectedAnswer: null
    }))
  }, [gameState.round, gameState.maxRounds, gameState.score, availableSongs, stats])

  // Seleccionar respuesta
  const selectAnswer = useCallback((selectedSong: Song) => {
    if (gameState.showAnswer) return

    const isCorrect = selectedSong.id === gameState.currentSong?.id
    
    setGameState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      showAnswer: true,
      selectedAnswer: selectedSong
    }))
  }, [gameState.showAnswer, gameState.currentSong])

  // Reiniciar juego
  const resetGame = useCallback(() => {
    setGameState(INITIAL_STATE)
  }, [])

  // Controlar reproducción
  const togglePlayback = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying
    }))
  }, [])

  // Cambiar configuración
  const updateSettings = useCallback((difficulty: 'easy' | 'medium' | 'hard', category: string) => {
    setGameState(prev => ({
      ...prev,
      difficulty,
      category
    }))
    loadSongs(category)
  }, [loadSongs])

  // Cargar canciones al montar el componente
  useEffect(() => {
    loadSongs()
  }, [loadSongs])

  return {
    gameState,
    stats,
    startGame,
    nextRound,
    selectAnswer,
    resetGame,
    togglePlayback,
    updateSettings,
    loadSongs
  }
}
