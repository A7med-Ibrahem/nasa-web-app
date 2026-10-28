# Integration notes

## Verified differences between backend docs and live server
- /judging/criteria can be called unscoped (GET /judging/criteria) returning all criteria; scoped GET /judging/criteria?challengeId=... may return [] depending on data. Criteria with challengeId null are GLOBAL (apply to every challenge). Criteria with a challengeId apply only to that challenge.
- PUT /judging/criteria/{id} replaces criterion and rebuilds questions; sending questions regenerates their ids. PUT without questions omits the list (server behavior observed). For scored criteria, replacing/removing questions can cause 500/update conflicts.
- Questions are soft-deleted (DELETE hides from lists; not restorable via admin UI). Soft-deleted questions are not visible in admin lists.
- Images: accept plain base64/data URI/http(s)/null; null or "" clears. On PATCH/PUT image fields, omitted/null clears stored image. Errors: image.invalid_type, image.invalid_base64, image.too_large. Max 20 MB decoded; MIME png,jpeg,jpg,webp,gif,svg+xml. SVG <=200KB, GIF <=1MB (client-side). Rasters resized client-side (default 512; season media 1280, team logos 512).
- Season media: GET /seasonmedia?includeInactive=true|false -> [{mediaId, season, title, description, image, link, mediaType, displayOrder, active}]. CRUD via POST/PUT/DELETE /seasonmedia.
- Challenges: only PATCH /challenges/{challengeId}/image supported (no create/edit/delete of challenge text).
- Teams: only PATCH /teams/{teamId}/logo supported (no create/edit/delete). Staff token reveals username in team lists/details as returned.
- Staff errors: staff.username_taken, staff.email_taken, staff.weak_password, staff.member_type_required, staff.invalid_member_type, staff.invalid_role.
- Sponsors/tiers: reads public; admin uses includeInactive=true.
- Requests: statuses observed Pending/In progress/Resolved. Messages may contain [test] (flagged in audits).
- Attendance: /attendance/teams returns teamName and status values observed (e.g. "In progress" casing). /hubs/requests JoinOrganizers missing and no events delivered in observed sessions.
- Auth errors: 401/403 may have empty body. Error envelope may be wrapped in array or use {error:{code,message}} or ProblemDetails.
- Publishing affects live standings immediately.

## Known backend issues to ask the backend owner about
- Criteria scoping inconsistency between scoped and unscoped endpoints
- PUT criteria with questions regenerating ids and potential 500 on scored criteria
- Image validation edge cases (some challenge images may have invalid base64)
- Soft-deleted questions not recoverable/listable
- Attendance hub behavior (/hubs/requests)
- 401/403 responses sometimes empty

## Code conventions
- API modules in src/api/ and src/api/admin/ use request() from src/api/client.js
- useApiResource for simple resource fetches with stale-response protection
- Copy/strings in src/data/* modules; no inline strings in components where shared copy exists
- Admin shared components: AdminPageHeader, ResourceTable, FormDialog, ConfirmDialog, Fields, ImageField, InlineNotice, StatusPill
- Lazy routes for role-gated areas; public pages eager
- Errors normalized via codeKey/statusCode/loadMessage
- Images via toImageSrc; no dangerouslySetInnerHTML

## Route table by role
Public: /, /challenges, /challenges/:id, /teams, /teams/:id, /sponsors, /season-media, /leaderboard/game, /live-standings, /login
Judge (auth): /judge, /judge/teams/:teamId/evaluate
Participant (auth): /participant, /participant/dashboard, /participant/game, /participant/requests
Staff (auth): /staff, /staff/requests, /staff/attendance, /staff/attendance/check-in (CoreTeam), /staff/teams
Admin (auth): /admin (Overview), /admin/staff, /admin/sponsors, /admin/criteria, /admin/criteria/publish, /admin/questions, /admin/season-media, /admin/challenges, /admin/teams

## Dev seed account names only (no passwords)
admin, coreteam, judge, judge2, judge2b, judge2c, judge2d, omar.dev, sara.mentor, admin2

## Test policy rules
- Use zz-test prefix for any test records (season media, etc.)
- No attendance writes
- Never leave anything published
- Never write credentials/tokens to files
- Only live writes allowed on zz-test records or explicitly permitted tests (Atlas team logo test only as specified)
- Delete all zz-test records created with GET proof
- No writes to pre-existing staff/sponsors/tiers/criteria/questions/season media/teams/challenges except permitted
