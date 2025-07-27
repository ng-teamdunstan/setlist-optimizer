// src/utils/setlistGenerator.js

// Funktion um Spotify Audio Features zu Energy-Score zu konvertieren
export const calculateSpotifyEnergyScore = (song) => {
  // Wenn wir Spotify Audio Features haben
  if (song.spotifyData?.audioFeatures) {
    const features = song.spotifyData.audioFeatures
    
    // Spotify Audio Features (alle 0-1 Skala)
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
    
    // Popularity-Bonus wenn verfügbar
    if (song.spotifyData.popularity) {
      liveScore += (song.spotifyData.popularity / 100) * 5
    }
    
    // Runde und begrenze auf 1-10 Skala
    return Math.min(Math.max(Math.round(liveScore / 10), 1), 10)
  }
  
  // Fallback für manuell eingegebene Songs
  return parseInt(song.energy) || 5
}

// Original calculateEnergyScore für Rückwärtskompatibilität
export const calculateEnergyScore = (song) => {
  if (song.spotifyData) {
    return calculateSpotifyEnergyScore(song) * 10 // Konvertiere zu 0-100 für Generator
  }
  return parseInt(song.energy) * 10
}

// Enhanced Setlist Generator mit Spotify Features
export const generateOptimalSetlist = (songs, config = {}) => {
  const defaultConfig = {
    venueType: 'club',
    duration: 60,
    energyCurve: [65, 75, 85, 90, 95, 85, 95] // Club-Curve
  }
  
  const finalConfig = { ...defaultConfig, ...config }
  
  // Songs mit verbessertem Energy-Score
  const songsWithEnergy = songs.map(song => ({
    ...song,
    energyScore: calculateEnergyScore(song),
    displayEnergy: calculateSpotifyEnergyScore(song), // Für UI-Anzeige (1-10)
    // Zusätzliche Spotify-Metriken für Reasoning
    spotifyMetrics: song.spotifyData?.audioFeatures ? {
      tempo: Math.round(song.spotifyData.audioFeatures.tempo),
      danceability: Math.round(song.spotifyData.audioFeatures.danceability * 100),
      valence: Math.round(song.spotifyData.audioFeatures.valence * 100),
      popularity: song.spotifyData.popularity || 0
    } : null
  }))
  
  // Songs nach Energy sortieren
  const sortedSongs = [...songsWithEnergy].sort((a, b) => b.energyScore - a.energyScore)
  
  const setlist = []
  const targetSongCount = Math.min(songs.length, 7)
  
  // Energy-Curve durchgehen und passende Songs finden
  for (let i = 0; i < targetSongCount; i++) {
    const targetEnergy = finalConfig.energyCurve[i] || 80
    
    let bestMatch = null
    let smallestDiff = 100
    
    for (const song of sortedSongs) {
      if (setlist.find(s => s.id === song.id)) continue
      
      const energyDiff = Math.abs(song.energyScore - targetEnergy)
      if (energyDiff < smallestDiff) {
        smallestDiff = energyDiff
        bestMatch = song
      }
    }
    
    if (bestMatch) {
      setlist.push({
        ...bestMatch,
        position: i + 1,
        targetEnergy: targetEnergy,
        reasoning: generateEnhancedReasoning(bestMatch, targetEnergy, i + 1)
      })
    }
  }
  
  return {
    setlist,
    totalSongs: setlist.length,
    averageEner