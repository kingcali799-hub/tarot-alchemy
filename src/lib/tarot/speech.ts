/** Split narration into TTS-sized chunks at sentence/paragraph boundaries. */
export function chunkNarration(text: string, maxChars = 700): string[] {
  const clean = text.replace(/\s+\n/g, "\n").trim();
  if (!clean) return [];
  const sentences = clean.match(/[^.!?\n]+[.!?]*\n*\s*/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";
  const flush = () => {
    if (current.trim()) chunks.push(current.trim());
    current = "";
  };
  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      flush();
      const words = sentence.match(/\S+/g) ?? [];
      let buffer = "";
      for (const word of words) {
        if ((buffer + " " + word).trim().length > maxChars) {
          chunks.push(buffer.trim());
          buffer = word;
        } else {
          buffer = `${buffer} ${word}`;
        }
      }
      if (buffer.trim()) chunks.push(buffer.trim());
      continue;
    }
    if (current.length + sentence.length > maxChars) flush();
    current += sentence;
  }
  flush();
  return chunks;
}
