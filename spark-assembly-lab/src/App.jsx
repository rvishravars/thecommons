import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SparkSelector from './components/SparkSelector';
import AssemblyCanvas from './components/AssemblyCanvas';
import Header from './components/Header';
import { Sparkles } from 'lucide-react';

function App() {
  console.log('🎯 App component rendering!');
  const [theme, setTheme] = useState(() => localStorage.getItem('sparkTheme') || 'studio');
  const [selectedSpark, setSelectedSpark] = useState(null);
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
  };

  const handleSparkUpdate = (updatedData) => {
    setSparkData(updatedData);
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
        <Header theme={theme} onThemeChange={setTheme} />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: Spark Selector */}
          <aside className="w-80 border-r theme-border theme-surface overflow-y-auto">
            <SparkSelector
              selectedSpark={selectedSpark}
              onSparkSelect={handleSparkSelect}
              onNewSpark={handleNewSpark}
            />
          </aside>

          {/* Main Canvas */}
          <main className="flex-1 overflow-y-auto">
            {selectedSpark || sparkData ? (
              <AssemblyCanvas
                sparkData={sparkData}
                onSparkUpdate={handleSparkUpdate}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Sparkles className="mx-auto h-16 w-16 theme-faint" />
                  <h3 className="mt-4 text-xl font-semibold theme-muted">
                    Select a Spark or Create a New One
                  </h3>
                  <p className="mt-2 theme-subtle">
                    Choose from existing sparks or start building from scratch
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
