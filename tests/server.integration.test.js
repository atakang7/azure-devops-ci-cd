import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import db, { connectDatabase, closeDatabase } from '../apis/db/cosmosDB.js';
import { app } from '../index.js';

const token = process.env.API_TOKEN;
const authenticated = () => request(app).get('/healthz'); // test helper kept explicit
const api = (method, path) => request(app)[method](path)
  .set('Authorization', 'Bearer ' + token);

beforeAll(async () => {
  if (!token || !process.env.MONGO_URI) throw new Error('Set API_TOKEN and MONGO_URI for E2E tests');
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
});
