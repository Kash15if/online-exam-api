const examService = require('../services/examService');

describe('examService', () => {
  let examId;

  describe('createExam', () => {
    it('should create a new exam', async () => {
      const data = {
        title: 'Math 101',
        description: 'Basic Mathematics',
        duration: 60,
        passingScore: 70
      };
      const exam = await examService.createExam(data);

      expect(exam).toBeDefined();
      expect(exam.id).toBeDefined();
      expect(exam.title).toBe('Math 101');
      expect(exam.createdAt).toBeDefined();
      examId = exam.id;
    });

    it('should have unique IDs', async () => {
      const data1 = { title: 'Exam 1', duration: 30, passingScore: 60 };
      const data2 = { title: 'Exam 2', duration: 45, passingScore: 75 };

      const exam1 = await examService.createExam(data1);
      const exam2 = await examService.createExam(data2);

      expect(exam1.id).not.toBe(exam2.id);
    });
  });

  describe('getExamById', () => {
    beforeEach(async () => {
      const data = { title: 'Physics 101', duration: 90, passingScore: 65 };
      const exam = await examService.createExam(data);
      examId = exam.id;
    });

    it('should retrieve exam by id', async () => {
      const exam = await examService.getExamById(examId);

      expect(exam).toBeDefined();
      expect(exam.id).toBe(examId);
      expect(exam.title).toBe('Physics 101');
    });

    it('should return null if exam not found', async () => {
      const exam = await examService.getExamById('nonexistent-id');

      expect(exam).toBeNull();
    });

    it('should include questions array', async () => {
      const exam = await examService.getExamById(examId);

      expect(Array.isArray(exam.questions)).toBe(true);
    });
  });

  describe('getAllExams', () => {
    it('should return all exams', async () => {
      const data1 = { title: 'Exam A', duration: 30, passingScore: 60 };
      const data2 = { title: 'Exam B', duration: 45, passingScore: 70 };

      await examService.createExam(data1);
      await examService.createExam(data2);

      const exams = await examService.getAllExams();

      expect(Array.isArray(exams)).toBe(true);
      expect(exams.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('updateExam', () => {
    beforeEach(async () => {
      const data = { title: 'Original Title', duration: 60, passingScore: 70 };
      const exam = await examService.createExam(data);
      examId = exam.id;
    });

    it('should update exam data', async () => {
      const updated = await examService.updateExam(examId, { title: 'Updated Title' });

      expect(updated.title).toBe('Updated Title');
      expect(updated.id).toBe(examId);
      expect(updated.updatedAt).toBeDefined();
    });

    it('should return null if exam not found', async () => {
      const result = await examService.updateExam('nonexistent-id', { title: 'New Title' });

      expect(result).toBeNull();
    });
  });

  describe('deleteExam', () => {
    it('should delete exam', async () => {
      const data = { title: 'Delete Me', duration: 30, passingScore: 60 };
      const exam = await examService.createExam(data);
      const deleted = await examService.deleteExam(exam.id);

      expect(deleted).toBe(true);

      const retrieved = await examService.getExamById(exam.id);
      expect(retrieved).toBeNull();
    });

    it('should return false if exam not found', async () => {
      const result = await examService.deleteExam('nonexistent-id');

      expect(result).toBe(false);
    });
  });
});
