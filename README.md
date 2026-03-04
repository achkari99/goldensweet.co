# Cinnamona Refactor Copy (Next.js)

This folder is a side-by-side Next.js runtime copy of the existing project.

## Goals
- Keep public website content unchanged.
- Keep API behavior aligned with the current Express implementation.
- Improve structure by isolating server logic into `src/server`.

## Run
1. `cd refactor`
2. `npm install`
3. `npm run dev`

## Notes
- Existing website files are mirrored in `public/`.
- Existing JSON persistence is mirrored in `data/`.
- Main runtime entry is `server.js` (Next.js + Express custom server).