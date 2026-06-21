'use strict';

const examService = require('../../../src/services/examService');
const { resetAll } = require('../../helpers');

describe('examService', () => {
  beforeEach(resetAll);

  describe('createExam', () => {
    it('creates a new exam with sane defaults', async () => {
      const exam = await examService.createExam({
        title: 'Math 101',
        description: 'Basic Math',
        duration: 60,
        passingScore: 70,
      });
      expect(exam.id).toBeDefined();
      expect(exam.title).toBe('Math 101');
      expect(exam.createdAt).toBeDefined();
      expect(exam.updatedAt).toBeDefined();
    });

    it('generates unique ids', async () => {
      const a = await examService.createExam({ title: 'A', duration: 10, passingScore: 50 });
      const b = await examService.createExam({ title: 'B', duration: 10, passingScore: 50 });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('getExamById', () => {
    it('returns the exam with a questions array', async () => {
      const created = await examService.createExam({ title: 'A', duration: 10, passingScore: 50 });
      const exam = await examService.getExamById(created.id);
      expect(exam.id).toBe(created.id);
      expect(Array.isArray(exam.questions)).toBe(true);
    });

    it('returns null for an unknown id', async () => {
      expect(await examService.getExamById('00000000-0000-0000-0000-000000000000')).toBeNull();
    });
  });

  describe('updateExam', () => {
    it('merges and updates the exam', async () => {
      const created = await examService.createExam({ title: 'A', duration: 10, passingScore: 50 });
      const updated = await examService.updateExam(created.id, { title: 'A2' });
      expect(updated.title).toBe('A2');
      expect(updated.id).toBe(created.id);
    });

    it('throws 404 when updating an unknown exam', async () => {
      await expect(
        examService.updateExam('00000000-0000-0000-0000-000000000000', { title: 'X' }),
      ).rejects.toMatchObject({ status: 404 });
    });
  });

  describe('deleteExam', () => {
    it('removes the exam', async () => {
      const created = await examService.createExam({ title: 'Del', duration: 10, passingScore: 50 });
      await examService.deleteExam(created.id);
      expect(await examService.getExamById(created.id)).toBeNull();
    });

    it('throws 404 for unknown exam', async () => {
      await expect(examService.deleteExam('00000000-0000-0000-0000-000000000000')).rejects.toMatchObject({
        status: 404,
      });
    });
  });
});
