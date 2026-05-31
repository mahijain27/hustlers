"""
Configuration for Prescription Processing Models

All model parameters and paths are configured here for easy adjustment.
"""

# ============================================================================
# OCR Model Configuration
# ============================================================================
OCR_CONFIG = {
    "languages": ["en"],  # Languages to recognize
    "gpu": False,  # Set to True if you have CUDA-capable GPU
    "model_storage_directory": "./models/ocr_cache",  # Where to cache OCR models
}

TRANSFORMER_OCR_CONFIG = {
    "model_name": "microsoft/trocr-base-printed",  # TrOCR model
    # Alternative: "microsoft/trocr-small-handwritten" for handwritten text
}

# ============================================================================
# NER Model Configuration
# ============================================================================
NER_CONFIG = {
    "model_name": "en_core_sci_md",  # spaCy medical NER model
    # Fallback to: "en_core_web_md", "en_core_web_sm", "blank:en"
    "medicine_labels": [
        "DRUG",
        "MEDICATION",
        "MEDICINE",
    ],  # Expected NER labels for medicines
}

# ============================================================================
# Medicine Correction Model Configuration
# ============================================================================
CORRECTION_CONFIG = {
    "similarity_threshold": 0.80,  # Minimum similarity to apply correction
    "max_distance": 2,  # Max edit distance for fuzzy matching
    "min_similarity_for_suggestions": 0.60,  # Min similarity to suggest as alternative
}

# ============================================================================
# Drug Validation Model Configuration
# ============================================================================
VALIDATION_CONFIG = {
    "drugs_database": "./data/drugs_database.csv",  # Path to drug database CSV
    "similarity_threshold": 0.80,  # Minimum similarity for fuzzy validation
}

# ============================================================================
# Drug Interaction Model Configuration
# ============================================================================
INTERACTION_CONFIG = {
    "interactions_database": "./data/interactions_database.csv",  # Known interactions
    "high_risk_threshold": 0.70,  # Risk score >= this = High severity
    "moderate_risk_threshold": 0.50,  # Risk score >= this = Moderate severity
}

# ============================================================================
# File Paths (relative to project root)
# ============================================================================
DATA_DIR = "./data"
MODELS_DIR = "./models"
OUTPUT_DIR = "./output"

# Common CSV paths
MEDICINES_CSV = f"{DATA_DIR}/medicines.csv"
DRUGS_CSV = f"{DATA_DIR}/drugs.csv"
INTERACTIONS_CSV = f"{DATA_DIR}/interactions.csv"

# Logging Configuration
LOGGING_CONFIG = {
    "level": "INFO",
    "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "handlers": ["console", "file"],
    "log_file": f"{OUTPUT_DIR}/prescription_processing.log",
}
