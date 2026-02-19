import { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('brian-theme') || 'system')
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('brian-accent') || '#3b82f6')
  const [cardDensity, setCardDensity] = useState(() => localStorage.getItem('brian-density') || 'comfortable')
  const [temperatureUnit, setTemperatureUnit] = useState(() => localStorage.getItem('brian-temp-unit') || 'F')

  // Apply theme
  useEffect(() => {
    localStorage.setItem('brian-theme', theme)
    const root = document.documentElement
    
    if (theme === 'dark') {
      root.classList.add('dark')
    } else if (theme === 'light') {
      root.classList.remove('dark')
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [theme])

  // Apply accent color as CSS variable
  useEffect(() => {
    localStorage.setItem('brian-accent', accentColor)
    document.documentElement.style.setProperty('--accent-color', accentColor)
    
    // Also set it as HSL for Tailwind compatibility
    const hex = accentColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255
    
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }
    
    // Set HSL values for primary color override
    document.documentElement.style.setProperty('--accent-h', `${Math.round(h * 360)}`)
    document.documentElement.style.setProperty('--accent-s', `${Math.round(s * 100)}%`)
    document.documentElement.style.setProperty('--accent-l', `${Math.round(l * 100)}%`)
  }, [accentColor])

  // Save card density
  useEffect(() => {
    localStorage.setItem('brian-density', cardDensity)
  }, [cardDensity])

  // Save temperature unit
  useEffect(() => {
    localStorage.setItem('brian-temp-unit', temperatureUnit)
  }, [temperatureUnit])

  // Get card density classes
  const getCardDensityClasses = () => {
    switch (cardDensity) {
      case 'compact':
        return {
          grid: 'gap-2',
          card: 'p-2',
          cardHeader: 'pb-1',
          cardContent: 'pb-2',
          text: 'text-sm',
          title: 'text-sm',
        }
      case 'spacious':
        return {
          grid: 'gap-6',
          card: 'p-6',
          cardHeader: 'pb-4',
          cardContent: 'pb-4',
          text: 'text-base',
          title: 'text-lg',
        }
      case 'comfortable':
      default:
        return {
          grid: 'gap-4',
          card: 'p-4',
          cardHeader: 'pb-3',
          cardContent: 'pb-3',
          text: 'text-sm',
          title: 'text-base',
        }
    }
  }

  const value = {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    cardDensity,
    setCardDensity,
    getCardDensityClasses,
    temperatureUnit,
    setTemperatureUnit,
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
