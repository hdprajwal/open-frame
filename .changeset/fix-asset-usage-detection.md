---
"@open-slide/core": patch
---

Stop marking imported assets as unused when they are passed as props to wrapper components (e.g. `<DiagramImage src={img} />`) instead of consumed directly by `<img src={img}>`.
