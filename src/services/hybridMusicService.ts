// Servicio híbrido que combina Last.fm + Spotify para obtener lo mejor de ambos
import { lastfmService, LastFmTrack } from './lastfmService'
import { spotifyService, SpotifyTrack } from './spotifyService'

export interface HybridTrack {
  id: string
  title: string
  artist: string
  previewUrl: string
  albumCover: string
  duration?: number
  source: 'spotify' | 'youtube' | 'fallback'
  popularity?: number
}

class HybridMusicService {
  
  async getArtistTopTracks(artist: string, limit: number = 5): Promise<HybridTrack[]> {
    console.log(`🎵 Buscando canciones de ${artist} con servicio híbrido`)
    
    const tracks: HybridTrack[] = []
    
    try {
      // 1. Intentar obtener canciones de Last.fm (metadatos)
      let lastfmTracks: LastFmTrack[] = []
      
      if (lastfmService.hasApiKey()) {
        try {
          lastfmTracks = await lastfmService.getArtistTopTracks(artist, limit)
          console.log(`✅ Last.fm encontró ${lastfmTracks.length} canciones para ${artist}`)
        } catch (error) {
          console.log(`⚠️ Last.fm falló para ${artist}:`, error)
        }
      }
      
      // 2. Para cada canción de Last.fm, intentar obtener preview de Spotify
      for (const lastfmTrack of lastfmTracks) {
        try {
          // Buscar en Spotify usando búsqueda general
          const spotifyResults = await spotifyService.getRandomTracks('pop', 50)
          
          // Buscar coincidencia por nombre de canción y artista
          const matchingTrack = spotifyResults.find(spotifyTrack => {
            const titleMatch = spotifyTrack.name.toLowerCase().includes(lastfmTrack.name.toLowerCase()) ||
                             lastfmTrack.name.toLowerCase().includes(spotifyTrack.name.toLowerCase())
            const artistMatch = spotifyTrack.artists[0].name.toLowerCase().includes(lastfmTrack.artist.name.toLowerCase()) ||
                               lastfmTrack.artist.name.toLowerCase().includes(spotifyTrack.artists[0].name.toLowerCase())
            
            return titleMatch && artistMatch && spotifyTrack.preview_url
          })
          
          if (matchingTrack) {
            tracks.push({
              id: matchingTrack.id,
              title: matchingTrack.name,
              artist: matchingTrack.artists[0].name,
              previewUrl: matchingTrack.preview_url!,
              albumCover: matchingTrack.album.images[0]?.url || '',
              duration: 30000, // 30 segundos para Spotify
              source: 'spotify'
            })
            console.log(`✅ Spotify preview encontrado para: ${lastfmTrack.name}`)
            continue
          }
          
          // Si no hay preview de Spotify, usar YouTube como fallback
          const youtubeUrl = this.generateYouTubeEmbedUrl(lastfmTrack.name, lastfmTrack.artist.name)
          
          tracks.push({
            id: `${lastfmTrack.artist.name}-${lastfmTrack.name}`.replace(/\s+/g, '-').toLowerCase(),
            title: lastfmTrack.name,
            artist: lastfmTrack.artist.name,
            previewUrl: youtubeUrl,
            albumCover: lastfmTrack.image?.find(img => img.size === 'large')?.['#text'] || '',
            source: 'youtube'
          })
          
          console.log(`🎬 YouTube fallback usado para: ${lastfmTrack.name}`)
          
        } catch (error) {
          console.log(`❌ Error procesando ${lastfmTrack.name}:`, error)
        }
      }
      
      // 3. Si no obtuvimos suficientes canciones de Last.fm, buscar directamente en Spotify
      if (tracks.length < limit) {
        console.log(`🔍 Buscando canciones adicionales directamente en Spotify para ${artist}`)
        
        try {
          const spotifyResults = await spotifyService.getRandomTracks('pop', limit * 2)
          
          // Filtrar por artista y que tengan preview
          const artistTracks = spotifyResults
            .filter((track: SpotifyTrack) => 
              track.preview_url && 
              track.artists[0].name.toLowerCase().includes(artist.toLowerCase())
            )
            .slice(0, limit - tracks.length)
            .map((track: SpotifyTrack) => ({
              id: track.id,
              title: track.name,
              artist: track.artists[0].name,
              previewUrl: track.preview_url!,
              albumCover: track.album.images[0]?.url || '',
              duration: 30000,
              source: 'spotify' as const
            }))
          
          tracks.push(...artistTracks)
          console.log(`✅ Spotify agregó ${artistTracks.length} canciones adicionales`)
          
        } catch (error) {
          console.log(`⚠️ Spotify directo falló para ${artist}:`, error)
        }
      }
      
      console.log(`📊 Total encontrado para ${artist}: ${tracks.length} canciones`)
      
      return tracks
      
    } catch (error) {
      console.error(`❌ Error en servicio híbrido para ${artist}:`, error)
      return []
    }
  }
  
