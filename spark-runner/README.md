# Spark-Runner TUI

A high-performance, native terminal-based application for running quizzes from Spark definitions. Built with Go and Bubble Tea for a responsive TUI experience.

## Features

- **GitHub OAuth Authentication** using Device Flow
- **Local Quiz Engine** loads Spark JSON/TOML files
- **Real-time Feedback** with AI evaluation of answers
- **Local Persistence** using SQLite
- **Leaderboard System** tracks scores across users
- **Room Architecture** prepared for future scaling/networking
- **Native Binary** compiled for fast startup and minimal resource usage

## Project Structure

```
spark-runner/
├── cmd/
│   └── main.go              # Entry point
├── internal/
│   ├── auth/
│   │   └── github.go        # GitHub OAuth implementation
│   ├── tui/
│   │   └── main.go          # Terminal UI components
│   ├── storage/
│   │   └── sqlite.go        # SQLite persistence
│   └── spark/
│       ├── loader.go        # Spark file loading
│       └── ai.go            # AI evaluation engine
├── go.mod                   # Go module definition
└── README.md               # This file
```

## Building

### Prerequisites

- Go 1.21 or later
- Git

### Installation

```bash
cd spark-runner
go build -o spark-runner cmd/main.go
```

### Running

```bash
./spark-runner
```

## Usage

### Main Menu

1. **[1] Login with GitHub** - Authenticate using GitHub Device Flow
2. **[2] Local Quiz Room** - Take a quiz
3. **[3] Leaderboard** - View top scores
4. **[q] Quit** - Exit the application

### Quiz Flow

1. Select a quiz from the Local Quiz Room
2. Answer questions one at a time
3. Receive immediate feedback from the AI evaluator
4. Scores are saved to your local database
5. View your progress on the leaderboard

## Configuration

### GitHub OAuth

Before running, set your GitHub OAuth credentials in `internal/auth/github.go`:

```go
data.Set("client_id", "YOUR_GITHUB_CLIENT_ID")
```

Get your Client ID by creating an OAuth app in GitHub:
1. Go to Settings → Developer settings → OAuth Apps
2. Create a new OAuth Application
3. Set Authorization callback URL to `http://localhost:8080`

### Spark Directory

Sparks are loaded from the `sparks/` directory. Create a `sparks/` folder in your data directory with JSON spark definitions.

### Sample Spark Format

```json
{
  "title": "Introduction to Sparks",
  "description": "Learn the basics of the Spark framework",
  "questions": [
    {
      "id": "q1",
      "text": "What are the 4 blocks of the Spark framework?",
      "type": "free-text",
      "hint": "Think: What? Why? How? Does it work?"
    },
    {
      "id": "q2",
      "text": "Which block describes the solution?",
      "type": "multiple-choice",
      "options": ["SPARK", "SOUL", "MUSCLE", "SKIN"]
    }
  ],
  "metadata": {
    "originator": "@user",
    "status": "published",
    "tags": ["tutorial"]
  }
}
```

## Architecture Patterns

### Concurrency

- Uses Go's goroutines for async operations (GitHub auth, DB queries)
- Non-blocking UI with message-based updates
- Channel-based communication between components

### Modularity

- Clean separation between auth, TUI, storage, and spark logic
- Interfaces for extensibility (e.g., custom AI evaluators, storage backends)
- Plugin-ready design for future room/networking features

### Performance

- Single compiled binary with no runtime dependencies
- Efficient SQLite queries with proper indexing
- Minimal memory footprint for terminal UI
- Fast startup and response times

## Future Enhancements

- [ ] IRC-like room architecture for collaborative quizzes
- [ ] Real-time network sync of scores
- [ ] Custom spark TOML parser
- [ ] Rich quiz analytics dashboard
- [ ] User profiles and achievements
- [ ] Spark recommendation engine
- [ ] Mobile app companion
- [ ] Multi-player quiz rooms

## License

MIT (see main repository)

## Contributing

This is a scaffold implementation. Areas for contribution:
- Complete AI evaluation engine with NLP
- Enhanced TUI with color themes and animations
- Multi-user room networking
- Quiz analytics and insights
- Spark creation wizard

## Support

For issues or questions, refer to the main thecommons repository:
https://github.com/rvishravars/thecommons
