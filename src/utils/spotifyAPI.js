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

  // ===== NEUE ARTIST FUNKTIONEN =====
  
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

  // ===== BESTEHENDE FUNKTIONEN =====

  // Audio Features für Tracks laden
  async getAudioFeatures(trackIds) {
    const ids = Array.isArray(trackIds) ? trackIds.join(',') : trackIds
    return this.request(`/audio-features?ids=${ids}`)
  }

  // User's Top Tracks laden
  async getUserTopTracks(limit = 20, timeRange = 'medium_term') {
    return this.request(`/me/top/tracks?limit=${limit}&time_range=${timeRange}`)
  }

  // User's Saved Tracks laden
  async getSavedTracks(limit = 50) {
    return this.request(`/me/tracks?limit=${limit}`)
  }

  // Search für Tracks
  async searchTracks(query, limit = 20) {
    const encodedQuery = encodeURIComponent(query)
    return this.request(`/search?q=${encodedQuery}&type=track&limit=${limit}`)
  }

  // Einzelnen Track laden
  async getTrack(trackId) {
    return this.request(`/tracks/${trackId}`)
  }
}