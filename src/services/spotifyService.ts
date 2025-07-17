// Configuración para Spotify Web API
export const SPOTIFY_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '',
  REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI || window.location.origin,
  SCOPE: 'user-read-private user-read-email',
  TOKEN_ENDPOINT: 'https://accounts.spotify.com/api/token',
  API_BASE_URL: 'https://api.spotify.com/v1'
}

// Tipos para Spotify API
export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    id: string
    name: string
  }>
  album: {
    id: string
    name: string
    images: Array<{
      url: string
      height: number
      width: number
    }>
  }
  preview_url: string | null
  external_urls: {
    spotify: string
  }
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
    total: number
  }
}

export interface SpotifyTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

class SpotifyService {
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  // Obtener token de acceso usando Client Credentials Flow
  async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const response = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token')
    }

    const data: SpotifyTokenResponse = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minuto antes

    return this.accessToken
  }

  // Buscar canciones populares por género
  async getRandomTracks(genre: string = 'pop', limit: number = 50): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken()
    
    // Usar búsqueda con filtros para obtener canciones populares
    const query = `genre:${genre} year:2020-2024`
    const url = `${SPOTIFY_CONFIG.API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=ES`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch tracks from Spotify')
    }

    const data: SpotifySearchResponse = await response.json()
    
    // Filtrar solo canciones con preview_url
    return data.tracks.items.filter(track => track.preview_url !== null)
  }

  // Obtener canciones de una playlist específica (para mejor calidad de juego)
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken()
    
    const url = `${SPOTIFY_CONFIG.API_BASE_URL}/playlists/${playlistId}/tracks?market=ES&limit=50`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch playlist tracks')
    }

    const data = await response.json()
    
    // Extraer tracks y filtrar los que tienen preview
    return data.items
      .map((item: any) => item.track)
      .filter((track: SpotifyTrack) => track && track.preview_url !== null)
  }

  // Buscar canciones por categoría/estado de ánimo
  async getTracksByCategory(category: string = 'party'): Promise<SpotifyTrack[]> {
    const token = await this.getAccessToken()
    
    // Primero obtener playlists de la categoría
    const categoryUrl = `${SPOTIFY_CONFIG.API_BASE_URL}/browse/categories/${category}/playlists?limit=20&market=ES`
    
    const categoryResponse = await fetch(categoryUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!categoryResponse.ok) {
      throw new Error('Failed to fetch category playlists')
    }

    const categoryData = await categoryResponse.json()
    
    if (categoryData.playlists.items.length === 0) {
      return []
    }

    // Tomar una playlist aleatoria de la categoría
    const randomPlaylist = categoryData.playlists.items[
      Math.floor(Math.random() * categoryData.playlists.items.length)
    ]

    return this.getPlaylistTracks(randomPlaylist.id)
  }
}

export const spotifyService = new SpotifyService()
