// src/App.jsx
import { useState, useEffect } from 'react'
import SongInput from './components/SongInput/SongInput'
import SongList from './components/SetlistDisplay/SongList'
import SetlistResult from './components/SetlistDisplay/SetlistResult'
import SpotifyLogin from './components/SpotifyAuth/SpotifyLogin'
import { generateOptimalSetlist } from './utils/setlistGenerator'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'

function App() {
  const [songs, setSongs] = useState([])
  const [setlistData, setSetlistData] = useState(null)
  const [currentView, setCurrentView] = useState('main')
  const { isAuthenticated } = useSpotifyAuth()

  // Prüfe ob wir auf /callback sind
  useEffect(() => {
    if (window.location.pathname === '/callback') {
      setCurrentView('callback')
    }
  }, [])

  const handleSongAdd = (newSong) => {
    setSongs([...songs, newSong])
    setSetlistData(null)
  }

  const handleGenerateSetlist = () => {
    console.log('Generiere Setlist für', songs.length, 'Songs')
    const result = generateOptimalSetlist(songs)
    setSetlistData(result)
    console.log('Setlist erstellt:', result)
  }

  // Callback-Seite anzeigen
  if (currentView === 'callback') {
    return (
      <div style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#0a0a0a',
        minHeight: '100vh',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{ 
            fontSize: '3rem', 
            marginBottom: '16px',
            color: '#ff6b35'
          }}>
            🎵
          </div>
          <h2 style={{ color: '#ffffff', marginBottom: '16px' }}>
            Spotify Login erfolgreich!
          </h2>
          <p style={{ color: '#b0b0b0', marginBottom: '24px' }}>
            Du wirst automatisch weitergeleitet...
          </p>
          <button
            onClick={() => {
              window.location.href = '/'
            }}
            style={{
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: '#ffffff',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Zurück zur App
          </button>
        </div>
      </div>
    )
  }

  // Normale App
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
        
        {isAuthenticated && (
          <>
            <SongInput onSongAdd={handleSongAdd} />
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