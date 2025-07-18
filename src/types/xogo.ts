// Tipos principales del juego de música

export interface Song {
  id: string
  title: string
  artist: string
  previewUrl: string
  albumCover: string
}

export interface GameState {
  gameStarted: boolean
  currentSong: Song | null
  options: Song[]
  selectedAnswer: string | null
  showAnswer: boolean
  score: number
  round: number
  maxRounds: number
  isPlaying: boolean
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

export interface GameSettings {
  maxRounds: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  autoPlay: boolean
  volume: number
}

export type GameMode = 'song' | 'artist' | 'album'
export type Category = 'pop' | 'rock' | 'indie' | 'electronic' | 'latin' | 'hits'
export type Difficulty = 'easy' | 'medium' | 'hard'
