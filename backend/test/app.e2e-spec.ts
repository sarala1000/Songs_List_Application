/**
 * E2E tests for the entire application
 * Tests complete API endpoints and integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('uptime');
          expect(typeof res.body.uptime).toBe('number');
        });
    });
  });

  describe('Songs API', () => {
    it('/songs (GET)', () => {
      return request(app.getHttpServer())
        .get('/songs')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/songs/import-sample (POST)', () => {
      return request(app.getHttpServer())
        .post('/songs/import-sample')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('songs');
          expect(res.body.message).toBe('Sample songs imported successfully');
        });
    });

    it('/songs/upload (POST) - should handle CSV upload', () => {
      const csvContent = 'band,song,year\nThe Beatles,Hey Jude,1968';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(csvContent), 'songs.csv')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('songs');
          expect(res.body.message).toBe('Songs uploaded successfully');
        });
    });

    it('/songs/upload (POST) - should reject non-CSV files', () => {
      const jsonContent = '{"band": "The Beatles", "song": "Hey Jude", "year": 1968}';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(jsonContent), 'songs.json')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Invalid file type');
        });
    });

    it('/songs/upload (POST) - should handle empty CSV', () => {
      const emptyCsv = 'band,song,year\n';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(emptyCsv), 'empty.csv')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('count', 0);
          expect(res.body).toHaveProperty('songs');
          expect(Array.isArray(res.body.songs)).toBe(true);
        });
    });

    it('/songs/upload (POST) - should handle malformed CSV', () => {
      const malformedCsv = 'invalid,csv,data\nwithout,proper,headers';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(malformedCsv), 'malformed.csv')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/non-existent')
        .expect(404);
    });

    it('should handle 405 for wrong HTTP methods', () => {
      return request(app.getHttpServer())
        .put('/songs')
        .expect(405);
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', () => {
      return request(app.getHttpServer())
        .options('/songs')
        .expect(204);
    });

    it('should include CORS headers in responses', () => {
      return request(app.getHttpServer())
        .get('/songs')
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('access-control-allow-origin');
        });
    });
  });

  describe('Content Type Handling', () => {
    it('should handle multipart/form-data for file uploads', () => {
      const csvContent = 'band,song,year\nThe Beatles,Hey Jude,1968';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(csvContent), 'songs.csv')
        .expect(201);
    });

    it('should handle JSON responses', () => {
      return request(app.getHttpServer())
        .get('/songs')
        .expect(200)
        .expect('Content-Type', /json/);
    });
  });

  describe('Performance', () => {
    it('should respond to health check within reasonable time', async () => {
      const start = Date.now();
      
      await request(app.getHttpServer())
        .get('/health')
        .expect(200);
      
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app.getHttpServer()).get('/health')
      );
      
      const responses = await Promise.all(promises);
      
      responses.forEach((res) => {
        expect(res.status).toBe(200);
      });
    });
  });

  describe('Data Validation', () => {
    it('should validate CSV structure', () => {
      const invalidCsv = 'band,song\nThe Beatles,Hey Jude'; // Missing year column
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(invalidCsv), 'invalid.csv')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should handle special characters in CSV', () => {
      const csvWithSpecialChars = 'band,song,year\nAC/DC,Highway to Hell,1979\nMotörhead,Ace of Spades,1980';
      
      return request(app.getHttpServer())
        .post('/songs/upload')
        .attach('file', Buffer.from(csvWithSpecialChars), 'special.csv')
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('count');
        });
    });
  });
});
