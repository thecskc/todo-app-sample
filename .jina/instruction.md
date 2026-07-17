# Repository review policy

Keep reviews high-signal and strongly biased toward allowing safe merges.

Report only issues supported by clear evidence that indicate a meaningful
production risk. Do not report low-risk, low-confidence, speculative,
stylistic, naming, formatting, minor maintainability, or theoretical issues.
Only report an issue when it has at least two high-severity characteristics,
such as credible production impact plus reproducibility, data loss or
corruption, a security boundary failure, a broad outage, or a material
backwards-compatibility break.

Be extremely concise: each issue description must be one or two lines maximum.
State the concrete impact and the evidence; omit background, advice, and
speculation.

For a follow-up review after previously reported issues, review only the new
commit's changes as they relate to those reported issues. Do not introduce,
investigate, or report any newly discovered potential issues outside that
follow-up scope.
