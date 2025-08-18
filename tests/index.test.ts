// Copyright (c) 2025-present TransTitle Contributors. Licensed under MIT license, Apache 2.0
// license and BSD license.

import * as tt from '../src/index.js';

import test from "node:test";
import assert from "node:assert";

test("basic, all fine", () => {
    var encodedWhole;
    encodedWhole = "Title#__#<<Hi>> <<Second Yellow@1>> C1<<Red color#red>> <<Second Blue@2#blue>> CC2<<Green#green>> ";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.strictEqual(enc.encodedWhole, encodedWhole);
    assert.strictEqual(enc.titleItselfLength, 5);
    assert.deepEqual(enc.corruptions, []);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 0,
            highlightWithoutCloserLength: 4,
            highlightWithCloserLength: 7,
            closer: 'complete'
        },
        {
            commentLength: 0,
            highlightWithoutCloserLength: 17,
            highlightWithCloserLength: 20,
            closer: 'complete'
        },
        {
            commentLength: 2,
            highlightWithoutCloserLength: 15,
            highlightWithCloserLength: 18,
            closer: 'complete'
        },
        {
            commentLength: 0,
            highlightWithoutCloserLength: 20,
            highlightWithCloserLength: 23,
            closer: 'complete'
        },
        {
            commentLength: 3,
            highlightWithoutCloserLength: 13,
            highlightWithCloserLength: 16,
            closer: 'complete'
        }
    ]);
});

test("missing last space, no comment", () => {
    var encodedWhole = "Title#__#<<Last, no comment, no trailing space>>";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 48,
        relativeInPart: 39,
        partIdx: 0,
        kind: tt.CorruptionKind.MISSING_LAST_SPACE
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
        commentLength: 0,
        highlightWithoutCloserLength: 37,
        highlightWithCloserLength: 39,
        closer: 'missing_last_space'
    }]);
});

test("missing last space, with a comment", () => {
    var encodedWhole = "Title#__#Comment<<Last, no comment, no trailing space>>";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 55,
        relativeInPart: 46,
        partIdx: 0,
        kind: tt.CorruptionKind.MISSING_LAST_SPACE
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
        commentLength: 7,
        highlightWithoutCloserLength: 37,
        highlightWithCloserLength: 39,
        closer: 'missing_last_space'
    }]);
});

test("missing internal space, without a comment", () => {
    var encodedWhole = "Title#__#<<No trailing internal space#blue>><<No comment@3#red>> ";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.strictEqual(enc.encodedWhole, encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 44,
        relativeInPart: 35,
        partIdx: 0,
        kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 0,
            highlightWithoutCloserLength: 33,
            highlightWithCloserLength: 35,
            closer: 'missing_internal_space'
        },
        {
            commentLength: 0,
            highlightWithoutCloserLength: 18,
            highlightWithCloserLength: 21,
            closer: 'complete'
        }
    ]);
});

test("missing internal space, with a comment", () => {
    var encodedWhole = "Title#__#<<No trailing internal space#blue>>Comment<<With a comment@3#red>> ";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.strictEqual(enc.encodedWhole, encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 44,
        relativeInPart: 35,
        partIdx: 0,
        kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 0,
            highlightWithoutCloserLength: 33,
            highlightWithCloserLength: 35,
            closer: 'missing_internal_space'
        },
        {
            commentLength: 7,
            highlightWithoutCloserLength: 22,
            highlightWithCloserLength: 25,
            closer: 'complete'
        }
    ]);
});

test("missing internal and last spaces, with and without comments", () => {
    var encodedWhole = "Title#__#<<Internal, no trailing space>><<Internal, no comment, no trailing space#red>>Comm<<Internal with comment, no trailing space@2#blue>><<Last, no trailing space>>";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.strictEqual(enc.encodedWhole, encodedWhole);
    // If comparisons of arrays of so many/long objects fail, then assert.deepEqual(.., ..) does NOT
    // print whole content of the objects, but skips with three dots... Then, replace
    // assert.deepEqual with assert.deepStrictEqual temporarily, while you're figuring out
    // differences.
    //
    // Also, using assert.deepStrictEqual (temporarily) prints a COLORED DIFF output.
    assert.deepEqual(enc.corruptions, [{
            absoluteInWhole: 40,
            relativeInPart: 31,
            partIdx: 0,
        kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
        },
        {
            absoluteInWhole: 87,
            relativeInPart: 47,
            partIdx: 1,
            kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
        },
        {
            absoluteInWhole: 142,
            relativeInPart: 55,
            partIdx: 2,
            kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
        },
        {
            absoluteInWhole: 169,
            relativeInPart: 27,
            partIdx: 3,
            kind: tt.CorruptionKind.MISSING_LAST_SPACE
        }
    ]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 0,
            highlightWithoutCloserLength: 29,
            highlightWithCloserLength: 31,
            closer: 'missing_internal_space'
        },
        {
            commentLength: 0,
            highlightWithoutCloserLength: 45,
            highlightWithCloserLength: 47,
            closer: 'missing_internal_space'
        },
        {
            commentLength: 4,
            highlightWithoutCloserLength: 49,
            highlightWithCloserLength: 51,
            closer: 'missing_internal_space'
        },
        {
            commentLength: 0,
            highlightWithoutCloserLength: 25,
            highlightWithCloserLength: 27,
            closer: 'missing_last_space'
        }
    ]);
});

