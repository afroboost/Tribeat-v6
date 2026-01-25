import React, { createContext, useContext, ReactNode } from 'react';
import { BeattribeTheme, theme as themeConfig } from '@/config/theme.types';

// Context type
interface ThemeContextType {
  theme: BeattribeTheme;
}

// Create context with default value
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme Provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Inject CSS variables into document
  React.useEffect(() => {
    const root = document.documentElement;
    const { colors, fonts } = themeConfig;

    // Set --bt- CSS variables
    root.style.setProperty('--bt-background', colors.background);
    root.style.setProperty('--bt-primary', colors.primary);
    root.style.setProperty('--bt-secondary', colors.secondary);
    root.style.setProperty('--bt-surface', colors.surface);
    root.style.setProperty('--bt-surface-solid', colors.surfaceSolid);
    root.style.setProperty('--bt-text-primary', colors.text.primary);
    root.style.setProperty('--bt-text-secondary', colors.text.secondary);
    root.style.setProperty('--bt-text-muted', colors.text.muted);
    root.style.setProperty('--bt-gradient-primary', colors.gradient.primary);
    root.style.setProperty('--bt-glow', colors.gradient.glow);
    root.style.setProperty('--bt-font-heading', fonts.heading);
    root.style.setProperty('--bt-font-body', fonts.body);
  }, []);

  const value: ThemeContextType = {
    theme: themeConfig,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export the raw theme for direct access
export { themeConfig as theme };
