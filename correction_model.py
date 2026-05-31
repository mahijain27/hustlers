"""
Model 3: Medicine Correction Model
Uses RapidFuzz and pandas for correcting OCR spelling errors using fuzzy string matching.

Fixes applied:
- get_similar_medicines now has a minimum similarity threshold to prevent
  suggesting completely unrelated medicines.
- Added clarification: "is_corrected: False" can mean either "exact match" or
  "no correction needed (below threshold)" — check the `method` field.
"""

import pandas as pd
from rapidfuzz import fuzz, process
import logging
from typing import Dict, List, Tuple, Optional
from utils.config import CORRECTION_CONFIG

logger = logging.getLogger(__name__)


class MedicineCorrectionModel:
    """
    Corrects OCR spelling errors in medicine names using fuzzy string matching.
    """

    def __init__(self, medicine_database: Optional[pd.DataFrame] = None):
        """
        Initialize correction model.

        Args:
            medicine_database: DataFrame with correct medicine names.
        """
        self.medicine_database = medicine_database
        self.similarity_threshold = CORRECTION_CONFIG["similarity_threshold"]
        self.max_distance = CORRECTION_CONFIG["max_distance"]
        self.min_similarity_for_suggestions = CORRECTION_CONFIG.get(
            "min_similarity_for_suggestions", 0.60
        )

        # Build a list of correct medicine names for fast lookup
        if medicine_database is not None:
            self.correct_medicines = medicine_database["name"].tolist()
        else:
            # Load default database
            default_db = self._get_default_database()
            self.medicine_database = default_db
            self.correct_medicines = default_db["name"].tolist()

        logger.info(
            f"Initialized correction model with {len(self.correct_medicines)} medicine names"
        )

    def _get_default_database(self) -> pd.DataFrame:
        """
        Get default medicine database (can be extended).

        Returns:
            DataFrame with medicine information.
        """
        medicines = [
            {"name": "Aspirin", "category": "Analgesic"},
            {"name": "Metformin", "category": "Diabetes"},
            {"name": "Lisinopril", "category": "Hypertension"},
            {"name": "Atorvastatin", "category": "Cholesterol"},
            {"name": "Ibuprofen", "category": "Analgesic"},
            {"name": "Amoxicillin", "category": "Antibiotic"},
            {"name": "Omeprazole", "category": "Gastric"},
            {"name": "Levothyroxine", "category": "Thyroid"},
            {"name": "Amlodipine", "category": "Hypertension"},
            {"name": "Sertraline", "category": "Antidepressant"},
        ]
        return pd.DataFrame(medicines)

    def load_medicine_database(self, database_path: str) -> None:
        """
        Load medicine database from CSV file.

        Args:
            database_path: Path to medicine CSV database.
        """
        logger.info(f"Loading medicine database from: {database_path}")
        try:
            self.medicine_database = pd.read_csv(database_path)
            self.correct_medicines = self.medicine_database["name"].tolist()
            logger.info(f"Loaded {len(self.correct_medicines)} medicines")
        except Exception as e:
            logger.error(f"Error loading database: {str(e)}")

    def correct_medicine_name(
        self, medicine_name: str, threshold: Optional[float] = None
    ) -> Dict:
        """
        Correct a single medicine name using fuzzy matching.

        Args:
            medicine_name: Potentially misspelled medicine name.
            threshold: Similarity threshold (default from config).

        Returns:
            Dictionary with correction results. The 'is_corrected' flag indicates
            whether a correction was applied. Check the 'method' field to distinguish
            between "Exact match", "Fuzzy matching", or "No match found".
        """
        if not medicine_name or not isinstance(medicine_name, str):
            return {
                "original": medicine_name,
                "corrected": medicine_name,
                "score": 0.0,
                "is_corrected": False,
                "confidence": 0.0,
                "method": "Invalid input",
            }

        threshold = threshold or self.similarity_threshold
        medicine_name_lower = medicine_name.lower().strip()

        # Check for exact match first
        exact_matches = [
            m for m in self.correct_medicines if m.lower() == medicine_name_lower
        ]
        if exact_matches:
            return {
                "original": medicine_name,
                "corrected": exact_matches[0],
                "score": 1.0,
                "is_corrected": False,  # No correction needed
                "confidence": 1.0,
                "method": "Exact match",
            }

        # Use fuzzy matching
        best_match = process.extractOne(
            medicine_name, self.correct_medicines, scorer=fuzz.token_set_ratio
        )

        if best_match:
            corrected_name, score, _ = best_match
            score_normalized = score / 100.0

            is_corrected = score_normalized >= threshold

            return {
                "original": medicine_name,
                "corrected": corrected_name if is_corrected else medicine_name,
                "score": score_normalized,
                "is_corrected": is_corrected,
                "confidence": score_normalized,
                "method": "Fuzzy matching (token_set_ratio)",
            }

        return {
            "original": medicine_name,
            "corrected": medicine_name,
            "score": 0.0,
            "is_corrected": False,
            "confidence": 0.0,
            "method": "No match found",
        }

    def get_similar_medicines(
        self, medicine_name: str, top_n: int = 5, min_similarity: Optional[float] = None
    ) -> List[Dict]:
        """
        Get top N similar medicine names with a minimum similarity threshold.

        Args:
            medicine_name: Input medicine name.
            top_n: Number of similar medicines to return.
            min_similarity: Minimum similarity score (default from config).
                           Prevents suggesting completely unrelated medicines.

        Returns:
            List of similar medicines with scores (only above min_similarity).
        """
        logger.info(f"Finding {top_n} most similar medicines for: {medicine_name}")

        min_sim = min_similarity or self.min_similarity_for_suggestions

        matches = process.extract(
            medicine_name,
            self.correct_medicines,
            scorer=fuzz.token_set_ratio,
            limit=top_n * 2,  # Get extras in case many are filtered
        )

        results = []
        for match, score, _ in matches:
            normalized_score = score / 100.0
            if normalized_score >= min_sim:
                results.append({"name": match, "similarity": normalized_score})

            if len(results) >= top_n:
                break

        return results

    def correct_medicines_batch(self, medicine_names: List[str]) -> pd.DataFrame:
        """
        Correct multiple medicine names.

        Args:
            medicine_names: List of medicine names to correct.

        Returns:
            DataFrame with correction results.
        """
        logger.info(f"Correcting {len(medicine_names)} medicine names...")

        corrections = []
        for medicine_name in medicine_names:
            correction = self.correct_medicine_name(medicine_name)
            corrections.append(correction)

        df_corrections = pd.DataFrame(corrections)

        corrected_count = df_corrections["is_corrected"].sum()
        logger.info(
            f"Corrected {corrected_count} out of {len(medicine_names)} medicines"
        )

        return df_corrections

    def correct_extracted_medicines(self, medicines: List[Dict]) -> List[Dict]:
        """
        Correct medicine names in extracted medicine list.

        Args:
            medicines: List of extracted medicine dictionaries.

        Returns:
            List of medicines with corrected names and metadata.
        """
        logger.info(f"Correcting {len(medicines)} extracted medicines...")

        corrected_medicines = []

        for medicine in medicines:
            if "name" in medicine:
                correction = self.correct_medicine_name(medicine["name"])

                corrected_medicine = medicine.copy()
                corrected_medicine["original_name"] = medicine["name"]
                corrected_medicine["name"] = correction["corrected"]
                corrected_medicine["correction_score"] = correction["score"]
                corrected_medicine["spelling_corrected"] = correction["is_corrected"]
                corrected_medicine["correction_confidence"] = correction["confidence"]
                corrected_medicine["correction_method"] = correction["method"]

                corrected_medicines.append(corrected_medicine)
            else:
                corrected_medicines.append(medicine)

        return corrected_medicines

    def get_correction_statistics(self, medicines: pd.DataFrame) -> Dict:
        """
        Get statistics about corrections made.

        Args:
            medicines: DataFrame with correction results.

        Returns:
            Dictionary with statistics.
        """
        stats = {
            "total_medicines": len(medicines),
            "corrected": medicines["is_corrected"].sum(),
            "not_corrected": (~medicines["is_corrected"]).sum(),
            "average_similarity": medicines["score"].mean(),
            "min_similarity": medicines["score"].min(),
            "max_similarity": medicines["score"].max(),
            "correction_rate": (
                medicines["is_corrected"].sum() / len(medicines)
                if len(medicines) > 0
                else 0
            ),
        }

        logger.info(f"Correction Statistics: {stats}")

        return stats

    def export_corrections(
        self, medicines: pd.DataFrame, output_path: str
    ) -> None:
        """
        Export correction results to CSV.

        Args:
            medicines: DataFrame with corrections.
            output_path: Path to save CSV file.
        """
        try:
            medicines.to_csv(output_path, index=False)
            logger.info(f"Corrections exported to: {output_path}")
        except Exception as e:
            logger.error(f"Error exporting corrections: {str(e)}")

    def interactive_correction(self, medicine_name: str) -> Dict:
        """
        Interactive correction with options to choose from similar matches.

        Args:
            medicine_name: Input medicine name.

        Returns:
            Dictionary with correction and similar options.
        """
        correction = self.correct_medicine_name(medicine_name)
        similar = self.get_similar_medicines(medicine_name, top_n=5)

        return {
            "original": medicine_name,
            "primary_correction": correction,
            "similar_options": similar,
        }


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    corrector = MedicineCorrectionModel()

    # Test single correction
    misspelled = "Asprinh"
    result = corrector.correct_medicine_name(misspelled)
    print(f"Correcting '{misspelled}': {result}")

    # Test batch correction
    misspelled_list = ["Asprinh", "Metforrmin", "Lsinopril", "Ibuprfen"]
    df_corrections = corrector.correct_medicines_batch(misspelled_list)
    print("\nBatch Corrections:")
    print(df_corrections)

    # Get similar medicines
    similar = corrector.get_similar_medicines("Aspirin", top_n=3)
    print("\nSimilar medicines:")
    for med in similar:
        print(f"  - {med['name']}: {med['similarity']:.2%}")
