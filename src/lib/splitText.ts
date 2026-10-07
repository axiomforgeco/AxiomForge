/**
 * Splits an element's text into per-letter spans for staggered reveals (the free
 * alternative to SplitText). Screen readers read a visually-hidden copy of the
 * original text; the animated letters are aria-hidden. Words never break mid-word.
 */
export function splitLetters(el: HTMLElement): HTMLElement[] {
  const text = (el.textContent ?? '').trim();
  const visual = document.createElement('span');
  visual.className = 'split';
  visual.setAttribute('aria-hidden', 'true');
  const letters: HTMLElement[] = [];

  text.split(/(\s+)/).forEach((part) => {
    if (!part) return;
    if (/^\s+$/.test(part)) {
      visual.append(document.createTextNode(' '));
      return;
    }
    const word = document.createElement('span');
    word.className = 'split-word';
    for (const char of part) {
      const letter = document.createElement('span');
      letter.className = 'split-char';
      letter.textContent = char;
      word.append(letter);
      letters.push(letter);
    }
    visual.append(word);
  });

  const readable = document.createElement('span');
  readable.className = 'visually-hidden';
  readable.textContent = text;
  el.replaceChildren(readable, visual);
  return letters;
}
