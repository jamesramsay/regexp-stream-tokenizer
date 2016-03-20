'use strict';

var through2 = require('through2');
var get = require('lodash.get');
var xtend = require('xtend');
var cloneRegExp = require('clone-regexp');

var ZERO_BYTE_STRING = '';

function ctor(optionsArg, regexArg) {
  var options;
  var regex;
  var pattern;
  var inputBuffer = '';

  // Zero-based line and column in the original source
  var cursor = {
    line: 1,
    column: 0
  };

  if (regexArg) {
    regex = regexArg;
    options = optionsArg;
  } else {
    regex = optionsArg;
    options = {};
  }

  options = xtend({ objectMode: true, highWaterMark: 16, token: true, excludeZBS: true }, options);
  pattern = cloneRegExp(regex);


  function processOutput(template, match) {
    var output;
    var matchContent = match[0];
    var newCursor = {
      line: matchContent.match(/\n/g),
      column: matchContent.match(/.*$/g)
    };

    switch (typeof template) {
      case 'boolean':
        output = matchContent;
        break;
      case 'string':
        output = {};
        output[template] = matchContent;
        break;
      case 'function':
        output = template(match, options);
        break;
      default:
        output = '';
    }

    // Append line & column
    if ((typeof output) === 'object') {
      output.line = cursor.line;
      output.column = cursor.column;
      if (options.source) output.source = options.source;
    }

    // Update line & column
    cursor.line += newCursor.line ? newCursor.line.length : 0;
    cursor.column = newCursor.line ? newCursor.column[0].length : cursor.column + newCursor.column[0].length;

    return output;
  }

  function push(chunk, match) {
    var matchAlt = match;
    var output;
    // Allows pseudo-lookbehind by using groups
    // [foo][ ][bar] (true lookbehind would yeild [foo ][bar])
    var leaveBehind = get(match, options.leaveBehind);

    if (leaveBehind) {
      output = processOutput(options.separator, [leaveBehind]);
      if (!options.excludeZBS !== (output !== ZERO_BYTE_STRING)) this.push(output);
      matchAlt[0] = chunk.slice(chunk.indexOf(leaveBehind) + leaveBehind.length);
    }

    if (matchAlt && options.token) {
      output = processOutput(options.token, match);
      if (!options.excludeZBS !== (output !== ZERO_BYTE_STRING)) this.push(output);
    }

    if (!matchAlt && options.separator) {
      output = processOutput(options.separator, [chunk]);
      if (!options.excludeZBS !== (output !== ZERO_BYTE_STRING)) this.push(output);
    }
  }


  function tokenize(chunk) {
    var lastChunk = !chunk;
    var nextOffset = 0;
    var match = null;

    if (chunk) inputBuffer += chunk.toString('utf8');

    while ((match = pattern.exec(inputBuffer)) !== null) {
      // Content prior to match can be returned without transform
      if (match.index !== nextOffset) {
        push.call(this, inputBuffer.slice(nextOffset, match.index));
      }

      // Match within bounds: [  xxxx  ]
      if (lastChunk || pattern.lastIndex < inputBuffer.length) {
        push.call(this, match[0], match);

        // Next match must be after this match
        nextOffset = pattern.lastIndex;
      // Match against bounds: [     xxx]
      } else {
        // Next match will be the start of this match
        nextOffset = match.index;
      }
    }
    inputBuffer = inputBuffer.slice(nextOffset);
    pattern.lastIndex = 0;
  }


  function transform(chunk, encoding, cb) {
    tokenize.call(this, chunk);
    return cb();
  }


  function flush(cb) {
    tokenize.call(this);

    // Empty internal buffer and signal the end of the output stream.
    if (inputBuffer !== '') {
      push.call(this, inputBuffer);
    }

    this.push(null);
    return cb();
  }

  return through2.ctor(options, transform, flush);
}

function make(options, regex) {
  return ctor(options, regex)();
}

module.exports = make;
module.exports.ctor = ctor;
