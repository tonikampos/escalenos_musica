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
      console.log('🔑 Usando token de acceso existente')
      return this.accessToken
    }

    console.log('🔑 Obteniendo nuevo token de acceso...')
    console.log('🔗 Client ID:', SPOTIFY_CONFIG.CLIENT_ID?.slice(0, 5) + '...')
    console.log('🔗 Client Secret:', SPOTIFY_CONFIG.CLIENT_SECRET ? 'Configurado' : 'No configurado')
    
    const response = await fetch(SPOTIFY_CONFIG.TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CONFIG.CLIENT_ID}:${SPOTIFY_CONFIG.CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    })

    console.log('🌐 Respuesta del token:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error obteniendo token:', errorText)
      throw new Error(`Failed to get Spotify access token: ${response.status} ${response.statusText}`)
    }

    const data: SpotifyTokenResponse = await response.json()
    console.log('✅ Token obtenido exitosamente, expira en:', data.expires_in, 'segundos')
    
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 minuto antes

    return this.accessToken
  }

  // Buscar canciones populares por género
  async getRandomTracks(genre: string = 'pop', limit: number = 50): Promise<SpotifyTrack[]> {
    console.log('🎯 Buscando canciones...', { genre, limit })
    
    const token = await this.getAccessToken()
    
    // Estrategias de búsqueda más efectivas para obtener canciones con preview
    const searchStrategies = {
      'pop': [
        'Bad Bunny OR Rosalía OR C. Tangana OR Aitana OR Lola Índigo',
        'indie español OR indie spain OR spanish indie',
        'top hits spain OR éxitos españa',
        'reggaeton OR trap latino'
      ],
      'indie': [
        'indie español OR indie spain OR spanish indie',
        'Vetusta Morla OR Izal OR Love of Lesbian OR Zahara',
        'indie rock español OR indie pop español',
        'música independiente española'
      ],
      'latin': [
        'Bad Bunny OR Rosalía OR Karol G OR Ozuna OR Daddy Yankee',
        'reggaeton OR bachata OR salsa OR merengue',
        'música latina OR latin hits',
        'trap latino OR urbano latino'
      ],
      'rock': [
        'rock español OR spanish rock',
        'Mägo de Oz OR Héroes del Silencio OR Extremoduro',
        'rock alternativo OR alternative rock',
        'indie rock OR rock independiente'
      ],
      'electronic': [
        'electronic dance OR EDM OR house music',
        'Calvin Harris OR David Guetta OR Tiësto',
        'deep house OR tech house OR progressive house',
        'electronic hits OR dance hits'
      ]
    }
    
    const queries = searchStrategies[genre as keyof typeof searchStrategies] || searchStrategies.pop
    
    for (const query of queries) {
      console.log('🔍 Probando búsqueda:', query)
      
      const url = `${SPOTIFY_CONFIG.API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&market=ES`
      console.log('� URL:', url)

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('📊 Respuesta de búsqueda:', response.status, response.statusText)
      
      if (!response.ok) {
        console.log('❌ Error en esta búsqueda, probando siguiente...')
        continue
      }

      const data: SpotifySearchResponse = await response.json()
      console.log('📋 Canciones encontradas:', data.tracks.items.length)
      console.log('🎵 Canciones con preview:', data.tracks.items.filter(track => track.preview_url !== null).length)
      
      // Filtrar solo canciones con preview_url
      const tracksWithPreview = data.tracks.items.filter(track => track.preview_url !== null)
      console.log('✅ Canciones válidas (con preview):', tracksWithPreview.length)
      
      if (tracksWithPreview.length > 0) {
        console.log('🎉 Encontradas canciones con preview, usando esta búsqueda')
        return tracksWithPreview
      }
    }
    
    console.log('😔 No se encontraron canciones con preview en ninguna búsqueda')
    return []
  }

  // Obtener canciones de una playlist específica (para mejor calidad de juego)
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    console.log('🎵 Obteniendo canciones de playlist:', playlistId)
    
    const token = await this.getAccessToken()
    
    const url = `${SPOTIFY_CONFIG.API_BASE_URL}/playlists/${playlistId}/tracks?market=ES&limit=50`
    console.log('🔗 URL de playlist:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    console.log('📊 Respuesta de playlist:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error obteniendo playlist:', errorText)
      throw new Error(`Failed to fetch playlist tracks: ${response.status}`)
    }

    const data = await response.json()
    console.log('📋 Items en playlist:', data.items?.length || 0)
    
    // Extraer tracks y filtrar los que tienen preview
    const tracks = data.items
      .map((item: any) => item.track)
      .filter((track: SpotifyTrack) => track && track.preview_url !== null)
    
    console.log('🎵 Canciones con preview en playlist:', tracks.length)
    console.log('📋 Primeras 3 canciones de playlist:', tracks.slice(0, 3).map((t: SpotifyTrack) => ({ 
      title: t.name, 
      artist: t.artists?.[0]?.name,
      hasPreview: !!t.preview_url,
      previewUrl: t.preview_url?.substring(0, 50) + '...'
    })))
    
    return tracks
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
