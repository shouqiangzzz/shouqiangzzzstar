/**
 * Calculate estimated reading time based on Chinese character and word count.
 * Average reading speed: ~350-400 characters/words per minute.
 */
export function calculateReadingTime(text: string = ''): { minutes: number; wordCount: number; label: string } {
  if (!text) {
    return { minutes: 1, wordCount: 0, label: '1 分钟阅读' };
  }

  // Remove Markdown symbols for accurate count
  const cleanText = text.replace(/[#*`~>_[\]()\-+]/g, '').trim();

  // Match Chinese and other CJK characters
  const cjkMatches = cleanText.match(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g) || [];
  // Match Latin words
  const latinMatches = cleanText.replace(/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/g, ' ').match(/\b\w+\b/g) || [];

  const wordCount = cjkMatches.length + latinMatches.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 350));

  return {
    minutes,
    wordCount,
    label: `${minutes} 分钟阅读`
  };
}
