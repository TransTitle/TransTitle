// @ts-check

// Copyright (c) 2025-present TransTitle Contributors. Licensed under MIT license, Apache 2.0
// license and BSD license.

const TITLE_HIGHLIGHT_SEPARATOR = "#__#";
const DOUBLE_OPENER = '<<';
const DOUBLE_CLOSER = '>>';
const SINGLE_OPENER = '<';
const SINGLE_CLOSER = '>';
const CLOSER_SPACE = ' ';
/**
 * An escape character used to escape special characters `<`, '>', '#', '@' in both the comments and
 * highlights. Using `'@'` instead of `'#'`, because Google says that when we exclude uses of `@` in
 * email addresses, social media tags, and usernames, the number sign (#), also known as the hash
 * symbol, is more frequent in general online content.
 */
const ESCAPER = '@';

/**
 * @param { object } [options]
 * @param { number } [options.MAX_ENCODED_LENGTH] Use `-1` (default) for unlimited.
 * @param { boolean } [options.ESCAPED] Use `false` for untreated/unverified. For example, for the
 * first time run on Yawas bookmarks. `false` by default.
 * @param { boolean } [options.INJECT_MISSING_SPACE_AFTER_HIGHLIGHT] Whether to inject a space after
 * any highlight and its double closer `'>>'` if the space is missing. For example if the bookmarks
 * have been edited manually.
 *
 * If `true`, this applies only to existing, unmodified highlights. Use `false` if you don't want
 * changes of other highlights when another highlight is removed/changed or when a new highlight is
 * added.
 *
 * Either way, Any new highlights will have a trailing space.
 *
 * `false` by default.
 */
function non_exported_options_for_later(options) {
    options = options || {};
    if (typeof options.MAX_ENCODED_LENGTH == "undefined") {
        options.MAX_ENCODED_LENGTH = -1;
    }
    if (typeof options.ESCAPED == "undefined") {
        options.ESCAPED = false;
    }
    if (typeof options.INJECT_MISSING_SPACE_AFTER_HIGHLIGHT == "undefined") {
        options.INJECT_MISSING_SPACE_AFTER_HIGHLIGHT = false;
    }
    // If storage (for example, YAML) trims trialing space(s), then we do NOT just add a space to
    // every bookmark. Because if the bookmark was corrupt and with just one closer character '>' at
    // the end, adding a trail would make that single closer character '>' become "a part of" the
    // highlight. But then the browser couldn't match such a highlight against the page content!
    if (1 == 1) {
        throw new Error("TODO");
    }
    /*if (typeof options.STORAGE_TRIMS_TRAILING_SPACE == "undefined") {
        options.STORAGE_TRIMS_TRAILING_SPACE = false;
        throw new Error("TODO");
    }*/
    const {
        MAX_ENCODED_LENGTH,
        ESCAPED,
        INJECT_MISSING_SPACE_AFTER_HIGHLIGHT
    } = options;
    throw new Error(`TODO ${options}`);
}

/**
 * Information about an encoded (stored) highlight and comment (if any). All the lengths are
 * lengths of the respective part of the related whole encoded title also. That whole encoded
 * title is stored in the related instance of {@linkcode EncodedWholeTitle} (which "owns/holds"
 * this {@linkcode EncodedHighlight} instance).
 *
 * This type intentionally stores only lengths of the respective parts, but not any indexes.
 * This makes it all relative to any previous encoded highlights (and the previous encoded page
 * title itself).
 *
 * Using lengths instead of indexes does increase the work when generating substrings for each
 * parts, because as we iterate over the whole encoded title, we need to keep the current index
 * to which we add length of each part. It also means we can't just access any highlight out of
 * its sequential order - but we don't need that.
 *
 * However, the advantage of using lengths (rather than indexes):
 * - no integrity checks, and
 * - if any highlight is modified/removed, no need to update any subsequent indexes.
 *
 * This class is used primarily as an intermediary when parsing (decoding). It CAN be used when
 * joining/storing (decoding), and it IS used by {@linkcode joinWholeEncodedTitleToString}, but
 * it's NOT preferred for encoding. Use {@linkcode joinWholeEncodedTitleToString} instead.
 *
 * All modern Javascript browser engines, especially Mozilla Firefox (SpiderMonkey), (Chrome
 * (V8) and WebKit (JavaScriptCore with `JSString`) used by Apple Safari and WebKit-derivative
 * browsers, store strings as UTF-16 and they store the string length. Therefore, instead of
 * storing substrings, we only store lengths referring to parts of the same ("whole") string
 * {@linkcode EncodedWholeTitle#encodedWhole}.}
 */
