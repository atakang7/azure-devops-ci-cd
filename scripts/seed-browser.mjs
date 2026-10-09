import { connectDatabase, closeDatabase } from '../apis/db/cosmosDB.js';
import Users from '../models/usersModel.js';
import Hotel from '../models/hotelModel.js';
import Apps from '../models/appsModel.js';
import Foods from '../models/foodsModel.js';

if (!process.env.MONGO_URI?.endsWith('/nevotek_ci')) {
  throw new Error('Browser fixtures are restricted to the isolated nevotek_ci database');
}
await connectDatabase(process.env.MONGO_URI);
try {
  const user = await Users.create({ name: 'Browser Owner', email: 'browser@example.test', role: 'owner' });
  const hotel = await Hotel.create({
    name: 'Browser Test Hotel', address: '1 Integration Avenue',
    phone: '+15555551111', rating: 4, price: 100,
    description: 'Demonstration hotel', facilities: ['Wi-Fi'], images: [],
    owner: user._id
  });
  await Apps.create({
    name: 'Guest Media', category: 'Entertainment',
    description: 'Television app', thumbnail: 'https://example.test/app.png',
    link: 'https://example.test', hotel: hotel._id
  });
  await Foods.create({
    name: 'Vegetable Soup', price: 12, description: 'Fresh soup',
    category: 'Starter', image: 'https://example.test/food.png', hotel: hotel._id
  });
} finally {
  await closeDatabase();
}
