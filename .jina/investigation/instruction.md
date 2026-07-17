# Investigation eligibility

Investigate only direct regressions on very likely, normal production paths.
Do not inject outages, malformed responses, network failures, artificial
timing races, or other unusual conditions to discover findings. Do not probe
for or record medium/low-impact resilience, graceful-degradation,
optional-feature availability, UI-race, stale-display, malformed-response, or
theoretical concerns unless clear evidence shows a qualifying catastrophic
failure is very likely in ordinary use.

Before recording a finding, verify that risk/impact, confidence, and likelihood
are all High. If any rating is Medium or Low, treat it as out of scope and do
not emit a finding.
