import Prescription from '../models/prescription.model.js';
import logger from '../utils/logger.js';
import { extractTextFromImage } from './ocr.service.js';
import { checkInteractions } from './interaction.service.js';
import { calculateRiskScore } from './risk.service.js';
import { buildFHIRMedicationRequest } from '../utils/fhir.builder.js';

/**
 * Asynchronous Background Processor
 * This simulates a worker queue job. It should NOT be awaited by the controller.
 */
export const processPrescriptionAsync = async (prescriptionId) => {
    try {
        // 1. Fetch prescription and mark as processing
        const prescription = await Prescription.findById(prescriptionId);
        if (!prescription) {
            logger.error(`Processor Error: Prescription ${prescriptionId} not found`);
            return;
        }

        prescription.status = 'processing';
        await prescription.save();
        logger.info(`Started processing prescription ${prescriptionId}`);

        // 2. Simulate processing delay (3-5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 4000));

        // 3. Execute mock ML/OCR services sequentially (or Promise.all parallel in future)
        const extractedDrugs = await extractTextFromImage(prescription.imagePath);
        const interactionWarnings = await checkInteractions(extractedDrugs);
        const riskScore = await calculateRiskScore(extractedDrugs, prescription.patientName);
        const fhirPayload = buildFHIRMedicationRequest(prescription.patientName, extractedDrugs);

        // 4. Update Database
        prescription.extractedDrugs = extractedDrugs;
        prescription.interactionWarnings = interactionWarnings;
        prescription.riskScore = riskScore;
        prescription.fhir = fhirPayload;
        prescription.status = 'analyzed';

        await prescription.save();
        logger.info(`Successfully analyzed prescription ${prescriptionId}`);

    } catch (error) {
        logger.error(`Failed to process prescription ${prescriptionId}: ${error.message}`);

        // Ensure failed state is recorded
        await Prescription.findByIdAndUpdate(prescriptionId, {
            status: 'failed',
            errorMessage: error.message || 'Unknown processing error occurred',
        });
    }
};
