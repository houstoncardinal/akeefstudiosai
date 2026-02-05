import { useState, useCallback, useEffect } from 'react';

export interface FeatureUsage {
  featureId: string;
  useCount: number;
  lastUsed: string;
  firstUsed: string;
}

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  showTooltips: boolean;
  tooltipsShown: string[]; // IDs of tooltips already seen
  featureUsage: Record<string, FeatureUsage>;
  preferredStyle: string | null;
  preferredColorGrade: string | null;
  preferredModel: string | null;
  preferredExportFormat: string | null;
  sessionCount: number;
  totalExports: number;
  lastVisit: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  recentTools: string[]; // Recently used tool IDs
  favoriteTools: string[]; // User-favorited tool IDs
}

const STORAGE_KEY = 'akeef_user_preferences';

const defaultPreferences: UserPreferences = {
  hasCompletedOnboarding: false,
  showTooltips: true,
  tooltipsShown: [],
  featureUsage: {},
  preferredStyle: null,
  preferredColorGrade: null,
  preferredModel: null,
  preferredExportFormat: null,
  sessionCount: 0,
  totalExports: 0,
  lastVisit: new Date().toISOString(),
  skillLevel: 'beginner',
  recentTools: [],
  favoriteTools: [],
};

function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultPreferences, sessionCount: 1, lastVisit: new Date().toISOString() };
    const parsed = JSON.parse(raw) as UserPreferences;
    return {
      ...defaultPreferences,
      ...parsed,
      sessionCount: parsed.sessionCount + 1,
      lastVisit: new Date().toISOString(),
    };
  } catch {
    return { ...defaultPreferences, sessionCount: 1, lastVisit: new Date().toISOString() };
  }
}

function savePreferences(prefs: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable
  }
}

function calculateSkillLevel(prefs: UserPreferences): 'beginner' | 'intermediate' | 'advanced' {
  const featureCount = Object.keys(prefs.featureUsage).length;
  const totalUses = Object.values(prefs.featureUsage).reduce((sum, f) => sum + f.useCount, 0);
  
  if (prefs.totalExports >= 20 || totalUses >= 100 || featureCount >= 10) {
    return 'advanced';
  }
  if (prefs.totalExports >= 5 || totalUses >= 30 || featureCount >= 5) {
    return 'intermediate';
  }
  return 'beginner';
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  // Persist changes
  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  // Track feature usage
  const trackFeatureUse = useCallback((featureId: string) => {
    setPreferences(prev => {
      const existing = prev.featureUsage[featureId];
      const now = new Date().toISOString();
      
      // Update recent tools if this is a panel
      let recentTools = prev.recentTools;
      if (featureId.startsWith('panel-')) {
        const toolId = featureId.replace('panel-', '');
        recentTools = [toolId, ...prev.recentTools.filter(t => t !== toolId)].slice(0, 5);
      }
      
      const updated = {
        ...prev,
        recentTools,
        featureUsage: {
          ...prev.featureUsage,
          [featureId]: {
            featureId,
            useCount: (existing?.useCount ?? 0) + 1,
            lastUsed: now,
            firstUsed: existing?.firstUsed ?? now,
          },
        },
      };
      updated.skillLevel = calculateSkillLevel(updated);
      return updated;
    });
  }, []);

  // Toggle favorite tool
  const toggleFavoriteTool = useCallback((toolId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteTools: prev.favoriteTools.includes(toolId)
        ? prev.favoriteTools.filter(t => t !== toolId)
        : [...prev.favoriteTools, toolId].slice(0, 6),
    }));
  }, []);

  // Mark tooltip as seen
  const markTooltipSeen = useCallback((tooltipId: string) => {
    setPreferences(prev => {
      if (prev.tooltipsShown.includes(tooltipId)) return prev;
      return {
        ...prev,
        tooltipsShown: [...prev.tooltipsShown, tooltipId],
      };
    });
  }, []);

  // Check if tooltip should be shown
  const shouldShowTooltip = useCallback((tooltipId: string) => {
    if (!preferences.showTooltips) return false;
    // Advanced users might not need beginner tooltips
    if (preferences.skillLevel === 'advanced' && tooltipId.startsWith('beginner-')) return false;
    return !preferences.tooltipsShown.includes(tooltipId);
  }, [preferences.showTooltips, preferences.skillLevel, preferences.tooltipsShown]);

  // Update preferred settings based on usage
  const updatePreferredSetting = useCallback((key: 'preferredStyle' | 'preferredColorGrade' | 'preferredModel' | 'preferredExportFormat', value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  }, []);

  // Record an export
  const recordExport = useCallback(() => {
    setPreferences(prev => {
      const updated = { ...prev, totalExports: prev.totalExports + 1 };
      updated.skillLevel = calculateSkillLevel(updated);
      return updated;
    });
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setPreferences(prev => ({ ...prev, hasCompletedOnboarding: true }));
  }, []);

  // Toggle tooltips
  const toggleTooltips = useCallback((enabled: boolean) => {
    setPreferences(prev => ({ ...prev, showTooltips: enabled }));
  }, []);

  // Get personalized suggestions
  const getSuggestions = useCallback(() => {
    const suggestions: string[] = [];
    
    if (preferences.skillLevel === 'beginner') {
      if (!preferences.featureUsage['color-panel']) {
        suggestions.push('Try the Color panel to apply cinematic LUTs to your footage');
      }
      if (!preferences.featureUsage['export-panel']) {
        suggestions.push('Explore export formats to save your edit in different codecs');
      }
    }
    
    if (preferences.skillLevel === 'intermediate') {
      if (!preferences.featureUsage['beat-engine']) {
        suggestions.push('Use the Beat Engine to sync edits to music automatically');
      }
      if (!preferences.featureUsage['director-intent']) {
        suggestions.push('Try Director Intent for AI-guided creative direction');
      }
    }

    return suggestions;
  }, [preferences.skillLevel, preferences.featureUsage]);

  // Get most used features
  const getMostUsedFeatures = useCallback(() => {
    return Object.values(preferences.featureUsage)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 5);
  }, [preferences.featureUsage]);

  // Is user new (first 3 sessions)
  const isNewUser = preferences.sessionCount <= 3;

  return {
    preferences,
    isNewUser,
    trackFeatureUse,
    markTooltipSeen,
    shouldShowTooltip,
    updatePreferredSetting,
    recordExport,
    completeOnboarding,
    toggleTooltips,
    getSuggestions,
    getMostUsedFeatures,
    toggleFavoriteTool,
  };
}
