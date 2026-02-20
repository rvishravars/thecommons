"""
Scribe v2.0 - Glass Box AI Agent for TheCommons

A deterministic, hardware-agnostic intelligence layer for evaluating and validating Sparks.
"""

__version__ = "2.0.0"
__author__ = "TheCommons Community"

from .logic.stability_audit import (
    StabilityAuditor,
    StabilityReport,
    PhaseStatus
)

__all__ = [
    "StabilityAuditor",
    "StabilityReport",
    "PhaseStatus"
]

try:
    from .scribe_brain import (
        ScribeBrain,
        HardwareDetector,
        ModelHandler,
        EvaluationPhase,
        HardwareType,
        EvaluationResult,
        GlassBoxLogger
    )

    __all__ += [
        "ScribeBrain",
        "HardwareDetector",
        "ModelHandler",
        "EvaluationPhase",
        "HardwareType",
        "EvaluationResult",
        "GlassBoxLogger"
    ]
except Exception:
    # Optional: scribe_brain dependencies may be missing in light-weight runtime.
    pass
