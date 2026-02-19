import { useState } from 'react';
import { X, Brain, CheckCircle, XCircle, Award } from 'lucide-react';

const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI (GPT-4)', icon: '🤖' },
  { id: 'anthropic', name: 'Anthropic (Claude)', icon: '🧠' },
  { id: 'local', name: 'Local Template', icon: '📋' },
];

export default function QuizModal({ sparkData, onClose }) {
  const [selectedAI, setSelectedAI] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateLocalQuiz = () => {
    // Generate quiz questions from spark content
    const quizQuestions = [];
    
    // Question 1: About Intuition phase
    if (sparkData.phases.intuition.gap) {
      quizQuestions.push({
        question: `What is the main gap identified in the "${sparkData.name}" spark?`,
        options: [
          sparkData.phases.intuition.gap || 'N/A',
          'There is no gap mentioned',
          'The system works perfectly',
          'Users are completely satisfied',
        ],
        correctAnswer: 0,
        phase: 'intuition',
      });
    }

    // Question 2: About Imagination phase
    if (sparkData.phases.imagination.novel_core || sparkData.phases.imagination.blueprint) {
      quizQuestions.push({
        question: `What is the Novel Core (10% Delta) of this spark?`,
        options: [
          'It uses existing technology',
          sparkData.phases.imagination.blueprint || sparkData.phases.imagination.novel_core || 'N/A',
          'It copies other solutions',
          'It makes no changes',
        ],
        correctAnswer: 1,
        phase: 'imagination',
      });
    }

    // Question 3: About Logic phase
    if (sparkData.phases.logic.technical_impl) {
      quizQuestions.push({
        question: `Which phase focuses on technical implementation and testing?`,
        options: [
          'Intuition - Scout discovers the gap',
          'Imagination - Designer creates blueprint',
          'Logic - Builder implements and tests',
          'None of the above',
        ],
        correctAnswer: 2,
        phase: 'logic',
      });
    }

    // Question 4: About Contributors
    quizQuestions.push({
      question: `In TheCommons framework, what is the reward for the Logic/Builder phase?`,
      options: [
        '+5 CS',
        '+15 CS (+5 Echo Bonus)',
        '+25 CS (+10 Prototype Bonus)',
        '+50 CS',
      ],
      correctAnswer: 2,
      phase: 'general',
    });

    // Question 5: About the Framework
    quizQuestions.push({
      question: `Which role identifies "Loose Studs" or gaps in the ecosystem?`,
      options: [
        'Builder',
        'Designer',
        'Scout',
        'Architect',
      ],
      correctAnswer: 2,
      phase: 'general',
    });

    return quizQuestions;
  };

  const handleStartQuiz = () => {
    if (selectedAI === 'local') {
      setLoading(true);
      setTimeout(() => {
        const quiz = generateLocalQuiz();
        setQuestions(quiz);
        setQuizStarted(true);
        setLoading(false);
      }, 500);
    } else {
      // For AI providers, would integrate with their APIs
      alert(`AI integration for ${selectedAI} coming soon! API Key: ${apiKey ? 'Provided' : 'Not provided'}`);
    }
  };

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: answerIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: Math.round((correct / questions.length) * 100),
    };
  };

  const getPhaseColor = (phase) => {
    if (phase === 'intuition') return 'text-intuition-400';
    if (phase === 'imagination') return 'text-imagination-400';
    if (phase === 'logic') return 'text-logic-400';
    return 'theme-muted';
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
        <div className="theme-panel rounded-xl border-2 border-imagination-600 w-full max-w-2xl shadow-2xl">
          <div className="bg-imagination-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8" />
              <h2 className="text-2xl font-bold">Quiz Results</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-8 text-center">
            <div className="text-6xl font-bold mb-4">
              {score.percentage}%
            </div>
            <div className="text-2xl mb-8">
              {score.correct} out of {score.total} correct
            </div>

            <div className="space-y-3 mb-8">
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                return (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      isCorrect ? 'bg-logic-900/20 border border-logic-600' : 'bg-red-900/20 border border-red-600'
                    }`}
                  >
                    <span className="text-sm">Question {idx + 1}</span>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-logic-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-imagination-600 hover:bg-imagination-700 rounded-lg font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizStarted) {
    const q = questions[currentQuestion];
    const hasAnswered = selectedAnswers[currentQuestion] !== undefined;

    return (
      <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
        <div className="theme-panel rounded-xl border-2 border-imagination-600 w-full max-w-2xl shadow-2xl">
          <div className="bg-imagination-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="h-6 w-6" />
              <h2 className="text-xl font-bold">
                Question {currentQuestion + 1} of {questions.length}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-8">
            <div className="mb-6">
              <span className={`text-xs font-semibold uppercase ${getPhaseColor(q.phase)}`}>
                {q.phase === 'general' ? 'Framework Knowledge' : `${q.phase} Phase`}
              </span>
              <h3 className="text-xl font-semibold mt-2">{q.question}</h3>
            </div>

            <div className="space-y-3 mb-8">
              {q.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestion, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedAnswers[currentQuestion] === idx
                      ? 'border-imagination-500 bg-imagination-900/20'
                      : 'theme-border theme-border-hover theme-card'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswers[currentQuestion] === idx
                          ? 'border-imagination-500 bg-imagination-500'
                          : 'theme-border'
                      }`}
                    >
                      {selectedAnswers[currentQuestion] === idx && (
                        <div className="w-3 h-3 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm theme-muted">
                {Object.keys(selectedAnswers).length} of {questions.length} answered
              </div>
              <button
                onClick={handleNext}
                disabled={!hasAnswered}
                className="px-6 py-2 bg-imagination-600 hover:bg-imagination-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div className="theme-panel rounded-xl border-2 border-imagination-600 w-full max-w-2xl shadow-2xl">
        <div className="bg-imagination-600 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Quiz Me!</h2>
              <p className="text-sm opacity-90">Test your understanding of this spark</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Spark: {sparkData.name}</h3>
            <p className="text-sm theme-muted">
              Choose your AI provider to generate quiz questions based on this spark&apos;s content
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {AI_PROVIDERS.map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedAI(provider.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAI === provider.id
                    ? 'border-imagination-500 bg-imagination-900/20'
                    : 'theme-border theme-border-hover theme-card'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.icon}</span>
                  <span className="font-semibold">{provider.name}</span>
                </div>
              </button>
            ))}
          </div>

          {selectedAI && selectedAI !== 'local' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">API Key (Optional)</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key..."
                className="w-full theme-input rounded border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-imagination-500"
              />
              <p className="text-xs theme-subtle mt-1">Coming soon! Local template available now.</p>
            </div>
          )}

          <button
            onClick={handleStartQuiz}
            disabled={!selectedAI || loading}
            className="w-full px-6 py-3 bg-imagination-600 hover:bg-imagination-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Quiz...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
