"""Domain service for unit conversion (packaging to total units)."""


class UnitConversionService:
    """Calculates total units from packaging quantity and factor."""

    @staticmethod
    def calculate_total_units(packaging_quantity: int, factor: int) -> int:
        """Total units = packaging_quantity * factor."""
        return packaging_quantity * factor
