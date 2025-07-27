// src/utils/setlistGenerator.js

// Funktion um Spotify Audio Features zu Energy-Score zu konvertieren
export const calculateSpotifyEnergyScore = (song) => {
  // Wenn wir Spotify Audio Features haben
  if (song.spotifyData?.audioFeatures) {
    const features = song.spotifyData.audioFeatures
    
    // Spotify Audio Features (alle 0-1 Skala außer tempo)
    const energy = features.energy || 0.5          // Energie/Intensität
    const danceability = features.danceability || 0.5  // Tanzbarkeit
    const valence = features.valence || 0.5        // Musikalische Positivität
    const tempo = features.tempo || 120            // BPM
    const loudness = features.loudness || -10      // dB (meist -60 bis 0)
    
    // Konvertiere zu Live-Performance Score (0-100)
    let liveScore = 0
    
    // Energy ist der wichtigste Faktor (40%)
    liveScore += energy * 40
    
    // Danceability für Live-Performance (25%)
    liveScore += danceability * 25
    
    // Tempo-Bonus für Live-Shows (20%)
    const tempoScore = Math.min(tempo / 140, 1) // Normalisiert auf 140 BPM = 1.0
    liveScore += tempoScore * 20
    
    // Valence für Crowd-Reaktion (10%)
    liveScore += valence * 10
    
    // Loudness-Bonus (5%) - lautere Songs sind oft energetischer live
    const loudnessScore = Math.min(Math.max((loudness + 60) / 60, 0), 1) // -60dB bis 0dB
    liveScore += loudnessScore * 5
    
    // Runde und begrenze auf 1-10 Skala
    return Math.min(Math.max(Math.round(liveScore / 10), 1), 10)
  }
  
  // Fallback für manuell eingegebene Songs
  return parseInt(song.energy) || 5
}

// Konvertiere Energy-Score für Generator (1-10 zu 0-100)
export const calculateEnergyScore = (song) => {
  const baseEnergy = song.energy || calculateSpotifyEnergyScore(song)
  return parseInt(baseEnergy) * 10
}

// Hauptfunktion: Optimierte Setlist generieren
export const generateOptimalSetlist = (songs, config = {}) => {
  console.log('🎯 Generating setlist for songs:', songs)
  
  const defaultConfig = {
    venueType: 'club',
    duration: 60,
    // Energy-Curve für Live-Performance (0-100 Skala)
    energyCurve: [65, 75, 85, 90, 95, 85, 95] // Opener, Build, Peak, Sustain, Peak, Pre-End, Finale
  }
  
  const finalConfig = { ...defaultConfig, ...config }
  
  // Songs mit Energy-Scores anreichern
  const songsWithEnergy = songs.map(song => {
    const energyScore = calculateEnergyScore(song)
    const displayEnergy = song.energy || calculateSpotifyEnergyScore(song)
    
    console.log(`📊 Song "${song.title}": Energy ${displayEnergy}/10 (Score: ${energyScore})`)
    
    return {
      ...song,
      energyScore: energyScore,
      displayEnergy: displayEnergy,
      // Zusätzliche Spotify-Metriken für besseres Reasoning
      spotifyMetrics: song.spotifyData?.audioFeatures ? {
        tempo: Math.round(song.spotifyData.audioFeatures.tempo),
        danceability: Math.round(song.spotifyData.audioFeatures.danceability * 100),
        valence: Math.round(song.spotifyData.audioFeatures.valence * 100),
        energy: Math.round(song.spotifyData.audioFeatures.energy * 100),
        popularity: song.spotifyData.popularity || 0
      } : null
    }
  })
  
  console.log('🎵 Songs with energy scores:', songsWithEnergy)
  
  // Songs nach Energy sortieren (höchste zuerst)
  const sortedSongs = [...songsWithEnergy].sort((a, b) => b.energyScore - a.energyScore)
  
  const setlist = []
  const targetSongCount = Math.min(songs.length, finalConfig.energyCurve.length)
  
  console.log(`🎯 Creating setlist with ${targetSongCount} songs`)
  
  // Energy-Curve durchgehen und passende Songs finden
  for (let i = 0; i < targetSongCount; i++) {
    const targetEnergy = finalConfig.energyCurve[i] || 80
    
    let bestMatch = null
    let smallestDiff = 100
    
    // Finde den Song, der am besten zur gewünschten Energy passt
    for (const song of sortedSongs) {
      // Skip bereits verwendete Songs
      if (setlist.find(s => s.id === song.id)) continue
      
      const energyDiff = Math.abs(song.energyScore - targetEnergy)
      if (energyDiff < smallestDiff) {
        smallestDiff = energyDiff
        bestMatch = song
      }
    }
    
    if (bestMatch) {
      const setlistSong = {
        ...bestMatch,
        position: i + 1,
        targetEnergy: targetEnergy,
        reasoning: generateReasoning(bestMatch, targetEnergy, i + 1, finalConfig.venueType)
      }
      
      setlist.push(setlistSong)
      console.log(`✅ Position ${i + 1}: "${bestMatch.title}" (Energy: ${bestMatch.displayEnergy}/10)`)
    }
  }
  
  const result = {
    setlist,
    totalSongs: setlist.length,
    averageEnergy: Math.round(setlist.reduce((sum, song) => sum + song.displayEnergy, 0) / setlist.length),
    energyFlow: setlist.map(song => song.displayEnergy),
    spotifyEnhanced: setlist.some(song => song.spotifyMetrics), // Flag für UI
    venueType: finalConfig.venueType
  }
  
  console.log('🎉 Generated setlist:', result)
  return result
}

