import { Check, Palette, Sparkles, Crown, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, THEMES, type ThemeName } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

const categoryIcons = {
  classic: Palette,
  creative: Sparkles,
  luxury: Crown,
  nature: Leaf,
};

const categoryLabels = {
  classic: 'Classic',
  creative: 'Creative',
  luxury: 'Luxury',
  nature: 'Nature',
};

export default function ThemeSelector() {
  const { theme, setTheme, themeConfig } = useTheme();

  const groupedThemes = THEMES.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, typeof THEMES>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2 px-2 hover:bg-muted"
        >
          <div className="flex -space-x-1">
            {themeConfig.preview.map((color, i) => (
              <div 
                key={i}
                className="theme-preview-dot"
                style={{ backgroundColor: color, zIndex: 3 - i }}
              />
            ))}
          </div>
          <span className="text-xs font-medium hidden sm:inline">{themeConfig.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        {Object.entries(groupedThemes).map(([category, themes]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          return (
            <div key={category}>
              <DropdownMenuLabel className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Icon className="w-3 h-3" />
                {categoryLabels[category as keyof typeof categoryLabels]}
              </DropdownMenuLabel>
              {themes.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={cn(
                    'gap-3 cursor-pointer',
                    theme === t.id && 'bg-primary/10'
                  )}
                >
                  <div className="flex -space-x-1">
                    {t.preview.map((color, i) => (
                      <div 
                        key={i}
                        className="w-3 h-3 rounded-full border border-background"
                        style={{ backgroundColor: color, zIndex: 3 - i }}
                      />
                    ))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.description}</p>
                  </div>
                  {theme === t.id && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}