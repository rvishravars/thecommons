import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SparkSelector from './components/SparkSelector';
import AssemblyCanvas from './components/AssemblyCanvas';
import Header from './components/Header';
import { Sparkles, X } from 'lucide-react';

// Main application component
function AppMain() {
  console.log('🎯 App component rendering!');
  const [theme, setTheme] = useState(() => localStorage.getItem('sparkTheme') || 'studio');
  const [selectedSpark, setSelectedSpark] = useState(null);
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('sparkRepoUrl') || 'https://github.com/rvishravars/thecommons');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sparkData, setSparkData] = useState({
    name: 'New Spark',
    phases: {
      intuition: { status: 'Active', observation: '', gap: '', why: '' },
      imagination: { status: 'Pending', novel_core: '', blueprint: '', interface: '', prior_art: '' },
      logic: { status: 'In-Progress', technical_impl: '', clutch_test: '', dependencies: '' },
    },
    contributors: { scout: '', designer: '', builder: '' },
  });

  const handleSparkSelect = (spark) => {
    setSelectedSpark(spark);
    if (spark) {
      // Load spark data from parsed file
      setSparkData({
        name: spark.name,
        phases: spark.phases,
        contributors: spark.contributors,
      });
    }
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  const handleSparkUpdate = (updatedData) => {
    setSparkData(updatedData);
  };

  const handleRepoChange = (newRepoUrl) => {
    setRepoUrl(newRepoUrl);
    localStorage.setItem('sparkRepoUrl', newRepoUrl);
    // Clear selected spark when changing repos
    setSelectedSpark(null);
  };

  const handleNewSpark = () => {
    setSelectedSpark(null);
    setSparkData({
      name: 'New Spark',
      phases: {
        intuition: { status: 'Active', observation: '', gap: '', why: '' },
        imagination: { status: 'Pending', novel_core: '', blueprint: '', interface: '', prior_art: '' },
        logic: { status: 'In-Progress', technical_impl: '', clutch_test: '', dependencies: '' },
      },
      contributors: { scout: '', designer: '', builder: '' },
    });
  };

  useEffect(() => {
    localStorage.setItem('sparkTheme', theme);
  }, [theme]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen flex-col theme-app" data-theme={theme}>
        <Header 
          theme={theme} 
          onThemeChange={setTheme}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />
        
        <div className="flex flex-1 overflow-hidden relative">
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar: Spark Selector */}
          <aside className={`
            w-80 border-r theme-border theme-surface overflow-y-auto
            fixed lg:static inset-y-0 left-0 z-50
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            top-[73px] lg:top-0
          `}>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg theme-muted-hover"
            >
              <X className="h-5 w-5" />
            </button>
            
            <SparkSelector
              selectedSpark={selectedSpark}
              onSparkSelect={handleSparkSelect}
              onNewSpark={handleNewSpark}
              repoUrl={repoUrl}
              onRepoChange={handleRepoChange}
            />
          </aside>

          {/* Main Canvas */}
          <main className="flex-1 overflow-y-auto w-full">
            {selectedSpark || sparkData ? (
              <AssemblyCanvas
                sparkData={sparkData}
                onSparkUpdate={handleSparkUpdate}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-4">
                <div className="text-center max-w-md">
                  <Sparkles className="mx-auto h-12 w-12 sm:h-16 sm:w-16 theme-faint" />
                  <h3 className="mt-4 text-lg sm:text-xl font-semibold theme-muted">
                    Select a Spark or Create a New One
                  </h3>
                  <p className="mt-2 text-sm sm:text-base theme-subtle">
                    Choose from existing sparks or start building from scratch
                  </p>
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="mt-4 lg:hidden px-4 py-2 bg-imagination-600 rounded-lg text-sm font-semibold hover:bg-imagination-700 transition-colors"
                  >
                    Browse Sparks
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

export default AppMain;
