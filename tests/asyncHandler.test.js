const asyncHandler = require('../middleware/asyncHandler');

describe('asyncHandler middleware', () => {
  it('should wrap async functions and catch errors', async () => {
    const mockNext = jest.fn();
    const mockError = new Error('Test error');

    const asyncFn = jest.fn().mockRejectedValue(mockError);
    const handler = asyncHandler(asyncFn);

    await handler({}, {}, mockNext);

    expect(mockNext).toHaveBeenCalledWith(mockError);
  });

  it('should call next without error on success', async () => {
    const mockNext = jest.fn();
    const mockReq = {};
    const mockRes = {};

    const asyncFn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(asyncFn);

    await handler(mockReq, mockRes, mockNext);

    expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
  });

  it('should handle synchronous errors', async () => {
    const mockNext = jest.fn();
    const syncError = new Error('Sync error');

    const syncFn = jest.fn().mockImplementation(() => {
      throw syncError;
    });
    const handler = asyncHandler(syncFn);

    await handler({}, {}, mockNext);

    expect(mockNext).toHaveBeenCalledWith(syncError);
  });
});