export class EncodedHighlight {
    // We use the `@type`, instead of `@property` that would be just before the class. Otherwise
    // (with `@property), VS Code was not inferring the property type.
    /**
     * Length of the encoded comment (if any). If no comment, it's zero. If non-zero (that is,
     * the comment present), the comment is stored before (left of) the highlight part.
     * @type { number } */
    commentLength;
    /**
     * Length of the encoded highlight part (not just highlight itself), including any suffixes:
     * occurrence-indicating suffix `'@number'` and/or color-indicating suffix `'#color'`, but
     * EXCLUDING trailing `'>> '` (or its part). A part of (equal or smaller than)
     * {@linkcode EncodedHighlight#highlightWithCloserLength}. It EXCLUDES length of an associated
     * (preceding) comment (if any).
     *
     * It INCLUDES the leading substring `"<<"`. Also, INCLUDING zero, one or both of the following
     * two suffixes (in this order):
     * - Occurrence indicator, if present. It is in form `"@number"`, where the number part is a
     *   zero-based index of the occurrence of the highlighted string. The very first match (with
     *   the index being zero) does __not__ have this `"@number"` suffix. So, only the second and
     *   successive occurrences have such an index (prefixed with `"@"`), and their zero-based
     *   indexes are `1, 2` etc. And/or:
     * - The trailing color-indicating string (but other than `"#yellow"`, that is: `"#red"`,
     *   `"#green"` or "#blue"`) if present. Yellow, the default color, is **not** stored (not even
     *   after an existing highlight in any other color is changed to yellow - in such case the
     *   color-indicating string is removed and not replaced).
     *
     * The highlighted text itself is trimmed on both sides - no leading/trailing whitespaces. It
     * can't contain a new line. (Other restrictions apply when matching the DOM element, like not
     * matching content across table cells.)
     *
     * Excluding trailing `">> "` (with a space at the end) and any occurrence or color indicator
     * (if present - required if the highlight has been sanitized).
     *
     * The highlighted text itself is trimmed on both sides - no leading/trailing whitespaces. It
     * can't contain a new line. (Other restrictions apply when matching the DOM element, like not
     * matching content across table cells.)
     * @type { number }
     */
    highlightWithoutCloserLength;
    /**
     * Length of the encoded highlight part, INCLUDING both the leading substring `"<<"` and
     * trailing `">> "` (if any, and with a space at the end, if any). If the highlight was
     * sanitized, it's higher by 3 than {@linkcodeEncodedHighlight #highlightWithoutCloserLength}.
     * Otherwise it may be lower than that, but still higher or equal to
     * {@linkcode EncodedHighlight#highlightWithoutCloserLength}. It EXCLUDES length of an
     * associated (preceding) comment (if any).
     *
     * The encoded/stored highlight part (if correct/sanitized) ends with a space that is a part of
     * the trailing double closer `">> "`.
     * @type { number }
     */
    highlightWithCloserLength;
    /**
     * @type {HighlightCloser} This does NOT indicate whether the highlight (and comment, if
     * any) is well-formatted/encoded! This parameter may well be `true`, but the highlight
     * and/or the comment themselves could be improperly encoded/ambiguous/corrupt!
     */
    closer;

    /**
     * @param { number } commentLength Length of the encoded comment, or zero.
     * @param { number } highlightWithoutCloserLength
     * @param { number } highlightWithCloserLength
     * @param { HighlightCloser } closer This does NOT indicate whether the highlight (and
     * comment, if any) is well-formatted/encoded! This attribute may well be
     * {@linkcode HighlightCloserValues#COMPLETE}, but the contents of the highlight and/or the
     * comment themselves could be improperly encoded/ambiguous/corrupt!
     */
    constructor(commentLength, highlightWithoutCloserLength, highlightWithCloserLength, closer) {
        this.commentLength = commentLength;
        this.highlightWithoutCloserLength = highlightWithoutCloserLength;
        this.highlightWithCloserLength = highlightWithCloserLength;
        this.closer = closer;
    }
}

