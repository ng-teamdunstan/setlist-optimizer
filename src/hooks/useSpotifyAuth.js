// src/hooks/useSpotifyAuth.js
import { useState, useEffect } from 'react'

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // HIER deine Spotify Client ID einfügen
  const CLIENT_ID = '4cf1301ef9a5476c9c400158a01d17da'
  
  // Automatische URL Detection
const getRedirectUri = () => {
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5173'  // OHNE /callback
  } else {
    return window.location.origin   // OHNE /callback
  }
}
  
  const REDIRECT_URI = getRedirectUri()
  
const SCOPES = [
  'user-read-private',
  'user-read-email', 
  'user-library-read',
  'user-top-read',
  'user-read-recently-played',  // Neu hinzufügen
  'streaming'                   // Neu hinzufügen - für Audio Features
].join(' ')

  const generateCodeVerifier = () => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let text = ''
    for (let i = 0; i < 128; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  const generateCodeChallenge = async (codeVerifier) => {
    const data = new TextEncoder().encode(codeVerifier)
    const digest = await window.crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  const getAuthUrl = async () => {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)
    
    localStorage.setItem('code_verifier', codeVerifier)
    
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: 'code',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
    })
    
    return `https://accounts.spotify.com/authorize?${params}`
  }

  const login = async () => {
    const authUrl = await getAuthUrl()
    window.location.href = authUrl
  }

  const handleCallback = async (code) => {
    setLoading(true)
    try {
      const codeVerifier = localStorage.getItem('code_verifier')
      
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier,
        }),
      })
      
      const data = await response.json()
      
      if (data.access_token) {
        setAccessToken(data.access_token)
        localStorage.setItem('spotify_access_token', data.access_token)
        
        await loadUserProfile(data.access_token)
        
        const url = new URL(window.location)
        url.searchParams.delete('code')
        url.searchParams.delete('state')
        window.history.replaceState({}, document.title, url.pathname)
      }
    } catch (error) {
      console.error('Spotify Auth Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserProfile = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const userData = await response.json()
      setUser(userData)
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const logout = () => {
    setAccessToken(null)
    setUser(null)
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('code_verifier')
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('spotify_access_token')
    if (savedToken) {
      setAccessToken(savedToken)
      loadUserProfile(savedToken)
    }

    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      handleCallback(code)
    }
  }, [])

  return {
    accessToken,
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!accessToken,
    redirectUri: REDIRECT_URI
  }
}

// In useSpotifyAuth.js - füge diese Debug-Funktion hinzu:

const debugTokenScopes = async (token) => {
  try {
    // Checke welche Scopes wir wirklich haben
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      console.log('🔑 Token ist gültig')
      
      // Teste Audio Features direkt
      const testResponse = await fetch('https://api.spotify.com/v1/audio-features/4iV5W9uYEdYUVa79Axb7Rh', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('🎛️ Audio Features Test Status:', testResponse.status)
      if (testResponse.status === 403) {
        console.log('❌ Audio Features NICHT verfügbar (403)')
      } else if (testResponse.ok) {
        console.log('✅ Audio Features verfügbar!')
        const data = await testResponse.json()
        console.log('🎵 Sample Audio Features:', data)
      }
    }
  } catch (error) {
    console.error('Debug Error:', error)
  }
}

// In der loadUserProfile Funktion hinzufügen:
const loadUserProfile = async (token) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const userData = await response.json()
    setUser(userData)
    
    // DEBUG: Teste Token Capabilities
    await debugTokenScopes(token)
    
  } catch (error) {
    console.error('Error loading user profile:', error)
  }
}