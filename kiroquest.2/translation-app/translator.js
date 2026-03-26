const { translate } = require('@vitalets/google-translate-api');

/**
 * Translates text, handling large inputs by chunking.
 * Google Translate has a ~5000 char limit per request.
 */
const CHUNK_SIZE = 4500;

const chunkText = (text) => {
  if (text.length <= CHUNK_SIZE) return [text];

  const chunks = [];
  // Split on sentence boundaries to preserve context
  const sentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  let current = '';

  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim());
      // If a single sentence exceeds limit, hard-split it
      if (sentence.length > CHUNK_SIZE) {
        for (let i = 0; i < sentence.length; i += CHUNK_SIZE) {
          chunks.push(sentence.slice(i, i + CHUNK_SIZE));
        }
        current = '';
      } else {
        current = sentence;
      }
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

const translateText = async (text, targetLang, sourceLang = 'auto') => {
  if (!text || !text.trim()) throw new Error('No text provided');

  const chunks = chunkText(text.trim());
  const results = [];

  for (const chunk of chunks) {
    const options = { to: targetLang };
    if (sourceLang !== 'auto') options.from = sourceLang;

    const res = await translate(chunk, options);
    results.push(res.text);
  }

  return {
    translatedText: results.join(' '),
    detectedSourceLang: sourceLang === 'auto' ? 'auto-detected' : sourceLang,
    chunks: chunks.length,
    charCount: text.length
  };
};

module.exports = { translateText };
