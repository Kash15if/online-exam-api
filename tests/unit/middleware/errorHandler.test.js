'use strict';

const errorHandler = require('../../../src/middleware/errorHandler');
const ApiError = require('../../../src/utils/ApiError');

const mockRes = () => ({
  headersSent: false,
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('errorHandler', () => {
  it('returns 500 with generic message for unknown errors', () => {
    const res = mockRes();
    errorHandler(new Error('boom'), { method: 'GET', originalUrl: '/x' }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(false);
    expect(body.error.status).toBe(500);
  });

  it('returns the ApiError status and message', () => {
    const res = mockRes();
    errorHandler(ApiError.notFound('missing'), { method: 'GET', originalUrl: '/x' }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0]).toMatchObject({
      success: false,
      error: { status: 404, message: 'missing' },
    });
  });

  it('passes the error to next when headers are already sent', () => {
    const next = jest.fn();
    const res = { ...mockRes(), headersSent: true };
    const err = new Error('late');
    errorHandler(err, { method: 'GET', originalUrl: '/x' }, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it('includes validation details on ApiError', () => {
    const res = mockRes();
    const err = ApiError.badRequest('Validation failed', [{ field: 'email', message: 'invalid' }]);
    errorHandler(err, { method: 'POST', originalUrl: '/auth/login' }, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].error.details).toEqual([{ field: 'email', message: 'invalid' }]);
  });
});
