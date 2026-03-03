.PHONY: infra infra-down api fe up down

# Run only infrastructure (Postgres)
infra:
	docker compose up -d db

# Stop infrastructure
infra-down:
	docker compose down

# Run API locally (requires infra running)
api:
	cd backend && uv run fastapi dev app/main.py --host 0.0.0.0 --port 8000

# Run frontend locally
fe:
	cd frontend && npm run dev

# Run everything with Docker
up:
	docker compose up --build -d

# Stop everything
down:
	docker compose down