export class Yellow {
    /**
     *  @type {true}
     **/
    yellow;

    constructor() {
        this.yellow = true;
    }
    /** @throws {Error} */
    toString() {
        throw new Error("Don't print/format any instance of class Yellow.");
    }
    /** @type {Yellow} */
    static INSTANCE = new Yellow();
}

/**
 * NOT for actually typing `color` property - for that we use `@typedef` {@link HighlightColor}
 * instead of an `enum`, because with an `@enum` VS Code didn't infer/show the type. Field
 * `YELLOW` is used only at runtime, but when encoding it's removed (and no trailing hash `'#'`
 * is encoded either).
 * @readonly
 * @enum {HighlightColor}
 */
export const HighlightColorValues = Object.freeze({
    /** @type {Yellow} */
    YELLOW: Yellow.INSTANCE,
    RED: "red",
    BLUE: "blue",
    GREEN: "green",
});

/**
 * This is for typing `color` parameters and properties - instead of an `enum`
 * {@link HighlightColorValues}, because with an `@enum` VS Code didn't infer/show the type.
 * Value `"yellow"` is used only at runtime, but when encoding it's removed (and no trailing
 * hash `'#'` is encoded either).
 * @typedef {(Yellow | "red" | "blue" | "green")} HighlightColor
 */

/** Human-friendly (decoded) highlight and comment. */
export class DecodedHighlight {
    /** @type {string} */
    comment;
    /** @type {string} */
    highlight;
    /** @type {number} Zero-based match index of the highlighted text. */
    occurrence;
    /** @type {HighlightColor} */
    color;
    /**
     * TODO revisit Whether this can be safely encoded back. If `true`, there are no encoding
     * problems for `comment` (if any) or `highlight`, and the related
     * {@linkcode EncodedHighlight#closer} is {@linkcode HighlightCloserValues#COMPLETE} or
     * {@linkcode HighlightCloserValues#MISSING_SPACE} (if the client allowed it). That means
     * there are no related {@linkcode Corruption} entries for this highlight in
     * {@linkcode EncodedWholeTitle#corruptions}.
     * @type {boolean}
     */
    canBeEncoded;

    /**
     * @param { string } comment If not present, then an empty string.
     * @param { string } highlight
     * @param { number } occurrence Zero-based match index of the highlighted text.
     * @param { boolean } canBeEncoded
     * @param { HighlightColor } color
     */
    constructor(comment, highlight, occurrence, color, canBeEncoded) {
        this.comment = comment;
        this.highlight = highlight;
        this.occurrence = occurrence;
        this.color = color;
        this.canBeEncoded = canBeEncoded;
    }
}

/**
 * NOT for actually typing `lastHighlightCloser` property - for that we use `@typedef`
 * {@link HighlightCloser} instead of an `enum`, because with an `@enum` VS Code didn't
 * infer/show the type.
 * @readonly
 * @enum {HighlightCloser}
 */
export const HighlightCloserValues = Object.freeze({
    COMPLETE: "complete",
    /**
     * Missing a space after a closer `'>>'`, EXCEPT for the very last missing space that
     * would be the very last character of the whole bookmarked title.
     **/
    MISSING_INTERNAL_SPACE: "missing_internal_space",
    /**
     * Missing the very last space, after a properly positioned last closer `'>>'`, where there are
     * no more characters after that `'>>'` closer.
     **/
    MISSING_LAST_SPACE: "missing_last_space",
    /**
     * Only single closer was present, AND it was the LAST character of the bookmark's whole
     * title. It has to be removed if we automate its sanitization.
     *
     * Used for the last highlight of a given bookmark (if applicable at all).
     */
    MISSING_SINGLE_CLOSER_AND_SPACE: "missing_single_closer_and_space",
    /** Used for the last highlight of a given bookmark (if applicable at all). */
    MISSING_DOUBLE_CLOSER_AND_SPACE: "missing_double_closer_and_space",
});

