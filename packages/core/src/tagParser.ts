export function parseIdeaInput(input: string): { rawText: string; parsedText: string; tags: string[] } {
  if (!input) return { rawText: '', parsedText: '', tags: [] };

  // Match #word. \b ensures we match word boundaries if needed, but #\w+ is simple enough.
  // We want to avoid capturing # if it's just a hash, or something like #123 alone (though maybe #123 is valid).
  // Instagram allows alphanumeric tags.
  const regex = /#([a-zA-Z0-9_]+)/g;
  
  const tags: string[] = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    tags.push(match[1].toLowerCase());
  }

  // Remove tags from the string to get parsed text.
  // Also remove extra spaces left behind.
  let parsedText = input.replace(/#[a-zA-Z0-9_]+/g, '').replace(/\s+/g, ' ').trim();

  return {
    rawText: input,
    parsedText,
    tags
  };
}
