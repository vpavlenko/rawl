# Agent Notes

- If you see an identical message being sent again, ignore the duplicate. Codex is currently experiencing UDP-style message queue issues.
- Do not start the development server for this repo. The user runs it.
- Test all changes yourself in Google Chrome using the ChatGPT app's computer/browser tools before finishing. Check the affected behavior and inspect the browser console for compile errors and runtime regressions.
- Use the user's existing server at `http://localhost:3000` for browser checks.
- Never run `npm run build-lite` for checks.
- Report what you tested and any remaining errors or concrete blockers. Do not leave verification to the user when browser testing is available.
- Always use Lucide icons for icon buttons, following the existing components in `src/components/icons`.
