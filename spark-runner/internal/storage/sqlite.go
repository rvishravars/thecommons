package storage

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"
)

type DB struct {
	conn *sql.DB
}

// KnowledgeDelta represents a user's answer feedback
type KnowledgeDelta struct {
	ID       string
	UserID   string
	SparkID  string
	Question string
	Answer   string
	Result   string // "correct", "incorrect", "nuance"
	Feedback string
	Score    int
	TimestampUnix int64
}

// Quiz represents a loaded spark quiz
type Quiz struct {
	ID          string
	Title       string
	Description string
	Questions   []QuizQuestion
}

type QuizQuestion struct {
	ID    string
	Text  string
	Type  string // "multiple-choice", "free-text"
	Options []string
}

// New initializes the local SQLite database
func New(dataDir string) (*DB, error) {
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %w", err)
	}

	dbPath := filepath.Join(dataDir, "spark_runner.db")
	conn, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := conn.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	db := &DB{conn: conn}

	if err := db.initSchema(); err != nil {
		return nil, fmt.Errorf("failed to initialize schema: %w", err)
	}

	return db, nil
}

// Close closes the database connection
func (db *DB) Close() error {
	return db.conn.Close()
}

func (db *DB) initSchema() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		username TEXT UNIQUE NOT NULL,
		github_token TEXT NOT NULL,
		created_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS quizzes (
		id TEXT PRIMARY KEY,
		title TEXT NOT NULL,
		description TEXT,
		data BLOB NOT NULL,
		created_at INTEGER NOT NULL
	);

	CREATE TABLE IF NOT EXISTS knowledge_deltas (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		spark_id TEXT NOT NULL,
		question TEXT NOT NULL,
		answer TEXT NOT NULL,
		result TEXT NOT NULL,
		feedback TEXT,
		score INTEGER,
		timestamp_unix INTEGER NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (spark_id) REFERENCES quizzes(id)
	);

	CREATE TABLE IF NOT EXISTS scores (
		id TEXT PRIMARY KEY,
		user_id TEXT NOT NULL,
		spark_id TEXT NOT NULL,
		total_score INTEGER NOT NULL,
		attempts INTEGER NOT NULL,
		last_updated INTEGER NOT NULL,
		UNIQUE(user_id, spark_id),
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (spark_id) REFERENCES quizzes(id)
	);
	`

	_, err := db.conn.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	return nil
}

// SaveUser saves or updates a user
func (db *DB) SaveUser(id, username, githubToken string, timestamp int64) error {
	query := `
	INSERT OR REPLACE INTO users (id, username, github_token, created_at)
	VALUES (?, ?, ?, ?)
	`
	_, err := db.conn.Exec(query, id, username, githubToken, timestamp)
	return err
}

// SaveKnowledgeDelta saves user feedback for an answer
func (db *DB) SaveKnowledgeDelta(delta KnowledgeDelta) error {
	query := `
	INSERT INTO knowledge_deltas (id, user_id, spark_id, question, answer, result, feedback, score, timestamp_unix)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`
	_, err := db.conn.Exec(
		query,
		delta.ID,
		delta.UserID,
		delta.SparkID,
		delta.Question,
		delta.Answer,
		delta.Result,
		delta.Feedback,
		delta.Score,
		delta.TimestampUnix,
	)
	return err
}

// GetUserScore retrieves total score for a user on a specific quiz
func (db *DB) GetUserScore(userID, sparkID string) (int, error) {
	var score int
	query := `SELECT COALESCE(SUM(score), 0) FROM knowledge_deltas WHERE user_id = ? AND spark_id = ?`
	err := db.conn.QueryRow(query, userID, sparkID).Scan(&score)
	return score, err
}

// GetLeaderboard retrieves top scores across all users
func (db *DB) GetLeaderboard(sparkID string, limit int) ([]map[string]interface{}, error) {
	query := `
	SELECT u.username, SUM(kd.score) as total_score, COUNT(DISTINCT kd.question) as answers
	FROM knowledge_deltas kd
	JOIN users u ON kd.user_id = u.id
	WHERE kd.spark_id = ?
	GROUP BY kd.user_id
	ORDER BY total_score DESC
	LIMIT ?
	`

	rows, err := db.conn.Query(query, sparkID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var leaderboard []map[string]interface{}
	for rows.Next() {
		var username string
		var totalScore, answers int
		if err := rows.Scan(&username, &totalScore, &answers); err != nil {
			log.Printf("error scanning row: %v", err)
			continue
		}
		leaderboard = append(leaderboard, map[string]interface{}{
			"username":     username,
			"total_score":  totalScore,
			"answers":      answers,
		})
	}

	return leaderboard, rows.Err()
}
