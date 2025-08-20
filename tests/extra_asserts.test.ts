// Copyright (c) 2025-present TransTitle Contributors. Licensed under MIT license, Apache 2.0
// license and BSD license.

import * as tt from '../index.js';

import test from "node:test";
import assert from "node:assert";

tt.flags.extra_asserts = true;

test("Yellow.toString() throws when flags.extra_asserts==true", () => {
    var encodedWhole;
    assert.throws(
        () => {
            tt.Yellow.INSTANCE.toString()
        },
        {
            name: 'Error',
            message: "Don't print/format any instance of class Yellow.",
        }
    );
});