/**
 * This is for typing `lastHighlightCloser` parameter and property - instead of an `enum`
 * {@linkcode HighlightCloserValues}, because with an `@enum` VS Code didn't infer/show the
 * type.
 * @typedef {("complete" | "missing_internal_space" | "missing_last_space" | "missing_single_closer_and_space" |
 * "missing_double_closer_and_space")} HighlightCloser
 */

/**
 * @param {HighlightCloser} closer
 * @returns {number}
 */
export function closer_length(closer) {
    switch (closer) {
        case HighlightCloserValues.COMPLETE:
            return 3;
        case HighlightCloserValues.MISSING_INTERNAL_SPACE:
        case HighlightCloserValues.MISSING_LAST_SPACE:
            return 2;
        case HighlightCloserValues.MISSING_SINGLE_CLOSER_AND_SPACE:
            return 1;
        case HighlightCloserValues.MISSING_DOUBLE_CLOSER_AND_SPACE:
            return 0;
        default:
            throw new Error(`Illegal parameter: ${closer}.`);
    }
}

/** Severity of a corruption problem. */
export class CorruptionKind {
    /**
     * The higher the more severe. Values are subject to CHANGE. NOT necessarily unique!
     * @type {number}
     * @readonly
     **/
    severity;
    /**
     * Whether the problem can be sanitized automatically.
     * @type {boolean}
     * @readonly
     **/
    auto_fixable;
    /**
     * Whether automatic sanitation involves potential data loss. Expected to be non-null and used
     * only if {@linkcode CorruptionKind#auto_fixable} is `true`.
     * @type {?boolean}
     * @readonly
     **/
    auto_fix_may_lose_data;
    /** @type {string} */
    description;

    /**
     * @param {number} severity The higher the more severe.
     * @param {boolean} auto_fixable Whether auto-fixable.
     * @param {?boolean} auto_fix_may_lose_data Whether automatic sanitation involves potential data
     * loss. Expected to be non-null and used only if {@linkcode CorruptionKind#auto_fixable} is
     * `true`.
     * @param {string} description
     */
    constructor(severity, auto_fixable, auto_fix_may_lose_data, description) {
        this.severity = severity;
        this.auto_fixable = auto_fixable;
        this.auto_fix_may_lose_data = auto_fix_may_lose_data;
        this.description = description;
    }

    // Keep sorted by severity
    /** @type {CorruptionKind} */
    static MISSING_LAST_SPACE = new CorruptionKind(10, true, false, "The last highlighter closer >> is missing a space just after it.");
    /** @type {CorruptionKind} */
    static MISSING_INTERNAL_SPACE = new CorruptionKind(15, true, false, "The highlighter closer >> is missing an internal space just after it.");
    /** @type {CorruptionKind} */
    static MISSING_LAST_CLOSER_PAIR = new CorruptionKind(30, true, false, "The last highlighter opener pair << doesn't have a matching closer pair >> (and a trailing space). Assuming the default (yellow) color.");
    /** @type {CorruptionKind} */
    static MISSING_LAST_CLOSER_SINGLE = new CorruptionKind(30, true, true, "The last highlighter opener pair << may have had a matching closer pair >> but with the second closer character > truncated (along with a trailing space). However, we can't be sure, so we are REMOVING that single closer >.");
    /**
     * A bookmark title contains the ` "#__#"` separator, but (after highlights, if any) there
     * is a trailing content that is not marked with an `"<<"` opener.
     * @type {CorruptionKind}
     **/
    static UNMARKED_REST = new CorruptionKind(100, false, null, "Expecting an opener pair <<. Discarding the rest.");
}

