'use strict';

const examService = require('../services/examService');

const list = async (_req, res) => {
  const exams = await examService.getAllExams();
  res.json({ success: true, exams });
};

const getOne = async (req, res) => {
  const includeAnswers = req.user?.role === 'admin';
  const exam = await examService.getExamById(req.params.id, { includeAnswers });
  if (!exam) return res.status(404).json({ success: false, error: { status: 404, message: 'Exam not found' } });
  return res.json({ success: true, exam });
};

const create = async (req, res) => {
  const exam = await examService.createExam(req.body);
  res.status(201).json({ success: true, exam });
};

const update = async (req, res) => {
  const exam = await examService.updateExam(req.params.id, req.body);
  res.json({ success: true, exam });
};

const remove = async (req, res) => {
  await examService.deleteExam(req.params.id);
  res.json({ success: true, message: 'Exam deleted' });
};

module.exports = { list, getOne, create, update, remove };
