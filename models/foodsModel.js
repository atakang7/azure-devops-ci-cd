import { Schema, model, Types } from 'mongoose';
import db from '../apis/db/cosmosDB.js';

const foodSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    description: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    image: {
        type: String,
        required: true,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: true,
        trim: true,
        default: ''
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


const Foods = db.model('Food', foodSchema);

export default Foods;

