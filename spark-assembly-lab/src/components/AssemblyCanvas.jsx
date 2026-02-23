import { useState, useEffect } from 'react';
import { Download, Copy, Eye, Brain, GitPullRequest, RotateCcw, Trash2 } from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuizModal from './QuizModal';
import { PhaseTypes } from '../types/spark';
import { generateSparkMarkdown, validateSparkData } from '../utils/sparkParser';
import { useToast } from '../utils/ToastContext';
import { getStoredToken, getStoredUserInfo } from '../utils/github';

export default function AssemblyCanvas({ sparkData, onSparkUpdate, repoUrl, originalSparkData, onResetSpark, isReadOnly, onPRCreated }) {
  const [showPreview, setShowPreview] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [editStatus, setEditStatus] = useState(null);
  const [editingPhase, setEditingPhase] = useState(null);
  const [phaseDraft, setPhaseDraft] = useState('');
  const [activePhasesForNewSpark, setActivePhasesForNewSpark] = useState(() => {
    // For new template sparks, start with only Spark
    const isNewTemplate = ['New Spark', 'School Level', 'University Level'].includes(sparkData?.name);
    return isNewTemplate ? [PhaseTypes.SPARK] : [PhaseTypes.SPARK, PhaseTypes.DESIGN, PhaseTypes.LOGIC];
  });
  const toast = useToast();
  const user = getStoredUserInfo();

  // Reset active phases when spark changes
  useEffect(() => {
    const isNewTemplate = ['New Spark', 'School Level', 'University Level'].includes(sparkData?.name);
    if (isNewTemplate) {
      setActivePhasesForNewSpark([PhaseTypes.SPARK]);
    } else {
      setActivePhasesForNewSpark([PhaseTypes.SPARK, PhaseTypes.DESIGN, PhaseTypes.LOGIC]);
    }
  }, [sparkData?.name]);

  const handleBlockUpdate = (phase, blockType, value) => {
    const updatedData = {
      ...sparkData,
      phases: {
        ...sparkData.phases,
        [phase]: {
          ...sparkData.phases[phase],
          [blockType]: value,
        },
      },
    };
    onSparkUpdate(updatedData);
  };

  const handleDownload = () => {
    const validation = validateSparkData(sparkData);
    if (!validation.valid) {
      toast.error(`Sanctity check failed: ${validation.errors.join('; ')}`);
      return;
    }
    const md = generateSparkMarkdown(sparkData);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sparkData.name.toLowerCase().replace(/\s+/g, '-')}.spark.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Spark downloaded successfully!');
  };

  const handleCopyToClipboard = () => {
    const validation = validateSparkData(sparkData);
    if (!validation.valid) {
      toast.error(`Sanctity check failed: ${validation.errors.join('; ')}`);
      return;
    }
    const md = generateSparkMarkdown(sparkData);
    navigator.clipboard.writeText(md).then(
      () => toast.success('Markdown copied to clipboard!'),
      () => toast.error('Failed to copy to clipboard')
    );
  };

  const calculateStability = () => {
    let count = 0;
    if (sparkData.phases.spark.observation || sparkData.phases.spark.gap) count++;
    if (sparkData.phases.design.blueprint || sparkData.phases.design.novel_core) count++;
    if (sparkData.phases.logic.technical_impl) count++;
    return count;
  };

  const stability = calculateStability();
  // Don't validate new sparks during editing, only check when submitting/downloading
  const isNewTemplate = ['New Spark', 'School Level', 'University Level'].includes(sparkData?.name);
  const validation = (!originalSparkData || isNewTemplate)
    ? { valid: true, errors: [] }
    : validateSparkData(sparkData);
  const isDirty = originalSparkData
    ? JSON.stringify(sparkData) !== JSON.stringify(originalSparkData)
    : false;

  const handleEditDone = () => {
    const result = validateSparkData(sparkData);
    if (result.valid) {
      setEditStatus({
        type: 'success',
        message: 'Saved locally. Ready to submit.',
      });
      return;
    }

    setEditStatus({
      type: 'error',
      message: `Validation failed: ${result.errors.join('; ')}`,
    });
  };

  const openPhaseEditor = (phaseKey) => {
    const phase = sparkData.phases[phaseKey];
    const fallback = buildPhaseNotes(phaseKey, phase);
    setPhaseDraft(phase.notes || fallback);
    setEditingPhase(phaseKey);
  };

  const savePhaseEditor = () => {
    if (!editingPhase) return;
    const updated = {
      ...sparkData,
      phases: {
        ...sparkData.phases,
        [editingPhase]: {
          ...sparkData.phases[editingPhase],
          notes: phaseDraft,
        },
      },
    };
    onSparkUpdate(updated);
    handleEditDone();
    setEditingPhase(null);
  };

  const buildPhaseNotes = (phaseKey, phase) => {
    if (!phase) return '';
    if (phaseKey === PhaseTypes.SPARK) {
      return `### The Observation\n> ${phase.observation || ''}\n* **The Gap:** ${phase.gap || ''}\n* **The "Why":** ${phase.why || ''}`.trim();
    }
    if (phaseKey === PhaseTypes.DESIGN) {
      return `### The Novel Core (The 10% Delta)\n* **The Novel Core:** ${phase.novel_core || ''}\n* **The Blueprint:** ${phase.blueprint || ''}\n* **The Interface:** ${phase.interface || ''}\n* **Prior Art:** ${phase.prior_art || ''}`.trim();
    }
    if (phaseKey === PhaseTypes.LOGIC) {
      return `### Technical Implementation\n* **The Logic:** ${phase.technical_impl || ''}\n* **Clutch Power Test:** ${phase.clutch_test || ''}\n* **Dependencies:** ${phase.dependencies || ''}`.trim();
    }
    return '';
  };

  const handleSubmit = async () => {
    // If confirmation is not yet shown, show it first
    if (!showConfirmation) {
      const validationResult = validateSparkData(sparkData);
      if (!validationResult.valid) {
        toast.error(`Sanctity check failed: ${validationResult.errors.join('; ')}`);
        return;
      }
      setShowConfirmation(true);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      toast.error('GitHub token required to submit a PR');
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);

    // Cool progress simulation
    for (let i = 0; i <= 100; i += 5) {
      setSyncProgress(i);
      await new Promise(r => setTimeout(r, 40));
    }

    try {
      const markdown = generateSparkMarkdown(sparkData);
      const slug = sparkData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const path = sparkData.sourcePath || `sparks/${slug || 'new-spark'}.spark.md`;
      const title = `Spark: ${sparkData.name}`;
      const body = `Automated submission from Spark Assembly Lab.`;

      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          repo: repoUrl,
          path,
          content: markdown,
          title,
          body,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit PR');
      }

      toast.success(`PR created: ${data.pr_url}`);
      setShowConfirmation(false);
      if (data.pr_url) {
        window.open(data.pr_url, '_blank');
      }
      // Refresh PR counts
      if (onPRCreated) {
        onPRCreated();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit PR');
      setSyncProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!onResetSpark || !originalSparkData) {
      return;
    }
    onResetSpark();
    setEditStatus({
      type: 'success',
      message: 'Changes reset to original content.',
    });
    toast.success('Changes reset to original content.');
  };

  const handleDeleteRequest = async () => {
    // Check if user is the owner (scout)
    if (sparkData.contributors.scout !== user?.login) {
      toast.error('Only the spark owner (scout) can delete a spark');
      return;
    }

    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      return;
    }

    const token = getStoredToken();
    if (!token) {
      toast.error('GitHub token required to submit a delete request');
      setShowDeleteConfirmation(false);
      return;
    }

    setIsSubmitting(true);

    // Cool progress simulation
    for (let i = 0; i <= 100; i += 5) {
      setSyncProgress(i);
      await new Promise(r => setTimeout(r, 40));
    }

    try {
      const slug = sparkData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const path = sparkData.sourcePath || `sparks/${slug || 'new-spark'}.spark.md`;
      const title = `Delete Spark: ${sparkData.name}`;
      const body = `Request to delete spark: ${sparkData.name}\n\nRequested by @${user?.login}. To cancel this deletion, close this PR without merging.`;

      const response = await fetch('/api/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          repo: repoUrl,
          path,
          title,
          body,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit delete request');
      }

      toast.success(`Delete PR created: ${data.pr_url}`);
      setShowDeleteConfirmation(false);
      if (data.pr_url) {
        window.open(data.pr_url, '_blank');
      }
      // Refresh PR counts
      if (onPRCreated) {
        onPRCreated();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit delete request');
      setSyncProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b theme-border theme-surface px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              readOnly={isReadOnly}
              value={sparkData.name}
              onChange={(e) => onSparkUpdate({ ...sparkData, name: e.target.value })}
              className={`text-xl sm:text-2xl font-bold bg-transparent border border-transparent hover:border-design-400/50 focus:border-design-500 focus:outline-none focus:ring-2 focus:ring-design-500 rounded px-2 -ml-2 w-full transition-colors ${isReadOnly ? 'cursor-not-allowed opacity-80' : ''}`}
              placeholder="Spark Name"
            />
            <div className="mt-1 flex items-center space-x-2">
              <span
                className={`inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold ${stability === 0
                  ? 'bg-red-600'
                  : stability === 1
                      ? 'bg-spark-600'
                    : stability === 2
                      ? 'bg-design-600'
                      : 'bg-logic-600'
                  }`}
              >
                {stability}/3 Stable
              </span>
              {originalSparkData && originalSparkData.name !== sparkData.name && (
                <span className="inline-flex items-center rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold bg-yellow-600 text-white">
                  Edited
                </span>
              )}
              {!validation.valid && (
                <span className="text-xs text-red-300">Sanctity check failed</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowQuiz(true)}
              disabled={!user}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-design-500 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-design-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-design-500"
              title={!user ? 'Please login with GitHub to use Quiz feature' : 'Test your understanding of this spark'}
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Quiz Me</span>
              <span className="sm:hidden">Quiz</span>
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg theme-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{showPreview ? 'Edit' : 'Preview'}</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg theme-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors"
            >
              <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Copy</span>
            </button>

            <button
              onClick={handleReset}
              disabled={!isDirty || isReadOnly}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg theme-button px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">Reset</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-design-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-design-700 transition-colors"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download</span>
              <span className="sm:hidden">Save</span>
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isReadOnly}
              className={`flex items-center space-x-1 sm:space-x-2 rounded-lg bg-logic-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-logic-700 transition-colors disabled:opacity-60 ${isReadOnly ? 'cursor-not-allowed grayscale' : ''}`}
            >
              <GitPullRequest className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Submit</span>
            </button>

            <button
              onClick={handleDeleteRequest}
              disabled={isSubmitting || isReadOnly || !originalSparkData}
              title={sparkData.contributors.scout !== user?.login ? 'Only the spark owner can delete' : 'Request deletion of this spark'}
              className="flex items-center space-x-1 sm:space-x-2 rounded-lg bg-red-600 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Assembly Area */}
      {editStatus && (
        <div
          className={`mx-4 sm:mx-6 mt-4 rounded-lg border px-3 py-2 text-xs sm:text-sm ${editStatus.type === 'success'
            ? 'border-logic-600/50 bg-logic-600/10 text-logic-200'
            : 'border-red-600/50 bg-red-900/20 text-red-200'
            }`}
        >
          {editStatus.message}
        </div>
      )}

      {showPreview ? (
        <MarkdownPreview markdown={generateSparkMarkdown(sparkData)} />
      ) : (
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="h-full flex flex-col lg:flex-row p-4 sm:p-6 gap-4 sm:gap-6 min-w-full">
            {[
              {
                key: PhaseTypes.SPARK,
                title: '🧠 Spark (Scout)',
                description: 'Identify and submit the gap',
                color: 'spark',
              },
              {
                key: PhaseTypes.DESIGN,
                title: '🎨 Design (Designer)',
                description: 'Design the solution',
                color: 'design',
              },
              {
                key: PhaseTypes.LOGIC,
                title: '🛠️ Logic (Builder)',
                description: 'Build and test',
                color: 'logic',
              },
            ]
            .filter(phase => activePhasesForNewSpark.includes(phase.key))
            .map((phase) => (
              <div key={phase.key} className={`flex-1 min-w-[280px] lg:min-w-[320px] flex flex-col rounded-xl border-2 border-${phase.color}-600 theme-panel-soft`}>
                <div className={`bg-${phase.color}-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl`}>
                  <h2 className="text-lg sm:text-xl font-bold">{phase.title}</h2>
                  <p className="text-xs sm:text-sm mt-1 opacity-90">{phase.description}</p>
                </div>
                <div className="flex-1 p-3 sm:p-4 flex flex-col overflow-y-hidden">
                  <div className="w-full flex-1 theme-input rounded border p-3 sm:p-4 text-sm sm:text-base overflow-y-auto bg-black/10 min-h-[240px]">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {sparkData.phases[phase.key].notes || buildPhaseNotes(phase.key, sparkData.phases[phase.key])}
                      </ReactMarkdown>
                    </div>
                  </div>
                  <button
                    onClick={() => openPhaseEditor(phase.key)}
                    disabled={isReadOnly}
                    className={`mt-2 text-xs text-${phase.color}-400 hover:text-${phase.color}-300 flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {!isReadOnly && <span>Edit</span>}
                  </button>
                </div>
              </div>
            ))}

            {/* Add Phase Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {!activePhasesForNewSpark.includes(PhaseTypes.DESIGN) && (
                <button
                  onClick={() => setActivePhasesForNewSpark([...activePhasesForNewSpark, PhaseTypes.DESIGN])}
                  className="px-4 py-2 rounded-lg border-2 border-design-500/50 hover:border-design-500 hover:bg-design-500/10 text-design-400 font-semibold transition-all text-sm"
                >
                  + Add Design Phase (with AI help coming soon)
                </button>
              )}
              {!activePhasesForNewSpark.includes(PhaseTypes.LOGIC) && (
                <button
                  onClick={() => setActivePhasesForNewSpark([...activePhasesForNewSpark, PhaseTypes.LOGIC])}
                  className="px-4 py-2 rounded-lg border-2 border-logic-500/50 hover:border-logic-500 hover:bg-logic-500/10 text-logic-400 font-semibold transition-all text-sm"
                >
                  + Add Logic Phase (with AI help coming soon)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && <QuizModal sparkData={sparkData} onClose={() => setShowQuiz(false)} />}

      {/* Cool PR Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 theme-overlay backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border-2 border-logic-500 bg-black/80 shadow-[0_0_50px_-12px_rgba(34,197,94,0.5)] backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {/* Modal Header with Glow */}
            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-logic-900/50 to-black p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(34,197,94,0.3),_transparent_70%)]" />
              <div className="relative flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-logic-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]">
                  <GitPullRequest className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-white">SYNC SPARK</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-logic-400">Final Validation Sequence</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest">
                  <span className="text-white/40">Status</span>
                  <span className="text-logic-400">Ready to Ship</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest">
                  <span className="text-white/40">Integrity Check</span>
                  <span className="text-logic-400">PASSED</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-widest">
                  <span className="text-white/40">Merit Stake</span>
                  <span className="text-logic-400">Verified</span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-logic-600 to-logic-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              {isSubmitting ? (
                <div className="py-4 text-center font-mono text-sm font-bold text-logic-400 animate-pulse uppercase tracking-[0.2em]">
                  Synchronizing with TheCommons...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Abort
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 rounded-xl bg-logic-500 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(34,197,94,0.4)] transition-all hover:bg-logic-400 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
                  >
                    Phase Shift
                  </button>
                </div>
              )}
            </div>

            <div className="bg-logic-900/20 p-4 text-center border-t border-logic-900/30">
              <p className="text-[10px] font-mono text-logic-400/60 uppercase tracking-widest">
                Instruction Set v2.0 // Standard Gauge: 100% Correct
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 theme-overlay backdrop-blur-md">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border-2 border-red-500 bg-black/80 shadow-[0_0_50px_-12px_rgba(239,68,68,0.5)] backdrop-blur-xl animate-in zoom-in-95 duration-200">
            {/* Modal Header with Glow */}
            <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-red-900/50 to-black p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(239,68,68,0.3),_transparent_70%)]" />
              <div className="relative flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
                  <Trash2 className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-white">DELETE SPARK</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400">Permanent Request</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4 rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-sm text-white/90">
                  You are about to request the deletion of this spark:
                </p>
                <p className="text-lg font-bold text-red-400">
                  "{sparkData.name}"
                </p>
                <div className="text-xs text-white/70 space-y-2 pt-2">
                  <p>• A pull request will be created to remove this spark</p>
                  <p>• Only you (the scout) can make this request</p>
                  <p>• You can cancel by closing the PR without merging</p>
                  <p>• Community review will apply to this deletion</p>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>

              {isSubmitting ? (
                <div className="py-4 text-center font-mono text-sm font-bold text-red-400 animate-pulse uppercase tracking-[0.2em]">
                  Submitting deletion request...
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteRequest}
                    className="flex-1 rounded-xl bg-red-500 py-4 text-sm font-black uppercase tracking-widest text-black shadow-[0_0_30px_rgba(239,68,68,0.4)] transition-all hover:bg-red-400 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                  >
                    Confirm Delete
                  </button>
                </div>
              )}
            </div>

            <div className="bg-red-900/20 p-4 text-center border-t border-red-900/30">
              <p className="text-[10px] font-mono text-red-400/60 uppercase tracking-widest">
                This action creates a deletion PR // Community Approval Required
              </p>
            </div>
          </div>
        </div>
      )}

      {editingPhase && (
        <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="theme-panel rounded-xl border-2 border-design-600 w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
            <div className="bg-design-600 px-4 sm:px-6 py-3 sm:py-4 rounded-t-xl flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-xl font-bold truncate">Edit Phase</h2>
                <p className="text-xs sm:text-sm opacity-90 truncate">Update the full block for this phase.</p>
              </div>
              <button
                onClick={() => setEditingPhase(null)}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 sm:p-6">
              <textarea
                value={phaseDraft}
                onChange={(e) => setPhaseDraft(e.target.value)}
                className="w-full h-full theme-input rounded border p-3 sm:p-4 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-design-500 font-mono resize-none min-h-[400px] sm:min-h-[500px]"
                autoFocus
              />
            </div>

            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t theme-border flex justify-between items-center">
              <div className="text-xs sm:text-sm theme-muted">{phaseDraft.length} characters</div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingPhase(null)}
                  className="px-4 py-2 theme-button rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={savePhaseEditor}
                  className="px-4 py-2 bg-design-600 hover:bg-design-700 rounded-lg font-semibold transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
