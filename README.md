# regexp-stream-tokenizer

[![Version](https://img.shields.io/npm/v/regexp-stream-tokenizer.svg)](https://npmjs.com/package/regexp-stream-tokenizer)
[![License](https://img.shields.io/npm/l/regexp-stream-tokenizer.svg)](https://npmjs.com/package/regexp-stream-tokenizer)
[![Build Status](https://img.shields.io/travis/jamesramsay/regexp-stream-tokenizer.svg)](https://travis-ci.org/jamesramsay/regexp-stream-tokenizer)
[![Coverage Status](https://img.shields.io/codecov/c/github/jamesramsay/regexp-stream-tokenizer.svg)](https://codecov.io/github/jamesramsay/regexp-stream-tokenizer)
[![Dependency Status](https://img.shields.io/david/jamesramsay/regexp-stream-tokenizer.svg)](https://david-dm.org/jamesramsay/regexp-stream-tokenizer)

[![NPM](https://nodei.co/npm/regexp-stream-tokenizer.png)](https://nodei.co/npm/regexp-stream-tokenizer/)

This is a simple regular expression based tokenizer for streams.

**IMPORTANT:** If you return `null` from your function, the stream will end there.

**IMPORTANT:** Only supports object mode streams.

```javascript

var tokenizer = require("regexp-stream-tokenizer");

var words = tokenizer(/w+/g);

// Sink receives tokens: 'The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'
words.write('The quick brown fox jumps over the lazy dog');
words.pipe(sink)

// Separators are excluded by default, but can be included
var wordsAndSeparators = tokenizer({ separator: true }, /w+/g);

// Sink receives tokens: 'The', ' ', 'quick', ' ', 'brown', ' ', 'fox', ' ', 'jumps', ' ', 'over', ...
words.write('The quick brown fox jumps over the lazy dog');
words.pipe(sink)

```

## API

```javascript
require("regexp-stream-tokenizer")([options,] regexp)
```

Create a `stream.Transform` instance with `objectMode: true` that will tokenize the input stream using the regexp.

```javascript
var Tx = require("regexp-stream-tokenizer").ctor([options,] regexp)
```

Create a reusable `stream.Transform` TYPE that can be called via `new Tx` or `Tx()` to create an instance.

__Arguments__

- `options`
  - `excludeZBS` (boolean): defaults `true`.
  - `token` (boolean|string|function): defaults `true`.
  - `separator` (boolean|string|function): defaults `false`.
  - `leaveBehind` (string|Array): optionally provides pseudo-lookbehind support.
  - all other through2 options.
- `regexp` (RegExp): The regular expression using which the stream will be tokenized.
