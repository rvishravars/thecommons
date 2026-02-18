package spark

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
)

// SparkDefinition represents a loaded spark quiz file
type SparkDefinition struct {
	Title       string       `json:"title"`
	Description string       `json:"description"`
	Questions   []Question   `json:"questions"`
	Metadata    Metadata     `json:"metadata"`
}

// Question represents a single quiz question
type Question struct {
	ID    string   `json:"id"`
	Text  string   `json:"text"`
	Type  string   `json:"type"` // "multiple-choice", "free-text"
	Options []string `json:"options,omitempty"`
	Hint  string   `json:"hint,omitempty"`
}

// Metadata contains spark metadata
type Metadata struct {
	Originator string `json:"originator"`
	Status     string `json:"status"`
	Tags       []string `json:"tags"`
}

// Loader loads spark definitions from disk
type Loader struct {
	sparkDir string
}

// NewLoader creates a new spark loader
func NewLoader(sparkDir string) *Loader {
	return &Loader{
		sparkDir: sparkDir,
	}
}

// LoadSpark loads a spark definition from file
func (l *Loader) LoadSpark(filename string) (*SparkDefinition, error) {
	path := filepath.Join(l.sparkDir, filename)

	data, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read spark file: %w", err)
	}

	var spark SparkDefinition
	if err := json.Unmarshal(data, &spark); err != nil {
		return nil, fmt.Errorf("failed to parse spark JSON: %w", err)
	}

	return &spark, nil
}

// ListSparks returns all available spark files
func (l *Loader) ListSparks() ([]string, error) {
	entries, err := ioutil.ReadDir(l.sparkDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read spark directory: %w", err)
	}

	var sparks []string
	for _, entry := range entries {
		if !entry.IsDir() && filepath.Ext(entry.Name()) == ".json" {
			sparks = append(sparks, entry.Name())
		}
	}

	return sparks, nil
}

// SaveSpark saves a spark definition to file
func (l *Loader) SaveSpark(filename string, spark *SparkDefinition) error {
	path := filepath.Join(l.sparkDir, filename)

	data, err := json.MarshalIndent(spark, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal spark: %w", err)
	}

	if err := ioutil.WriteFile(path, data, 0644); err != nil {
		return fmt.Errorf("failed to write spark file: %w", err)
	}

	return nil
}

// CreateSampleSpark creates a sample spark for testing
func CreateSampleSpark() *SparkDefinition {
	return &SparkDefinition{
		Title:       "Introduction to Sparks",
		Description: "Learn the basics of the Spark framework",
		Questions: []Question{
			{
				ID:   "q1",
				Text: "What are the 4 blocks of the Spark framework?",
				Type: "free-text",
				Hint: "Think: What? Why? How? Does it work?",
			},
			{
				ID:      "q2",
				Text:    "Which block describes the solution approach?",
				Type:    "multiple-choice",
				Options: []string{"SPARK", "SOUL", "MUSCLE", "SKIN"},
			},
		},
		Metadata: Metadata{
			Originator: "@system",
			Status:     "Published",
			Tags:       []string{"tutorial", "framework"},
		},
	}
}
