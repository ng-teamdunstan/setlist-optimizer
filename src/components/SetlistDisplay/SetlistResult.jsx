// src/components/SetlistDisplay/SetlistResult.jsx
function SetlistResult({ setlistData }) {
  if (!setlistData) return null

  const { setlist, totalSongs, averageEnergy } = setlistData

  return (
    <div style={{ 
      background: '#1a1a1a',
      border: '2px solid #ff6b35',
      borderRadius: '12px',
      padding: '32px',
      marginTop: '32px'
    }}>
      <h3 style={{ 
        color: '#ff6b35', 
        margin: '0 0 24px 0',
        fontSize: '1.75rem',
        fontWeight: '700'
      }}>
        Deine optimierte Setlist
      </h3>
      
      {/* Statistiken */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
        padding: '20px',
        background: '#2a2a2a',
        borderRadius: '8px',
        border: '1px solid #3a3a3a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ff6b35',
            marginBottom: '4px'
          }}>
            {totalSongs}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#b0b0b0',
            fontWeight: '500'
          }}>
            SONGS
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ff6b35',
            marginBottom: '4px'
          }}>
            {averageEnergy}
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#b0b0b0',
            fontWeight: '500'
          }}>
            Ø ENERGY
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ff6b35',
            marginBottom: '4px'
          }}>
            CLUB
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#b0b0b0',
            fontWeight: '500'
          }}>
            VENUE
          </div>
        </div>
      </div>

      {/* Setlist */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {setlist.map((song, index) => (
          <div 
            key={song.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '24px',
              background: index % 2 === 0 ? '#2a2a2a' : '#323232',
              borderRadius: '8px',
              border: '1px solid #3a3a3a'
            }}
          >
            {/* Position */}
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              marginRight: '20px',
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {song.position}
            </div>
            
            {/* Song Info */}
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#ffffff',
                fontSize: '18px'
              }}>
                {song.title}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#b0b0b0',
                lineHeight: '1.4'
              }}>
                {song.reasoning}
              </div>
            </div>
            
            {/* Energy Anzeige */}
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
              <div style={{ 
                fontSize: '14px', 
                marginBottom: '8px',
                color: '#e0e0e0'
              }}>
                {song.duration}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '8px'
              }}>
                <div style={{
                  width: '60px',
                  height: '6px',
                  background: '#3a3a3a',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${song.energyScore}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #ff6b35 0%, #f7931e 100%)',
                    borderRadius: '3px'
                  }}></div>
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '700',
                  color: '#ff6b35',
                  minWidth: '35px'
                }}>
                  {song.energyScore}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SetlistResult