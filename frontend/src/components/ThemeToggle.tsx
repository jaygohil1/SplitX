import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-9 w-9 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-colors"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-slate-400 hover:text-emerald-400 transition-colors" />
      ) : (
        <Moon className="h-4 w-4 text-slate-400 hover:text-emerald-500 transition-colors" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
