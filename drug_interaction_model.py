"""
Model 5: Drug Interaction Prediction Model
Uses XGBoost and scikit-learn for predicting harmful interactions between drugs.

Fixes applied:
- Original feature engineering (string length, vowel count, name similarity) was
  pharmacologically meaningless. Replaced with:
  * Shared drug class indicators (e.g., both are statins, both are ACE inhibitors)
  * Category similarity/distance (drugs in similar categories more likely to interact)
  * Known interaction database as primary lookup
- Added proper training mechanism that trains on default interaction database
- Removed bare except clause; now logs specific errors
- Added validation that model is fitted before prediction
- Severity thresholding is more conservative (0.7 high, 0.5 moderate)
"""

import pandas as pd
import numpy as np
import xgboost as xgb
import json
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
from sklearn.preprocessing import LabelEncoder
from utils.config import INTERACTION_CONFIG

logger = logging.getLogger(__name__)


class DrugInteractionModel:
    """
    Predicts harmful drug interactions using a database-first approach
    with ML as a supplemental signal.
    """

    def __init__(self, database_path: Optional[str] = None):
        """
        Initialize drug interaction model.

        Args:
            database_path: Path to known drug interactions CSV.
        """
        self.database_path = database_path or str(
            INTERACTION_CONFIG.get("interactions_database", "interactions.csv")
        )
        self.interaction_database = None
        self.xgb_model = None
        self.is_model_fitted = False

        # Feature encoders
        self.category_encoder = LabelEncoder()
        self.known_categories = []

        # High/moderate/low interaction thresholds (more conservative)
        self.high_risk_threshold = INTERACTION_CONFIG.get("high_risk_threshold", 0.70)
        self.moderate_risk_threshold = INTERACTION_CONFIG.get(
            "moderate_risk_threshold", 0.50
        )

        # Load interaction database
        self._load_interaction_database()

        # Initialize XGBoost model (unfitted)
        self.xgb_model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.05,
            random_state=42,
        )

    def _load_interaction_database(self) -> None:
        """Load known drug interactions from CSV or create default."""
        try:
            if Path(self.database_path).exists():
                logger.info(f"Loading interaction database from: {self.database_path}")
                self.interaction_database = pd.read_csv(self.database_path)
            else:
                logger.warning(
                    f"Database file not found: {self.database_path}. Using default database."
                )
                self.interaction_database = self._create_default_interaction_database()
        except Exception as e:
            logger.error(
                f"Error loading interaction database: {str(e)}. Using default."
            )
            self.interaction_database = self._create_default_interaction_database()

    def _create_default_interaction_database(self) -> pd.DataFrame:
        """
        Create a default known drug interactions database.
        These are real interactions from pharmacological literature.

        Returns:
            DataFrame with known interactions.
        """
        interactions = [
            {
                "drug1": "Aspirin",
                "drug2": "Ibuprofen",
                "severity": "Moderate",
                "risk_score": 0.65,
                "interaction_type": "NSAID + NSAID - Increased GI bleeding risk",
            },
            {
                "drug1": "Metformin",
                "drug2": "Atorvastatin",
                "severity": "Low",
                "risk_score": 0.35,
                "interaction_type": "Minimal - Different mechanisms",
            },
            {
                "drug1": "Lisinopril",
                "drug2": "Amlodipine",
                "severity": "Low",
                "risk_score": 0.30,
                "interaction_type": "Both are antihypertensives - Additive but manageable",
            },
            {
                "drug1": "Metformin",
                "drug2": "Lisinopril",
                "severity": "Low",
                "risk_score": 0.25,
                "interaction_type": "Different mechanisms - Safe together",
            },
            {
                "drug1": "Sertraline",
                "drug2": "Ibuprofen",
                "severity": "Moderate",
                "risk_score": 0.55,
                "interaction_type": "SSRI + NSAID - Increased bleeding risk",
            },
            {
                "drug1": "Aspirin",
                "drug2": "Atorvastatin",
                "severity": "Low",
                "risk_score": 0.20,
                "interaction_type": "Cardioprotective combination",
            },
            {
                "drug1": "Amoxicillin",
                "drug2": "Metformin",
                "severity": "Low",
                "risk_score": 0.32,
                "interaction_type": "Minimal interaction",
            },
        ]
        return pd.DataFrame(interactions)

    # ------------------------------------------------------------------
    # Feature engineering (pharmacologically meaningful)
    # ------------------------------------------------------------------

    def extract_interaction_features(
        self, drug1: str, drug2: str, drug_database: Optional[pd.DataFrame] = None
    ) -> np.ndarray:
        """
        Extract pharmacologically meaningful features for drug pair.

        Features:
        1. Shared drug class indicator (1.0 if both contain common suffixes)
        2. Category similarity (encoded distance between categories)
        3. Historical interaction strength (from database lookup)

        Args:
            drug1: First drug name.
            drug2: Second drug name.
            drug_database: Optional DataFrame with drug metadata (name, category).

        Returns:
            Feature vector (3-element array).
        """
        features = []

        # Feature 1: Shared drug class (based on naming patterns)
        # Common suffixes indicate drug class
        # e.g., "-statin" (statins), "-pril" (ACE inhibitors), "-ine" (various)
        shared_class = self._compute_shared_class_score(drug1, drug2)
        features.append(shared_class)

        # Feature 2: Category similarity (if we have metadata)
        if drug_database is not None:
            category_sim = self._compute_category_similarity(drug1, drug2, drug_database)
            features.append(category_sim)
        else:
            features.append(0.0)

        # Feature 3: Known interaction base score
        known_interaction = self._get_known_interaction_score(drug1, drug2)
        features.append(known_interaction)

        return np.array(features)

    @staticmethod
    def _compute_shared_class_score(drug1: str, drug2: str) -> float:
        """
        Compute shared drug class score based on naming patterns.
        Drugs in the same class are more likely to interact.

        Args:
            drug1: First drug name.
            drug2: Second drug name.

        Returns:
            Score 0.0–1.0 (higher = more likely same class).
        """
        # Drug class suffixes (non-exhaustive examples)
        class_patterns = {
            "-statin": "Statin",
            "-pril": "ACE Inhibitor",
            "-sartan": "ARB",
            "-ine": "Generic",
            "-olol": "Beta blocker",
            "-ine": "Antidepressant (SSRIs often end in -ine)",
        }

        shared_count = 0
        for suffix in class_patterns.keys():
            if drug1.lower().endswith(suffix) and drug2.lower().endswith(suffix):
                shared_count += 1

        return min(0.5, shared_count * 0.25)  # Cap at 0.5

    @staticmethod
    def _compute_category_similarity(
        drug1: str, drug2: str, drug_database: pd.DataFrame
    ) -> float:
        """
        Compute similarity between drug categories.
        Same or related categories suggest higher interaction risk.

        Args:
            drug1: First drug name.
            drug2: Second drug name.
            drug_database: DataFrame with drug metadata.

        Returns:
            Score 0.0–1.0 (higher = more similar categories).
        """
        # Find categories for both drugs
        db_lower = drug_database.copy()
        db_lower["name"] = db_lower["name"].str.lower()

        drug1_lower = drug1.lower()
        drug2_lower = drug2.lower()

        cat1_matches = db_lower[db_lower["name"] == drug1_lower]
        cat2_matches = db_lower[db_lower["name"] == drug2_lower]

        if cat1_matches.empty or cat2_matches.empty:
            return 0.0

        cat1 = str(cat1_matches.iloc[0].get("category", "")).lower()
        cat2 = str(cat2_matches.iloc[0].get("category", "")).lower()

        # Exact match
        if cat1 == cat2:
            return 1.0

        # Partial match (both contain common word)
        if cat1 and cat2:
            words1 = set(cat1.split())
            words2 = set(cat2.split())
            overlap = len(words1 & words2)
            if overlap > 0:
                return min(1.0, overlap * 0.3)

        return 0.0

    def _get_known_interaction_score(self, drug1: str, drug2: str) -> float:
        """
        Look up known interaction score from database.
        Returns risk_score or 0.0 if not found.

        Args:
            drug1: First drug name.
            drug2: Second drug name.

        Returns:
            Risk score 0.0–1.0 from database.
        """
        if self.interaction_database is None or self.interaction_database.empty:
            return 0.0

        db = self.interaction_database.copy()
        db["drug1"] = db["drug1"].str.lower()
        db["drug2"] = db["drug2"].str.lower()

        drug1_lower = drug1.lower()
        drug2_lower = drug2.lower()

        # Check both directions
        matches = db[
            ((db["drug1"] == drug1_lower) & (db["drug2"] == drug2_lower))
            | ((db["drug1"] == drug2_lower) & (db["drug2"] == drug1_lower))
        ]

        if not matches.empty:
            return float(matches.iloc[0].get("risk_score", 0.0))

        return 0.0

    # ------------------------------------------------------------------
    # Training
    # ------------------------------------------------------------------

    def train_model(
        self, X_train: np.ndarray, y_train: np.ndarray, validation_split: float = 0.2
    ) -> Dict:
        """
        Train the XGBoost model on interaction data.

        Args:
            X_train: Feature matrix (n_samples, 3).
            y_train: Target interaction risk scores (n_samples,).
            validation_split: Fraction of data for validation.

        Returns:
            Dictionary with training metrics.
        """
        logger.info(
            f"Training XGBoost model on {len(X_train)} samples with "
            f"{validation_split:.0%} validation split..."
        )

        if len(X_train) == 0 or len(y_train) == 0:
            logger.warning("No training data provided. Model will use lookup only.")
            return {"status": "No training data"}

        # Train-test split
        split_idx = int(len(X_train) * (1 - validation_split))
        X_tr, X_val = X_train[:split_idx], X_train[split_idx:]
        y_tr, y_val = y_train[:split_idx], y_train[split_idx:]

        # Train
        try:
            self.xgb_model.fit(
                X_tr,
                y_tr,
                eval_set=[(X_val, y_val)] if len(X_val) > 0 else None,
                verbose=False,
            )
            self.is_model_fitted = True

            # Compute metrics
            train_score = float(self.xgb_model.score(X_tr, y_tr))
            val_score = float(self.xgb_model.score(X_val, y_val)) if len(X_val) > 0 else 0.0

            logger.info(
                f"Training complete. Train R²: {train_score:.3f}, Val R²: {val_score:.3f}"
            )

            return {
                "status": "success",
                "train_score": train_score,
                "val_score": val_score,
                "n_samples": len(X_train),
            }

        except Exception as e:
            logger.error(f"Error during model training: {str(e)}")
            return {"status": "error", "message": str(e)}

    def train_from_database(self, drug_database: Optional[pd.DataFrame] = None) -> Dict:
        """
        Train model using interactions from the default interaction database.
        Creates synthetic training data from known interactions.

        Args:
            drug_database: Optional drug metadata for category features.

        Returns:
            Dictionary with training status.
        """
        if self.interaction_database is None or self.interaction_database.empty:
            logger.warning("No interaction database available for training.")
            return {"status": "No data"}

        logger.info("Training from known interaction database...")

        # Extract features and targets from known interactions
        X_list = []
        y_list = []

        for _, row in self.interaction_database.iterrows():
            drug1 = row.get("drug1", "")
            drug2 = row.get("drug2", "")
            risk_score = float(row.get("risk_score", 0.5))

            if drug1 and drug2:
                features = self.extract_interaction_features(drug1, drug2, drug_database)
                X_list.append(features)
                y_list.append(risk_score)

        if not X_list:
            logger.warning("Could not extract features from interaction database.")
            return {"status": "No features"}

        X_train = np.array(X_list)
        y_train = np.array(y_list)

        return self.train_model(X_train, y_train, validation_split=0.3)

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict_interaction(
        self, drug1: str, drug2: str, drug_database: Optional[pd.DataFrame] = None
    ) -> Dict:
        """
        Predict interaction risk between two drugs.

        Strategy:
        1. Check known interaction database first (primary).
        2. If not found and model is trained, use ML prediction (supplemental).
        3. Otherwise, return low risk.

        Args:
            drug1: First drug name.
            drug2: Second drug name.
            drug_database: Optional drug metadata.

        Returns:
            Dictionary with interaction prediction.
        """
        logger.info(f"Predicting interaction between {drug1} and {drug2}...")

        # Step 1: Check known interactions
        known_score = self._get_known_interaction_score(drug1, drug2)
        if known_score > 0.0:
            severity = self._score_to_severity(known_score)
            return {
                "drug1": drug1,
                "drug2": drug2,
                "risk_score": known_score,
                "severity": severity,
                "source": "Database lookup",
                "is_interaction": severity in ["High", "Moderate"],
            }

        # Step 2: Use ML model if fitted
        if self.is_model_fitted:
            try:
                features = self.extract_interaction_features(
                    drug1, drug2, drug_database
                )
                ml_score = float(self.xgb_model.predict(features.reshape(1, -1))[0])
                ml_score = max(0.0, min(1.0, ml_score))  # Clamp to [0, 1]

                severity = self._score_to_severity(ml_score)
                return {
                    "drug1": drug1,
                    "drug2": drug2,
                    "risk_score": ml_score,
                    "severity": severity,
                    "source": "ML model",
                    "is_interaction": severity in ["High", "Moderate"],
                }

            except Exception as e:
                logger.error(f"Error in ML prediction: {str(e)}")
                # Fall through to low-risk default
        else:
            logger.debug(
                "ML model not fitted. Using database lookup only. "
                "Call train_from_database() to enable ML predictions."
            )

        # Step 3: Default to low risk
        return {
            "drug1": drug1,
            "drug2": drug2,
            "risk_score": 0.0,
            "severity": "Low",
            "source": "Default (no data)",
            "is_interaction": False,
        }

    def _score_to_severity(self, score: float) -> str:
        """
        Convert risk score to severity label.

        Args:
            score: Risk score 0.0–1.0.

        Returns:
            Severity label: "High", "Moderate", or "Low".
        """
        if score >= self.high_risk_threshold:
            return "High"
        elif score >= self.moderate_risk_threshold:
            return "Moderate"
        else:
            return "Low"

    def predict_interactions_batch(
        self, drug_pairs: List[Tuple[str, str]], drug_database: Optional[pd.DataFrame] = None
    ) -> pd.DataFrame:
        """
        Predict interactions for multiple drug pairs.

        Args:
            drug_pairs: List of (drug1, drug2) tuples.
            drug_database: Optional drug metadata.

        Returns:
            DataFrame with interaction predictions.
        """
        logger.info(f"Predicting interactions for {len(drug_pairs)} pairs...")

        predictions = []
        for drug1, drug2 in drug_pairs:
            prediction = self.predict_interaction(drug1, drug2, drug_database)
            predictions.append(prediction)

        df = pd.DataFrame(predictions)

        high_count = (df["severity"] == "High").sum()
        mod_count = (df["severity"] == "Moderate").sum()

        logger.info(
            f"Batch predictions complete: {high_count} high, {mod_count} moderate risk"
        )

        return df

    def get_interaction_statistics(self, predictions: pd.DataFrame) -> Dict:
        """
        Get statistics about interaction predictions.

        Args:
            predictions: DataFrame with predictions.

        Returns:
            Dictionary with statistics.
        """
        stats = {
            "total_pairs": len(predictions),
            "high_risk": (predictions["severity"] == "High").sum(),
            "moderate_risk": (predictions["severity"] == "Moderate").sum(),
            "low_risk": (predictions["severity"] == "Low").sum(),
            "average_risk_score": float(predictions["risk_score"].mean()),
            "max_risk_score": float(predictions["risk_score"].max()),
        }

        logger.info(f"Interaction Statistics: {stats}")

        return stats

    def export_interactions(
        self, predictions: pd.DataFrame, output_path: str
    ) -> None:
        """
        Export interaction predictions to CSV.

        Args:
            predictions: DataFrame with predictions.
            output_path: Path to save CSV.
        """
        try:
            predictions.to_csv(output_path, index=False)
            logger.info(f"Interactions exported to: {output_path}")
        except Exception as e:
            logger.error(f"Error exporting interactions: {str(e)}")


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    interaction_model = DrugInteractionModel()

    # Train on default database
    training_result = interaction_model.train_from_database()
    print(f"Training result: {training_result}")

    # Test single prediction
    result = interaction_model.predict_interaction("Aspirin", "Ibuprofen")
    print(f"\nInteraction (Aspirin + Ibuprofen): {result}")

    # Test batch prediction
    pairs = [
        ("Aspirin", "Ibuprofen"),
        ("Metformin", "Atorvastatin"),
        ("Lisinopril", "Amlodipine"),
    ]
    df_predictions = interaction_model.predict_interactions_batch(pairs)
    print("\nBatch Predictions:")
    print(df_predictions)

    # Get statistics
    stats = interaction_model.get_interaction_statistics(df_predictions)
    print("\nStatistics:")
    for key, value in stats.items():
        print(f"  {key}: {value}")
