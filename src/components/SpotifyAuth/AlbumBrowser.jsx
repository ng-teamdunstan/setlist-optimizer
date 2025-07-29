// src/components/SpotifyAuth/AlbumBrowser.jsx
import { useState, useEffect } from 'react'
import { SpotifyAPI } from '../../utils/spotifyAPI'
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth'

function AlbumBrowser({ selectedArtist, onSongsSelect }) {
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTracks, setSelectedTracks] = useState([])
  const [expandedAlbum, setExpandedAlbum] = useState(null)
  const [albumTracks, setAlbumTracks] = useState({})
  const { accessToken } = useSpotifyAuth()

  // Alben beim Mount laden
  useEffect(() => {
    if (selectedArtist && accessToken) {
      loadArtistAlbums()
    }
  }, [selectedArtist, accessToken])

  const loadArtistAlbums = async () => {
    setLoading(true)
    try {
      const spotifyAPI = new SpotifyAPI(accessToken)
      const albumsData = await spotifyAPI.getArtistAlbums(selectedArtist.id, 50)
      
      // Duplikate entfernen (gleiche Alben in verschiedenen Märkten)
      const uniqueAlbums = albumsData.items.filter((album, index, self) => 
        index === self.findIndex(a => a.name.toLowerCase() === album.name.toLowerCase())
      )
      
      setAlbums(uniqueAlbums)
      console.log('Loaded albums:', uniqueAlbums)
    } catch (error) {
      console.error('Error loading albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAlbumTracks = async (albumId) => {
    if (albumTracks[albumId]) return // Schon geladen
    
    try {
      const spotifyAPI = new SpotifyAPI(accessToken)
      const tracksData = await spotifyAPI.getAlbumTracks(albumId, 50)
      
      setAlbumTracks(prev => ({
        ...prev,
        [albumId]: tracksData.items
      }))
      console.log('Loaded tracks for album:', albumId, tracksData.items)
    } catch (error) {
      console.error('Error loading album tracks:', error)
    }
  }

  const toggleAlbum = async (albumId) => {
    if (expandedAlbum === albumId) {
      setExpandedAlbum(null)
    } else {
      setExpandedAlbum(albumId)
      await loadAlbumTracks(albumId)
    }
  }

  const toggleTrackSelection = (track, album) => {
    const trackWithAlbum = {
      ...track,
      album: {
        id: album.id,
        name: album.name,
        images: album.images,
        release_date: album.release_date
      },
      artists: [selectedArtist] // Ensure artist info is included
    }

    const isSelected = selectedTracks.find(t => t.id === track.id)
    
    if (isSelected) {
      setSelectedTracks(prev => prev.filter(t => t.id !== track.id))
    } else {
      setSelectedTracks(prev => [...prev, trackWithAlbum])
    }
  }

  // MEHRSTUFIGE SETLIST-ERSTELLUNG mit verschiedenen Fallback-Strategien
  // KOMPLETTE NEUE handleCreateSetlist Funktion - ersetze die alte!
const handleCreateSetlist = async () => {
  // === VERSION MARKER ===
  console.log('🚀🚀🚀 NEW VERSION DEPLOYED: AlbumBrowser v2.0 🚀🚀🚀')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  if (selectedTracks.length === 0) return
  
  console.log('🚀 === STARTING SETLIST CREATION ===')
  console.log('📝 Selected tracks:', selectedTracks.length)
  
  const spotifyAPI = new SpotifyAPI(accessToken)
  const trackIds = selectedTracks.map(track => track.id)
  
  console.log('🎵 Track IDs to fetch:', trackIds)
  
  // Strategie 4: Intelligenter Fallback (springe direkt dahin wegen 403-Fehler)
  console.log('🧠 Strategy 4: Intelligent Fallback Algorithm...')
  console.log('🎵 Analyzing track names, durations, and metadata...')
  
  const tracksWithSmartEnergy = selectedTracks.map(track => {
    let energy = 5 // Base energy
    
    const name = track.name.toLowerCase()
    console.log(`🔍 Analyzing "${track.name}":`)
    
    // High-Energy Keywords
    if (name.includes('dance') || name.includes('party') || name.includes('energy') || 
        name.includes('fire') || name.includes('power') || name.includes('rock') ||
        name.includes('wild') || name.includes('loud') || name.includes('beat') ||
        name.includes('pump') || name.includes('drop') || name.includes('bass')) {
      energy += 3
      console.log(`  ⚡ High-energy keywords found: +3 energy`)
    }
    
    // Low-Energy Keywords  
    if (name.includes('slow') || name.includes('soft') || name.includes('calm') ||
        name.includes('acoustic') || name.includes('ballad') || name.includes('quiet') ||
        name.includes('sad') || name.includes('lonely') || name.includes('goodbye')) {
      energy -= 2
      console.log(`  🌙 Low-energy keywords found: -2 energy`)
    }
    
    // Duration analysis
    const durationMinutes = track.duration_ms / 60000
    if (durationMinutes < 2.5) {
      energy += 1
      console.log(`  ⏱️ Short duration (${durationMinutes.toFixed(1)}min): +1 energy`)
    } else if (durationMinutes > 5) {
      energy -= 1
      console.log(`  ⏱️ Long duration (${durationMinutes.toFixed(1)}min): -1 energy`)
    }
    
    // Popularity analysis
    if (track.popularity > 70) {
      energy += 1
      console.log(`  🔥 High popularity (${track.popularity}%): +1 energy`)
    } else if (track.popularity < 30) {
      energy -= 0.5
      console.log(`  📉 Low popularity (${track.popularity}%): -0.5 energy`)
    }
    
    // Track position (opener is often strong)
    if (track.track_number === 1) {
      energy += 0.5
      console.log(`  🚀 Track #1 (opener): +0.5 energy`)
    }
    
    // Explicit content often more intense
    if (track.explicit) {
      energy += 0.5
      console.log(`  🅴 Explicit content: +0.5 energy`)
    }
    
    energy = Math.min(Math.max(Math.round(energy), 1), 10)
    console.log(`  🎯 Final energy for "${track.name}": ${energy}/10`)
    
    return {
      ...track,
      duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
      energy: energy,
      spotifyData: {
        popularity: track.popularity,
        audioFeatures: null,
        album: track.album,
        artists: track.artists,
        energySource: 'intelligent_fallback'
      }
    }
  })
  
  console.log('🎉 SMART FALLBACK COMPLETE - Energy Summary:')
  tracksWithSmartEnergy.forEach((track, i) => {
    console.log(`${i + 1}. "${track.name}" - ${track.energy}/10`)
  })
  
  onSongsSelect(tracksWithSmartEnergy)
}

  const processTrackDetails = (tracks, trackDetails) => {
    return tracks.map((track, index) => {
      const details = trackDetails[index]
      let energy = 5
      
      // Use track details for energy estimation
      if (details) {
        // Duration-based
        const durationMinutes = details.duration_ms / 60000
        if (durationMinutes < 2.5) energy += 1
        if (durationMinutes > 5) energy -= 1
        
        // Popularity-based
        if (details.popularity > 80) energy += 2
        else if (details.popularity > 60) energy += 1
        else if (details.popularity < 30) energy -= 1
        
        energy = Math.min(Math.max(energy, 1), 10)
      }
      
      console.log(`🎵 "${track.name}": Track Details Energy = ${energy}/10`)
      
      return {
        ...track,
        duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
        energy: energy,
        spotifyData: {
          popularity: track.popularity,
          audioFeatures: null,
          album: track.album,
          artists: track.artists,
          energySource: 'track_details'
        }
      }
    })
  }

  const createFallbackTrack = (track) => {
    return {
      ...track,
      duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
      energy: 5,
      spotifyData: {
        popularity: track.popularity,
        audioFeatures: null,
        album: track.album,
        artists: track.artists,
        energySource: 'fallback'
      }
    }
  }

  // Loading State
  if (loading) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '48px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ff6b35', fontSize: '3rem', marginBottom: '16px' }}>🎵</div>
        <p style={{ color: '#b0b0b0', margin: 0 }}>
          Lade {selectedArtist.name}'s Alben...
        </p>
      </div>
    )
  }

  // Main Component Render
  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h3 style={{
            color: '#ffffff',
            margin: '0 0 4px 0',
            fontSize: '1.5rem',
            fontWeight: '600'
          }}>
            📀 {selectedArtist.name}'s Releases
          </h3>
          <p style={{
            color: '#b0b0b0',
            margin: 0,
            fontSize: '14px'
          }}>
            {albums.length} Alben gefunden • {selectedTracks.length} Songs ausgewählt
          </p>
        </div>

        {selectedTracks.length > 0 && (
          <button
            onClick={handleCreateSetlist}
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: '#ffffff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.3)'
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0px)'
              e.target.style.boxShadow = 'none'
            }}
          >
            🎯 Setlist erstellen ({selectedTracks.length})
          </button>
        )}
      </div>

      {/* Albums List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {albums.map((album) => (
          <div
            key={album.id}
            style={{
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {/* Album Header */}
            <div
              onClick={() => toggleAlbum(album.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                background: '#2a2a2a',
                cursor: 'pointer',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#323232'}
              onMouseOut={(e) => e.target.style.background = '#2a2a2a'}
            >
              {/* Album Cover */}
              {album.images && album.images[2] ? (
                <img
                  src={album.images[2].url}
                  alt={album.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '8px',
                  background: '#3a3a3a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  💿
                </div>
              )}

              {/* Album Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {album.name}
                </div>
                <div style={{
                  color: '#b0b0b0',
                  fontSize: '14px',
                  display: 'flex',
                  gap: '16px'
                }}>
                  <span>📅 {new Date(album.release_date).getFullYear()}</span>
                  <span>🎵 {album.total_tracks} Tracks</span>
                  <span style={{
                    background: album.album_type === 'album' ? '#ff6b35' : '#666',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {album.album_type}
                  </span>
                </div>
              </div>

              {/* Expand Icon */}
              <div style={{
                color: '#ff6b35',
                fontSize: '20px',
                transform: expandedAlbum === album.id ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▶
              </div>
            </div>

            {/* Album Tracks */}
            {expandedAlbum === album.id && albumTracks[album.id] && (
              <div style={{ background: '#1a1a1a' }}>
                {albumTracks[album.id].map((track) => {
                  const isSelected = selectedTracks.find(t => t.id === track.id)
                  
                  return (
                    <div
                      key={track.id}
                      onClick={() => toggleTrackSelection(track, album)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        padding: '12px 16px',
                        borderTop: '1px solid #2a2a2a',
                        cursor: 'pointer',
                        background: isSelected ? '#2a2a2a' : 'transparent',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        if (!isSelected) e.target.style.background = '#222'
                      }}
                      onMouseOut={(e) => {
                        if (!isSelected) e.target.style.background = 'transparent'
                      }}
                    >
                      {/* Track Number */}
                      <div style={{
                        width: '24px',
                        textAlign: 'center',
                        color: '#b0b0b0',
                        fontSize: '14px'
                      }}>
                        {track.track_number}
                      </div>

                      {/* Checkbox */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: '2px solid ' + (isSelected ? '#ff6b35' : '#3a3a3a'),
                        background: isSelected ? '#ff6b35' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {isSelected ? '✓' : ''}
                      </div>

                      {/* Track Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          color: '#ffffff',
                          fontSize: '14px',
                          fontWeight: '500',
                          marginBottom: '2px'
                        }}>
                          {track.name}
                        </div>
                        <div style={{
                          color: '#b0b0b0',
                          fontSize: '12px'
                        }}>
                          {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                          {track.explicit && <span> • 🅴</span>}
                          {track.popularity && <span> • {track.popularity}% Pop</span>}
                        </div>
                      </div>

                      {/* Preview Button */}
                      {track.preview_url && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const audio = new Audio(track.preview_url)
                            audio.play()
                          }}
                          style={{
                            background: 'transparent',
                            border: '1px solid #3a3a3a',
                            color: '#ff6b35',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          ▶
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {albums.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#b0b0b0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🤷‍♂️</div>
          <p>Keine Alben gefunden für {selectedArtist.name}</p>
        </div>
      )}
    </div>
  )
}

export default AlbumBrowser