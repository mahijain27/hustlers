import mongoose from 'mongoose';

const rxNORMConceptSchema = new mongoose.Schema({
    rxcui: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const drugSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a drug name'],
            unique: true,
            trim: true
        },
        genericName: {
            type: String,
            trim: true
        },
        rxNorm: rxNORMConceptSchema,
        classification: {
            type: String,
            trim: true
        },
        commonSideEffects: [
            {
                type: String,
                trim: true
            }
        ]
    },
    {
        timestamps: true
    }
);

// Index for full-text search during interaction checks
drugSchema.index({ name: 'text', genericName: 'text' });

const Drug = mongoose.model('Drug', drugSchema);
export default Drug;
