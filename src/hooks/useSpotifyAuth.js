// src/hooks/useSpotifyAuth.js
import { useState, useEffect } from 'react'

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  
  // HIER deine Spotify Client ID einfügen
  const CLIENT_ID = 'DEINE_SPOTIFY_CLIENT_ID_HIER'
  
  // Automatische URL Detection
  const getRedirectUri = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5173/callback'
    } else {
      // Production URL - hier deine echte Vercel URL eintragen
      return `${window.location.origin}/callback`
    }
  }
  
  const REDIRECT_URI = getRedirectUri()
  
  const SCOPES = [
    'user-read-private',
    'user-read-email',
    'user-library-read',
    'user-top-read'
  ].join(' ')

  // Rest bleibt gleich...
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
      
      const response = await fetch('https://accounts.spotify.com/api/to