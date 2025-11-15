---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true
author: "kai-renner"
description: ""
keywords: []
categories: []
tags: []
featured: false

# Custom parameters
params:
  group: "basic"  # Options: basic, pro
  heroImage: ""
  heroImageAlt: ""
  references: []
---

## Einleitung

[Einführung in das Thema...]

## Hauptinhalt

[Hauptinhalt...]

## Fazit

[Zusammenfassung...]

---

<!-- Verwendung von Shortcodes:

Bild einfügen:
{{< image src="images/beispiel.jpg" alt="Beschreibung" position="center" >}}

Hervorgehobene Liste:
{{< featured-list >}}
- Punkt 1
- Punkt 2
- Punkt 3
{{< /featured-list >}}

Therapeuten Tipp (Blockquote):
{{< blockquote author="Therapeut Name" >}}
Wichtiger Tipp oder Zitat...
{{< /blockquote >}}

Accordion (Aufklappbarer Bereich):
{{< accordion title="Weitere Informationen" >}}
Zusätzliche Details, die eingeklappt werden können...
{{< /accordion >}}

-->
