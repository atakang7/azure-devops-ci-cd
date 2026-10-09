import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import db, { connectDatabase, closeDatabase } from '../apis/db/cosmosDB.js';
import { app } from '../index.js';

const token = process.env.API_TOKEN;
const api = (method, path) => request(app)[method](path)
  .set('Authorization', 'Bearer ' + token);

beforeAll(async () => {
  if (!token || !process.env.MONGO_URI || !process.env.MONGO_URI.endsWith('/nevotek_ci')) {
    throw new Error('Tests may only use the isolated nevotek_ci database');
  }
  await connectDatabase(process.env.MONGO_URI);
}, 30000);

afterAll(async () => {
  await db.dropDatabase();
  await closeDatabase();
}, 30000);

describe('real Express + MongoDB integration', () => {
  it('exposes liveness and database readiness without credentials', async () => {
    expect((await request(app).get('/healthz')).status).toBe(200);
    expect((await request(app).get('/readyz')).status).toBe(200);
  });

  it('rejects unauthenticated and invalid-token access', async () => {
    expect((await request(app).get('/users')).status).toBe(401);
    expect((await request(app).get('/users').set('Authorization', 'Bearer invalid')).status).toBe(401);
    expect((await request(app).post('/users').send({ name: 'Untrusted' })).status).toBe(401);
  });

  it('executes a complete user, hotel and visit lifecycle', async () => {
    const user = await api('post', '/users').send({ name: 'Test Owner', email: 'owner@example.test', role: 'owner' });
    expect(user.status).toBe(201);
    expect(user.body._id).toBeTruthy();

    const hotel = await api('post', '/hotels').send({
      name: 'Local E2E Hotel',
      address: '123 Test Street',
      phone: '+15555550101',
      rating: 4,
      price: 120,
      description: 'Testable hotel',
      facilities: ['Wi-Fi'],
      images: [],
      owner: user.body._id
    });
    expect(hotel.status).toBe(201);
    const hotelId = hotel.body.id;
    expect(hotelId).toBeTruthy();

    const visit = await api('post', '/' + hotelId + '/visit').send({
      clientId: 'test-guest', visitTime: new Date().toISOString()
    });
    expect(visit.status).toBe(200);

    const list = await api('get', '/hotels');
    expect(list.status).toBe(200);
    expect(list.body.some(row => row._id === hotelId)).toBe(true);

    const dashboard = await api('get', '/dashboard/' + hotelId);
    expect(dashboard.status).toBe(200);
    expect(dashboard.headers['content-type']).toMatch(/html/);

    const page = await api('get', '/');
    expect(page.status).toBe(200);
    expect(page.text).toContain('Local E2E Hotel');
  });

  it('rejects the removed hardcoded admin credentials', async () => {
    const response = await api('post', '/login').send({ username: 'admin', password: 'password123' });
    expect(response.status).toBe(404);
  });

  it('rejects missing audio instead of making an external API request', async () => {
    const response = await api('post', '/chatbot/get-chatbot-response').field('hotelId', 'invalid');
    expect(response.status).toBe(400);
  });

  it('returns 404 for non-existent routes', async () => {
    expect((await api('get', '/unknown-path')).status).toBe(404);
  });
  it('round-trips rooms, foods and apps through the actual database', async () => {
    const user = await api('post', '/users').send({
      name: 'Resource Owner', email: 'resource-owner@example.test', role: 'owner'
    });
    expect(user.status).toBe(201);
    const hotel = await api('post', '/hotels').send({
      name: 'Resource Hotel', address: 'Unit Test Avenue', phone: '+15555551234',
      rating: 4, price: 50, description: 'Fixture', facilities: [], images: [], owner: user.body._id
    });
    expect(hotel.status).toBe(201);
    const hotelId = hotel.body.id;

    const food = await api('post', '/foods').send({
      name: 'Soup', price: 10, description: 'Hot soup', image: 'https://example.test/soup.png',
      category: 'Starters', hotel: hotelId
    });
    expect(food.status).toBe(201);
    expect(food.body.hotel).toBe(hotelId);
    const updatedFood = await api('put', '/foods/' + food.body._id).send({
      name: 'Updated Soup', price: 11, description: 'Hot soup',
      image: 'https://example.test/soup.png', category: 'Starters'
    });
    expect(updatedFood.status).toBe(200);
    expect(updatedFood.body.name).toBe('Updated Soup');

    const room = await api('post', '/rooms').send({
      hotel: hotelId, roomNumber: 102, roomType: 'Double', price: 90
    });
    expect(room.status).toBe(201);
    const updatedRoom = await api('put', '/rooms/' + room.body._id).send({ price: 110 });
    expect(updatedRoom.status).toBe(200);
    expect(updatedRoom.body.price).toBe(110);
    expect((await api('get', '/rooms/' + room.body._id)).status).toBe(200);

    const appItem = await api('post', '/apps').send({
      hotel: hotelId, name: 'Guest Browser', category: 'Entertainment',
      description: 'Apps', thumbnail: 'https://example.test/a.png', link: 'https://example.test'
    });
    expect(appItem.status).toBe(201);
    const appId = appItem.body._id;
    expect((await api('get', '/apps/' + appId)).status).toBe(200);
    expect((await api('patch', '/apps/' + appId).send({ name: 'New Name' })).body.name).toBe('New Name');

    expect((await api('delete', '/apps/' + appId)).status).toBe(200);
    expect((await api('get', '/apps/' + appId)).status).toBe(404);
    expect((await api('delete', '/foods/' + food.body._id)).status).toBe(200);
    expect((await api('delete', '/rooms/' + room.body._id)).status).toBe(200);
  });

  it('returns 404 for missing users and rejects invalid hotel visits', async () => {
    const missing = '507f1f77bcf86cd799439011';
    expect((await api('get', '/users/' + missing)).status).toBe(404);
    expect((await api('put', '/users/' + missing).send({ name: 'Missing' })).status).toBe(404);
    expect((await api('delete', '/users/' + missing)).status).toBe(404);
    expect((await api('post', '/' + missing + '/visit').send({
      clientId: 'visitor', visitTime: 'not-a-timestamp'
    })).status).toBe(400);
  });

});
