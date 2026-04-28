const EN_NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
];

// Common Hindi / Hinglish number words (romanized)
const HI_LATIN_NUMBER_WORDS = [
  'shoonya',
  'shunya',
  'ek',
  'do',
  'teen',
  'tin',
  'char',
  'chaar',
  'paanch',
  'panch',
  'che',
  'chhe',
  'chhah',
  'saat',
  'sat',
  'aath',
  'ath',
  'nau',
  'nav',
  'das',
];

// Hindi number words (Devanagari)
const HI_DEVANAGARI_NUMBER_WORDS = [
  'शून्य',
  'एक',
  'दो',
  'तीन',
  'चार',
  'पांच',
  'पाँच',
  'छह',
  'छः',
  'सात',
  'आठ',
  'नौ',
  'दस',
];

const escapeRegExp = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Matches tokens that are made entirely of number-words concatenated together:
// e.g. "ninenine", "onezero", "eightseven"
const NUMBER_WORDS_ALL = [...EN_NUMBER_WORDS, ...HI_LATIN_NUMBER_WORDS, ...HI_DEVANAGARI_NUMBER_WORDS];
const NUMBER_WORD_TOKEN_RE = new RegExp(`^(?:${NUMBER_WORDS_ALL.map(escapeRegExp).join('|')})+$`, 'iu');

// Split into alphanumeric tokens only. This helps catch "99nine", "nine9", "nine-nine".
// Uses Unicode categories so it also tokenizes Devanagari words properly.
const tokenize = (s) => String(s || '').toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];

/**
 * Returns true if text contains any numeric content:
 * - Any digit anywhere ("999", "9o9", "909") -> immediate block
 * - Any token that is purely number-words ("ninenine")
 *
 * Intentionally strict for privacy (prevents phone-like sharing).
 */
function containsNumericLikeText(text) {
  const t = String(text || '');
  // Any digit in any script (0-9, ०-९, etc.)
  if (/\p{N}/u.test(t)) return true;

  const tokens = tokenize(t);
  for (const tok of tokens) {
    if (NUMBER_WORD_TOKEN_RE.test(tok)) return true;
  }
  return false;
}

module.exports = { containsNumericLikeText };

