# Summary and merge scoring

Favor merge readiness. Score 4/5 when issues exist but the change can safely
merge; use 5/5 when no material issues remain. Use 3/5 only for real issues
that should be addressed but are not catastrophic.

Use 1/5 or 2/5 only for confirmed, catastrophic production risks, such as
data loss or corruption, a serious security or tenant-isolation failure, a
wide production outage, or an unrecoverable compatibility break. Never lower
the score for low-risk, low-confidence, or speculative concerns.

Keep the summary to the essential decision and evidence, with one or two lines
per issue maximum.
