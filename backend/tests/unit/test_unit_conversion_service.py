"""Unit tests for UnitConversionService."""

import pytest

from app.domain.services.unit_conversion_service import UnitConversionService


def test_calculate_total_units_five_boxes_factor_twelve_returns_sixty():
    """5 boxes with factor 12 returns 60 units."""
    result = UnitConversionService.calculate_total_units(
        packaging_quantity=5,
        factor=12,
    )
    assert result == 60
