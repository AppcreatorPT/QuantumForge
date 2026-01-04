# Lessons Learned (Auto-Improvement Log)
This file contains specific error patterns and their fixes, learned from user feedback.
Consult this file BEFORE generating code to avoid repeating known mistakes.

## 1. Type Mismatch in Sessions
**Error:** `Cannot assign a value of the "series int" type to the "inSession" variable.`
**Cause:** Using `time()` directly as a boolean.
**Fix:** Always use `not na(time(...))`.

## 2. String Parsing
**Error:** `Cannot call 'str.format' with argument...`
**Cause:** Trying to manually parse session strings (e.g. substring).
**Fix:** Use native Pine Script session handling.

## 3. Calc on Input
**Error:** `Cannot call 'operator *' with argument 'expr1'='input int'.`
**Cause:** Multiplying an `input.int` by a `close` (float).
**Fix:** Cast input to float: `float(myInput) * close`.

- [2025-12-23] LESSON: Always cast inputs to float before multiplication.
- [2025-12-23] LESSON: Line 10, 12-15 - Undeclared identifier 'close'
- [2025-12-25] LESSON: Sky is Blue
- [2025-12-25] LESSON: Sky is Blue
- [2025-12-25] LESSON: Line 22 - The "ta.dmi" function does not have an argument with the name "length"
- [2025-12-25] LESSON: Line 25 - Cannot call "operator SQBR" with argument "expr0"="call "ta.dmi" ([series float, series float, series float])". An argument of "[series float, series float, series float]" type was used but a "series na" is expected.
- [2025-12-25] LESSON: Line 8 - "timeframe" is not a valid type keyword.
- [2025-12-26] LESSON: Line 23 - Cannot call "operator SQBR" with argument "expr0"="call "ta.dmi" ([series float, series float, series float])". An argument of "[series float, series float, series float]" type was used but a "series na" is expected.
- [2025-12-26] LESSON: Line 23-25 - Cannot call "operator SQBR" with argument "expr0"="call "ta.dmi" ([series float, series float, series float])". An argument of "[series float, series float, series float]" type was used but a "series na" is expected.
- [2025-12-27] LESSON: Line 21-24 - Invalid argument "gaps" in "request.security" call. Possible values: [barmerge.gaps_off, barmerge.gaps_on]