set shell := ["bash", "-lc"]

# Paths and versions
NVM_DIR := env_var("HOME") + "/.nvm"
NVM_SH := NVM_DIR + "/nvm.sh"
NODE_VERSION := "22"
N8N_CUSTOM_PATH := env_var("HOME") + "/.n8n/custom"
nvm_use := "if [ -s {{NVM_SH}} ]; then . {{NVM_SH}} && nvm use {{NODE_VERSION}}; fi"
PNPM_BIN := NVM_DIR + "/versions/node/v22.15.0/bin/pnpm"
VIRALAPP_BASE_URL := "https://preview.viral.app/api/v1"
env_prefix := "VIRALAPP_BASE_URL=" + VIRALAPP_BASE_URL + " DB_SQLITE_POOL_SIZE=4 N8N_RUNNERS_ENABLED=true N8N_BLOCK_ENV_ACCESS_IN_NODE=false "

# Resolve package name with the desired Node version
PACKAGE_NAME := `bash -lc 'if [ -s {{NVM_SH}} ]; then . {{NVM_SH}} && nvm use {{NODE_VERSION}} >/dev/null 2>&1; fi; node -p "require(\"./package.json\").name"'`

@default:
    just --list

clean:
    @echo "🧹 Cleaning up..."
    @rm -rf dist node_modules .turbo .build

build: kill-port
    @echo "🏗️  Building project..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} install
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} run build

init-custom-dir:
    @echo "🔧 Ensuring n8n custom directory exists and has a package.json..."
    @mkdir -p {{N8N_CUSTOM_PATH}}
    @[ -f {{N8N_CUSTOM_PATH}}/package.json ] || echo "{}" > {{N8N_CUSTOM_PATH}}/package.json

unlink: init-custom-dir
    @echo "🔓 Unlinking {{PACKAGE_NAME}} from n8n custom directory..."
    @cd {{N8N_CUSTOM_PATH}} && {{nvm_use}} && {{PNPM_BIN}} unlink --global {{PACKAGE_NAME}} || true

link: build init-custom-dir
    @echo "🔗 Linking {{PACKAGE_NAME}} to n8n custom directory..."
    @echo "   Creating global link for {{PACKAGE_NAME}}..."
    @{{nvm_use}} && CI=true {{env_prefix}}{{PNPM_BIN}} link --global || true
    @echo "   Linking {{PACKAGE_NAME}} into {{N8N_CUSTOM_PATH}}..."
    @cd {{N8N_CUSTOM_PATH}} && {{nvm_use}} && CI=true {{env_prefix}}{{PNPM_BIN}} link --global {{PACKAGE_NAME}} || true

start: kill-port
    @echo "🔄 Starting n8n locally (Debug Level)..."
    @echo "🌐 n8n will be available at: http://localhost:5678"
    @{{nvm_use}} && export N8N_LOG_LEVEL=debug N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true && {{env_prefix}}n8n start

format:
    @echo "💅 Formatting code..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} format

lint:
    @echo "🔍 Linting code..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} lint

lintfix:
    @echo "🔧 Fixing lint issues..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} lintfix

watch:
    @echo "👀 Watching for changes and rebuilding (tsc --watch)..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} dev

all: clean build unlink link start

dev: init-custom-dir kill-port
    @echo "🔥 Starting hot reload development mode..."
    @echo "👀 TypeScript will compile automatically on changes"
    @echo "🔄 n8n will hot reload your custom node changes"
    @echo "🌐 n8n will be available at: http://localhost:5678"
    @echo ""
    @echo "💡 Initial build and link required first..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} build
    @{{nvm_use}} && CI=true {{env_prefix}}{{PNPM_BIN}} link --global || true
    @cd {{N8N_CUSTOM_PATH}} && {{nvm_use}} && CI=true {{env_prefix}}{{PNPM_BIN}} link --global {{PACKAGE_NAME}} || true
    @echo "🚀 Starting watch mode with hot reload..."
    @{{nvm_use}} && {{env_prefix}}{{PNPM_BIN}} run dev:hot

dev-simple: build unlink link start

local: build unlink link kill-port
    @echo "🎮 Starting n8n locally (without tunnel)..."
    @echo "🌐 Access n8n at: http://localhost:5678"
    @{{nvm_use}} && export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true && {{env_prefix}}n8n start

tunnel-ngrok: build unlink link kill-port
    @echo "🌍 Starting n8n with ngrok tunnel..."
    @echo "📝 Make sure ngrok is installed: brew install ngrok"
    @echo "🔗 Starting n8n on localhost:5678..."
    @{{nvm_use}} && export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true && {{env_prefix}}n8n start &
    @sleep 3
    @echo "🌐 Starting ngrok tunnel..."
    @ngrok http 5678

tunnel-builtin: build unlink link kill-port
    @echo "⚠️  Warning: The built-in tunnel service is currently experiencing issues"
    @echo "🔄 Starting n8n with built-in tunnel..."
    @{{nvm_use}} && export N8N_LOG_LEVEL=debug N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true && {{env_prefix}}n8n start --tunnel

kill-port:
    @echo "🛑 Freeing port 5678 (n8n default)..."
    @lsof -ti :5678 | xargs -r kill -9 || true

update-openapi:
    @echo "⬇️  Downloading latest ViralApp OpenAPI spec..."
    @curl -fsSL https://preview.viral.app/api/v1/openapi.json -o viralapp-openapi.json
