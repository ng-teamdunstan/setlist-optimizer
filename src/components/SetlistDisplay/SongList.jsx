// src/components/SetlistDisplay/SongList.jsx
function SongList({ songs, onGenerateSetlist }) {
  if (songs.length === 0) {
    return (
      <div style={{ 
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '12px',
        padding: '48px 32px',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        <div style={{ 
          fontSize: '4rem', 
          marginBottom: '16px',
          opacity: '0.5'
        }}>🎼</div>
        <h3 style={{ 
          margin: '0 0 8px 0',
          color: '#ffffff',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          Noch keine Songs hinzugefügt
        </h3>
        <p style={{ 
          margin: 0,
          color: '#b0b0b0',
          fontSize: '14px'
        }}>
          Füge mindestens 3 Songs hinzu, um eine Setlist zu erstellen
        </p>
      </div>
    )
  }

  return (
    <div style={{ 
      background: '#1a1a1a',
      border: '1px solid #2a2a2a',
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: '#ffffff',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Deine Songs ({songs.length})
        </h3>
        
        {songs.length >= 3 && (
          <button
            onClick={onGenerateSetlist}
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
            Setlist erstellen
          </button>
        )}
        
        {songs.length > 0 && songs.length < 3 && (
          <div style={{ 
            padding: '12px 24px',
            background: '#2a2a2a',
            borderRadius: '8px',
            color: '#b0b0b0',
            fontSize: '14px',
            border: '1px solid #3a3a3a'
          }}>
            Noch {3 - songs.length} Song{3 - songs.length > 1 ? 's' : ''} benötigt
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {songs.map((song, index) => (
          <div 
            key={song.id} 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              background: '#2a2a2a',
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#323232'
              e.target.style.borderColor = '#4a4a4a'
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#2a2a2a'
              e.target.style.borderColor = '#3a3a3a'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600', 
                fontSize: '16px', 
                marginBottom: '4px',
                color: '#ffffff'
              }}>
                {song.title}
              </div>
              <div style={{ 
                color: '#b0b0b0', 
                fontSize: '14px' 
              }}>
                {song.duration}
              </div>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px' 
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#808080', 
                  marginBottom: '4px' 
                }}>
                  Energy
                </div>
                <div style={{ 
                  fontWeight: '700', 
                  fontSize: '16px',
                  color: '#ff6b35'
                }}>
                  {song.energy}/10
                </div>
              </div>
              <div style={{
                width: '80px',
                height: '6px',
                background: '#3a3a3a',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${song.energy * 10}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
                  borderRadius: '3px',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SongList