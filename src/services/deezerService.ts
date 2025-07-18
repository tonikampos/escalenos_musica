// Servicio para obtener previews de Deezer
import { Song } from '../types/xogo'

export const deezerService = {
  // Busca canciones por término (devuelve solo las que tienen preview)
  async searchTracks(query: string, limit: number = 10): Promise<Song[]> {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}` // Evitar CORS en local
    const res = await fetch(proxyUrl)
    if (res.status === 403) {
      // Deezer bloqueado por CORS o región
      window.localStorage.setItem('musicguess-deezer-blocked', '1');
      throw new Error('Deezer bloqueado por CORS o región. Prueba con otra fuente.');
    }
    if (!res.ok) throw new Error('Error consultando Deezer')
    const data = await res.json()
    return (data.data || [])
      .filter((track: any) => !!track.preview)
      .map((track: any) => ({
        id: String(track.id),
        title: track.title,
        artist: track.artist.name,
        previewUrl: track.preview,
        albumCover: track.album.cover_big || track.album.cover_medium || ''
      }))
  }
}
