import { Boxes, Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-gray-700 bg-commons-dark px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Boxes className="h-8 w-8 text-imagination-500" />
          <div>
            <h1 className="text-2xl font-bold text-commons-light font-mono">
              Spark Assembly Lab
            </h1>
            <p className="text-sm text-gray-400">
              TheCommons v2.0 | Build in LEGO-style
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-intuition-600 px-3 py-1">
              <span className="mr-1">🧠</span> Intuition
            </span>
            <span className="inline-flex items-center rounded-full bg-imagination-600 px-3 py-1">
              <span className="mr-1">🎨</span> Imagination
            </span>
            <span className="inline-flex items-center rounded-full bg-logic-600 px-3 py-1">
              <span className="mr-1">🛠️</span> Logic
            </span>
          </div>
          
          <a
            href="https://github.com/rvishravars/thecommons"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-gray-700 p-2 hover:bg-gray-600 transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