test("trailing content, no previous highlight", () => {
    var encodedWhole = "Title#__#Trailing";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 10,
        relativeInPart: 1,
        partIdx: 0,
        kind: tt.CorruptionKind.UNMARKED_REST
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
        length: 8
    }]);
});


test("trailing content, with a previous proper highlight", () => {
    var encodedWhole = "Title#__#Comment<<Proper highlight>> Trailing";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 38,
        relativeInPart: 1,
        partIdx: 1,
        kind: tt.CorruptionKind.UNMARKED_REST
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 7,
            highlightWithoutCloserLength: 18,
            highlightWithCloserLength: 21,
            closer: 'complete'
        },
        {
            length: 8
        }
    ]);
});

test("trailing content, with a previous highlight missing a trailing space", () => {
    var encodedWhole = "Title#__#Comment<<Proper highlight@1#blue>>Trailing";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
            absoluteInWhole: 43,
            relativeInPart: 34,
            partIdx: 0,
            kind: tt.CorruptionKind.MISSING_INTERNAL_SPACE
        },
        {
            absoluteInWhole: 44,
            relativeInPart: 1,
            partIdx: 1,
            kind: tt.CorruptionKind.UNMARKED_REST
        }
    ]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 7,
            highlightWithoutCloserLength: 25,
            highlightWithCloserLength: 27,
            closer: 'missing_internal_space'
        },
        {
            length: 8
        }
    ]);
});

test("missing last closer pair, no comment, no suffixes, no previous highlights", () => {
    var encodedWhole = "Title#__#<<Highlight";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 10,
        relativeInPart: 1,
        partIdx: 0,
        kind: tt.CorruptionKind.MISSING_LAST_CLOSER_PAIR
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
        commentLength: 0,
        highlightWithoutCloserLength: 11,
        highlightWithCloserLength: 11,
        closer: 'missing_double_closer_and_space'
    }]);
});

test("missing last closer pair, a comment, suffixes, previous highlights", () => {
    var encodedWhole = "Title#__#Comment<<Proper highlight@1#blue>> 2ndComment<<UnclosedHi";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 55,
        relativeInPart: 11,
        partIdx: 1,
        kind: tt.CorruptionKind.MISSING_LAST_CLOSER_PAIR
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 7,
            highlightWithoutCloserLength: 25,
            highlightWithCloserLength: 28,
            closer: 'complete'
        },
        {
            commentLength: 10,
            highlightWithoutCloserLength: 12,
            highlightWithCloserLength: 12,
            closer: 'missing_double_closer_and_space'
        }
    ]);
});

test("missing last closer single, a comment, suffixes, previous highlights", () => {
    var encodedWhole = "Title#__#Comment<<Proper highlight@1#blue>> 2ndComment<<NotFullyClosed>";
    var enc = tt.parseWholeTitleToEncoded(encodedWhole);
    assert.deepEqual(enc.corruptions, [{
        absoluteInWhole: 55,
        relativeInPart: 11,
        partIdx: 1,
        kind:tt.CorruptionKind. MISSING_LAST_CLOSER_SINGLE
    }]);
    assert.deepEqual(enc.encodedHighlights, [{
            commentLength: 7,
            highlightWithoutCloserLength: 25,
            highlightWithCloserLength: 28,
            closer: 'complete'
        },
        {
            commentLength: 10,
            highlightWithoutCloserLength: 16,
            highlightWithCloserLength: 17,
            closer: 'missing_single_closer_and_space'
        }
    ]);
});

test("trailing content todo", () => {
    throw new Error("TODO - and change implementation to HAVE an EXTRA EncodedHighlight (or some other) for this trailing content.");
});
