# Spark-Runner Makefile

.PHONY: build run clean test install-deps fmt lint

# Build variables
BINARY_NAME=spark-runner
GO_CMD=go
GO_BUILD=$(GO_CMD) build
GO_CLEAN=$(GO_CMD) clean
GO_TEST=$(GO_CMD) test
GO_INSTALL=$(GO_CMD) install

# Paths
CMD_DIR=cmd
BUILD_DIR=bin
MAIN_PACKAGE=$(CMD_DIR)/main.go

# Build target
build: install-deps
	$(GO_BUILD) -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PACKAGE)
	@echo "✅ Build complete: $(BUILD_DIR)/$(BINARY_NAME)"

# Run the application
run: build
	./$(BUILD_DIR)/$(BINARY_NAME)

# Install dependencies
install-deps:
	$(GO_CMD) mod download
	$(GO_CMD) mod tidy
	@echo "✅ Dependencies installed"

# Run tests
test:
	$(GO_TEST) ./...

# Format code
fmt:
	$(GO_CMD) fmt ./...
	@echo "✅ Code formatted"

# Lint code
lint:
	golangci-lint run ./...

# Clean build artifacts
clean:
	$(GO_CLEAN)
	rm -rf $(BUILD_DIR)
	@echo "✅ Clean complete"

# Build for multiple platforms
build-all: build-linux build-macos build-windows
	@echo "✅ All builds complete"

build-linux:
	GOOS=linux GOARCH=amd64 $(GO_BUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-linux cmd/main.go

build-macos:
	GOOS=darwin GOARCH=amd64 $(GO_BUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-macos cmd/main.go

build-windows:
	GOOS=windows GOARCH=amd64 $(GO_BUILD) -o $(BUILD_DIR)/$(BINARY_NAME)-windows.exe cmd/main.go

# Help
help:
	@echo "Available commands:"
	@echo "  make build          - Build the application"
	@echo "  make run            - Build and run the application"
	@echo "  make clean          - Remove build artifacts"
	@echo "  make install-deps   - Install Go dependencies"
	@echo "  make test           - Run tests"
	@echo "  make fmt            - Format code"
	@echo "  make lint           - Run linter"
	@echo "  make build-all      - Build for all platforms"
	@echo "  make help           - Show this help message"

.DEFAULT_GOAL := help
