.PHONY: clean build init-custom-dir link unlink start all dev dev-simple format lint lintfix watch

# Variables
PROJECT_PATH=$(shell pwd) # Assumes you run make from the project root
N8N_CUSTOM_PATH=~/.n8n/custom

# NVM configuration - load nvm and use Node v22
NVM_DIR := $(HOME)/.nvm
NVM_SH := $(NVM_DIR)/nvm.sh
NODE_VERSION := 22

# Define a command to load nvm and use Node v22
define NVM_USE
	. $(NVM_SH) && nvm use $(NODE_VERSION)
endef

# Get package name using Node v22
PACKAGE_NAME=$(shell . $(NVM_SH) && nvm use $(NODE_VERSION) >/dev/null 2>&1 && node -p "require('./package.json').name")

clean:
	@echo "🧹 Cleaning up..."
	rm -rf dist
	rm -rf node_modules
	rm -rf .turbo # Keep if using turborepo, otherwise remove
	rm -rf .build # Keep if your build process creates this, otherwise remove
	# pnpm store prune # Usually not needed unless you suspect store corruption

build:
	@echo "🏗️  Building project..."
	@$(NVM_USE) && pnpm install # Ensure dependencies are installed
	@$(NVM_USE) && pnpm run build

init-custom-dir:
	@echo "🔧 Ensuring n8n custom directory exists and has a package.json..."
	mkdir -p $(N8N_CUSTOM_PATH)
	@# Check if package.json exists, if not, create a minimal one
	@[ -f $(N8N_CUSTOM_PATH)/package.json ] || echo "{}" > $(N8N_CUSTOM_PATH)/package.json

unlink: init-custom-dir
	@echo "🔓 Unlinking $(PACKAGE_NAME) from n8n custom directory..."
	@cd $(N8N_CUSTOM_PATH) && $(NVM_USE) && pnpm unlink --global $(PACKAGE_NAME) || true

link: build init-custom-dir
	@echo "🔗 Linking $(PACKAGE_NAME) to n8n custom directory..."
	@echo "   Creating global link for $(PACKAGE_NAME)..."
	@$(NVM_USE) && pnpm link --global
	@echo "   Linking $(PACKAGE_NAME) into $(N8N_CUSTOM_PATH)..."
	@cd $(N8N_CUSTOM_PATH) && $(NVM_USE) && pnpm link --global $(PACKAGE_NAME)

# Note: The --tunnel flag has been removed from start due to ongoing localtunnel service issues
# Use 'make tunnel-ngrok' for webhook testing or deploy to a cloud service
start:
	@echo "🔄 Starting n8n locally (Debug Level)..."
	@echo "🌐 n8n will be available at: http://localhost:5678"
	@$(NVM_USE) && export N8N_LOG_LEVEL=debug && n8n start

format:
	@echo "💅 Formatting code..."
	@$(NVM_USE) && pnpm format

lint:
	@echo "🔍 Linting code..."
	@$(NVM_USE) && pnpm lint

lintfix:
	@echo "🔧 Fixing lint issues..."
	@$(NVM_USE) && pnpm lintfix

watch:
	@echo "👀 Watching for changes and rebuilding (tsc --watch)..."
	@$(NVM_USE) && pnpm dev

# Main command to run everything (clean build, link, start)
all: clean build unlink link start

# Main development command with hot reload (recommended)
dev: init-custom-dir
	@echo "🔥 Starting hot reload development mode..."
	@echo "👀 TypeScript will compile automatically on changes"
	@echo "🔄 n8n will hot reload your custom node changes"
	@echo "🌐 n8n will be available at: http://localhost:5678"
	@echo ""
	@echo "💡 Initial build and link required first..."
	@$(NVM_USE) && pnpm build
	@$(NVM_USE) && pnpm link --global
	@cd $(N8N_CUSTOM_PATH) && $(NVM_USE) && pnpm link --global $(PACKAGE_NAME)
	@echo "🚀 Starting watch mode with hot reload..."
	@$(NVM_USE) && pnpm run dev:hot

# Simple development cycle without hot reload (fallback)
dev-simple: build unlink link start

# Run n8n locally without tunnel (recommended for development)
local: build unlink link
	@echo "🎮 Starting n8n locally (without tunnel)..."
	@echo "🌐 Access n8n at: http://localhost:5678"
	@$(NVM_USE) && n8n start


# Run n8n with ngrok tunnel (requires ngrok to be installed)
tunnel-ngrok: build unlink link
	@echo "🌍 Starting n8n with ngrok tunnel..."
	@echo "📝 Make sure ngrok is installed: brew install ngrok"
	@echo "🔗 Starting n8n on localhost:5678..."
	@$(NVM_USE) && n8n start &
	@sleep 3
	@echo "🌐 Starting ngrok tunnel..."
	ngrok http 5678

# Run n8n with the built-in tunnel (currently unreliable)
tunnel-builtin: build unlink link
	@echo "⚠️  Warning: The built-in tunnel service is currently experiencing issues"
	@echo "🔄 Starting n8n with built-in tunnel..."
	@$(NVM_USE) && export N8N_LOG_LEVEL=debug && n8n start --tunnel 