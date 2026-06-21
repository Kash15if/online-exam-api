'use strict';

const submissionService = require('../services/submissionService');

const submit = async (req, res) => {
  const submission = await submissionService.submitExam({
    userId: req.user.sub,
    examId: req.params.examId,
    answers: req.body.answers,
  });
  res.status(201).json({ success: true, submission });
};

const getOne = async (req, res) => {
  const submission = await submissionService.getSubmission(req.params.id, req.user);
  res.json({ success: true, submission });
};

const listForUser = async (req, res) => {
  const submissions = await submissionService.getUserSubmissions(req.params.userId, req.user);
  res.json({ success: true, submissions });
};

const listMine = async (req, res) => {
  const submissions = await submissionService.getUserSubmissions(req.user.sub, req.user);
  res.json({ success: true, submissions });
};

module.exports = { submit, getOne, listForUser, listMine };
