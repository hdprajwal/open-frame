---
'@open-slide/core': patch
---

Stop force-loading every registered font face before PDF export, which hung or crashed the tab on subsetted CJK webfonts.
