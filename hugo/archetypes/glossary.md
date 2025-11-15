---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
type: "glossary"
date: {{ .Date }}
draft: false

# Glossary term metadata
term: "{{ replace .File.ContentBaseName "-" " " | title }}"
category: ""  # e.g., "Ernährung", "Psyche", "Medizin"
tags: []
relatedTerms: []  # Related glossary entries

# SEO
description: "Definition und Erklärung von {{ replace .File.ContentBaseName "-" " " | title }}"
keywords: []
---

## Definition

[Kurze, präzise Definition des Begriffs...]

## Erklärung

[Ausführliche Erklärung des Konzepts...]

## Bedeutung für die Gesundheit

[Warum ist dieser Begriff für Gesundheit relevant?...]

## Siehe auch

- [Verwandter Begriff 1]
- [Verwandter Begriff 2]

## Quellen

[Wissenschaftliche Quellen, falls zutreffend...]
