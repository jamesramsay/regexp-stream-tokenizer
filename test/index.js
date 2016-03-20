import test from 'ava';
import tokenizer from '../';

test.cb('should not return content when no input provided', (t) => {
  const words = tokenizer(/\w+/g);

  words.on('readable', function read() {
    if (this.read() !== null) t.fail();
  });

  words.on('end', () => {
    t.pass();
    t.end();
  });

  words.end();
});


test.cb('should return tokens with default options', (t) => {
  const input = 'The quick brown fox jumps over the lazy dog.';
  const expected = [
    'The',
    'quick',
    'brown',
    'fox',
    'jumps',
    'over',
    'the',
    'lazy',
    'dog',
  ];
  const words = tokenizer(/\w+/g);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should not return ZBS with default excludeZBS option', (t) => {
  const input = '  The';
  const expected = [
    'The',
  ];
  const words = tokenizer({ leaveBehind: '[1]' }, /(^\s*)(\w+)/gm);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should return ZBS with excludeZBS option false', (t) => {
  const input = '  The';
  const expected = [
    '',
    'The',
  ];
  const words = tokenizer({ excludeZBS: false, leaveBehind: '[1]' }, /(^\s*)(\w+)/gm);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should return tokens and separators when separator option true', (t) => {
  const input = 'The quick brown fox jumps over the lazy dog.';
  const expected = [
    'The',
    ' ',
    'quick',
    ' ',
    'brown',
    ' ',
    'fox',
    ' ',
    'jumps',
    ' ',
    'over',
    ' ',
    'the',
    ' ',
    'lazy',
    ' ',
    'dog',
    '.',
  ];
  const words = tokenizer({ separator: true }, /\w+/g);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should return tokens and separators as objects (string options provided)', (t) => {
  const input = 'The quick brown fox jumps over the lazy dog.';
  const expected = [
    { token: 'The' },
    { separator: ' ' },
    { token: 'quick' },
    { separator: ' ' },
    { token: 'brown' },
    { separator: ' ' },
    { token: 'fox' },
    { separator: ' ' },
    { token: 'jumps' },
    { separator: ' ' },
    { token: 'over' },
    { separator: ' ' },
    { token: 'the' },
    { separator: ' ' },
    { token: 'lazy' },
    { separator: ' ' },
    { token: 'dog' },
    { separator: '.' },
  ];
  const words = tokenizer({ token: 'token', separator: 'separator' }, /\w+/g);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should return tokens and separators as objects (function options provided)', (t) => {
  const input = 'The quick brown fox jumps over the lazy dog.';
  const expected = [
    { content: 'The', match: true },
    { content: ' ' },
    { content: 'quick', match: true },
    { content: ' ' },
    { content: 'brown', match: true },
    { content: ' ' },
    { content: 'fox', match: true },
    { content: ' ' },
    { content: 'jumps', match: true },
    { content: ' ' },
    { content: 'over', match: true },
    { content: ' ' },
    { content: 'the', match: true },
    { content: ' ' },
    { content: 'lazy', match: true },
    { content: ' ' },
    { content: 'dog', match: true },
    { content: '.' },
  ];

  function token(match) {
    return { content: match[0], match: true };
  }

  function separator(chunk) {
    return { content: chunk[0] };
  }

  const words = tokenizer({ token, separator }, /\w+/g);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});


test.cb('should return tokens and separators as objects (function options provided)', (t) => {
  const input = '  The';
  const expected = [
    { content: '  ' },
    { content: 'The', sentence: true, leadingWS: '  ' },
  ];

  function token(match) {
    return { content: match[2], sentence: true, leadingWS: match[1] };
  }

  function separator(chunk) {
    return { content: chunk[0] };
  }

  const words = tokenizer({ token, separator, leaveBehind: '[1]' }, /(^\s*)?(\w+)/gm);
  let index = 0;

  words.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  words.on('end', () => t.end());

  input.match(/.{1,3}/g).forEach((chunk) => {
    words.write(chunk, 'utf8');
  });
  words.end();
});
