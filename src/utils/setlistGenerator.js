// src/utils/setlistGenerator.js

// Funktion um Energy-Score zu berechnen
export const calculateEnergyScore = (song) => {
  // Einfache Berechnung: Energy * 10 für 0-100 Skala
  return parseInt(song.energy) * 10
}

// Funktion um optimale Setlist zu erstellen
export const generateOptimalSetlist = (songs, config = {}) => {
  // Standard-Konfiguration
  const defaultConfig = {
    venueType: 'club',
    duration: 60, // Minuten
    energyCurve: [65, 75, 85, 90, 95, 85, 95] // Club-Curve
  }
  
  const finalConfig = { ...defaultConfig, ...config }
  
  // Songs mit Energy-Score erweitern
  const songsWithEnergy = songs.map(song => ({
    ...song,
    energyScore: calculateEnergyScore(song)
  }))
  
  // Songs nach Energy sortieren
  const sortedSongs = [...songsWithEnergy].sort((a, b) => b.energyScore - a.energyScore)
  
  // Einfache Setlist-Erstellung (wird später verbessert)
  const setlist = []
  const targetSongCount = Math.min(songs.length, 7) // Maximal 7 Songs
  
  // Energy-Curve durchgehen und passende Songs finden
  for (let i = 0; i < targetSongCount; i++) {
    const targetEnergy = finalConfig.energyCurve[i] || 80
    
    // Finde Song mit passender Energy
    let bestMatch = null
    let smallestDiff = 100
    
    for (const song of sortedSongs) {
      if (setlist.find(s => s.id === song.id)) continue // Skip bereits verwendete Songs
      
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
        reasoning: generateReasoning(bestMatch, targetEnergy, i + 1)
      })
    }
  }
  
  return {
    setlist,
    totalSongs: setlist.length,
    averageEnergy: Math.round(setlist.reduce((sum, song) => sum + song.energyScore, 0) / setlist.length),
    energyFlow: setlist.map(song => song.energyScore)
  }
}

// Funktion um Begründung zu generieren
const generateReasoning = (song, targetEnergy, position) => {
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
  
  if (song.energyScore >= 80) {
    return `Perfekt für ${positionName} - hohe Energy (${song.energyScore}/100) bringt die Crowd zum Toben!`
  } else if (song.energyScore >= 60) {
    return `Gute Wahl für ${positionName} - moderate Energy (${song.energyScore}/100) hält das Momentum.`
  } else {
    return `Ideal für ${positionName} - ruhigere Energy (${song.energyScore}/100) gibt der Crowd eine Verschnaufpause.`
  }
}