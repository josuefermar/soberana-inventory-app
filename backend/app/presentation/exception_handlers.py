from fastapi import Request
from fastapi.responses import JSONResponse
from starlette import status

from app.domain.exceptions.business_exceptions import (
    BusinessRuleViolation,
    NotFoundException,
)


def business_rule_exception_handler(
    _: Request, exc: BusinessRuleViolation
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


def not_found_exception_handler(_: Request, exc: NotFoundException) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )
    