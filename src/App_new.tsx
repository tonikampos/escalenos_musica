import { useEffect, useRef } from 'react'
import { Music, Play, Pause, Volume2, RotateCcw, Star, Settings, Trophy } from 'lucide-react'
import { useGameState } from './hooks/useGameState'

function App() {
  const {
    gameState,
    stats,
    availableSongs,
    startGame,
    nextRound,
    selectAnswer,
    resetGame,
    togglePlayback,
    updateSettings
  } = useGameState()

  const audioRef = useRef<HTMLAudioElement>(null)

  // Manejar reproducción de audio
  useEffect(() => {
    if (audioRef.current && gameState.currentSong) {
      if (gameState.isPlaying) {
        audioRef.current.src = gameState.currentSong.previewUrl
        audioRef.current.play().catch(console.error)
        
        // Pausar después de 10 segundos
        const timer = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.pause()
            togglePlayback()
          }
        }, 10000)

        return () => clearTimeout(timer)
      } else {
        audioRef.current.pause()
      }
    }
  }, [gameState.isPlaying, gameState.currentSong, togglePlayback])

  // Pantalla de inicio
  if (!gameState.gameStarted) {
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
              ¿Puedes adivinar la canción en 10 segundos?
            </p>
          </div>

          {/* Configuración del juego */}
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <div className="flex items-center mb-4">
              <Settings className="w-5 h-5 mr-2 text-spotify-green" />
              <h2 className="text-lg font-semibold">Configuración</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dificultad</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => updateSettings(diff, gameState.category)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        gameState.difficulty === diff
                          ? 'bg-spotify-green text-white'
                          : 'glass-effect hover:bg-white/20'
                      }`}
                    >
                      {diff === 'easy' ? 'Fácil (5)' : diff === 'medium' ? 'Medio (10)' : 'Difícil (15)'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Categoría</label>
                <select
                  value={gameState.category}
                  onChange={(e) => updateSettings(gameState.difficulty, e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white"
                >
                  <option value="pop">Pop</option>
                  <option value="hits">Top Hits</option>
                  <option value="rock">Rock</option>
                  <option value="latin">Latino</option>
                  <option value="electronic">Electrónica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cómo jugar */}
          <div className="glass-effect rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Cómo jugar</h2>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center">
                <Volume2 className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Escucha 10 segundos de la canción</span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Elige la respuesta correcta</span>
              </div>
              <div className="flex items-center">
                <RotateCcw className="w-4 h-4 mr-3 text-spotify-green" />
                <span>Completa todas las rondas y obtén tu puntuación</span>
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
                  <div className="text-sm text-gray-300">Mejor puntuación</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-spotify-green">{stats.totalGames}</div>
                  <div className="text-sm text-gray-300">Partidas jugadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-spotify-green">{stats.averageScore}</div>
                  <div className="text-sm text-gray-300">Promedio</div>
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
            onClick={() => startGame(gameState.difficulty, gameState.category)}
            disabled={gameState.isLoading}
            className="button-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {gameState.isLoading ? 'Cargando canciones...' : 'Empezar a jugar'}
          </button>
          
          {/* Debug info */}
          <div className="mt-4 text-xs text-gray-400 text-center">
            <button 
              onClick={() => console.log('🔧 Debug Info:', {
                hasClientId: !!import.meta.env.VITE_SPOTIFY_CLIENT_ID,
                hasClientSecret: !!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
                redirectUri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
                availableSongs: availableSongs.length,
                category: gameState.category,
                difficulty: gameState.difficulty
              })}
              className="text-xs text-gray-500 hover:text-spotify-green"
            >
              🔧 Debug Info (Ver consola)
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de juego
  return (
    <div className="min-h-screen p-4">
      <audio ref={audioRef} />
      
      {/* Header con puntuación */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={resetGame} className="button-secondary">
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="text-sm">
            <span className="text-gray-300">Ronda </span>
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
            onClick={togglePlayback}
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

        {gameState.isPlaying && (
          <div className="text-sm text-gray-300">
            Reproduciendo... 10 segundos
          </div>
        )}
      </div>

      {/* Opciones de respuesta */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center mb-4">
          ¿Cuál es esta canción?
        </h3>
        
        {gameState.options.map((song) => {
          const isCorrect = song.id === gameState.currentSong?.id
          const isSelected = gameState.selectedAnswer?.id === song.id
          const showResult = gameState.showAnswer
          
          return (
            <button
              key={song.id}
              onClick={() => selectAnswer(song)}
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
            {gameState.round >= gameState.maxRounds ? 'Ver Resultados' : 'Siguiente Ronda'}
          </button>
        </div>
      )}
    </div>
  )
}

export default App
