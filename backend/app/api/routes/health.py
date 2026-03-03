from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/sentry-debug")
def sentry_debug() -> None:
    raise ValueError("Sentry test error from backend - fix me!")
