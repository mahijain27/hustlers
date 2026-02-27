import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
    {
        patientName: {
            type: String,
            required: [true, 'Please add a patient name'],
            trim: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        imagePath: {
            type: String,
            required: [true, 'Please provide an image path'],
        },
        extractedDrugs: {
            type: [String],
            default: [],
        },
        interactionWarnings: {
            type: [String],
            default: [],
        },
        riskScore: {
            type: Number,
            default: null,
        },
        fhir: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        status: {
            type: String,
            enum: ['uploaded', 'processing', 'analyzed', 'failed'],
            default: 'uploaded',
            index: true,
        },
        errorMessage: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
