import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  audioUrl: string
  isPlaying: boolean
  onTogglePlay: () => void
  albumCover?: string
  maxDuration?: number // en segundos
}

export const AudioPlayer = ({ 
  audioUrl, 
  isPlaying, 
  onTogglePlay, 
  albumCover,
  maxDuration = 10 
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.8)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.src = audioUrl
      audio.volume = volume
      audio.play().catch(console.error)

      // Timer para pausar después del tiempo máximo
      const timer = setTimeout(() => {
        audio.pause()
        onTogglePlay()
      }, maxDuration * 1000)

      return () => clearTimeout(timer)
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl, onTogglePlay, maxDuration, volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('ended', onTogglePlay)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('ended', onTogglePlay)
    }
  }, [onTogglePlay])

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      audio.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const progress = Math.min((currentTime / maxDuration) * 100, 100)

  return (
    <div className="music-card text-center">
      <audio ref={audioRef} />
      
      {/* Album Cover / Equalizer */}
      <div className="mb-6">
        {albumCover && !isPlaying ? (
          <div className="w-32 h-32 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={albumCover} 
              alt="Album cover"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
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
        )}

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
            onClick={onTogglePlay}
            className="button-primary flex items-center"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 mr-2" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {isPlaying ? 'Pausar' : 'Reproducir'}
          </button>

          {/* Volume Control */}
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
        </div>
      </div>

      {isPlaying && (
        <div className="text-sm text-gray-300 animate-pulse">
          Reproduciendo... {Math.ceil(maxDuration - currentTime)}s restantes
        </div>
      )}
    </div>
  )
}
