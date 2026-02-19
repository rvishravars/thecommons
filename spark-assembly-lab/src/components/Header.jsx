import { Boxes, Github } from 'lucide-react';

const THEME_OPTIONS = [
  { value: 'studio', label: 'Studio Noir' },
  { value: 'wonderworks', label: 'WonderWorks' },
  { value: 'ledger', label: 'Ledger Light' },
];

export default function Header({ theme, onThemeChange }) {
  return (
    <header className="border-b theme-border theme-surface px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Boxes className="h-8 w-8 text-imagination-500" />
          <div>
            <h1 className="text-2xl font-bold font-mono">
              Spark Assembly Lab
            </h1>
            <p className="text-sm theme-muted">
              TheCommons v2.0 | Build in LEGO-style
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label htmlFor="theme-select" className="text-xs uppercase tracking-wider theme-subtle">
              Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(event) => onThemeChange(event.target.value)}
              className="rounded-lg border px-3 py-2 text-xs font-semibold theme-input"
              aria-label="Theme"
            >
              {THEME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <a
            href="https://github.com/rvishravars/thecommons"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg theme-button p-2 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
