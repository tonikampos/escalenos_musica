import { useEffect, useRef, useState } from 'react'
import { Music, Play, Pause, Volume2, RotateCcw, Star, Settings, Trophy } from 'lucide-react'
import { useGameState } from './hooks/useGameState'

function App() {
  const [showLoading, setShowLoading] = useState(false);
  const {
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
    musicSource,
    setMusicSource
  } = useGameState()

  // Limpieza: sin logs ni clearCache global

  const audioRef = useRef<HTMLAudioElement>(null)


  // Determinar si la URL es de YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com/embed/') || url.includes('youtube.com/results')
  }

  // Manejar reproducción de audio
  useEffect(() => {
    if (gameState.currentSong && gameState.isPlaying) {
      const previewUrl = gameState.currentSong.previewUrl
      if (!isYouTubeUrl(previewUrl)) {
        if (audioRef.current) {
          audioRef.current.src = previewUrl
          audioRef.current.play().catch(() => {})
        }
      }
      const timer = setTimeout(() => {
        if (audioRef.current && !isYouTubeUrl(previewUrl)) {
          audioRef.current.pause()
        }
        togglePlay()
      }, 10000)
      return () => clearTimeout(timer)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [gameState.isPlaying, gameState.currentSong, togglePlay])

  // Pantalla de inicio
  if (!gameState.gameStarted) {
    // Detectar si no hay canciones válidas en la fuente seleccionada
    const noSongsAvailable = !gameState.isLoading && availableSongs.length === 0
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-spotify-green rounded-full mb-4">
              <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-spotify-green to-green-400 bg-clip-text text-transparent">
              MusicGuess
            </h1>
            <p className="text-gray-300 text-lg">
              Podes adiviñar a canción en 10 segundos?
            </p>
          </div>
          {/* Mensaje si no hay previews en la fuente seleccionada */}
          {noSongsAvailable && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-700 text-sm">
              <strong>No se encontraron previews de canciones en la fuente seleccionada ({musicSource.charAt(0).toUpperCase() + musicSource.slice(1)}).</strong>
              <div>Prueba cambiando a otra fuente (Spotify, YouTube o Deezer) para más variedad de previews.</div>
            </div>
          )}

          {/* Configuración del juego: selector de fuente de música */}
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-spotify-green" />
              <h2 className="text-lg font-semibold">Configuración</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Fuente de música</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${musicSource === 'spotify' ? 'bg-spotify-green text-white' : 'glass-effect hover:bg-white/20'}`}
                    onClick={() => setMusicSource('spotify')}
                    type="button"
                  >
                    Spotify
                  </button>
                  <button
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${musicSource === 'youtube' ? 'bg-red-600 text-white' : 'glass-effect hover:bg-white/20'}`}
                    onClick={() => setMusicSource('youtube')}
                    type="button"
                  >
                    YouTube
                  </button>
                  <button
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${musicSource === 'deezer' ? 'bg-blue-600 text-white' : 'glass-effect hover:bg-white/20'}`}
                    onClick={() => setMusicSource('deezer')}
                    type="button"
                  >
                    Deezer
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Cómo jugar */}
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Como xogar</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Volume2 className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Escoita 10 segundos da canción</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Escolle a resposta correcta</span>
              </div>
              <div className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Completa todas as roldas e obtén a túa puntuación</span>
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          {stats.totalGames > 0 && (
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <Trophy className="w-5 h-5 mr-2 text-spotify-green" />
                <h3 className="text-lg font-semibold">Estadísticas</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-spotify-green">{stats.bestScore}</div>
                  <div className="text-sm text-gray-300">Mellor puntuación</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-spotify-green">{stats.totalGames}</div>
                  <div className="text-sm text-gray-300">Partidas xogadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-spotify-green">{stats.averageScore}</div>
                  <div className="text-sm text-gray-300">Media</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-spotify-green">
                    {Math.round((stats.correctAnswers / stats.totalAnswers) * 100)}%
                  </div>
                  <div className="text-sm text-gray-300">Precisión</div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={async () => {
              // Mostrar mensaje de carga
              setShowLoading(true);
              await startGame(gameState.difficulty);
              setShowLoading(false);
            }}
            disabled={gameState.isLoading || showLoading}
            className="button-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.isLoading || showLoading ? 'Estou buscando cancións...' : 'Comezar a xogar'}
          </button>
import { useState } from 'react'
  const [showLoading, setShowLoading] = useState(false);
          >
            {gameState.isLoading || showLoading ? 'Estou buscando cancións...' : 'Comezar a xogar'}
  }

  // Pantalla de juego
  return (
    <div className="min-h-screen p-4">
      
      {/* Header con puntuación */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={resetGame} className="button-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="text-sm">
            <span className="text-gray-300">Rolda </span>
            <span className="font-bold text-spotify-green">{gameState.round}</span>
            <span className="text-gray-300"> de {gameState.maxRounds}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-300">Puntuación</div>
          <div className="text-2xl font-bold text-spotify-green">{gameState.score}</div>
        </div>
      </div>

      {/* Reproductor de música */}
      <div className="music-card text-center mb-8">
        <div className="mb-6">
          {gameState.currentSong?.albumCover ? (
            <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden">
              <img
                src={gameState.currentSong.albumCover}
                alt="Album cover"
                className="w-full h-full object-cover"
                onError={e => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = '/default_album.png';
                }}
              />
            </div>
          ) : (
            <div className="w-32 h-32 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-spotify-green to-green-600 flex items-center justify-center">
              {gameState.isPlaying ? (
                <div className="flex items-end space-x-1">
                  <div className="equalizer-bar w-2 bg-white rounded-full"></div>
                  <div className="equalizer-bar w-2 bg-white rounded-full"></div>
                  <div className="equalizer-bar w-2 bg-white rounded-full"></div>
                  <div className="equalizer-bar w-2 bg-white rounded-full"></div>
                </div>
              ) : (
                <Music className="w-16 h-16 text-white" />
              )}
            </div>
          )}
          
          <button 
            onClick={togglePlay}
            className="button-primary"
          >
            {gameState.isPlaying ? (
              <Pause className="w-5 h-5 mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {gameState.isPlaying ? 'Pausar' : 'Reproducir'}
          </button>
        </div>

        {/* Reproductor de YouTube - Abrir en nueva ventana (eliminado, solo audio en app) */}

        {/* Reproductor de audio tradicional */}
        <audio ref={audioRef} />

        {gameState.isPlaying && (
          <div className="text-sm text-gray-300">
            Reproducindo... 10 segundos
          </div>
        )}
      </div>

      {/* Opciones de respuesta */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center mb-4">
          Cal é esta canción?
        </h3>
        
        {gameState.options.map((song) => {
          const isCorrect = song.id === gameState.currentSong?.id
          const isSelected = gameState.selectedAnswer === song.id
          const showResult = gameState.showAnswer
          
          return (
            <button
              key={song.id}
              onClick={() => selectAnswer(song.id)}
              disabled={gameState.showAnswer}
              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                showResult && isCorrect 
                  ? 'bg-green-600 border-green-500' 
                  : showResult && isSelected && !isCorrect
                  ? 'bg-red-600/50 border-red-500'
                  : showResult
                  ? 'bg-gray-700/50 border-gray-600'
                  : 'glass-effect hover:bg-white/20'
              } ${gameState.showAnswer ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center mr-4">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{song.title}</div>
                  <div className="text-sm text-gray-300">{song.artist}</div>
                </div>
                {showResult && isCorrect && (
                  <div className="ml-auto">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Botón siguiente ronda */}
      {gameState.showAnswer && (
        <div className="mt-8 text-center">
          <button 
            onClick={nextRound}
            className="button-primary"
          >
            {gameState.round >= gameState.maxRounds ? 'Ver Resultados' : 'Seguinte Rolda'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
