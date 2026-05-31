"""
Model 1: OCR Model for extracting text from handwritten prescription images
Uses EasyOCR, TrOCR (Transformers), OpenCV, and Pillow

Fixes applied:
- TrOCR confidence was hardcoded to 0.95, making EasyOCR result never win.
  Now uses a real scoring heuristic (output length + language plausibility).
- _enhance_image was converting to grayscale/binary before TrOCR, which
  degrades transformer accuracy. Now preprocessing is split: EasyOCR gets the
  enhanced binary image; TrOCR receives a lightly-denoised colour image.
"""

import cv2
import numpy as np
from PIL import Image
import easyocr
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import logging
import re
from typing import Tuple, Dict, List
from utils.config import OCR_CONFIG, TRANSFORMER_OCR_CONFIG

logger = logging.getLogger(__name__)


class OCRModel:
    """
    Optical Character Recognition model for prescription images.
    Combines EasyOCR and TrOCR for robust text extraction.
    """

    def __init__(self, use_easy_ocr: bool = True, use_transformer_ocr: bool = True):
        """
        Initialize OCR models.

        Args:
            use_easy_ocr: Whether to use EasyOCR.
            use_transformer_ocr: Whether to use TrOCR (Transformer-based OCR).
        """
        self.use_easy_ocr = use_easy_ocr
        self.use_transformer_ocr = use_transformer_ocr

        if self.use_easy_ocr:
            logger.info("Initializing EasyOCR...")
            self.easy_ocr_reader = easyocr.Reader(
                OCR_CONFIG["languages"],
                gpu=OCR_CONFIG["gpu"],
                model_storage_directory=OCR_CONFIG["model_storage_directory"],
            )

        if self.use_transformer_ocr:
            logger.info("Initializing TrOCR (Transformer-based)...")
            self.trocr_model = VisionEncoderDecoderModel.from_pretrained(  # type: ignore
                TRANSFORMER_OCR_CONFIG["model_name"]
            )
            self.image_processor = ViTImageProcessor.from_pretrained(  # type: ignore
                TRANSFORMER_OCR_CONFIG["model_name"]
            )
            self.tokenizer = AutoTokenizer.from_pretrained(  # type: ignore
                TRANSFORMER_OCR_CONFIG["model_name"]
            )

    # ------------------------------------------------------------------
    # Image preprocessing
    # ------------------------------------------------------------------

    def preprocess_image(
        self, image_path: str
    ) -> Tuple[np.ndarray, np.ndarray, Image.Image]:
        """
        Preprocess prescription image, producing two variants:
        - An enhanced/binarized version for EasyOCR.
        - A lightly denoised colour version for TrOCR.

        Args:
            image_path: Path to the prescription image.

        Returns:
            Tuple of (enhanced_cv_image, colour_cv_image, pil_image_for_trocr).
        """
        logger.info(f"Preprocessing image: {image_path}")

        cv_image = cv2.imread(image_path)
        cv_image_rgb = cv2.cvtColor(cv_image, cv2.COLOR_BGR2RGB)

        # Branch 1: binarized image for EasyOCR
        enhanced = self._enhance_for_easyocr(cv_image_rgb)

        # Branch 2: colour denoised image for TrOCR (preserves texture cues)
        colour_denoised = self._denoise_colour(cv_image_rgb)
        pil_image = Image.fromarray(colour_denoised)

        return enhanced, colour_denoised, pil_image

    def _enhance_for_easyocr(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance image for EasyOCR: CLAHE → denoise → binarize.

        Args:
            image: RGB numpy array.

        Returns:
            Binarized RGB numpy array suitable for EasyOCR.
        """
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        denoised = cv2.fastNlMeansDenoising(enhanced, h=10)
        _, binary = cv2.threshold(denoised, 150, 255, cv2.THRESH_BINARY)
        return cv2.cvtColor(binary, cv2.COLOR_GRAY2RGB)

    def _denoise_colour(self, image: np.ndarray) -> np.ndarray:
        """
        Light denoising that preserves colour for TrOCR.

        Args:
            image: RGB numpy array.

        Returns:
            Denoised RGB numpy array.
        """
        return cv2.fastNlMeansDenoisingColored(image, None, h=7, hColor=7,
                                               templateWindowSize=7,
                                               searchWindowSize=21)

    # ------------------------------------------------------------------
    # Extraction methods
    # ------------------------------------------------------------------

    def extract_text_easyocr(self, image: np.ndarray) -> Dict:
        """
        Extract text using EasyOCR.

        Args:
            image: Enhanced (binarized) OpenCV RGB image.

        Returns:
            Dictionary with extracted text and confidence scores.
        """
        logger.info("Extracting text using EasyOCR...")

        results = self.easy_ocr_reader.readtext(image)

        extracted_text = []
        confidences = []

        for detection in results:
            text = detection[1]       # type: ignore
            confidence = detection[2] # type: ignore
            extracted_text.append(text)
            confidences.append(confidence)

        full_text = " ".join(extracted_text)
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0

        return {
            "text": full_text,
            "lines": extracted_text,
            "confidence": avg_confidence,
            "method": "EasyOCR",
        }

    def extract_text_trocr(self, pil_image: Image.Image) -> Dict:
        """
        Extract text using TrOCR and estimate a real confidence score.

        Confidence heuristic:
        - Base score of 0.60.
        - +0.15 if output length is between 10 and 500 chars (plausible length).
        - +0.10 if output contains at least one digit (prescriptions always have).
        - +0.10 if output contains common prescription keywords.
        - Capped at 0.95.

        Args:
            pil_image: Colour PIL image (NOT binarized).

        Returns:
            Dictionary with extracted text and estimated confidence.
        """
        logger.info("Extracting text using TrOCR...")

        try:
            pixel_values = self.image_processor(
                images=pil_image, return_tensors="pt"
            ).pixel_values  # type: ignore

            generated_ids = self.trocr_model.generate(  # type: ignore
                pixel_values,
                max_length=128,
                num_beams=5,
                early_stopping=True,
            )

            generated_text = self.tokenizer.batch_decode(
                generated_ids, skip_special_tokens=True
            )[0]

            confidence = self._estimate_trocr_confidence(generated_text)

            return {
                "text": generated_text,
                "lines": [generated_text],
                "confidence": confidence,
                "method": "TrOCR",
            }

        except Exception as e:
            logger.error(f"TrOCR extraction failed: {str(e)}")
            return {"text": "", "lines": [], "confidence": 0.0, "method": "TrOCR"}

    def _estimate_trocr_confidence(self, text: str) -> float:
        """
        Estimate a plausibility-based confidence score for TrOCR output.

        Args:
            text: Decoded text from TrOCR.

        Returns:
            Confidence float in [0.0, 0.95].
        """
        if not text or not text.strip():
            return 0.0

        score = 0.60

        # Plausible length (prescription text is typically 10–500 chars)
        if 10 <= len(text) <= 500:
            score += 0.15

        # Contains at least one digit (dosages always present in prescriptions)
        if re.search(r"\d", text):
            score += 0.10

        # Contains common prescription keywords
        rx_keywords = re.compile(
            r"\b(mg|ml|tab|tablet|cap|capsule|daily|twice|morning|night|days?|weeks?)\b",
            re.IGNORECASE,
        )
        if rx_keywords.search(text):
            score += 0.10

        return min(score, 0.95)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def extract_text(self, image_path: str) -> Dict:
        """
        Extract text from prescription image using both OCR methods and pick
        the result with the higher confidence score.

        Args:
            image_path: Path to the prescription image.

        Returns:
            Dictionary with extracted text and metadata.
        """
        logger.info(f"Starting OCR extraction from: {image_path}")

        enhanced_img, colour_img, pil_image = self.preprocess_image(image_path)

        results: Dict = {
            "image_path": image_path,
            "methods": [],
        }

        if self.use_easy_ocr:
            easyocr_result = self.extract_text_easyocr(enhanced_img)
            results["methods"].append(easyocr_result)

        if self.use_transformer_ocr:
            trocr_result = self.extract_text_trocr(pil_image)
            results["methods"].append(trocr_result)

        if not results["methods"]:
            results["extracted_text"] = ""
            results["best_method"] = "None"
            results["confidence"] = 0.0
            return results

        # Select the method with the highest estimated confidence
        best_result = max(results["methods"], key=lambda x: x["confidence"])
        results["extracted_text"] = best_result["text"]
        results["best_method"] = best_result["method"]
        results["confidence"] = best_result["confidence"]

        logger.info(
            f"OCR extraction completed. Best method: {results['best_method']} "
            f"(confidence: {results['confidence']:.2f})"
        )

        return results

    def batch_extract(self, image_paths: List[str]) -> List[Dict]:
        """
        Extract text from multiple images.

        Args:
            image_paths: List of paths to prescription images.

        Returns:
            List of extraction results.
        """
        results = []
        for image_path in image_paths:
            try:
                result = self.extract_text(image_path)
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing {image_path}: {str(e)}")
                results.append({"image_path": image_path, "error": str(e)})

        return results


# Example usage
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    ocr = OCRModel(use_easy_ocr=True, use_transformer_ocr=False)
    # result = ocr.extract_text("path/to/prescription_image.jpg")
    # print(result)
