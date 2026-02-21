import { useEffect, useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import SparkSelector from './components/SparkSelector';
import AssemblyCanvas from './components/AssemblyCanvas';
import Header from './components/Header';
import { Sparkles, X } from 'lucide-react';
import { generateSparkMarkdown } from './utils/sparkParser';
import { getStoredUserInfo } from './utils/github';

// Main application component
function AppMain() {
  console.log('🎯 App component rendering!');
  const [theme, setTheme] = useState(() => localStorage.getItem('sparkTheme') || 'studio');
  const [selectedSpark, setSelectedSpark] = useState(null);
  const [repoUrl, setRepoUrl] = useState(() => localStorage.getItem('sparkRepoUrl') || 'https://github.com/rvishravars/thecommons');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [originalSparkData, setOriginalSparkData] = useState(null);
  const [sparkData, setSparkData] = useState(null);
  const [user, setUser] = useState(() => getStoredUserInfo());
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const handleSparkSelect = (spark) => {
    setSelectedSpark(spark);
    if (spark) {
      // Load spark data from parsed file
      const loaded = {
        name: spark.name,
        markedForDeletion: spark.markedForDeletion || false,
        phases: spark.phases,
        contributors: spark.contributors,
        sourcePath: spark.sourcePath || spark.sourceFile || null,
      };
      loaded.phases = {
        spark: { ...loaded.phases.spark, notes: loaded.phases.spark?.notes || '' },
        design: { ...loaded.phases.design, notes: loaded.phases.design?.notes || '' },
        logic: { ...loaded.phases.logic, notes: loaded.phases.logic?.notes || '' },
      };
      setSparkData(loaded);
      setOriginalSparkData(JSON.parse(JSON.stringify(loaded)));
    }
    // Close mobile menu after selection
    setIsMobileMenuOpen(false);
  };

  const handleSparkUpdate = (updatedData) => {
    setSparkData(updatedData);
    // Also update selectedSpark to keep it in sync
    if (selectedSpark) {
      setSelectedSpark({
        ...selectedSpark,
        name: updatedData.name,
        phases: updatedData.phases,
        contributors: updatedData.contributors,
        rawContent: generateSparkMarkdown(updatedData)
      });
    }
  };

  const handleRepoChange = (newRepoUrl) => {
    setRepoUrl(newRepoUrl);
    localStorage.setItem('sparkRepoUrl', newRepoUrl);
    // Clear selected spark when changing repos
    setSelectedSpark(null);
  };

  const handleNewSpark = () => {
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (template) => {
    setSelectedSpark(null);
    const userHandle = user?.login || '';
    setSparkData({
      name: template.name,
      markedForDeletion: false,
      phases: {
        spark: { status: 'Active', observation: template.spark.observation || '', gap: template.spark.gap || '', why: template.spark.why || '', notes: '' },
        design: { status: 'Pending', novel_core: '', blueprint: '', interface: '', prior_art: '', notes: '' },
        logic: { status: 'In-Progress', technical_impl: '', clutch_test: '', dependencies: '', notes: '' },
      },
      contributors: { scout: userHandle, designer: '', builder: '' },
      sourcePath: null,
    });
    setOriginalSparkData(null);
    setIsMobileMenuOpen(false);
    setShowTemplateSelector(false);
  };

  const handleResetSpark = () => {
    if (!originalSparkData) return;
    setSparkData(JSON.parse(JSON.stringify(originalSparkData)));
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
          user={user}
          onUserChange={setUser}
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
              currentSparkData={sparkData}
            />
          </aside>

          {/* Main Canvas */}
          <main className="flex-1 overflow-y-auto w-full">
            {sparkData && sparkData.name ? (
              <AssemblyCanvas
                sparkData={sparkData}
                onSparkUpdate={handleSparkUpdate}
                repoUrl={repoUrl}
                originalSparkData={originalSparkData}
                onResetSpark={handleResetSpark}
                isReadOnly={!user}
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
                    className="mt-4 lg:hidden px-4 py-2 bg-design-600 rounded-lg text-sm font-semibold hover:bg-design-700 transition-colors"
                  >
                    Browse Sparks
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg border border-design-500/30 max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Generic Template */}
                <button
                  onClick={() => handleTemplateSelect({ name: 'New Spark', spark: { observation: '', gap: '', why: '' } })}
                  className="p-4 rounded-lg border-2 border-design-500/30 hover:border-design-500 hover:bg-design-500/10 transition-all text-left"
                >
                  <h3 className="font-semibold text-design-400 mb-2">Generic Spark</h3>
                  <p className="text-sm text-gray-300">A blank canvas for any idea or project</p>
                </button>

                {/* School Level Template */}
                <button
                  onClick={() => handleTemplateSelect({
                    name: 'School Level',
                    spark: { observation: '', gap: '', why: '' }
                  })}
                  className="p-4 rounded-lg border-2 border-spark-500/30 hover:border-spark-500 hover:bg-spark-500/10 transition-all text-left"
                >
                  <h3 className="font-semibold text-spark-400 mb-2">🏫 School Level</h3>
                  <p className="text-sm text-gray-300">Educational project for students to explore and learn</p>
                </button>

                {/* University Level Template */}
                <button
                  onClick={() => handleTemplateSelect({
                    name: 'University Level',
                    spark: { observation: '', gap: '', why: '' }
                  })}
                  className="p-4 rounded-lg border-2 border-logic-500/30 hover:border-logic-500 hover:bg-logic-500/10 transition-all text-left"
                >
                  <h3 className="font-semibold text-logic-400 mb-2">🎓 University Level</h3>
                  <p className="text-sm text-gray-300">Research-focused project with academic rigor</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default AppMain;
