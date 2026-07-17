# Repository review policy

Keep reviews high-signal and strongly biased toward allowing safe merges.

Report an issue only when clear evidence supports High risk/impact, High
confidence, and High production likelihood. This exceeds the minimum
two-high threshold. Never report an issue if any of those ratings is Medium
or Low; do not reinterpret a Medium concern as High to make it eligible.

Assess likelihood from the normal, intended production path—not from injected
outages, malformed responses, network failures, rapid timing races, or other
unusual conditions. If a failure is not very likely during ordinary use, do
not investigate it as a finding and do not report it.

Do not report low-risk, low-confidence, speculative, stylistic, naming,
formatting, minor maintainability, theoretical, or bounded feature/UI issues.
Eligible issues normally involve data loss or corruption, a security or
tenant-isolation failure, a broad production outage, or an unrecoverable
backwards-compatibility break.

Report only issues directly introduced by the pull request. A finding must be
absent on the base branch and caused by the changed code or its direct
interaction with an existing dependency. Never investigate or report a
pre-existing issue, an unrelated repository concern, or a potential issue
outside the pull request's changed behavior.

Be extremely concise: each issue description must be one or two lines maximum.
State the concrete impact and the evidence; omit background, advice, and
speculation.

For a follow-up review after previously reported issues, review only the new
commit's changes as they relate to those reported issues. Do not introduce,
investigate, or report any newly discovered potential issues outside that
follow-up scope.