/** Description (and location, if known) of what didn't parse well. */
export class Corruption {
    /**
     * "Absolute" character index to the WHOLE encoded title (including the page title itself),
     * starting NOT at zero, but at one. Optional - if present, then
     * {@linkcode Corruption#relativeInPart} is present, too. TODO reconsider as zero-based index.
     * @type {?number}
     **/
    absoluteInWhole;
    /**
     * "Relative" character index to the part/entry being identified/parsed (like
     * {@linkcode EncodedHighlight}). INCLUDING the
     * - comment (if present), and
     * - opener/prefixes (like `'<<'`), in its encoded form/representation.
     *
     * Starting NOT at zero, but at one. Optional - if present, then
     * {@linkcode Corruption#absoluteInWhole} is present, too. The related part's index/order number
     * is in {@linkcode Corruption#partIdx}. TODO reconsider as zero-based index.
     * @type {?number}
     **/
    relativeInPart;
    /**
     * Zero-based index (order number) of the related part (like {@linkcode EncodedHighlight}).
     * @type {number }
     **/
    partIdx;
    /** @type {CorruptionKind} */
    kind;

    /**
     * @param {?number} absoluteInWhole
     * @param {?number} relativeInPart
     * @param {number} partIdx
     * @param {CorruptionKind} kind
     */
    constructor(absoluteInWhole, relativeInPart, partIdx, kind) {
        this.absoluteInWhole = absoluteInWhole;
        this.relativeInPart = relativeInPart;
        this.partIdx = partIdx;
        this.kind = kind;
    }

    /** @returns {string} */
    toString() {
        if (this.absoluteInWhole) {
            return `Problem related to character index ${this.absoluteInWhole}: ${this.kind.toString() }`;
        } else {
            return this.kind.toString();
        }
    }
}

/**
 * Leftover content after the last highlight (if any). Indicated by
 * {@linkcode CorruptionKind#UNMARKED_REST}.
 */
export class UnmarkedRest {
    /**
     * Always positive (we don't instantiate for zero length).
     *  @type {number}
     **/
    length;

    /** @param {number} length */
    constructor(length) {
        this.length = length;
    }
}

/**
 * {@linkcode EncodedHighlight} or {@linkcode UnmarkedRest}.
 * @typedef {(EncodedHighlight | UnmarkedRest)} EncodedHighlightOrUnmarkedRest
 */

/** The whole title, encoded. */
export class EncodedWholeTitle {
    /**
     * @type { string } The whole title, encoded. All indexes in this
     * {@linkcode EncodedWholeTitle} instance are zero-based indexes to this whole string.
     */
    encodedWhole;
    /**
     * Length of the page title (either original or edited). (The title itself does NOT get
     * encoded/decoded - hence this length is the same as length of
     * {@link DecodedWholeTitle#titleItself} of a related {@link DecodedWholeTitle} instance. If
     * no title, then zero.
     *
     * If we choose to use a part of the bookmarked page title between the actual page title and
     * the Yawas delimiter `"#__#"` (by introducing some other delimiter(s)), this will continue
     * be length of just the page title.
     * @type { number }
     */
    titleItselfLength;
    /**NOT PARSED/USED YET. MAY CHANGE/MOVE.
     * Whether to keep the actual page title part as-is, even if the actual web page title has
     * changed. `true` for example if the user edited the page title and doesn't want it to be
     * auto-updated. Defaults to `false`.
     * @type { boolean }
     */
    preservePageTitle;
    /**
     * @type {EncodedHighlightOrUnmarkedRest[]}
     */
    encodedHighlights;
    /** @type {Corruption[]} */
    corruptions;

    /**
     * @param { string } encodedWhole
     * @param { number } titleItselfLength
     * @param { boolean } preservePageTitle
     * @param { EncodedHighlightOrUnmarkedRest[] } encodedHighlights}
     * @param { Corruption[] } corruptions
     */
    constructor(encodedWhole, titleItselfLength, preservePageTitle, encodedHighlights, corruptions) {
        this.encodedWhole = encodedWhole;
        this.titleItselfLength = titleItselfLength;
        this.preservePageTitle = preservePageTitle;
        this.encodedHighlights = encodedHighlights;
        this.corruptions = corruptions;
    }
}

/**
 * @param {string} encodedWhole
 * @returns {EncodedWholeTitle}
 */
