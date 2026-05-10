## Goal

Trim the sidebar's "More" section from 13 items to 7 by moving 6 rarely-used pages out of nav. Everything stays reachable via Cmd+K and direct URL — nothing is deleted.

## What gets hidden from sidebar

| Item | Still reachable via |
|---|---|
| Webhooks | Cmd+K, /webhooks URL, future Settings → Integrations link |
| Team | Cmd+K, /team URL, future Settings → Team link |
| Goals | Cmd+K, /goals URL |
| Suppressions | Cmd+K, /suppressions URL |
| Library | Cmd+K, /library URL (operators open it from inside the campaign editor) |
| Visitors | Cmd+K, /visitors URL |

Salesflows + AI Copilot **stay** in More (flagship features — discoverability matters).

## Resulting sidebar

```text
PRIMARY (always visible)
  Dashboard · Inbox · Campaigns · Leads · Mailboxes · Analytics

MORE ▾ (collapsed by default)
  Outbound:        Subsequences · Salesflows · AI Copilot · Reply Agent
  Pipeline:        Pipeline · Meetings
  Infrastructure:  Warmup

FOOTER
  Settings · (Admin if applicable) · user chip
```

## Implementation

**File:** `src/components/AppShell.tsx` only.

1. In the `moreGroups` array, remove these entries:
   - Outbound group: nothing removed
   - Pipeline group: remove `Visitors`
   - Infrastructure group: remove `Suppressions` and `Library`
   - Account group: remove entirely (Team, Goals, Webhooks all hidden) — drop the whole group object
2. The Cmd+K command palette is built from the same `moreGroups` array, so removed items also disappear from the palette under their old headings. Add a new `CommandGroup heading="More"` block that lists the 6 hidden routes (Webhooks, Team, Goals, Suppressions, Library, Visitors) so they remain discoverable via search.
3. `allItems` derives from `primary` + `moreGroups` and is used for the breadcrumb label resolution. Add the 6 hidden routes to a separate `hiddenItems` array and include them in `allItems` so the top-bar breadcrumb still shows the right page name when the user lands on those routes via URL or Cmd+K.

## Out of scope

- No Settings page restructuring (no new tabs added). The 6 hidden routes still live at their existing URLs.
- No changes to routes, data, or any other file.
- No removal of features.
