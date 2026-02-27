// Simulate OCR extraction functionality
export const extractTextFromImage = async (imagePath) => {
    // In the future this calls Google Cloud Vision or Tesseract
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(['Paracetamol', 'Ibuprofen']);
        }, 1000);
    });
};
