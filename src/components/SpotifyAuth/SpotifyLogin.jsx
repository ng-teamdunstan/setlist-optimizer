// src/components/SpotifyAuth/SpotifyLogin.jsx
import { useSpotifyAuth } from '../../hooks/useSpotifyAuth'

function SpotifyLogin() {
  const { login, logout, user, loading, isAuthenticated } = useSpotifyAuth()

  if (loading) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#ff6b35', marginBottom: '16px' }}>🎵</div>
        <p style={{ color: '#b0b0b0', margin: 0 }}>
          Verbinde mit Spotify...
        </p>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user.images?.[0] && (
            <img 
              src={user.images[0].url} 
              alt={user.display_name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%'
              }}
            />
          )}
          <div>
            <div style={{ 
              color: '#ffffff', 
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Verbunden mit Spotify
            </div>
            <div style={{ color: '#b0b0b0', fontSize: '14px' }}>
              {user.display_name} • {user.followers?.total} Follower
            </div>
          </div>
        </div>
        
        <button
          onClick={logout}
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
          Trennen
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '3rem', 
        marginBottom: '16px' 
      }}>
        🎵
      </div>
      
      <h3 style={{
        color: '#ffffff',
        margin: '0 0 12px 0',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Mit Spotify verbinden
      </h3>
      
      <p style={{
        color: '#b0b0b0',
        margin: '0 0 24px 0',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        Lade deine Songs direkt von Spotify und erhalte präzise 
        Audio-Analysen für die perfekte Setlist.
      </p>
      
      <button
        onClick={login}
        style={{
          background: '#1DB954',
          color: '#ffffff',
          padding: '14px 28px',
          border: 'none',
          borderRadius: '24px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          margin: '0 auto',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = '#1ed760'
          e.target.style.transform = 'translateY(-1px)'
        }}
        onMouseOut={(e) => {
          e.target.style.background = '#1DB954'
          e.target.style.transform = 'translateY(0px)'
        }}
      >
        <span>🎵</span>
        Mit Spotify anmelden
      </button>
    </div>
  )
}

export default SpotifyLogin