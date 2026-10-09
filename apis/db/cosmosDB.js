import mongoose from 'mongoose';

const db = mongoose.createConnection();

export async function connectDatabase(uri) {
  if (!uri) throw new Error('MONGO_URI is required');
  await db.openUri(uri, { serverSelectionTimeoutMS: 10000 });
  return db;
}

export async function closeDatabase() {
  await db.close();
}

export default db;
