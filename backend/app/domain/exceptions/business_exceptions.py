class DomainException(Exception):
    """Base exception for domain errors"""
    pass


class BusinessRuleViolation(DomainException):
    """Raised when a business rule is violated"""
    pass


class NotFoundException(DomainException):
    """Raised when an entity is not found"""
    pass
