import Apps from '../models/appsModel.js';

/**
 * Get all apps
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllApps = async (req, res) => {
    try {
        const apps = await Apps.find();
        res.json(apps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get an app by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAppById = async (req, res) => {
    const { id } = req.params;
    try {
        const app = await Apps.findById(id);
        if (!app) {
            res.status(404).json({ message: 'App not found' });
        } else {
            res.json(app);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Create a new app
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createApp = async (req, res) => {
    try {
        const app = new Apps(req.body);
        await app.save();
        res.status(201).json(app);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Update an app by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateApp = async (req, res) => {
    const { id } = req.params;
    try {
        const app = await Apps.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!app) {
            res.status(404).json({ message: 'App not found' });
        } else {
            res.json(app);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Delete an app by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteApp = async (req, res) => {
    const { id } = req.params;
    try {
        const app = await Apps.findByIdAndDelete(id);
        if (!app) {
            res.status(404).json({ message: 'App not found' });
        } else {
            res.json({ message: 'App deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
