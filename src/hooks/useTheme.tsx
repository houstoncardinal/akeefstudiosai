import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemeName = 
  | 'light' 
  | 'dark' 
  | 'cyberpunk' 
  | 'neon' 
  | 'retro' 
  | 'metallic' 
  | 'blackout' 
  | 'diamond' 
  | 'gold' 
  | 'silver'
  | 'emerald'
  | 'rose'
  | 'ocean'
  | 'sunset'
  | 'aurora';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  description: string;
  category: 'classic' | 'creative' | 'luxury' | 'nature';
  preview: string[];
}

export const THEMES: ThemeConfig[] = [
  // Classic
  { id: 'light', name: 'Light', description: 'Clean professional light theme', category: 'classic', preview: ['#ffffff', '#6366f1', '#f1f5f9'] },
  { id: 'dark', name: 'Dark', description: 'Cinema-grade dark interface', category: 'classic', preview: ['#0f0f14', '#a78bfa', '#1e1e28'] },
  // Creative
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon city vibes with magenta & cyan', category: 'creative', preview: ['#0a0a12', '#ff00ff', '#00ffff'] },
  { id: 'neon', name: 'Neon', description: 'Electric glowing accents', category: 'creative', preview: ['#0d0d15', '#39ff14', '#ff073a'] },
  { id: 'retro', name: 'Retro', description: 'Vintage 80s aesthetic', category: 'creative', preview: ['#1a1a2e', '#ff6b6b', '#feca57'] },
  { id: 'aurora', name: 'Aurora', description: 'Northern lights gradient magic', category: 'creative', preview: ['#0f1419', '#00d4aa', '#7c3aed'] },
  // Luxury
  { id: 'metallic', name: 'Metallic', description: 'Brushed metal industrial look', category: 'luxury', preview: ['#1c1c1c', '#a8a8a8', '#4a4a4a'] },
  { id: 'blackout', name: 'Blackout', description: 'Pure black on black elegance', category: 'luxury', preview: ['#000000', '#1a1a1a', '#333333'] },
  { id: 'diamond', name: 'Diamond', description: 'Crystal clear luxury finish', category: 'luxury', preview: ['#f0f8ff', '#b9f2ff', '#e0e7ff'] },
  { id: 'gold', name: 'Gold', description: 'Premium golden accents', category: 'luxury', preview: ['#0f0f0f', '#ffd700', '#b8860b'] },
  { id: 'silver', name: 'Silver', description: 'Platinum professional finish', category: 'luxury', preview: ['#101014', '#c0c0c0', '#808080'] },
  // Nature
  { id: 'emerald', name: 'Emerald', description: 'Lush green forest theme', category: 'nature', preview: ['#0f1610', '#10b981', '#059669'] },
  { id: 'rose', name: 'Rosé', description: 'Elegant pink champagne tones', category: 'nature', preview: ['#1a1214', '#f472b6', '#ec4899'] },
  { id: 'ocean', name: 'Ocean', description: 'Deep sea blue depths', category: 'nature', preview: ['#0a1628', '#0ea5e9', '#0284c7'] },
  { id: 'sunset', name: 'Sunset', description: 'Warm orange twilight glow', category: 'nature', preview: ['#1a0f0a', '#f97316', '#ea580c'] },
];

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('akeef-theme') as ThemeName) || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    THEMES.forEach(t => root.classList.remove(t.id));
    
    // Add current theme
    root.classList.add(theme);
    localStorage.setItem('akeef-theme', theme);
  }, [theme]);

  const themeConfig = THEMES.find(t => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeConfig }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}