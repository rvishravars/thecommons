package tui

import (
	"github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/rvishravars/thecommons/spark-runner/internal/auth"
)

type Screen int

const (
	ScreenMainMenu Screen = iota
	ScreenQuizRoom
	ScreenLeaderboard
	ScreenLoading
)

type MainModel struct {
	currentScreen Screen
	width         int
	height        int
	isLoggedIn    bool
	username      string
	err           error
}

func NewMainModel() MainModel {
	return MainModel{
		currentScreen: ScreenMainMenu,
		isLoggedIn:    false,
	}
}

func (m MainModel) Init() bubbletea.Cmd {
	return nil
}

func (m MainModel) Update(msg bubbletea.Msg) (bubbletea.Model, bubbletea.Cmd) {
	switch msg := msg.(type) {
	case bubbletea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height

	case bubbletea.KeyMsg:
		switch msg.String() {
		case "ctrl+c", "q":
			return m, bubbletea.Quit
		case "1":
			if !m.isLoggedIn {
				return m, m.startGitHubLogin()
			}
		case "2":
			m.currentScreen = ScreenQuizRoom
		case "3":
			m.currentScreen = ScreenLeaderboard
		case "esc":
			m.currentScreen = ScreenMainMenu
		}

	case auth.LoginSuccessMsg:
		m.isLoggedIn = true
		m.username = msg.Username
		m.currentScreen = ScreenMainMenu

	case auth.LoginErrorMsg:
		m.err = msg.Error
	}

	return m, nil
}

func (m MainModel) View() string {
	switch m.currentScreen {
	case ScreenMainMenu:
		return m.renderMainMenu()
	case ScreenQuizRoom:
		return m.renderQuizRoom()
	case ScreenLeaderboard:
		return m.renderLeaderboard()
	case ScreenLoading:
		return m.renderLoading()
	default:
		return m.renderMainMenu()
	}
}

func (m MainModel) renderMainMenu() string {
	title := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("205")).
		Render("⚡ Spark-Runner")

	var content string
	if m.isLoggedIn {
		content = lipgloss.NewStyle().
			Margin(2, 0).
			Render("Welcome, " + m.username + "!\n\n" +
				"[1] Local Quiz Room\n" +
				"[2] Leaderboard\n" +
				"[q] Quit")
	} else {
		content = lipgloss.NewStyle().
			Margin(2, 0).
			Render("[1] Login with GitHub\n" +
				"[q] Quit")
	}

	errMsg := ""
	if m.err != nil {
		errMsg = lipgloss.NewStyle().
			Foreground(lipgloss.Color("1")).
			Render("\n\n❌ " + m.err.Error())
	}

	return lipgloss.Place(m.width, m.height,
		lipgloss.Center, lipgloss.Center,
		title+"\n"+content+errMsg,
	)
}

func (m MainModel) renderQuizRoom() string {
	title := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("33")).
		Render("📚 Local Quiz Room")

	content := lipgloss.NewStyle().
		Margin(2, 0).
		Render("[Placeholder] Quiz room interface\n\n" +
			"[esc] Back to menu\n" +
			"[q] Quit")

	return lipgloss.Place(m.width, m.height,
		lipgloss.Center, lipgloss.Center,
		title+"\n"+content,
	)
}

func (m MainModel) renderLeaderboard() string {
	title := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("82")).
		Render("🏆 Leaderboard")

	content := lipgloss.NewStyle().
		Margin(2, 0).
		Render("[Placeholder] Leaderboard interface\n\n" +
			"[esc] Back to menu\n" +
			"[q] Quit")

	return lipgloss.Place(m.width, m.height,
		lipgloss.Center, lipgloss.Center,
		title+"\n"+content,
	)
}

func (m MainModel) renderLoading() string {
	title := lipgloss.NewStyle().
		Bold(true).
		Foreground(lipgloss.Color("214")).
		Render("🔄 Authenticating...")

	return lipgloss.Place(m.width, m.height,
		lipgloss.Center, lipgloss.Center,
		title,
	)
}

func (m MainModel) startGitHubLogin() bubbletea.Cmd {
	return auth.LoginWithGitHub()
}
