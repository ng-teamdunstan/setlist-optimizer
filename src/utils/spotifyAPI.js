// src/utils/spotifyAPI.js
export class SpotifyAPI {
  constructor(accessToken) {
    this.accessToken = accessToken
    this.baseUrl = 'https://api.spotify.com/v1'
  }

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`Spotify API Error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Spotify API Request failed:', error)
      throw error
    }
  }

  // ===== ARTIST FUNKTIONEN =====
  
  // Artists suchen
  async searchArtists(query, limit = 10) {
    const encodedQuery = encodeURIComponent(query)
    return this.request(`/search?q=${encodedQuery}&type=artist&limit=${limit}`)
  }

  // Artist Details laden
  async getArtist(artistId) {
    return this.request(`/artists/${artistId}`)
  }

  // Artist's Alben laden
  async getArtistAlbums(artistId, limit = 50) {
    return this.request(`/artists/${artistId}/albums?include_groups=album,single&market=DE&limit=${limit}`)
  }

  // Album Tracks laden
  async getAlbumTracks(albumId, limit = 50) {
    return this.request(`/albums/${albumId}/tracks?market=DE&limit=${limit}`)
  }

  // Mehrere Alben auf einmal laden
  async getMultipleAlbums(albumIds) {
    const ids = Array.isArray(albumIds) ? albumIds.join(',') : albumIds
    return this.request(`/albums?ids=${ids}&market=DE`)
  }

  // ===== AUDIO FEATURES FUNKTIONEN (MIT FALLBACKS) =====

  // Standard Audio Features (primäre Methode)
  async getAudioFeatures(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds
    return this.request(`/audio-features?ids=${ids}`)
  }

  // Alternative Audio Features mit verschiedenen Ansätzen
  async getAudioFeaturesAlternative(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds]
    
    console.log('🔄 Trying alternative Audio Features approach...')
    
    try {
      // Versuche Batch-Aufruf
      const batchResult = await this.request(`/audio-features?ids=${ids.join(',')}`)
      console.log('✅ Batch Audio Features successful')
      return batchResult
    } catch (error) {
      if (error.message.includes('403')) {
        console.log('❌ Batch failed, trying individual calls...')
        
        // Fallback: Einzelne Aufrufe
        const individualResults = []
        for (const id of ids) {
          try {
            const result = await this.request(`/audio-features/${id}`)
            individualResults.push(result)
            console.log(`✅ Individual call for ${id} successful`)
          } catch (individualError) {
            console.log(`❌ Individual call for ${id} failed`)
            individualResults.push(null)
          }
        }
        
        return { audio_features: individualResults }
      } else {
        throw error
      }
    }
  }

  // Einzelne Audio Features für einen Track
  async getTrackAudioFeatures(trackId) {
    return this.request(`/audio-features/${trackId}`)
  }

  // ===== TRACK DETAILS FUNKTIONEN =====

  // Track Details als Audio Features Backup
  async getTrackDetails(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds : [trackIds]
    
    try {
      const result = await this.request(`/tracks?ids=${ids.join(',')}`)
      console.log('🎵 Track details loaded as backup')
      return result
    } catch (error) {
      console.error('❌ Track details also failed:', error)
      return null
    }
  }

  // Einzelnen Track laden
  async getTrack(trackId) {
    return this.request(`/tracks/${trackId}`)
  }

  // Mehrere Tracks laden
  async getMultipleTracks(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds
    return this.request(`/tracks?ids=${ids}`)
  }

  // ===== USER FUNKTIONEN =====

  // User's Top Tracks laden
  async getUserTopTracks(limit = 20, timeRange = 'medium_term') {
    return this.request(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`)
  }

  // User's Top Artists laden
  async getUserTopArtists(limit = 20, timeRange = 'medium_term') {
    return this.request(`/me/top/artists?limit=${limit}&time_range=${timeRange}`)
  }

  // User's Saved Tracks laden
  async getSavedTracks(limit = 50) {
    return this.request(`/me/tracks?limit=${limit}`)
  }

  // User's Recently Played Tracks
  async getRecentlyPlayed(limit = 50) {
    return this.request(`/me/player/recently-played?limit=${limit}`)
  }

  // User Profile
  async getUserProfile() {
    return this.request('/me')
  }

  // ===== SEARCH FUNKTIONEN =====

  // Search für Tracks
  async searchTracks(query, limit = 20) {
    const encodedQuery = encodeURIComponent(query)
    return this.request(`/search?q=${encodedQuery}&type=track&limit=${limit}`)
  }

  // Search für Alben
  async searchAlbums(query, limit = 20) {
    const encodedQuery = encodeURIComponent(query)
    return this.request(`/search?q=${encodedQuery}&type=album&limit=${limit}`)
  }

  // Universal Search (Tracks, Artists, Albums)
  async searchAll(query, limit = 10) {
    const encodedQuery = encodeURIComponent(query)
    return this.request(`/search?q=${encodedQuery}&type=track,artist,album&limit=${limit}`)
  }

  // ===== PLAYLIST FUNKTIONEN =====

  // User's Playlists
  async getUserPlaylists(limit = 50) {
    return this.request(`/me/playlists?limit=${limit}`)
  }

  // Playlist Tracks
  async getPlaylistTracks(playlistId, limit = 100) {
    return this.request(`/playlists/${playlistId}/tracks?limit=${limit}`)
  }

  // ===== GENRE & RECOMMENDATIONS =====

  // Available Genre Seeds
  async getGenreSeeds() {
    return this.request('/recommendations/available-genre-seeds')
  }

  // Recommendations basierend auf Seeds
  async getRecommendations(options = {}) {
    const params = new URLSearchParams()
    
    // Seeds
    if (options.seed_artists) params.append('seed_artists', options.seed_artists.join(','))
    if (options.seed_tracks) params.append('seed_tracks', options.seed_tracks.join(','))
    if (options.seed_genres) params.append('seed_genres', options.seed_genres.join(','))
    
    // Audio Features Targets
    if (options.target_energy) params.append('target_energy', options.target_energy)
    if (options.target_danceability) params.append('target_danceability', options.target_danceability)
    if (options.target_tempo) params.append('target_tempo', options.target_tempo)
    if (options.target_valence) params.append('target_valence', options.target_valence)
    
    // Min/Max Values
    if (options.min_energy) params.append('min_energy', options.min_energy)
    if (options.max_energy) params.append('max_energy', options.max_energy)
    if (options.min_tempo) params.append('min_tempo', options.min_tempo)
    if (options.max_tempo) params.append('max_tempo', options.max_tempo)
    
    // Limit
    params.append('limit', options.limit || 20)
    
    return this.request(`/recommendations?${params.toString()}`)
  }

  // ===== ANALYZE FUNKTIONEN =====

  // Track Audio Analysis (sehr detailliert)
  async getTrackAnalysis(trackId) {
    return this.request(`/audio-analysis/${trackId}`)
  }

  // ===== UTILITY FUNKTIONEN =====

  // Batch-Verarbeitung mit Rate Limiting
  async batchRequest(items, batchSize = 50, requestFunction) {
    const results = []
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize)
      
      try {
        const batchResult = await requestFunction(batch)
        results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]))
        
        // Rate limiting - warte kurz zwischen Batches
        if (i + batchSize < items.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`Batch request failed for items ${i}-${i + batchSize}:`, error)
        // Füge null-Werte für fehlgeschlagene Batches hinzu
        results.push(...new Array(batch.length).fill(null))
      }
    }
    
    return results
  }

  // Audio Features für große Track-Listen
  async getAudioFeaturesLarge(trackIds) {
    if (trackIds.length <= 100) {
      return this.getAudioFeatures(trackIds)
    }
    
    console.log(`🔄 Processing ${trackIds.length} tracks in batches...`)
    
    const batchResults = await this.batchRequest(
      trackIds,
      100,
      (batch) => this.getAudioFeatures(batch)
    )
    
    return {
      audio_features: batchResults.flatMap(result => 
        result ? (result.audio_features || [result]) : null
      )
    }
  }

  // ===== DEBUG & TEST FUNKTIONEN =====

  // Token-Berechtigung testen
  async testTokenPermissions() {
    const tests = {
      basic: false,
      tracks: false,
      audioFeatures: false,
      userProfile: false,
      playlists: false
    }
    
    try {
      // Basic Test
      await this.request('/me')
      tests.basic = true
      console.log('✅ Basic API access working')
      
      // Track Access Test
      await this.request('/tracks/4iV5W9uYEdYUVa79Axb7Rh')
      tests.tracks = true
      console.log('✅ Track access working')
      
      // Audio Features Test
      await this.request('/audio-features/4iV5W9uYEdYUVa79Axb7Rh')
      tests.audioFeatures = true
      console.log('✅ Audio Features access working')
      
      // User Profile Test
      await this.request('/me')
      tests.userProfile = true
      console.log('✅ User profile access working')
      
      // Playlists Test
      await this.request('/me/playlists?limit=1')
      tests.playlists = true
      console.log('✅ Playlists access working')
      
    } catch (error) {
      console.log('❌ Some API permissions missing:', error.message)
    }
    
    return tests
  }

  // API Status Check
  async getApiStatus() {
    try {
      const start = Date.now()
      await this.request('/me')
      const responseTime = Date.now() - start
      
      return {
        status: 'connected',
        responseTime: responseTime,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

// ===== STATIC UTILITY FUNKTIONEN =====

// Spotify URI Helper
export const SpotifyUtils = {
  // Extract ID from Spotify URI/URL
  extractId: (spotifyUriOrUrl) => {
    const match = spotifyUriOrUrl.match(/(?:track|album|artist|playlist)[:/]([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  },
  
  // Create Spotify URL from ID and type
  createUrl: (id, type = 'track') => {
    return `https://open.spotify.com/${type}/${id}`
  },
  
  // Format duration from ms to mm:ss
  formatDuration: (durationMs) => {
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  },
  
  // Get image by size preference
  getImage: (images, preferredSize = 'medium') => {
    if (!images || images.length === 0) return null
    
    const sizeMap = {
      large: 0,
      medium: 1,
      small: 2
    }
    
    return images[sizeMap[preferredSize]] || images[0]
  },
  
  // Audio Features to Energy Score (0-10)
  audioFeaturesToEnergy: (audioFeatures) => {
    if (!audioFeatures) return 5
    
    const energy = audioFeatures.energy || 0.5
    const danceability = audioFeatures.danceability || 0.5
    const tempo = audioFeatures.tempo || 120
    const valence = audioFeatures.valence || 0.5
    
    let score = 0
    score += energy * 40
    score += danceability * 25
    score += Math.min(tempo / 140, 1) * 20
    score += valence * 10
    score += Math.min(Math.max((audioFeatures.loudness + 60) / 60, 0), 1) * 5
    
    return Math.min(Math.max(Math.round(score / 10), 1), 10)
  }
}

// Default Export
export default SpotifyAPI