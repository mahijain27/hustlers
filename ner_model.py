"""
Model 2: Medicine Extraction Model (NER)
Uses spaCy and pandas for identifying and extracting medicine names, dosage, and duration from text.

Fixes applied:
- NER was running on lowercased text, suppressing entity recognition from spaCy models
  which rely on mixed case for proper noun detection. Now pass original-case text to nlp().
- "Closest dosage/duration" assignment was naive: multiple medicines could claim the same
  single dosage. Now uses a greedy assignment that prevents re-use.
- df_medicines was created but never populated. Now properly builds and returns it as an
  alternative output format.
"""

import pandas as pd
import spacy
import logging
import re
from typing import Dict, List, Optional
from utils.config import NER_CONFIG

logger = logging.getLogger(__name__)


class MedicineExtractionModel:
    """
    Extracts medicine names, dosages, and durations from prescription text using NER.
    """

    def __init__(self, model_name: Optional[str] = None):
        """
        Initialize NER model.

        Args:
            model_name: spaCy model name (e.g., 'en_core_sci_md' for medical texts).
                       If None, falls back to 'en_core_web_md', then 'blank:en'.
        """
        self.model_name = model_name or NER_CONFIG["model_name"]
        self.nlp = self._load_model()

        # Define regex patterns for dosage, duration, and frequency
        self.dosage_pattern = re.compile(
            r"(\d+(?:\.\d+)?)\s*(mg|ml|g|mcg|ug|units?|drops?|%)", re.IGNORECASE
        )
        self.duration_pattern = re.compile(
            r"(?:for\s+)?(\d+)\s*(days?|weeks?|months?|years?)", re.IGNORECASE
        )
        self.frequency_pattern = re.compile(
            r"(once|twice|thrice|1x|2x|3x|4x|daily|bd|tid|qid|every\s+\d+\s+hours?)",
            re.IGNORECASE,
        )

    def _load_model(self) -> spacy.Language:
        """
        Load spaCy NER model with fallback chain.

        Returns:
            Loaded spaCy model.
        """
        models_to_try = [
            self.model_name,
            "en_core_web_md",
            "en_core_web_sm",
            "blank:en",
        ]

        for model in models_to_try:
            try:
                logger.info(f"Attempting to load spaCy model: {model}")
                return spacy.load(model)
            except OSError:
                logger.warning(f"Model {model} not found. Trying next option...")
                continue

        logger.warning(
            "Could not load any spaCy model. Creating blank English model."
        )
        return spacy.blank("en")

    # ------------------------------------------------------------------
    # Entity extraction
    # ------------------------------------------------------------------

    def extract_medicines(self, text: str) -> List[Dict]:
        """
        Extract medicine entities and associated metadata from text.

        Args:
            text: Prescription text (original casing preserved).

        Returns:
            List of medicine dictionaries with name, dosage, duration, frequency.
        """
        logger.info("Extracting medicines from text...")

        # Process with spaCy using ORIGINAL case (not lowercased)
        # NER models rely on mixed case for proper noun detection
        doc = self.nlp(text)

        medicines = []
        seen_names = set()

        # Extract medicine entities
        for ent in doc.ents:
            if ent.label_ in NER_CONFIG["medicine_labels"]:
                medicine_name = ent.text.strip()

                # Avoid duplicates
                if medicine_name.lower() in seen_names:
                    continue
                seen_names.add(medicine_name.lower())

                medicine = {
                    "name": medicine_name,
                    "entity_label": ent.label_,
                    "start": ent.start_char,
                    "end": ent.end_char,
                    "dosage": None,
                    "duration": None,
                    "frequency": None,
                }

                medicines.append(medicine)

        # If no entities found, try pattern-based extraction as fallback
        if not medicines:
            logger.info(
                "No NER entities found. Attempting pattern-based extraction..."
            )
            medicines = self._extract_medicines_by_pattern(text)

        # Assign dosage, duration, and frequency
        medicines = self._assign_dosage_duration_frequency(text, medicines)

        logger.info(f"Extracted {len(medicines)} medicines")

        return medicines

    def _extract_medicines_by_pattern(self, text: str) -> List[Dict]:
        """
        Pattern-based fallback extraction when NER fails.
        Looks for capitalized words before dosage indicators.

        Args:
            text: Prescription text.

        Returns:
            List of extracted medicines.
        """
        medicines = []

        # Simple heuristic: words immediately before dosage mentions
        for match in self.dosage_pattern.finditer(text):
            start = max(0, match.start() - 50)
            preceding_text = text[start : match.start()]
            words = preceding_text.split()

            if words:
                # Take the last capitalized word before the dosage
                for word in reversed(words):
                    if word and word[0].isupper() and len(word) > 2:
                        medicine_name = word.rstrip(".,;:")
                        medicines.append(
                            {
                                "name": medicine_name,
                                "entity_label": "MEDICINE_PATTERN",
                                "start": -1,
                                "end": -1,
                                "dosage": None,
                                "duration": None,
                                "frequency": None,
                            }
                        )
                        break

        return medicines

    # ------------------------------------------------------------------
    # Dosage, duration, frequency assignment
    # ------------------------------------------------------------------

    def _assign_dosage_duration_frequency(
        self, text: str, medicines: List[Dict]
    ) -> List[Dict]:
        """
        Assign dosage, duration, and frequency to medicines using greedy matching.
        Prevents multiple medicines from claiming the same dosage value.

        Args:
            text: Original prescription text.
            medicines: List of extracted medicines.

        Returns:
            Medicines with assigned dosage, duration, frequency.
        """
        # Extract all dosages, durations, and frequencies with positions
        dosages = [
            (m.group(0), m.start()) for m in self.dosage_pattern.finditer(text)
        ]
        durations = [
            (m.group(0), m.start()) for m in self.duration_pattern.finditer(text)
        ]
        frequencies = [
            (m.group(0), m.start()) for m in self.frequency_pattern.finditer(text)
        ]

        used_dosage_indices = set()
        used_duration_indices = set()
        used_frequency_indices = set()

        for medicine in medicines:
            med_pos = medicine.get("start", 0)
            if med_pos == -1:
                med_pos = 0

            # Assign closest unused dosage
            if dosages:
                closest_dosage_idx = self._find_closest_unused_idx(
                    med_pos, dosages, used_dosage_indices
                )
                if closest_dosage_idx is not None:
                    medicine["dosage"] = dosages[closest_dosage_idx][0]
                    used_dosage_indices.add(closest_dosage_idx)

            # Assign closest unused duration
            if durations:
                closest_duration_idx = self._find_closest_unused_idx(
                    med_pos, durations, used_duration_indices
                )
                if closest_duration_idx is not None:
                    medicine["duration"] = durations[closest_duration_idx][0]
                    used_duration_indices.add(closest_duration_idx)

            # Assign closest unused frequency
            if frequencies:
                closest_frequency_idx = self._find_closest_unused_idx(
                    med_pos, frequencies, used_frequency_indices
                )
                if closest_frequency_idx is not None:
                    medicine["frequency"] = frequencies[closest_frequency_idx][0]
                    used_frequency_indices.add(closest_frequency_idx)

        return medicines

    @staticmethod
    def _find_closest_unused_idx(
        position: int, items: List[tuple], used_indices: set
    ) -> Optional[int]:
        """
        Find the index of the closest item to a position that hasn't been used.

        Args:
            position: Reference position.
            items: List of (value, position) tuples.
            used_indices: Set of already-used indices.

        Returns:
            Index of closest unused item, or None.
        """
        closest_idx = None
        closest_distance = float("inf")

        for idx, (_, item_pos) in enumerate(items):
            if idx not in used_indices:
                distance = abs(position - item_pos)
                if distance < closest_distance:
                    closest_distance = distance
                    closest_idx = idx

        return closest_idx

    # ------------------------------------------------------------------
    # Batch processing and output formats
    # ------------------------------------------------------------------

    def extract_medicines_batch(self, texts: List[str]) -> pd.DataFrame:
        """
        Extract medicines from multiple texts.

        Args:
            texts: List of prescription texts.

        Returns:
            DataFrame with medicines from all texts.
        """
        all_medicines = []

        for text in texts:
            medicines = self.extract_medicines(text)
            for medicine in medicines:
                medicine["source_text"] = text
                all_medicines.append(medicine)

        df_medicines = pd.DataFrame(all_medicines)
        logger.info(f"Extracted {len(df_medicines)} medicines from {len(texts)} texts")

        return df_medicines

    def extract_medicines_with_context(self, text: str) -> Dict:
        """
        Extract medicines with full context information.

        Args:
            text: Prescription text.

        Returns:
            Dictionary with medicines and metadata.
        """
        medicines = self.extract_medicines(text)

        return {
            "text": text,
            "text_length": len(text),
            "medicines": medicines,
            "total_medicines": len(medicines),
            "extraction_method": (
                "spaCy NER"
                if any(m.get("entity_label") != "MEDICINE_PATTERN" for m in medicines)
                else "Pattern-based"
            ),
        }

    def get_extraction_statistics(self, medicines: pd.DataFrame) -> Dict:
        """
        Get statistics about extracted medicines.

        Args:
            medicines: DataFrame with extraction results.

        Returns:
            Dictionary with statistics.
        """
        stats = {
            "total_medicines": len(medicines),
            "with_dosage": medicines["dosage"].notna().sum(),
            "with_duration": medicines["duration"].notna().sum(),
            "with_frequency": medicines["frequency"].notna().sum(),
            "unique_medicines": medicines["name"].nunique(),
        }

        logger.info(f"Extraction Statistics: {stats}")

        return stats

    def export_medicines(self, medicines: pd.DataFrame, output_path: str) -> None:
        """
        Export extracted medicines to CSV.

        Args:
            medicines: DataFrame with medicines.
            output_path: Path to save CSV file.
        """
        try:
            medicines.to_csv(output_path, index=False)
            logger.info(f"Medicines exported to: {output_path}")
        except Exception as e:
            logger.error(f"Error exporting medicines: {str(e)}")


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    extractor = MedicineExtractionModel()

    # Test single extraction
    prescription = (
        "Patient: John Doe. "
        "Rx: Aspirin 500mg twice daily for 10 days. "
        "Also prescribe Metformin 1000mg once daily for 3 months."
    )
    medicines = extractor.extract_medicines(prescription)
    print("Extracted Medicines:")
    for med in medicines:
        print(f"  - {med['name']}: {med['dosage']} {med['frequency']} for {med['duration']}")

    # Test batch extraction
    prescriptions = [
        prescription,
        "Rx: Ibuprofen 400mg three times daily for 5 days",
    ]
    df = extractor.extract_medicines_batch(prescriptions)
    print("\nBatch Extraction:")
    print(df)

    # Get statistics
    stats = extractor.get_extraction_statistics(df)
    print("\nStatistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