export function parseWholeTitleToEncoded(encodedWhole) {
    const titleSeparatorIdx = encodedWhole.indexOf(TITLE_HIGHLIGHT_SEPARATOR);
    if (titleSeparatorIdx >= 0) {
        // ANY variable name ending with "Idx" is a zero-based index.
        /** @type {EncodedHighlightOrUnmarkedRest[]} */
        var highlights = [];
        /** @type {Corruption[]} */
        var corruptions = [];
        /**
         * Start of the comment for the next highlight, if there is such a comment;
         * otherwise it's the index where we expect the leading `"<<"` prefix of the next
         * highlight.
         * @type {number}
         */
        var commentIdx = titleSeparatorIdx + TITLE_HIGHLIGHT_SEPARATOR.length;
        while (commentIdx < encodedWhole.length) {

            /**
             * Where the next comment should start.
             * @type {number}
             **/
            var nextCommentIdx;
            const doubleOpenerIdx = encodedWhole.indexOf(DOUBLE_OPENER, commentIdx);
            if (doubleOpenerIdx > 0) {

                const commentLength = doubleOpenerIdx - commentIdx;
                const afterDoubleOpenerIdx = doubleOpenerIdx + DOUBLE_OPENER.length;
                const doubleCloserIdx = encodedWhole.indexOf(DOUBLE_CLOSER, afterDoubleOpenerIdx);

                /**
                 * Just after (right of) the highlight (and any `@` or `#` suffixes), INCLUDING
                 * a trailing closer `">>"` (with a trailing space), or a trailing `">>"` (if
                 * the trailing space is not present), or one trailing ">" (if it's the last
                 * ">") or no trailing ">" (if not present).
                 * @type {number}
                 */
                var postHighlightWithCloserIdx;
                /**
                 * Just after (right of) the highlight (and any `@` or `#` suffixes), but EXCLUDING
                 * any trailing ">> ", ">>" (if unsanitized) or (if the last highlight and
                 * unsanitized) a trailing * ">".
                 * @type {number}
                 **/
                var postHighlightWithoutCloserIdx;
                /** @type {HighlightCloser} */
                var closer;
                /* @type {number} Index just after (right of) the highlight content itself. */
                //var postHighlightItselfIdx;

                if (doubleCloserIdx > 0) {
                    if (encodedWhole.length > doubleCloserIdx + 2) {
                        if (encodedWhole[doubleCloserIdx + 2] == CLOSER_SPACE) {
                            postHighlightWithCloserIdx = doubleCloserIdx + 3; // past >> and the SPACE
                            postHighlightWithoutCloserIdx = doubleCloserIdx;

                            closer = HighlightCloserValues.COMPLETE;
                            nextCommentIdx = doubleCloserIdx + DOUBLE_CLOSER.length + 1;
                        } else {
                            postHighlightWithCloserIdx = doubleCloserIdx + 2;
                            postHighlightWithoutCloserIdx = doubleCloserIdx;

                            corruptions.push(new Corruption(postHighlightWithCloserIdx, postHighlightWithCloserIdx - commentIdx, highlights.length, CorruptionKind.MISSING_INTERNAL_SPACE));
                            closer = HighlightCloserValues.MISSING_INTERNAL_SPACE;
                            nextCommentIdx = doubleCloserIdx + DOUBLE_CLOSER.length;
                        }
                    } else {
                        postHighlightWithCloserIdx = doubleCloserIdx + 2;
                        postHighlightWithoutCloserIdx = doubleCloserIdx;

                        corruptions.push(new Corruption(postHighlightWithCloserIdx, postHighlightWithCloserIdx - commentIdx, highlights.length, CorruptionKind.MISSING_LAST_SPACE));
                        closer = HighlightCloserValues.MISSING_LAST_SPACE;
                        nextCommentIdx = doubleCloserIdx + DOUBLE_CLOSER.length + 1;
                    }
                } else {
                    postHighlightWithCloserIdx = encodedWhole.length;

                    const singleCloserIdx = encodedWhole.lastIndexOf(SINGLE_CLOSER);
                    if (singleCloserIdx === encodedWhole.length - 1 &&
                        /*at least one character is highlighted on the left of the single closer: */
                        singleCloserIdx > afterDoubleOpenerIdx &&
                        /* the single closer is not escaped: */
                        /* TODO If we escape *after* special characters, then  remove the following
                           check. */
                        encodedWhole[singleCloserIdx - 1] !== ESCAPER /* @TODO && check that the previous character is not @,  or that it's escaped; and so on leftward,*/ ) {
                        {
                            // If half of the double closer was truncated, we do NOT want to leave
                            // it as a part of the content. Even if we escaped it, it wouldn't work,
                            // because the highlighter couldn't match on the trailing single closer.
                            // So we remove it.
                            //
                            // That is the best we can do. It does mean that if the highlight did
                            // contain single character closer `'>'`, and that character was NOT the
                            // last character of this highlight, and the whole encoded title got
                            // truncated right after that single closer (with some more character(s)
                            // highlighted in the same highlight), we lose the legitimate highlight
                            // of this closer character `'>'`.
                            //
                            // We can't just compare encodedWhole.length to MAX_ENCODED_LENGTH as an
                            // indication of the bookmark truncation. Why? Because even if the
                            // bookmark had been truncated, some earlier (well-enclosed/uncorrupted)
                            // bookmarks could have been deleted/shortened later, which could
                            // decrease the total encoded length.
                            //
                            // (If the highlighted closer character were the last character of this
                            // highlight, this highlight when encoded would end with `'>>>'`, which
                            // would be a problem anyway.)
                        }
                        postHighlightWithoutCloserIdx = encodedWhole.length - 1;

                        corruptions.push(new Corruption(doubleOpenerIdx + 1, doubleOpenerIdx + 1 - commentIdx, highlights.length, CorruptionKind.MISSING_LAST_CLOSER_SINGLE));
                        closer = HighlightCloserValues.MISSING_SINGLE_CLOSER_AND_SPACE;
                    } else {
                        postHighlightWithoutCloserIdx = encodedWhole.length;

                        corruptions.push(new Corruption(doubleOpenerIdx + 1, doubleOpenerIdx + 1 - commentIdx, highlights.length, CorruptionKind.MISSING_LAST_CLOSER_PAIR));
                        closer = HighlightCloserValues.MISSING_DOUBLE_CLOSER_AND_SPACE;
                    }
                    nextCommentIdx = encodedWhole.length;
                }

                const highlightWithoutCloserLength = postHighlightWithoutCloserIdx - doubleOpenerIdx;
                const highlightWithCloserLength = postHighlightWithCloserIdx - doubleOpenerIdx;
                // Extra validation
                if (highlightWithCloserLength - highlightWithoutCloserLength != closer_length(closer)) {
                    // @TODO new Corruption
                    throw new Error(`closer is '${closer}', but highlightWithCloserLength: ${highlightWithCloserLength} and highlightWithoutCloserLength: ${highlightWithoutCloserLength}.`);
                }

                // @TODO 2nd stage
                /*
                // Similarly to the detection of unescaped double closer in the encoded comment
                // (above), here we detect an unescaped double opener in the encoded highlight.
                if (highlightWithoutCloserLength > 1) {
                // @TODO
                    const doubleOpenerIdxPotentiallyInHighlight = encodedWhole.indexOf(DOUBLE_OPENER, doubleOpenerIdx);
                    if (doubleOpenerIdxPotentiallyInHighlight > 0
                    && doubleOpenerIdxPotentiallyInHighlight < doubleOpenerIdx + highlightWithoutCloserLength) {
                        // @TODO choose severity based on !ESCAPED
                    }
                }*/

                highlights.push(new EncodedHighlight(commentLength, highlightWithoutCloserLength, highlightWithCloserLength, closer));

                commentIdx = nextCommentIdx;
            } else {
                corruptions.push(new Corruption(commentIdx + 1, 1, highlights.length, CorruptionKind.UNMARKED_REST));
                // @TODO
                highlights.push(new UnmarkedRest(encodedWhole.length - commentIdx));
                break;
            }
        }
        return new EncodedWholeTitle(encodedWhole, titleSeparatorIdx, false, highlights, corruptions);
    } else {
        return new EncodedWholeTitle(encodedWhole, encodedWhole.length, false, [], []);
    }
}

