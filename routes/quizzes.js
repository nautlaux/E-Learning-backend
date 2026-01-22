const express = require('express');
const {
  createTopic,
  addQuestion,
  listTopics,
  getTopicWithQuestions,
  deleteTopic,
  deleteQuestion,
  updateTopic,
  updateQuestion,
  startAttempt,
  answerQuestion,
  getAttempt,
} = require('../controllers/quizController');

const router = express.Router();

// Admin
router.post('/topics', createTopic);
router.post('/topics/:topicId/questions', addQuestion);
router.delete('/topics/:topicId', deleteTopic);
router.delete('/questions/:questionId', deleteQuestion);
router.put('/topics/:topicId', updateTopic);
router.put('/questions/:questionId', updateQuestion);

// Shared (Admin/App)
router.get('/topics', listTopics);
router.get('/topics/getAllQuestions/:topicId', getTopicWithQuestions);

// App
router.post('/attempts', startAttempt); // restart via { restart: true }
router.get('/attempts/:attemptId', getAttempt); // resume
router.post('/attempts/:attemptId/answer', answerQuestion);

module.exports = router;

