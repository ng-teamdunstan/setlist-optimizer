// src/components/SpotifyAuth/ArtistSearch.jsx
import { useState } from 'react'
import { SpotifyAPI } from '../../utils/spotifyAPI'
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth'

function ArtistSearch({ onArtistSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const { accessToken } = useSpotifyAuth()

  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!searchQuery.trim() || !accessToken) return
    
    setLoading(true)
    try {
      const spotifyAPI = new SpotifyAPI(accessToken)
      const results = await spotifyAPI.searchArtists(searchQuery, 10)
      
      setSearchResults(results.artists.items || [])
      setHasSearched(true)
      console.log('Artist Search Results:', results.artists.items)
    } catch (error) {
      console.error('Artist search error:', error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleArtistSelect = (artist) => {
    console.log('Selected Artist:', artist)
    onArtistSelect(artist)
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px'
    }}>
      <h3 style={{
        color: '#ffffff',
        margin: '0 0 24px 0',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        🎤 Welcher Artist bist du?
      </h3>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="z.B. Taylor Swift, Ed Sheeran, Billie Eilish..."
            style={{
              flex: 1,
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              fontSize: '16px',
              background: '#2a2a2a',
              color: '#ffffff',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || loading}
            style={{
              background: searchQuery.trim() && !loading 
                ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' 
                : '#3a3a3a',
              color: '#ffffff',
              padding: '14px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: searchQuery.trim() && !loading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              minWidth: '100px'
            }}
          >
            {loading ? '🔍...' : 'Suchen'}
          </button>
        </div>
      </form>

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#b0b0b0'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎵</div>
          <p>Suche nach Artists...</p>
        </div>
      )}

      {/* Search Results */}
      {hasSearched && !loading && (
        <div>
          {searchResults.length > 0 ? (
            <div>
              <h4 style={{
                color: '#e0e0e0',
                margin: '0 0 16px 0',
                fontSize: '1.1rem'
              }}>
                Gefundene Artists ({searchResults.length}):
              </h4>
              
              <div style={{ display: 'grid', gap: '12px' }}>
                {searchResults.map((artist) => (
                  <div
                    key={artist.id}
                    onClick={() => handleArtistSelect(artist)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      background: '#2a2a2a',
                      borderRadius: '8px',
                      border: '1px solid #3a3a3a',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#323232'
                      e.target.style.borderColor = '#ff6b35'
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = '#2a2a2a'
                      e.target.style.borderColor = '#3a3a3a'
                    }}
                  >
                    {/* Artist Image */}
                    {artist.images && artist.images[2] ? (
                      <img
                        src={artist.images[2].url}
                        alt={artist.name}
                        style={{
                          width: '64px',
                          height: '64px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: '#3a3a3a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        🎤
                      </div>
                    )}

                    {/* Artist Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: '#ffffff',
                        fontSize: '18px',
                        fontWeight: '600',
                        marginBottom: '4px'
                      }}>
                        {artist.name}
                      </div>
                      <div style={{
                        color: '#b0b0b0',
                        fontSize: '14px',
                        display: 'flex',
                        gap: '16px'
                      }}>
                        <span>👥 {artist.followers?.total?.toLocaleString() || '0'} Follower</span>
                        <span>🎵 {artist.popularity || 0}/100 Popularität</span>
                      </div>
                      {artist.genres && artist.genres.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}>
                          {artist.genres.slice(0, 3).map((genre, index) => (
                            <span
                              key={index}
                              style={{
                                background: '#ff6b35',
                                color: '#ffffff',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500'
                              }}
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Select Arrow */}
                    <div style={{
                      color: '#ff6b35',
                      fontSize: '24px'
                    }}>
                      →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#b0b0b0'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🤷‍♂️</div>
              <p>Keine Artists gefunden für "{searchQuery}"</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Versuche einen anderen Suchbegriff
              </p>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#b0b0b0'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎤</div>
          <p>Gib deinen Künstlernamen ein, um deine Spotify-Releases zu laden</p>
        </div>
      )}
    </div>
  )
}

export default ArtistSearch