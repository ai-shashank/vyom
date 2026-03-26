const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { translateText } = require('../translator');
const history = require('../history');

// POST /api/translate
router.post('/', async (req, res) => {
  const { text, targetLang, sourceLang = 'auto' } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'text is required and must be a string' });
  }
  if (!targetLang) {
    return res.status(400).json({ error: 'targetLang is required' });
  }
  if (text.length > 500000) {
    return res.status(413).json({ error: 'Text too large. Max 500,000 characters.' });
  }

  try {
    const result = await translateText(text, targetLang, sourceLang);
    const id = uuidv4();

    history.save(id, text, result.translatedText, sourceLang, targetLang);

    return res.json({
      id,
      translatedText: result.translatedText,
      sourceLang,
      targetLang,
      charCount: result.charCount,
      chunks: result.chunks
    });
  } catch (err) {
    console.error('Translation error:', err.message);
    return res.status(500).json({ error: 'Translation failed', detail: err.message });
  }
});

module.exports = router;
