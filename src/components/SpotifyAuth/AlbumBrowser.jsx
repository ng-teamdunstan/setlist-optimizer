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
// ERWEITERTE DEBUG-VERSION für Audio Features Testing
const handleCreateSetlist = async () => {
  console.log('🚀🚀🚀 AUDIO FEATURES DEBUG SESSION 🚀🚀🚀')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  if (selectedTracks.length === 0) return
  
  console.log('📝 Selected tracks count:', selectedTracks.length)
  console.log('🎵 Selected tracks:', selectedTracks.map(t => t.name))
  
  const spotifyAPI = new SpotifyAPI(accessToken)
  const trackIds = selectedTracks.map(track => track.id)
  
  console.log('🔑 Track IDs:', trackIds)
  console.log('🔐 Access Token (first 20 chars):', accessToken.substring(0, 20) + '...')

  // === STRATEGIE 1: Einzelner Track Test ===
  console.log('\n🔬 === STRATEGY 1: Single Track Audio Features ===')
  try {
    const testTrackId = trackIds[0]
    console.log('🎵 Testing single track ID:', testTrackId)
    
    const singleAudioFeatures = await spotifyAPI.getTrackAudioFeatures(testTrackId)
    console.log('✅ SINGLE TRACK SUCCESS! Audio Features:', singleAudioFeatures)
    
    if (singleAudioFeatures && singleAudioFeatures.energy !== undefined) {
      console.log('🎯 Energy detected:', singleAudioFeatures.energy)
      console.log('💃 Danceability:', singleAudioFeatures.danceability)
      console.log('🥁 Tempo:', singleAudioFeatures.tempo)
      console.log('😊 Valence:', singleAudioFeatures.valence)
      
      // Wenn einzeln funktioniert, teste alle
      console.log('\n🔄 Single track works! Trying batch request...')
      
      try {
        const batchAudioFeatures = await spotifyAPI.getAudioFeatures(trackIds)
        console.log('✅ BATCH REQUEST SUCCESS!', batchAudioFeatures)
        
        if (batchAudioFeatures && batchAudioFeatures.audio_features) {
          console.log('🎉 USING REAL SPOTIFY AUDIO FEATURES!')
          const tracksWithSpotifyFeatures = processSpotifyAudioFeatures(selectedTracks, batchAudioFeatures.audio_features)
          onSongsSelect(tracksWithSpotifyFeatures)
          return
        }
      } catch (batchError) {
        console.log('❌ Batch request failed:', batchError.message)
        console.log('🔄 Trying individual requests for all tracks...')
        
        // Individual requests for all tracks
        const individualResults = []
        for (let i = 0; i < trackIds.length; i++) {
          try {
            const trackFeatures = await spotifyAPI.getTrackAudioFeatures(trackIds[i])
            individualResults.push(trackFeatures)
            console.log(`✅ Track ${i+1}/${trackIds.length} success:`, selectedTracks[i].name)
          } catch (individualError) {
            console.log(`❌ Track ${i+1}/${trackIds.length} failed:`, individualError.message)
            individualResults.push(null)
          }
          
          // Rate limiting - warte zwischen Requests
          if (i < trackIds.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
        
        console.log('🔄 Individual results:', individualResults)
        if (individualResults.some(result => result !== null)) {
          console.log('🎉 USING INDIVIDUAL SPOTIFY AUDIO FEATURES!')
          const tracksWithSpotifyFeatures = processSpotifyAudioFeatures(selectedTracks, individualResults)
          onSongsSelect(tracksWithSpotifyFeatures)
          return
        }
      }
    }
  } catch (singleError) {
    console.log('❌ STRATEGY 1 FAILED - Single track error:', singleError.message)
    console.log('📊 Error details:', singleError)
  }

  // === STRATEGIE 2: Alternative API Endpoints ===
  console.log('\n🔬 === STRATEGY 2: Alternative API Endpoints ===')
  try {
    // Teste Track Details zuerst
    console.log('🎵 Testing track details endpoint...')
    const trackDetails = await spotifyAPI.getTrackDetails(trackIds)
    console.log('✅ Track details success:', trackDetails)
    
    if (trackDetails && trackDetails.tracks) {
      console.log('🎯 Using track details for energy estimation...')
      const tracksWithTrackDetails = processTrackDetails(selectedTracks, trackDetails.tracks)
      onSongsSelect(tracksWithTrackDetails)
      return
    }
  } catch (trackDetailsError) {
    console.log('❌ STRATEGY 2 FAILED - Track details error:', trackDetailsError.message)
  }

  // === STRATEGIE 3: Token Permission Check ===
  console.log('\n🔬 === STRATEGY 3: Token Permission Analysis ===')
  try {
    console.log('🔐 Testing current token permissions...')
    
    // Test basic API access
    const userProfile = await spotifyAPI.getUserProfile()
    console.log('✅ User profile access: OK')
    
    // Test track access
    const singleTrack = await spotifyAPI.getTrack(trackIds[0])
    console.log('✅ Single track access: OK')
    
    // Test audio features with different approach
    console.log('🔄 Testing audio features with manual fetch...')
    const manualResponse = await fetch(`https://api.spotify.com/v1/audio-features/${trackIds[0]}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('📊 Manual fetch response status:', manualResponse.status)
    console.log('📊 Manual fetch response headers:', [...manualResponse.headers.entries()])
    
    if (manualResponse.ok) {
      const manualData = await manualResponse.json()
      console.log('✅ MANUAL FETCH SUCCESS!', manualData)
      
      // If manual works, try all tracks manually
      const manualResults = []
      for (const trackId of trackIds) {
        try {
          const trackResponse = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (trackResponse.ok) {
            const trackData = await trackResponse.json()
            manualResults.push(trackData)
          } else {
            console.log(`❌ Manual track ${trackId} failed:`, trackResponse.status)
            manualResults.push(null)
          }
        } catch (manualError) {
          console.log(`❌ Manual track ${trackId} error:`, manualError.message)
          manualResults.push(null)
        }
        
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      if (manualResults.some(result => result !== null)) {
        console.log('🎉 USING MANUAL SPOTIFY AUDIO FEATURES!')
        const tracksWithManualFeatures = processSpotifyAudioFeatures(selectedTracks, manualResults)
        onSongsSelect(tracksWithManualFeatures)
        return
      }
    } else {
      const errorText = await manualResponse.text()
      console.log('❌ Manual fetch failed:', manualResponse.status, errorText)
    }
    
  } catch (permissionError) {
    console.log('❌ STRATEGY 3 FAILED - Permission error:', permissionError.message)
  }

  // === FALLBACK: Intelligent Algorithm ===
  console.log('\n🧠 === FALLBACK: Intelligent Algorithm ===')
  console.log('📝 All Spotify strategies failed, using intelligent fallback...')
  
  const tracksWithSmartEnergy = selectedTracks.map(track => {
    let energy = 5
    const name = track.name.toLowerCase()
    
    console.log(`🔍 Analyzing "${track.name}":`)
    
    // Keywords
    if (name.includes('dance') || name.includes('party') || name.includes('energy') || 
        name.includes('fire') || name.includes('power') || name.includes('rock') ||
        name.includes('wild') || name.includes('loud') || name.includes('beat')) {
      energy += 3
      console.log(`  ⚡ High-energy keywords: +3`)
    }
    
    if (name.includes('slow') || name.includes('soft') || name.includes('calm') ||
        name.includes('acoustic') || name.includes('ballad') || name.includes('quiet')) {
      energy -= 2
      console.log(`  🌙 Low-energy keywords: -2`)
    }
    
    // Duration
    const durationMinutes = track.duration_ms / 60000
    if (durationMinutes < 2.5) {
      energy += 1
      console.log(`  ⏱️ Short duration: +1`)
    } else if (durationMinutes > 5) {
      energy -= 1
      console.log(`  ⏱️ Long duration: -1`)
    }
    
    // Popularity
    if (track.popularity > 70) {
      energy += 1
      console.log(`  🔥 High popularity: +1`)
    }
    
    // Track position
    if (track.track_number === 1) {
      energy += 0.5
      console.log(`  🚀 Album opener: +0.5`)
    }
    
    energy = Math.min(Math.max(Math.round(energy), 1), 10)
    console.log(`  🎯 Final energy: ${energy}/10`)
    
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
  
  console.log('🎉 Fallback complete - using intelligent energy values')
  onSongsSelect(tracksWithSmartEnergy)
}

// Hilfsfunktionen hinzufügen (falls nicht vorhanden)
const processSpotifyAudioFeatures = (tracks, audioFeatures) => {
  console.log('🎛️ Processing Spotify Audio Features...')
  
  return tracks.map((track, index) => {
    const features = audioFeatures[index]
    
    if (!features || features.energy === undefined) {
      console.log(`⚠️ No features for "${track.name}", using fallback`)
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
    
    // ECHTE SPOTIFY BERECHNUNG
    const spotifyEnergy = features.energy || 0.5
    const danceability = features.danceability || 0.5
    const tempo = features.tempo || 120
    const valence = features.valence || 0.5
    
    console.log(`🎵 Processing "${track.name}":`, {
      energy: spotifyEnergy,
      danceability: danceability,
      tempo: tempo,
      valence: valence
    })
    
    // Intelligente Kombination der Spotify-Werte
    let energyScore = 0
    energyScore += spotifyEnergy * 4      // Energy 40%
    energyScore += danceability * 3       // Danceability 30%
    energyScore += Math.min(tempo / 140, 1) * 2  // Tempo 20%
    energyScore += valence * 1            // Valence 10%
    
    const finalEnergy = Math.min(Math.max(Math.round(energyScore), 1), 10)
    
    console.log(`✨ "${track.name}" Spotify Energy: ${finalEnergy}/10 (from ${spotifyEnergy} energy, ${danceability} dance, ${tempo} BPM)`)
    
    return {
      ...track,
      duration: `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}`,
      energy: finalEnergy,
      spotifyData: {
        popularity: track.popularity,
        audioFeatures: features,
        album: track.album,
        artists: track.artists,
        energySource: 'spotify_audio_features'
      }
    }
  })
}

const processTrackDetails = (tracks, trackDetails) => {
  console.log('🎵 Processing Track Details...')
  
  return tracks.map((track, index) => {
    const details = trackDetails[index]
    let energy = 5
    
    if (details) {
      // Duration
      const durationMinutes = details.duration_ms / 60000
      if (durationMinutes < 2.5) energy += 1
      if (durationMinutes > 5) energy -= 1
      
      // Popularity
      if (details.popularity > 80) energy += 2
      else if (details.popularity > 60) energy += 1
      else if (details.popularity < 30) energy -= 1
      
      energy = Math.min(Math.max(energy, 1), 10)
    }
    
    console.log(`🎵 "${track.name}" Track Details Energy: ${energy}/10`)
    
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