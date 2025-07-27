// src/components/SongInput/SongInput.jsx
import { useState } from 'react'

function SongInput({ onSongAdd }) {
  const [songTitle, setSongTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [energy, setEnergy] = useState(5)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (songTitle && duration) {
      const newSong = {
        id: Date.now(),
        title: songTitle,
        duration: duration,
        energy: energy
      }
      
      onSongAdd(newSong)
      
      setSongTitle('')
      setDuration('')
      setEnergy(5)
    }
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
        margin: '0 0 24px 0', 
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: '600'
      }}>
        Song hinzufügen
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#e0e0e0',
            fontSize: '14px'
          }}>
            Song Titel
          </label>
          <input
            type="text"
            value={songTitle}
            onChange={(e) => setSongTitle(e.target.value)}
            placeholder="z.B. Bohemian Rhapsody"
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              fontSize: '16px',
              background: '#2a2a2a',
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
        </div>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            color: '#e0e0e0',
            fontSize: '14px'
          }}>
            Dauer
          </label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="z.B. 3:45"
            style={{ 
              width: '100%', 
              padding: '14px 16px', 
              borderRadius: '8px',
              border: '1px solid #3a3a3a',
              fontSize: '16px',
              background: '#2a2a2a',
              color: '#ffffff',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
            onBlur={(e) => e.target.style.borderColor = '#3a3a3a'}
          />
        </div>
        
        <div style={{ marginBottom: '32px' }}>
          <label style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px', 
            fontWeight: '500',
            color: '#e0e0e0',
            fontSize: '14px'
          }}>
            <span>Energy Level</span>
            <span style={{ 
              color: '#ff6b35', 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              {energy}/10
            </span>
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
            style={{ 
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: '#3a3a3a',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none'
            }}
          />
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            fontSize: '12px', 
            color: '#808080',
            marginTop: '8px'
          }}>
            <span>Chill</span>
            <span>Moderate</span>
            <span>High Energy</span>
          </div>
        </div>
        
        <button 
          type="submit"
          disabled={!songTitle || !duration}
          style={{
            background: songTitle && duration 
              ? 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)' 
              : '#3a3a3a',
            color: songTitle && duration ? '#ffffff' : '#808080',
            padding: '16px 32px',
            border: 'none',
            borderRadius: '8px',
            cursor: songTitle && duration ? 'pointer' : 'not-allowed',
            fontSize: '16px',
            fontWeight: '600',
            width: '100%',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            if (songTitle && duration) {
              e.target.style.transform = 'translateY(-1px)'
              e.target.style.boxShadow = '0 8px 25px rgba(255, 107, 53, 0.3)'
            }
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0px)'
            e.target.style.boxShadow = 'none'
          }}
        >
          Song hinzufügen
        </button>
      </form>
    </div>
  )
}

export default SongInput