/**
 * @param {string} str
 * @param {number} start
 * @param {number} len
 * @returns {[string,Corruption[]]}
 */
export function decodeContent(str, start, len) {
    throw new Error("TODO decodeContent");
    //return ["", []];
}

export class DecodedWholeTitle {
    /**
     * Actual ENCODED (stored) length of the whole title - even though all entries in this class
     * are "decoded/decoded", we keep length of the whole encoded representation (so that we
     * don't have to re-calculated it, for example when checking limits on addition/change of a
     * highlight/comment/metadata). So it's the same as length of
     * {@linkcode EncodedWholeTitle#encodedWhole} of a related {@linkcode EncodedWholeTitle}
     * instance.
     * @type { number }
     */
    encodedLength;
    /**
     * Page title (either original or edited). (It does NOT get encoded/decoded - hence its
     * length is the same as {@linkcode EncodedWholeTitle#titleItselfLength} in a related
     * {@linkcode EncodedWholeTitle} instance.) If no title, it's an empty string.
     * @type { string }
     */
    titleItself;
    /**
     * Whether to keep the actual page title part as-is, even if the actual web page title has
     * changed. `true` for example if the user edited the page title and doesn't want it to be
     * auto-updated.
     * @type { boolean }
     */
    preservePageTitle;
    /**
     * @type {DecodedHighlight[]}
     */
    decodedHighlights;