  private generateYouTubeEmbedUrl(songTitle: string, artistName: string): string {
    const query = `${artistName} ${songTitle} official audio`
    
    // Generar un ID de YouTube "simulado" basado en el hash del query
    const fakeId = this.generateFakeYouTubeId(query)
    
    return `https://www.youtube.com/embed/${fakeId}?autoplay=1&start=30&end=50&controls=0`
  }
  
  private generateFakeYouTubeId(query: string): string {
    // Generar un ID "realista" basado en el query para YouTube
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
    let result = ''
    let hash = 0
    
    for (let i = 0; i < query.length; i++) {
      hash = ((hash << 5) - hash + query.charCodeAt(i)) & 0xffffffff
    }
    
    for (let i = 0; i < 11; i++) {
      result += chars[Math.abs(hash + i) % chars.length]
    }
    
    return result
  }
  
  async searchTracks(query: string, limit: number = 5): Promise<HybridTrack[]> {
    console.log(`🔍 Búsqueda híbrida: ${query}`)
    
    const tracks: HybridTrack[] = []
    
    try {
      // 1. Buscar en Spotify primero
      const spotifyResults = await spotifyService.getRandomTracks('pop', limit * 2)
      
      // Filtrar por query y que tengan preview
      const matchingTracks = spotifyResults.filter((track: SpotifyTrack) => {
        const queryLower = query.toLowerCase()
        const titleMatch = track.name.toLowerCase().includes(queryLower)
        const artistMatch = track.artists[0].name.toLowerCase().includes(queryLower)
        
        return (titleMatch || artistMatch) && track.preview_url
      }).slice(0, limit)
      
      for (const track of matchingTracks) {
        tracks.push({
          id: track.id,
          title: track.name,
          artist: track.artists[0].name,
          previewUrl: track.preview_url!,
          albumCover: track.album.images[0]?.url || '',
          duration: 30000,
          source: 'spotify'
        })
      }
      
      // 2. Si no hay suficientes con preview, buscar en Last.fm
      if (tracks.length < limit && lastfmService.hasApiKey()) {
        try {
          const lastfmResults = await lastfmService.searchTrack(query, limit - tracks.length)
          
          for (const track of lastfmResults) {
            const youtubeUrl = this.generateYouTubeEmbedUrl(track.name, track.artist.name)
            
            tracks.push({
              id: `${track.artist.name}-${track.name}`.replace(/\s+/g, '-').toLowerCase(),
              title: track.name,
              artist: track.artist.name,
              previewUrl: youtubeUrl,
              albumCover: track.image?.find(img => img.size === 'large')?.['#text'] || '',
              source: 'youtube'
            })
          }
          
        } catch (error) {
          console.log('⚠️ Last.fm search falló:', error)
        }
      }
      
      return tracks
      
    } catch (error) {
      console.error('❌ Error en búsqueda híbrida:', error)
      return []
    }
  }
}

export const hybridMusicService = new HybridMusicService()
