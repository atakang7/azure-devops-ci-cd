import Apps from '../models/appsModel.js';

function sendDatabaseError(res, error) {
  console.error('App request failed:', error);
  const invalid = error.name === 'CastError' || error.name === 'ValidationError';
  return res.status(invalid ? 400 : 500)
    .json({ message: invalid ? 'Invalid request data' : 'Database operation failed' });
}

export const getAllApps = async (req, res) => {
    try {
        const apps = await Apps.find();
        res.json(apps);
    } catch (error) {
        sendDatabaseError(res, error);
    }
};

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
        sendDatabaseError(res, error);
    }
};

export const createApp = async (req, res) => {
    try {
        const app = new Apps(req.body);
        await app.save();
        res.status(201).json(app);
    } catch (error) {
        sendDatabaseError(res, error);
    }
};

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
        sendDatabaseError(res, error);
    }
};

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
        sendDatabaseError(res, error);
    }
};
