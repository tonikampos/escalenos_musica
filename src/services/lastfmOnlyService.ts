// Servicio simplificado que usa SOLO Last.fm para evitar problemas de quota
export interface LastFmOnlyTrack {
  id: string
  title: string
  artist: string
  previewUrl: string
  albumCover: string
  source: 'lastfm'
}

class LastFmOnlyService {
  private apiKey: string
  private baseUrl = 'https://ws.audioscrobbler.com/2.0/'
  
  constructor() {
    this.apiKey = import.meta.env.VITE_LASTFM_API_KEY || ''
  }

  hasApiKey(): boolean {
    return !!this.apiKey
  }

  async getArtistTopTracks(artist: string, limit: number = 5): Promise<LastFmOnlyTrack[]> {
    console.log(`🎵 Last.fm SOLO - Buscando ${artist}`)
    
    if (!this.hasApiKey()) {
      console.log('❌ No hay API key de Last.fm')
      return []
    }

    try {
      const params = new URLSearchParams({
        method: 'artist.gettoptracks',
        artist: artist,
        api_key: this.apiKey,
        format: 'json',
        limit: limit.toString()
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.toptracks || !data.toptracks.track) {
        console.log(`⚠️ No hay canciones para ${artist}`)
        return []
      }

      const tracks = Array.isArray(data.toptracks.track) 
        ? data.toptracks.track 
        : [data.toptracks.track]

      const processedTracks = tracks.map((track: any) => ({
        id: `lastfm-${track.artist.name}-${track.name}`.replace(/\s+/g, '-').toLowerCase(),
        title: track.name,
        artist: track.artist.name,
        previewUrl: this.generateSimpleAudioUrl(track.name, track.artist.name),
        albumCover: track.image?.find((img: any) => img.size === 'large')?.['#text'] || 
                   'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png',
        source: 'lastfm' as const
      }))

      console.log(`✅ Last.fm encontró ${processedTracks.length} canciones para ${artist}`)
      return processedTracks

    } catch (error) {
      console.error(`❌ Error en Last.fm para ${artist}:`, error)
      return []
    }
  }

  private generateSimpleAudioUrl(songTitle: string, artistName: string): string {
    // Generar URL simple para demostración
    // En producción, esto podría ser un servicio de audio alternativo
    const query = `${artistName} ${songTitle}`
    const encodedQuery = encodeURIComponent(query)
    
    // Usar un servicio de audio genérico como placeholder
    return `https://www.youtube.com/embed/search?query=${encodedQuery}&autoplay=1&controls=0`
  }

  async searchTracks(query: string, limit: number = 5): Promise<LastFmOnlyTrack[]> {
    console.log(`🔍 Last.fm SOLO - Búsqueda: ${query}`)
    
    if (!this.hasApiKey()) {
      console.log('❌ No hay API key de Last.fm')
      return []
    }

    try {
      const params = new URLSearchParams({
        method: 'track.search',
        track: query,
        api_key: this.apiKey,
        format: 'json',
        limit: limit.toString()
      })

      const response = await fetch(`${this.baseUrl}?${params}`)
      
      if (!response.ok) {
        throw new Error(`Last.fm API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.results || !data.results.trackmatches || !data.results.trackmatches.track) {
        console.log(`⚠️ No hay resultados para: ${query}`)
        return []
      }

      const tracks = Array.isArray(data.results.trackmatches.track) 
        ? data.results.trackmatches.track 
        : [data.results.trackmatches.track]

      const processedTracks = tracks.map((track: any) => ({
        id: `lastfm-${track.artist}-${track.name}`.replace(/\s+/g, '-').toLowerCase(),
        title: track.name,
        artist: track.artist,
        previewUrl: this.generateSimpleAudioUrl(track.name, track.artist),
        albumCover: track.image?.find((img: any) => img.size === 'large')?.['#text'] || 
                   'https://lastfm.freetls.fastly.net/i/u/300x300/2a96cbd8b46e442fc41c2b86b821562f.png',
        source: 'lastfm' as const
      }))

      console.log(`✅ Last.fm búsqueda encontró ${processedTracks.length} canciones`)
      return processedTracks

    } catch (error) {
      console.error(`❌ Error en búsqueda Last.fm:`, error)
      return []
    }
  }
}

export const lastfmOnlyService = new LastFmOnlyService()
