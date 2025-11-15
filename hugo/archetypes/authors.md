---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
type: "author"
date: {{ .Date }}
draft: false

# Author information
bio: ""
avatar: "/images/authors/{{ .File.ContentBaseName }}.jpg"
email: ""
website: ""

# Social media links (optional)
social:
  twitter: ""
  linkedin: ""
  github: ""
  instagram: ""
  facebook: ""

# Professional info
expertise: []
credentials: []
---

## Über {{ replace .File.ContentBaseName "-" " " | title }}

[Erweiterte Biografie des Autors...]

## Fachgebiete

- [Fachgebiet 1]
- [Fachgebiet 2]
- [Fachgebiet 3]

## Qualifikationen

- [Qualifikation 1]
- [Qualifikation 2]
