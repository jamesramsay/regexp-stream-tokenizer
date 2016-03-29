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
    { token: 'The', line: 1, column: 0 },
    { separator: ' ', line: 1, column: 3 },
    { token: 'quick', line: 1, column: 4 },
    { separator: ' ', line: 1, column: 9 },
    { token: 'brown', line: 1, column: 10 },
    { separator: ' ', line: 1, column: 15 },
    { token: 'fox', line: 1, column: 16 },
    { separator: ' ', line: 1, column: 19 },
    { token: 'jumps', line: 1, column: 20 },
    { separator: ' ', line: 1, column: 25 },
    { token: 'over', line: 1, column: 26 },
    { separator: ' ', line: 1, column: 30 },
    { token: 'the', line: 1, column: 31 },
    { separator: ' ', line: 1, column: 34 },
    { token: 'lazy', line: 1, column: 35 },
    { separator: ' ', line: 1, column: 39 },
    { token: 'dog', line: 1, column: 40 },
    { separator: '.', line: 1, column: 43 },
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
    { content: 'The', line: 1, column: 0, match: true },
    { content: ' ', line: 1, column: 3 },
    { content: 'quick', line: 1, column: 4, match: true },
    { content: ' ', line: 1, column: 9 },
    { content: 'brown', line: 1, column: 10, match: true },
    { content: ' ', line: 1, column: 15 },
    { content: 'fox', line: 1, column: 16, match: true },
    { content: ' ', line: 1, column: 19 },
    { content: 'jumps', line: 1, column: 20, match: true },
    { content: ' ', line: 1, column: 25 },
    { content: 'over', line: 1, column: 26, match: true },
    { content: ' ', line: 1, column: 30 },
    { content: 'the', line: 1, column: 31, match: true },
    { content: ' ', line: 1, column: 34 },
    { content: 'lazy', line: 1, column: 35, match: true },
    { content: ' ', line: 1, column: 39 },
    { content: 'dog', line: 1, column: 40, match: true },
    { content: '.', line: 1, column: 43 },
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
    { content: '  ', line: 1, column: 0 },
    { content: 'The', line: 1, column: 2, sentence: true, leadingWS: '  ' },
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


test.cb('should tokenize mixed input', (t) => {
  const input = '# Title\n:[link](test1.apib)\nSome content...\n';
  const expected = [
    { content: '# Title\n', line: 1, column: 0 },
    { content: '', line: 2, column: 0 },
    { content: ':[link](test1.apib)', line: 2, column: 0 },
    { content: '\n', line: 2, column: 19 },
    { content: 'Some content...\n', line: 3, column: 0 },
    { content: '', line: 4, column: 0 },
  ];
  const linkRegExp = new RegExp(/(^[\t ]*)?(\:\[.*?\]\((.*?)\))/gm);

  function token(match) {
    return { content: match[2] };
  }

  function separator(match) {
    return { content: match[0] };
  }

  const tokenStream = tokenizer({ token, separator }, linkRegExp);
  let index = 0;

  tokenStream.on('readable', function read() {
    let chunk = null;
    while ((chunk = this.read()) !== null) {
      t.same(chunk, expected[index]);
      index += 1;
    }
  });

  tokenStream.on('end', () => t.end());

  tokenStream.write(input, 'utf8');
  tokenStream.end();
});
