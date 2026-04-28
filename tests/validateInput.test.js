const validateInput = require('../middleware/validateInput');
const { validationResult } = require('express-validator');

jest.mock('express-validator');

describe('validateInput middleware', () => {
  describe('validate function', () => {
    it('should call next if no errors', () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(true),
        array: jest.fn().mockReturnValue([])
      });

      const { validate } = validateInput;
      validate(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 error if validation fails', () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();
      const errors = [
        { field: 'email', message: 'Invalid email' }
      ];

      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue(errors)
      });

      const { validate } = validateInput;
      validate(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        auth: false,
        errors: errors
      });
    });
  });

  describe('validation rules arrays', () => {
    it('should export examValidation rules', () => {
      const { examValidation } = validateInput;

      expect(Array.isArray(examValidation)).toBe(true);
      expect(examValidation.length).toBeGreaterThan(0);
    });

    it('should export questionValidation rules', () => {
      const { questionValidation } = validateInput;

      expect(Array.isArray(questionValidation)).toBe(true);
      expect(questionValidation.length).toBeGreaterThan(0);
    });

    it('should export submitAnswerValidation rules', () => {
      const { submitAnswerValidation } = validateInput;

      expect(Array.isArray(submitAnswerValidation)).toBe(true);
      expect(submitAnswerValidation.length).toBeGreaterThan(0);
    });
  });
});
