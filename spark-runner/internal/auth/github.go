package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/golang-jwt/jwt/v5"
)

const (
	githubOAuthHost   = "https://github.com"
	githubAPIHost     = "https://api.github.com"
	localStorageKey   = "spark_runner_token"
)

// LoginSuccessMsg represents a successful GitHub login
type LoginSuccessMsg struct {
	Username string
	Token    string
}

// LoginErrorMsg represents a login error
type LoginErrorMsg struct {
	Error error
}

// GitHubDeviceFlow represents the device flow response
type githubDeviceFlow struct {
	DeviceCode      string `json:"device_code"`
	UserCode        string `json:"user_code"`
	VerificationURI string `json:"verification_uri"`
	ExpiresIn       int    `json:"expires_in"`
	Interval        int    `json:"interval"`
}

// GitHubUser represents a GitHub user from the API
type GitHubUser struct {
	Login string `json:"login"`
	ID    int    `json:"id"`
}

// LoginWithGitHub initiates the GitHub Device Flow OAuth
func LoginWithGitHub() tea.Cmd {
	return func() tea.Msg {
		// Step 1: Request device code
		deviceFlow, err := requestDeviceCode()
		if err != nil {
			return LoginErrorMsg{Error: err}
		}

		// Step 2: Prompt user to visit verification URL
		fmt.Printf("\n🔐 GitHub Authentication\n")
		fmt.Printf("Visit: %s\n", deviceFlow.VerificationURI)
		fmt.Printf("Enter code: %s\n", deviceFlow.UserCode)
		fmt.Printf("Waiting for authorization...\n\n")

		// Step 3: Poll for token
		token, err := pollForToken(deviceFlow)
		if err != nil {
			return LoginErrorMsg{Error: err}
		}

		// Step 4: Get user info
		username, err := getUserInfo(token)
		if err != nil {
			return LoginErrorMsg{Error: err}
		}

		return LoginSuccessMsg{
			Username: username,
			Token:    token,
		}
	}
}

func requestDeviceCode() (*githubDeviceFlow, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	data := url.Values{}
	data.Set("client_id", "YOUR_GITHUB_CLIENT_ID") // TODO: Move to config
	data.Set("scope", "read:user")

	resp, err := client.PostForm(
		githubOAuthHost+"/login/device/code",
		data,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to request device code: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("github returned status %d: %s", resp.StatusCode, string(body))
	}

	var flow githubDeviceFlow
	if err := json.NewDecoder(resp.Body).Decode(&flow); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &flow, nil
}

func pollForToken(flow *githubDeviceFlow) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(flow.ExpiresIn)*time.Second)
	defer cancel()

	ticker := time.NewTicker(time.Duration(flow.Interval) * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return "", fmt.Errorf("authentication timeout")
		case <-ticker.C:
			data := url.Values{}
			data.Set("client_id", "YOUR_GITHUB_CLIENT_ID") // TODO: Move to config
			data.Set("device_code", flow.DeviceCode)
			data.Set("grant_type", "urn:ietf:params:oauth:grant-type:device_code")

			req, _ := http.NewRequestWithContext(ctx, "POST", githubOAuthHost+"/login/oauth/access_token", nil)
			req.PostForm = data
			req.Header.Set("Accept", "application/json")

			resp, err := client.Do(req)
			if err != nil {
				log.Printf("poll error: %v", err)
				continue
			}

			var result map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&result)
			resp.Body.Close()

			if token, ok := result["access_token"].(string); ok && token != "" {
				return token, nil
			}

			if e, ok := result["error"].(string); ok && e == "authorization_pending" {
				continue
			}

			return "", fmt.Errorf("authentication failed: %v", result["error"])
		}
	}
}

func getUserInfo(token string) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}

	req, _ := http.NewRequest("GET", githubAPIHost+"/user", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	var user GitHubUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return "", fmt.Errorf("failed to decode user: %w", err)
	}

	return user.Login, nil
}

// GenerateJWT creates a local JWT for session management
func GenerateJWT(username string, token string) (string, error) {
	claims := jwt.MapClaims{
		"username": username,
		"github_token": token,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
		"iat":      time.Now().Unix(),
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := jwtToken.SignedString([]byte("spark_runner_secret"))
	if err != nil {
		return "", fmt.Errorf("failed to generate JWT: %w", err)
	}

	return tokenString, nil
}
