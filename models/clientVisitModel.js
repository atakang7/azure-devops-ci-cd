import { Schema, Types } from 'mongoose';
import db from '../apis/db/cosmosDB.js';

const schema = new Schema({
  hotelId: { type: Types.ObjectId, ref: 'hotel', required: true },
  clientId: { type: String, required: true, trim: true, maxlength: 128 },
  visitTime: { type: Date, required: true }
}, { timestamps: true });

export default db.model('ClientVisit', schema);