    constructor() {
        this.encodedLength = 0;
        this.titleItself = '';
        this.preservePageTitle = false;
        this.decodedHighlights = [];
    }
}

/**
 * @param {EncodedWholeTitle} encodedWholeTitle
 * @returns {DecodedWholeTitle}
 */
export function decodeWholeTitle(encodedWholeTitle) {
    const encodedWhole = encodedWholeTitle.encodedWhole; // shortcut

    /** @type {Corruption[]} */
    var corruptions = [];
    /** @type {number} */
    var idx = 0;

    for (var highlightIdx = 0; highlightIdx < encodedWholeTitle.encodedHighlights.length; highlightIdx++) {
        const highlight = encodedWholeTitle.encodedHighlights[highlightIdx];
        {
            // If the comment contains an unescaped double closer, the previous highlight
            // may be corrupted: the highlighted content could have contained a double
            // closer that was stored unescaped, and parsing the previous highlight finished
            // earlier, leaving the rest of the highlight as if a part of the next comment.
            //
            // Of course, the unescaped double closer could be a legitimate comment from the
            // period when comments were not being escaped. We could have the browser
            // extension load the page and search for various alternatives of
            // comments/highlights.... but this sounds so rare that we leave it up to the
            // user.
        }
        if (highlight instanceof EncodedHighlight) {
            if (highlight.commentLength > 1) {
                /** @type {number} Index just after (right of) the highlight. */
                const postCommentIdx = idx + highlight.commentLength;
                const doubleCloserIdxPotentiallyInComment = encodedWhole.indexOf(DOUBLE_CLOSER, idx);
                if (doubleCloserIdxPotentiallyInComment > 0 && doubleCloserIdxPotentiallyInComment < postCommentIdx) {
                    // @TODO new Corruption choose severity based on !ESCAPED
                }
            }
        } else {
            throw new Error("TODO");
        }
    }

    return new DecodedWholeTitle();
}

/**
 * @param {DecodedWholeTitle} decodedWholeTitle
 * @returns {EncodedWholeTitle}
 */
export function encodeWholeTitle(decodedWholeTitle) {
    throw Error("todo");
    //return new EncodedWholeTitle('');
}

/**
 * NOT preferred for encoding. Somewhat redundant to, slower than and with higher memory
 * consumption than  {@linkcode encodeWholeTitle}.
 * @param {EncodedWholeTitle} encodedWholeTitle
 * @returns {string}
 */
export function joinWholeEncodedTitleToString(encodedWholeTitle) {
    //throw Error("todo"); return {};
    return '';
}

/**
 * Preferred for encoding. Somewhat redundant to {@linkcode encodeWholeTitle} combined/piped to
 * {@linkcode joinWholeEncodedTitleToString}. Faster and with less memory consumption.
 * Redundancy is also good so that tests can help prevent human mistakes.
 * @param {DecodedWholeTitle} decodedWholeTitle
 * @returns {string}
 */
export function encodeWholeTitleToString(decodedWholeTitle) {
    //throw Error("todo"); return {};
    return '';
}
