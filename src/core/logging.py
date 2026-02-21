import sys
from loguru import logger
import logging

class InterceptHandler(logging.Handler):
    """
    Default handler from examples in loguru documentation.
    Intercepts standard logging messages and routes them to loguru.
    """
    def emit(self, record: logging.LogRecord) -> None:
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(level, record.getMessage())

def setup_logging():
    """Configure loguru and intercept standard logging."""
    logging.root.handlers = [InterceptHandler()]
    logging.root.setLevel(logging.INFO)

    # Remove all default handlers
    logger.remove()
    
    # Add a formatted handler
    logger.add(
        sys.stdout,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        level="INFO"
    )

    # Specific format for uvicorn access logs if needed
    for name in ["uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"]:
        logging.getLogger(name).handlers = [InterceptHandler()]
        logging.getLogger(name).propagate = False
