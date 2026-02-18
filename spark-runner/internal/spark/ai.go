package spark

import (
	"fmt"
	"strings"
)

// AIEvaluator represents the AI quiz-master
type AIEvaluator struct {
	models map[string]evaluationRules
}

type evaluationRules struct {
	correctAnswers []string
	scorePerMatch  int
	acceptPartial  bool
}

// NewAIEvaluator creates a new AI evaluator
func NewAIEvaluator() *AIEvaluator {
	return &AIEvaluator{
		models: make(map[string]evaluationRules),
	}
}

// RegisterQuestion registers evaluation rules for a question
func (a *AIEvaluator) RegisterQuestion(questionID string, correctAnswers []string, scorePerMatch int) {
	a.models[questionID] = evaluationRules{
		correctAnswers: correctAnswers,
		scorePerMatch:  scorePerMatch,
		acceptPartial:  true,
	}
}

// EvaluationResult represents the feedback from AI
type EvaluationResult struct {
	IsCorrect bool
	Score     int
	Feedback  string
	Nuance    string
}

// Evaluate evaluates a user's answer
func (a *AIEvaluator) Evaluate(questionID, userAnswer string) EvaluationResult {
	rules, exists := a.models[questionID]
	if !exists {
		return EvaluationResult{
			IsCorrect: false,
			Score:     0,
			Feedback:  "❌ No evaluation rules for this question",
			Nuance:    "unregistered",
		}
	}

	userAnswer = strings.ToLower(strings.TrimSpace(userAnswer))

	// Check exact match
	for _, correct := range rules.correctAnswers {
		if strings.ToLower(correct) == userAnswer {
			return EvaluationResult{
				IsCorrect: true,
				Score:     rules.scorePerMatch,
				Feedback:  "✅ Correct!",
				Nuance:    "exact",
			}
		}
	}

	// Check partial match if enabled
	if rules.acceptPartial {
		for _, correct := range rules.correctAnswers {
			if strings.Contains(strings.ToLower(correct), userAnswer) ||
				strings.Contains(userAnswer, strings.ToLower(correct)) {
				return EvaluationResult{
					IsCorrect: true,
					Score:     rules.scorePerMatch / 2,
					Feedback:  "🟡 Partially correct",
					Nuance:    "partial",
				}
			}
		}
	}

	return EvaluationResult{
		IsCorrect: false,
		Score:     0,
		Feedback:  fmt.Sprintf("❌ Incorrect. Expected: %v", rules.correctAnswers),
		Nuance:    "incorrect",
	}
}

// ProvideHint provides a hint based on question context
func (a *AIEvaluator) ProvideHint(question Question) string {
	if question.Hint != "" {
		return fmt.Sprintf("💡 Hint: %s", question.Hint)
	}

	switch question.Type {
	case "multiple-choice":
		return "💡 Hint: This is a multiple-choice question. Read the options carefully."
	case "free-text":
		return "💡 Hint: Think about the fundamental concepts covered in this spark."
	default:
		return "💡 Take your time and think through the question."
	}
}
