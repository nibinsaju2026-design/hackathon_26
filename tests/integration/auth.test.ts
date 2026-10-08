import request from 'supertest';
import express from 'express';
import authRoutes from '../../apps/api/src/routes/auth';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth API Integration Tests', () => {
  it('should reject signup outside the Pondicherry University email domain', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'attacker@gmail.com',
        password: 'password123',
        name: 'Attacker'
      });
      
    expect(res.status).toBe(422); // Validation Error from Zod
  });

  it('should require the @pondiuni.ac.in domain', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'student@pondiuni.edu.in',
        password: 'password123',
        name: 'Student'
      });

    expect(res.status).toBe(422);
  });

  // Note: These tests assume a running test DB environment.
  // In a real execution, we'd mock Prisma or use a transaction rollback DB.
});
