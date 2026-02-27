import { checkInteractions } from '../services/interaction.service.js';

// @desc    Check drug interactions
// @route   POST /api/drugs/check
// @access  Private
export const verifyInteractions = async (req, res, next) => {
    try {
        const { drugs } = req.body;

        if (!drugs || !Array.isArray(drugs) || drugs.length === 0) {
            res.status(400);
            throw new Error('Please provide an array of drugs');
        }

        const assessment = await checkInteractions(drugs);

        res.status(200).json({
            success: true,
            data: assessment
        });

    } catch (error) {
        next(error);
    }
};
