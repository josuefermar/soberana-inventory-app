from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.application.use_cases.auth.login_use_case import LoginUseCase
from app.infrastructure.repositories.user_repository_impl import UserRepositoryImpl
from app.presentation.dependencies.database import get_db


router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    repo = UserRepositoryImpl(db)
    use_case = LoginUseCase(repo)
    token = use_case.execute(request.email, request.password)
    return TokenResponse(access_token=token)