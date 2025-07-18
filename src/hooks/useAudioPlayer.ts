import { useCallback, useRef, useState } from 'react'

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [error, setError] = useState<string | null>(null)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)

  // Inicializar AudioContext (requerido para móviles)
  const initAudioContext = useCallback(async () => {
    try {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        setAudioContext(ctx)
        
        // Desbloquear audio context en móviles
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }
      }
    } catch (err) {
      console.error('Error inicializando AudioContext:', err)
      setError('Error al inicializar audio')
    }
  }, [audioContext])

  // Reproducir audio
  const play = useCallback(async (audioUrl: string) => {
    try {
      setError(null)
      
      // Inicializar audio context si no existe
      await initAudioContext()
      
      // Crear o actualizar elemento audio
      if (!audioRef.current) {
        audioRef.current = new Audio()
      }
      
      const audio = audioRef.current
      
      // Configurar audio
      audio.src = audioUrl
      audio.volume = volume
      audio.currentTime = 0
      
      // Configurar crossOrigin para evitar problemas CORS
      audio.crossOrigin = 'anonymous'
      
      // Event listeners
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration)
      })
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime)
      })
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false)
        setCurrentTime(0)
      })
      
      audio.addEventListener('error', (e) => {
        console.error('Error de audio:', e)
        setError('Error al reproducir audio')
        setIsPlaying(false)
      })
      
      // Intentar reproducir
      console.log('🎵 Intentando reproducir:', audioUrl)
      await audio.play()
      setIsPlaying(true)
      
      // Auto-pausar después de 10 segundos
      setTimeout(() => {
        if (audio && !audio.paused) {
          audio.pause()
          setIsPlaying(false)
        }
      }, 10000)
      
    } catch (err) {
      console.error('Error reproduciendo audio:', err)
      setError('Error al reproducir: ' + (err as Error).message)
      setIsPlaying(false)
    }
  }, [volume, initAudioContext])

  // Pausar audio
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // Parar audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [])

  // Cambiar volumen
  const setAudioVolume = useCallback((newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }, [])

  // Cleanup
  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setError(null)
  }, [])

  return {
    play,
    pause,
    stop,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume: setAudioVolume,
    error,
    cleanup,
    initAudioContext
  }
}
