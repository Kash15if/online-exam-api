'use strict';

const asyncHandler = require('../../../src/middleware/asyncHandler');

describe('asyncHandler', () => {
  it('forwards rejected promise errors to next', async () => {
    const error = new Error('boom');
    const next = jest.fn();
    await asyncHandler(async () => {
      throw error;
    })({}, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('does not call next on success', async () => {
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue('ok');
    await asyncHandler(handler)({ a: 1 }, { b: 2 }, next);
    expect(handler).toHaveBeenCalledWith({ a: 1 }, { b: 2 }, next);
    expect(next).not.toHaveBeenCalled();
  });
});
