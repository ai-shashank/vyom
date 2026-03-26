const express = require('express');
const router = express.Router();
const history = require('../history');

// GET /api/history?limit=20
router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const records = history.getRecent(limit);
  res.json(records);
});

// DELETE /api/history/:id
router.delete('/:id', (req, res) => {
  const result = history.deleteById(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// DELETE /api/history  (clear all)
router.delete('/', (req, res) => {
  history.clearAll();
  res.json({ success: true, message: 'History cleared' });
});

module.exports = router;
