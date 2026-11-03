import { Schema, model, Types } from 'mongoose';
import db from '../apis/db/cosmosDB.js';
import Hotel from './hotelModel.js'; // Import the Hotel model

const appSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: 'App Name'
    },
    category: {
        type: String,
        required: true,
        trim: true,
        default: 'Category'
    },
    description: {
        type: String,
        required: true,
        trim: true,
        default: 'App Description'
    },
    thumbnail: {
        type: String,
        required: true,
        trim: true,
        default: 'Placeholder Thumbnail'
    },
    link: {
        type: String,
        required: true,
        trim: true,
        default: 'https://defaultlink.com'
    },
    hotel: {
        type: Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});


appSchema.pre('save', async function (next) {
    try {
        const hotelExists = await Hotel.findById(this.hotel);
        if (!hotelExists) {
            return next(new Error('Invalid hotel ID'));
        }
        next();
    } catch (error) {
        next(error);
    }
});

const Apps = db.model('App', appSchema);

export default Apps;
