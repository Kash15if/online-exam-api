const validateInput = require('../middleware/validateInput');

describe('validateInput middleware', () => {
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

  describe('validate function', () => {
    it('should export validate middleware function', () => {
      const { validate } = validateInput;

      expect(typeof validate).toBe('function');
    });

    it('should handle validation results', () => {
      const { validate } = validateInput;
      const mockReq = { body: {} };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      // Call validate - it will read from express-validator which returns empty for empty body
      validate(mockReq, mockRes, mockNext);

      // Should pass through as next is called
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
