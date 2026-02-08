from uuid import UUID, uuid4
from typing import Union


def generate_uuid() -> UUID:
    """Generate a new UUID"""
    return uuid4()


def validate_uuid(uuid_string: str) -> bool:
    """Validate if a string is a valid UUID"""
    try:
        UUID(uuid_string)
        return True
    except ValueError:
        return False