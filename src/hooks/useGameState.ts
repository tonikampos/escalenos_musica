
import { useState, useCallback, useEffect } from 'react'
import { Song, GameState, GameStats } from '../types/xogo'
import { youtubeMusicService } from '../services/youtubeMusicService'
import { spotifyService } from '../services/spotifyService'
import { deezerService } from '../services/deezerService'

// ...existing code...

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
  const [musicSource, setMusicSource] = useState<'spotify' | 'youtube' | 'deezer'>('spotify')

  // Cargar canciones desde YouTube y Spotify
  const loadSongs = useCallback(async (category: string = 'pop') => {
    setGameState(prev => ({ ...prev, isLoading: true }))
    try {
      // Si Deezer está bloqueado, avisar y salir
      if (musicSource === 'deezer' && window.localStorage.getItem('musicguess-deezer-blocked') === '1') {
        alert('Deezer está temporalmente bloqueado por CORS o restricciones regionales. Por favor, selecciona otra fuente de música.');
        setAvailableSongs([]);
        setGameState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      const queries = [
        'Aitana', 'Manuel Carrasco', 'Sebastian Yatra', 'Morat', 'Vanesa Martin',
        'indie español', 'indie spain', 'spanish indie', 'indie rock español', 'indie pop español',
        'música independiente española', 'grupos gallegos', 'música gallega', 'banda gallega', 'grupo gallego',
        'pop gallego', 'rock gallego', 'indie gallego', 'folk gallego',
        'Arde Bogota', 'Viva Suecia', 'Siloe', 'Sidonie', 'Shinova', 'Marlena', 'Heredeiros da Crus', 'Dakidarria',
        'Miss Caffeina', 'Funambulista', 'Lori Meyers', 'La La Love You', 'Sexy Zebras', 'Mikel Izal',
        'Fillas de Casandra', 'Lontreira', 'QUEVEDO', 'Myke Towers', 'Beéle', 'Lucho RK', 'Kapo',
        'Blackpink', 'Lola Indigo', 'Bad Bunny', 'Manuel Turizo', 'Karol G'
      ];
      let allSongs: Song[] = [];
      for (const q of queries) {
        let found: Song[] = [];
        try {
          if (musicSource === 'spotify') {
            const spotifyTracks = await spotifyService.getRandomTracks(q, 10);
            if (Array.isArray(spotifyTracks)) {
              found = spotifyTracks
                .filter(track => !!track && !!track.preview_url)
                .map(track => ({
                  id: track.id,
                  title: track.name,
                  artist: track.artists?.[0]?.name || '',
                  previewUrl: track.preview_url || '',
                  albumCover: track.album?.images?.[0]?.url || ''
                }));
            }
          } else if (musicSource === 'youtube') {
            const youtubeTracks = await youtubeMusicService.searchByCategory(q, 10);
            if (Array.isArray(youtubeTracks)) {
              found = youtubeTracks
                .filter(track => !!track && !!track.audioUrl)
                .map(track => ({
                  id: track.id,
                  title: track.title,
                  artist: track.artist,
                  previewUrl: track.audioUrl || '',
                  albumCover: track.thumbnailUrl || ''
                }));
            }
          } else if (musicSource === 'deezer') {
            try {
              const deezerTracks = await deezerService.searchTracks(q, 10);
              if (Array.isArray(deezerTracks)) {
                found = deezerTracks.filter(track => !!track && !!track.previewUrl);
              }
            } catch (deezerError) {
              console.warn('Deezer error for query', q, deezerError);
            }
          }
        } catch (queryError) {
          console.warn('Error en búsqueda para', q, queryError);
        }
        if (Array.isArray(found) && found.length > 0) {
          allSongs = allSongs.concat(found);
        }
      }
      // Filtrar duplicados y previews vacíos
      allSongs = allSongs.filter(song => song && song.previewUrl);
      allSongs = allSongs.filter((song, idx, arr) =>
        arr.findIndex(s => s.title.toLowerCase() === song.title.toLowerCase() && s.artist.toLowerCase() === song.artist.toLowerCase()) === idx
      );
      if (allSongs.length < 4) {
        setAvailableSongs([]);
        setGameState(prev => ({ ...prev, isLoading: false }));
        alert('No se encontraron canciones válidas con preview en la fuente seleccionada. Prueba con otra fuente o inténtalo más tarde.');
        return;
      }
      const shuffledSongs = allSongs.sort(() => Math.random() - 0.5);
      setAvailableSongs(shuffledSongs);
      localStorage.setItem('musicguess-songs-cache', JSON.stringify(shuffledSongs));
      localStorage.setItem('musicguess-cache-timestamp', Date.now().toString());
      console.log(`✅ ${shuffledSongs.length} cancións cargadas de ${musicSource}`);
    } catch (error) {
      console.error('❌ Error cargando cancións:', error);
      setAvailableSongs([]);
      alert('Error cargando canciones. Puede que la fuente esté bloqueada o no haya previews disponibles.');
    }
    setGameState(prev => ({ ...prev, isLoading: false }));
  }, [musicSource])
  // Permitir cambiar la fuente de música desde el exterior
  const setMusicSourceExternal = (source: 'spotify' | 'youtube' | 'deezer') => {
    setMusicSource(source)
  }

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
    updateSettings,
    musicSource,
    setMusicSource: setMusicSourceExternal
  }
}
