# Google scripts

this repo is where I'll keep some scripts that are useful to me, and hopefully others can benefit from them too.

1.`fill-time-report.gs` - auto-fill dev-pro time report for last day. It fill report at 12 a.m (or 15min later) and send sotification via email. For install this script we need:
- copy it to script to your google doc time report
- change `jiraDocumentId` to doc id report exporter from jira
- change `name` to you name, that imported from jira
- run `makeTriggrt` function to crate trigger for fill report every day

License
----
MIT

**Free Software, Yeah!**
