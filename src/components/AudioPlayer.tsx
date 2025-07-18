import { useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react'
import { useAudioPlayer } from '../hooks/useAudioPlayer'

interface AudioPlayerProps {
  audioUrl: string
  isGamePlaying: boolean
  onTogglePlay: () => void
  albumCover?: string
  maxDuration?: number // en segundos
}

export const AudioPlayer = ({ 
  audioUrl, 
  isGamePlaying, 
  onTogglePlay, 
  albumCover,
  maxDuration = 10 
}: AudioPlayerProps) => {
  const { 
    play, 
    pause, 
    isPlaying, 
    currentTime, 
    volume, 
    setVolume, 
    error, 
    initAudioContext 
  } = useAudioPlayer()
  
  const [isMuted, setIsMuted] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)

  // Función para inicializar audio (requerido en móviles)
  const handleInitAudio = async () => {
    try {
      await initAudioContext()
      setAudioInitialized(true)
    } catch (err) {
      console.error('Error inicializando audio:', err)
    }
  }

  // Manejar play/pause
  const handleTogglePlay = async () => {
    if (!audioInitialized) {
      await handleInitAudio()
    }
    
    if (isPlaying) {
      pause()
    } else {
      await play(audioUrl)
    }
    onTogglePlay()
  }

  // Sincronizar con el estado del juego
  useEffect(() => {
    if (isGamePlaying && !isPlaying && audioInitialized) {
      play(audioUrl)
    } else if (!isGamePlaying && isPlaying) {
      pause()
    }
  }, [isGamePlaying, isPlaying, audioUrl, audioInitialized, play, pause])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    setVolume(isMuted ? 0.8 : 0)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const progress = Math.min((currentTime / maxDuration) * 100, 100)

  return (
    <div className="music-card text-center">
      {/* Botón inicial para activar audio en móviles */}
      {!audioInitialized && (
        <div className="mb-4 p-4 bg-yellow-600/20 border border-yellow-600/40 rounded-xl">
          <div className="flex items-center justify-center mb-2">
            <Volume2 className="w-5 h-5 mr-2 text-yellow-400" />
            <span className="text-sm font-medium">Activar audio</span>
          </div>
          <p className="text-xs text-gray-300 mb-3">
            Toca el botón para habilitar el audio (requerido en móviles)
          </p>
          <button 
            onClick={handleInitAudio}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            🔊 Activar Audio
          </button>
        </div>
      )}

      {/* Error de audio */}
      {error && (
        <div className="mb-4 p-3 bg-red-600/20 border border-red-600/40 rounded-xl">
          <div className="flex items-center justify-center text-red-400">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {/* Album Cover oculto: solo visualización de ecualizador o fondo */}
      <div className="mb-6">
        <div className="w-32 h-32 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-spotify-green to-green-600 flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <div className="flex items-end space-x-1">
              <div className="equalizer-bar w-2 bg-white rounded-full"></div>
              <div className="equalizer-bar w-2 bg-white rounded-full"></div>
              <div className="equalizer-bar w-2 bg-white rounded-full"></div>
              <div className="equalizer-bar w-2 bg-white rounded-full"></div>
            </div>
          ) : (
            <Play className="w-16 h-16 text-white" />
          )}
        </div>

        {/* Progress Bar */}
        {isPlaying && (
          <div className="w-full max-w-xs mx-auto mb-4">
            <div className="w-full bg-gray-700 rounded-full h-1">
              <div 
                className="bg-spotify-green h-1 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{Math.floor(currentTime)}s</span>
              <span>{maxDuration}s</span>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center space-x-4">
          <button 
            onClick={handleTogglePlay}
            disabled={!audioInitialized}
            className={`button-primary flex items-center ${!audioInitialized ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>

          {/* Volume Control */}
          {audioInitialized && (
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute}
                className="p-2 glass-effect rounded-full hover:bg-white/20 transition-all"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-500 mt-2">
        <div>Audio: {audioInitialized ? '✅' : '❌'}</div>
        <div>URL: {audioUrl ? '✅' : '❌'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>

      {isPlaying && (
        <div className="text-sm text-gray-300 animate-pulse">
          Reproduciendo... {Math.ceil(maxDuration - currentTime)}s restantes
        </div>
      )}
    </div>
  )
}
