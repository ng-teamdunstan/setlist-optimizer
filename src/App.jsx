// src/App.jsx
import { useState } from 'react'
import SongInput from './components/SongInput/SongInput'
import SongList from './components/SetlistDisplay/SongList'
import SetlistResult from './components/SetlistDisplay/SetlistResult'
import SpotifyLogin from './components/SpotifyAuth/SpotifyLogin'
import ArtistSearch from './components/SpotifyAuth/ArtistSearch'
import AlbumBrowser from './components/SpotifyAuth/AlbumBrowser'
import { generateOptimalSetlist } from './utils/setlistGenerator'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'

function App() {
  const [songs, setSongs] = useState([])
  const [setlistData, setSetlistData] = useState(null)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const { isAuthenticated } = useSpotifyAuth()

  const handleSongAdd = (newSong) => {
    setSongs([...songs, newSong])
    setSetlistData(null)
  }

  const handleSpotifySongsSelect = (spotifyTracks) => {
    // Konvertiere Spotify Tracks zu unserem Song Format
    const convertedSongs = spotifyTracks.map(track => ({
      id: track.id,
      title: track.name,
      duration: track.duration,
      energy: track.energy,
      // Spotify-spezifische Daten für bessere Setlist-Generierung
      spotifyData: {
        popularity: track.popularity,
        audioFeatures: track.audioFeatures,
        album: track.album,
        artists: track.artists
      }
    }))
    
    setSongs(convertedSongs)
    setSetlistData(null)
    console.log('Songs from Spotify:', convertedSongs)
  }

  const handleGenerateSetlist = () => {
    console.log('Generiere Setlist für', songs.length, 'Songs')
    const result = generateOptimalSetlist(songs)
    setSetlistData(result)
    console.log('Setlist erstellt:', result)
  }

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist)
    setSongs([]) // Reset songs when new artist selected
    setSetlistData(null) // Reset setlist
    console.log('Artist selected:', artist)
  }

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#0a0a0a',
      minHeight: '100vh',
      color: '#ffffff'
    }}>
      <header style={{ 
        padding: '40px 20px 60px 20px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 16px 0',
          background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Setlist Optimizer
        </h1>
        <p style={{ 
          fontSize: '1.2rem',
          color: '#b0b0b0',
          fontWeight: '400',
          margin: 0,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Erstelle die perfekte Setlist für deine Live-Performances
        </p>
      </header>
      
      <main style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <SpotifyLogin />
        
        {isAuthenticated && !selectedArtist && (
          <ArtistSearch onArtistSelect={handleArtistSelect} />
        )}
        
        {isAuthenticated && selectedArtist && songs.length === 0 && (
          <>
            {/* Selected Artist Info */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {selectedArtist.images?.[2] && (
                <img
                  src={selectedArtist.images[2].url}
                  alt={selectedArtist.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#ffffff', margin: '0 0 4px 0' }}>
                  {selectedArtist.name}
                </h3>
                <p style={{ color: '#b0b0b0', margin: 0, fontSize: '14px' }}>
                  👥 {selectedArtist.followers?.total?.toLocaleString()} Follower
                </p>
              </div>
              <button
                onClick={() => setSelectedArtist(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #3a3a3a',
                  color: '#b0b0b0',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Anderen Artist wählen
              </button>
            </div>

            <AlbumBrowser 
              selectedArtist={selectedArtist} 
              onSongsSelect={handleSpotifySongsSelect}
            />
          </>
        )}
        
        {isAuthenticated && selectedArtist && songs.length > 0 && (
          <>
            {/* Selected Artist Info mit Songs */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '32px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              {selectedArtist.images?.[2] && (
                <img
                  src={selectedArtist.images[2].url}
                  alt={selectedArtist.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%'
                  }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#ffffff', margin: '0 0 4px 0' }}>
                  {selectedArtist.name}
                </h3>
                <p style={{ color: '#b0b0b0', margin: 0, fontSize: '14px' }}>
                  {songs.length} Songs ausgewählt für Setlist
                </p>
              </div>
              <button
                onClick={() => {
                  setSongs([])
                  setSetlistData(null)
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #3a3a3a',
                  color: '#b0b0b0',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  marginRight: '8px'
                }}
              >
                Andere Songs
              </button>
              <button
                onClick={() => setSelectedArtist(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid #3a3a3a',
                  color: '#b0b0b0',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Anderen Artist
              </button>
            </div>

            <SongList songs={songs} onGenerateSetlist={handleGenerateSetlist} />
            {setlistData && <SetlistResult setlistData={setlistData} />}
          </>
        )}
        
        {!isAuthenticated && (
          <div style={{
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: '12px',
            padding: '48px 32px',
            textAlign: 'center',
            color: '#b0b0b0'
          }}>
            <p>Bitte verbinde dich mit Spotify, um deine Songs zu laden und Setlists zu erstellen.</p>
          </div>
        )}
      </main>

      <footer style={{
        textAlign: 'center',
        padding: '60px 20px 40px 20px',
        color: '#666',
        fontSize: '14px'
      }}>
        Powered by Dunstan Media
      </footer>
    </div>
  )
}

export default App