// Reasoning-Generator für jeden Song in der Setlist
const generateReasoning = (song, targetEnergy, position, venueType = 'club') => {
  const positionNames = {
    1: 'Opener',
    2: 'Warm-up', 
    3: 'Build-up',
    4: 'Peak Energy',
    5: 'Sustain',
    6: 'Pre-Finale',
    7: 'Finale'
  }
  
  const positionName = positionNames[position] || 'Mid-Set'
  const energy = song.displayEnergy || 5
  
  let reasoning = `${positionName}: `
  
  // Basis-Reasoning nach Energy und Position
  if (position === 1) {
    reasoning += `Starker Einstieg mit ${energy}/10 Energy - zieht das Publikum sofort rein!`
  } else if (position <= 3) {
    reasoning += `Aufbau-Phase mit ${energy}/10 Energy - steigert die Spannung kontinuierlich.`
  } else if (position === 4 || position === 5) {
    reasoning += `Peak-Moment mit ${energy}/10 Energy - Maximum Impact für die Crowd!`
  } else if (position === 6) {
    reasoning += `Pre-Finale mit ${energy}/10 Energy - bereitet das große Ende vor.`
  } else {
    reasoning += `Grandioses Finale mit ${energy}/10 Energy - unvergesslicher Abschluss!`
  }
  
  // Erweiterte Spotify-Insights hinzufügen
  if (song.spotifyMetrics) {
    const metrics = song.spotifyMetrics
    
    // Popularity-Bonus
    if (metrics.popularity > 70) {
      reasoning += ` Hit-Song (${metrics.popularity}% Popularität) - Publikum wird mitsingen!`
    } else if (metrics.popularity > 40) {
      reasoning += ` Bekannter Track (${metrics.popularity}% Popularität) - gute Crowd-Reaktion erwartet.`
    }
    
    // Danceability-Faktor
    if (metrics.danceability > 75) {
      reasoning += ` Extrem tanzbar (${metrics.danceability}%) - bringt alle zum Tanzen!`
    } else if (metrics.danceability > 50) {
      reasoning += ` Tanzbar (${metrics.danceability}%) - hält die Bewegung im Publikum aufrecht.`
    }
    
    // Tempo-Insights
    if (metrics.tempo > 140) {
      reasoning += ` High-Tempo (${metrics.tempo} BPM) - pure Energie und Drive!`
    } else if (metrics.tempo < 80) {
      reasoning += ` Langsamerer Groove (${metrics.tempo} BPM) - emotionaler, intensiver Moment.`
    } else if (metrics.tempo >= 120 && metrics.tempo <= 140) {
      reasoning += ` Perfektes Tempo (${metrics.tempo} BPM) - ideal für ${venueType} Setting.`
    }
    
    // Valence (Mood) Factor
    if (metrics.valence > 80) {
      reasoning += ` Super positive Vibes (${metrics.valence}%) - gute Laune garantiert!`
    } else if (metrics.valence < 30) {
      reasoning += ` Emotionaler Track (${metrics.valence}% Valence) - berührt die Herzen.`
    }
  }
  
  // Venue-spezifische Tipps
  if (venueType === 'festival') {
    if (energy >= 8) {
      reasoning += ` Perfect für Festival-Crowd - maximale Energie für große Bühne!`
    }
  } else if (venueType === 'intimate') {
    if (energy <= 6) {
      reasoning += ` Ideal für intimate Venue - schafft persönliche Verbindung.`
    }
  }
  
  return reasoning
}

// Hilfsfunktion: Venue-spezifische Energy-Curves
export const getVenueEnergyProfile = (venueType) => {
  const profiles = {
    club: [65, 75, 85, 90, 95, 85, 95],
    festival: [70, 80, 90, 95, 100, 90, 100],
    intimate: [45, 55, 65, 75, 80, 70, 85],
    theater: [50, 60, 70, 80, 85, 75, 90],
    arena: [75, 85, 90, 95, 100, 95, 100]
  }
  
  return profiles[venueType] || profiles.club
}

// Export für externe Nutzung
export default {
  generateOptimalSetlist,
  calculateSpotifyEnergyScore,
  calculateEnergyScore,
  getVenueEnergyProfile
}