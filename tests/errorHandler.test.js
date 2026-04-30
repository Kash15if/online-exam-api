const errorHandler = require('../middleware/errorHandler');

describe('errorHandler middleware', () => {
  it('should send 500 error if no status provided', () => {
    const mockErr = new Error('Test error');
    const mockReq = {};
    const mockRes = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(mockErr, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    // Error message is passed through, not replaced with generic message
    expect(mockRes.json).toHaveBeenCalledWith({
      auth: false,
      error: 'Test error'
    });
  });

  it('should send custom status and message', () => {
    const mockErr = new Error('Not found');
    mockErr.status = 404;

    const mockReq = {};
    const mockRes = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(mockErr, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      auth: false,
      error: 'Not found'
    });
  });

  it('should not send response if headers already sent', () => {
    const mockErr = new Error('Error');
    const mockReq = {};
    const mockRes = {
      headersSent: true,
      status: jest.fn(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(mockErr, mockReq, mockRes, mockNext);

    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(mockErr);
  });

  it('should include stack trace in development', () => {
    process.env.NODE_ENV = 'development';

    const mockErr = new Error('Test error');
    mockErr.status = 500;

    const mockReq = {};
    const mockRes = {
      headersSent: false,
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const mockNext = jest.fn();

    errorHandler(mockErr, mockReq, mockRes, mockNext);

    const response = mockRes.json.mock.calls[0][0];
    expect(response.stack).toBeDefined();

    delete process.env.NODE_ENV;
  });
});
