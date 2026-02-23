# StackDraw - Isometrisches Diagramm-Werkzeug

[English](../README.md) | [Русский](README.ru.md) | [Deutsch](README.de.md)

StackDraw ist eine leistungsstarke, quelloffene Progressive Web App (PWA) zum Erstellen schöner isometrischer Diagramme. Entwickelt mit React und TypeScript, läuft sie vollständig in Ihrem Browser mit Offline-Unterstützung.

> Fork von [FossFLOW](https://github.com/stan-smith/FossFLOW) von @stan-smith, basierend auf der [Isoflow](https://github.com/markmanx/isoflow)-Bibliothek von @markmanx

## Demo

**Jetzt ausprobieren:** [https://seed-factory.github.io/StackDraw](https://seed-factory.github.io/StackDraw)

> **Empfohlener Browser:** Für das beste Erlebnis empfehlen wir **Google Chrome** oder andere Chromium-basierte Browser (Edge, Brave, Opera). Einige Funktionen wie der Bildexport können in Firefox Kompatibilitätsprobleme aufweisen.

## Funktionen

- Isometrische Diagrammerstellung mit Drag-and-Drop-Oberfläche
- Verbinder mit anpassbaren Beschriftungen und Stilen
- Unterstützung mehrerer Symbolpakete (AWS, GCP, Azure, Kubernetes)
- Export nach PNG, SVG, JSON
- PWA mit Offline-Unterstützung
- Mehrsprachige Benutzeroberfläche (12+ Sprachen)
- Sitzungs- und Serverspeicheroptionen
- Versionshistorie mit Git-Backup (Docker)

## Schnellstart

```bash
# Repository klonen
git clone https://github.com/seed-factory/StackDraw
cd StackDraw

# Abhängigkeiten installieren
npm install

# Bibliothek bauen (beim ersten Mal erforderlich)
npm run build:lib

# Entwicklungsserver starten
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## Docker

```bash
# Mit Docker Compose (empfohlen)
docker compose up

# Oder direkt mit persistentem Speicher ausführen
docker run -p 80:80 -v $(pwd)/diagrams:/data/diagrams stackdraw:latest

# Serverspeicher deaktivieren
docker run -p 80:80 -e ENABLE_SERVER_STORAGE=false stackdraw:latest
```

## Projektstruktur

Monorepo mit drei Paketen:

- `packages/fossflow-lib` - React-Komponentenbibliothek zum Zeichnen von Diagrammen
- `packages/fossflow-app` - Progressive Web App Wrapper
- `packages/fossflow-backend` - Node.js Backend für Serverspeicher

### Befehle

```bash
# Entwicklung
npm run dev          # App-Entwicklungsserver starten
npm run dev:lib      # Watch-Modus für Bibliothek

# Bauen
npm run build        # Bibliothek und App bauen
npm run build:lib    # Nur Bibliothek bauen
npm run build:app    # Nur App bauen

# Testen
npm test             # Unit-Tests ausführen
npm run lint         # Linting
```

## Verwendung

### Diagramme erstellen

1. **Elemente hinzufügen**: Drücken Sie die "+"-Taste, ziehen Sie Komponenten aus der Bibliothek auf die Leinwand
2. **Elemente verbinden**: Wählen Sie das Verbindungswerkzeug (C), klicken Sie auf Knoten zum Verbinden
3. **Speichern**: Schnellspeichern in Sitzung oder als JSON exportieren

### Speicheroptionen

- **Sitzungsspeicher**: Temporär, wird beim Schließen des Browsers gelöscht
- **Export/Import**: Permanente JSON-Dateien
- **Serverspeicher**: Persistent mit Versionshistorie (Docker)

## Roadmap

Siehe [STACKDRAW_TODO.md](../STACKDRAW_TODO.md) für geplante Funktionen:

- Verbesserte Animationen
- Benutzerdefiniertes Symbolpaket
- GIF/WebM-Export

## Beitragen

Beiträge sind willkommen. Siehe [CONTRIBUTING.md](../CONTRIBUTING.md) für Richtlinien.

## Lizenz

MIT
