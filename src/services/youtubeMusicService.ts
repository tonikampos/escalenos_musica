// Servicio para YouTube Music API
// Nota: YouTube Music API requiere autenticación OAuth, por lo que usaremos una aproximación alternativa

export interface YouTubeTrack {
  id: string
  title: string
  artist: string
  thumbnailUrl: string
  duration: string
  audioUrl?: string
}

export interface YouTubeSearchResponse {
  items: YouTubeTrack[]
  nextPageToken?: string
}

class YouTubeMusicService {
  private readonly API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || ''
  private readonly API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

  // Buscar canciones por término
  async searchTracks(query: string, maxResults: number = 20): Promise<YouTubeTrack[]> {
    console.log('🎵 Buscando en YouTube Music:', query)
    
    try {
      // Agregar "official audio" o "official video" para obtener mejores resultados
      const searchQuery = `${query} official audio OR official video OR lyrics`
      
      const url = `${this.API_BASE_URL}/search?part=snippet&type=video&videoCategoryId=10&q=${encodeURIComponent(searchQuery)}&maxResults=${maxResults}&key=${this.API_KEY}`
      
      console.log('🔗 URL de búsqueda YouTube:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Respuesta de YouTube:', data.items?.length || 0, 'videos encontrados')
      
      if (!data.items || data.items.length === 0) {
        return []
      }
      
      // Convertir a nuestro formato
      const tracks: YouTubeTrack[] = data.items.map((item: any) => ({
        id: item.id.videoId,
        title: this.cleanTitle(item.snippet.title),
        artist: this.extractArtist(item.snippet.title, item.snippet.channelTitle),
        thumbnailUrl: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        duration: '3:30', // Duración aproximada
        audioUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }))
      
      console.log('✅ Tracks procesados:', tracks.length)
      console.log('📋 Muestra de tracks:', tracks.slice(0, 3).map(t => `${t.title} - ${t.artist}`))
      
      return tracks
      
    } catch (error) {
      console.error('❌ Error buscando en YouTube:', error)
      return []
    }
  }

  // Buscar por artista específico
  async searchByArtist(artist: string, maxResults: number = 10): Promise<YouTubeTrack[]> {
    const queries = [
      `${artist} official audio`,
      `${artist} official video`,
      `${artist} greatest hits`,
      `${artist} best songs`
    ]
    
    let allTracks: YouTubeTrack[] = []
    
    for (const query of queries) {
      const tracks = await this.searchTracks(query, Math.ceil(maxResults / queries.length))
      allTracks = [...allTracks, ...tracks]
      
      if (allTracks.length >= maxResults) break
    }
    
    // Eliminar duplicados y limitar resultados
    const uniqueTracks = allTracks.filter((track, index, self) => 
      index === self.findIndex(t => t.id === track.id)
    ).slice(0, maxResults)
    
    return uniqueTracks
  }

  // Buscar por categoría/género
  async searchByCategory(category: string, maxResults: number = 20): Promise<YouTubeTrack[]> {
    const categoryQueries = {
      'pop': [
        'pop hits 2024 official',
        'pop music 2024 playlist',
        'top pop songs official audio'
      ],
      'rock': [
        'rock hits official audio',
        'rock music 2024 playlist',
        'best rock songs official'
      ],
      'indie': [
        'indie music 2024 official',
        'indie rock playlist official',
        'indie pop hits official'
      ],
      'electronic': [
        'electronic music 2024 official',
        'edm hits official audio',
        'dance music playlist official'
      ],
      'latin': [
        'latin music 2024 official',
        'reggaeton hits official',
        'latin pop official audio'
      ],
      'hits': [
        'top hits 2024 official audio',
        'billboard hot 100 official',
        'trending music official'
      ]
    }
    
    const queries = categoryQueries[category as keyof typeof categoryQueries] || categoryQueries.pop
    let allTracks: YouTubeTrack[] = []
    
    for (const query of queries) {
      const tracks = await this.searchTracks(query, Math.ceil(maxResults / queries.length))
      allTracks = [...allTracks, ...tracks]
      
      if (allTracks.length >= maxResults) break
    }
    
    return allTracks.slice(0, maxResults)
  }

  // Limpiar título del video (remover "Official Video", "Official Audio", etc.)
  private cleanTitle(title: string): string {
    return title
      .replace(/\s*\(Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video)\)/gi, '')
      .replace(/\s*\[Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video)\]/gi, '')
      .replace(/\s*-\s*Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video)/gi, '')
      .replace(/\s*Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video)\s*/gi, '')
      .replace(/\s*\|\s*Official\s*(Video|Audio|Music\s*Video|Lyric\s*Video)/gi, '')
      .replace(/\s*HD\s*/gi, '')
      .replace(/\s*4K\s*/gi, '')
      .replace(/\s*\(Lyrics\)/gi, '')
      .replace(/\s*\[Lyrics\]/gi, '')
      .trim()
  }

  // Extraer artista del título o canal
  private extractArtist(title: string, channelTitle: string): string {
    // Si el título contiene " - ", asumir que el artista está antes del guión
    const dashIndex = title.indexOf(' - ')
    if (dashIndex > 0) {
      return title.substring(0, dashIndex).trim()
    }
    
    // Si no, usar el nombre del canal pero limpiarlo
    return channelTitle
      .replace(/\s*(Official|Music|Channel|Records|Entertainment|VEVO)\s*/gi, '')
      .replace(/\s*-\s*Topic\s*/gi, '')
      .trim()
  }

  // Obtener URL de audio embedible para YouTube
  getEmbedAudioUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&start=30&end=50&controls=0&modestbranding=1`
  }

  // Verificar si tenemos API key
  hasApiKey(): boolean {
    return this.API_KEY.length > 0
  }
}

export const youtubeMusicService = new YouTubeMusicService()
