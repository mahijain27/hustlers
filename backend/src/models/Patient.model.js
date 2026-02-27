import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
            default: 'prefer_not_to_say'
        },
        contactNumber: {
            type: String,
            trim: true
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String
        },
        allergies: [
            {
                type: String,
                trim: true
            }
        ],
        fhirPatientId: {
            type: String,
            description: 'Reference to external FHIR server Patient ID if linked'
        }
    },
    {
        timestamps: true
    }
);

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
