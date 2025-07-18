// Servicio para Last.fm API
export interface LastFmTrack {
  name: string
  artist: {
    name: string
    mbid?: string
    url?: string
  }
  url: string
  duration?: string
  playcount?: string
  listeners?: string
  mbid?: string
  image?: Array<{
    '#text': string
    size: string
  }>
}

export interface LastFmResponse {
  tracks: {
    track: LastFmTrack[]
  }
}

class LastFmService {
  private apiKey: string
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'

  constructor() {
    this.apiKey = import.meta.env.VITE_LASTFM_API_KEY || ''
  }

  hasApiKey(): boolean {
    return !!this.apiKey
  }

  async getArtistTopTracks(artist: string, limit: number = 5): Promise<LastFmTrack[]> {
    if (!this.hasApiKey()) {
      throw new Error('Last.fm API key not configured')
    }

    const url = `${this.baseUrl}?method=artist.gettoptracks&artist=${encodeURIComponent(artist)}&api_key=${this.apiKey}&format=json&limit=${limit}`
    
    console.log(`🎵 Buscando en Last.fm: ${artist}`)
    console.log(`🔗 URL de búsqueda Last.fm: ${url}`)

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Last.fm API error: ${data.message}`)
      }

      const tracks = data.toptracks?.track || []
      
      console.log(`📊 Respuesta de Last.fm:`, tracks.length, 'canciones encontradas')
      
      return Array.isArray(tracks) ? tracks : [tracks]
    } catch (error) {
      console.error('❌ Error buscando en Last.fm:', error)
      throw error
    }
  }

  async searchTrack(query: string, limit: number = 5): Promise<LastFmTrack[]> {
    if (!this.hasApiKey()) {
      throw new Error('Last.fm API key not configured')
    }

    const url = `${this.baseUrl}?method=track.search&track=${encodeURIComponent(query)}&api_key=${this.apiKey}&format=json&limit=${limit}`
    
    console.log(`🔍 Buscando canción en Last.fm: ${query}`)

    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(`Last.fm API error: ${data.message}`)
      }

      const tracks = data.results?.trackmatches?.track || []
      
      return Array.isArray(tracks) ? tracks : [tracks]
    } catch (error) {
      console.error('❌ Error buscando canción en Last.fm:', error)
      throw error
    }
  }

  // Obtener información adicional de una canción
  async getTrackInfo(artist: string, track: string): Promise<LastFmTrack | null> {
    if (!this.hasApiKey()) {
      return null
    }

    const url = `${this.baseUrl}?method=track.getinfo&api_key=${this.apiKey}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`
    
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        return null
      }

      const data = await response.json()
      
      if (data.error) {
        return null
      }

      return data.track || null
    } catch (error) {
      console.error('❌ Error obteniendo info de canción:', error)
      return null
    }
  }
}

export const lastfmService = new LastFmService()
