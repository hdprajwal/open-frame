---
"@open-frame/core": patch
---

Serve the bundled Rubik and JetBrains Mono webfonts in dev — they were blocked by Vite's file-serving allow list, so the UI silently fell back to the system sans.
