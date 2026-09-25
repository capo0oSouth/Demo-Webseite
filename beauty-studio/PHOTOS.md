# Fotos – Bildplätze & Anforderungen

Die Website bindet Fotos automatisch ein: Liegt eine Datei `src/assets/photos/<name>.jpg`
(oder `.jpeg`, `.png`, `.webp`, `.avif`) vor, wird sie beim Build als AVIF/WebP in mehreren
Grössen ausgeliefert. Fehlt ein Foto, zeigt die Fläche eine passende Illustration.

**Lizenz:** Nur Bilder mit Lizenz für die kommerzielle Nutzung ohne Namensnennungspflicht
verwenden (z. B. CC0, Unsplash License oder Pexels License). Jedes verwendete Bild mit
Fotograf:in und Quell-URL unten unter «Bildnachweise» eintragen.

**Fachliche Regel:** Ein Bild, das eine konkrete Behandlung zeigt, muss genau diese Behandlung
zeigen, z. B. eine Mandelform bei «Mandel», dichte Fächer bei «Volume» und laminierte, nach oben
gebürstete Härchen bei «Lamination». Bei Zweifeln lieber die Illustration behalten.

**Personen:** Porträts des Teams sollten echte Fotos der Inhaberinnen sein. Stockfotos realer
Personen mit erfundenen Namen, Biografien und Zitaten zu versehen, verletzt deren Recht am
eigenen Bild. Deshalb zeigen diese Flächen bewusst gestaltete Monogramme.

**Dateiformat:** rawpixel liefert Bilder als WebP aus, auch wenn die URL auf `.jpg` endet.
Solche Dateien vor dem Ablegen in echtes JPEG umwandeln, sonst erzeugt Astro grosse
PNG-Fallbacks.

| Datei                                    | Einsatz                          | Format       | Inhalt (Anforderung)                                              | Status                                   |
| ---------------------------------------- | -------------------------------- | ------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| `hero`                                   | Startseite, Hero (Bogen)         | 4 : 5 hoch   | Frisch gestaltete Nägel, hell und feminin                         | Foto: lange Mandelnägel mit French       |
| `category-nails`                         | Startseite, Karte Nails          | ca. 3 : 2    | Gepflegte Hände mit Gel-Nägeln                                    | Foto: Gel-Lack neben LED-Lampe           |
| `category-lashes`                        | Startseite, Karte Lashes         | ca. 3 : 2    | Nahaufnahme Augen mit vollen, geschwungenen Wimpern               | Foto                                     |
| `category-brows`                         | Startseite, Karte Brows          | ca. 3 : 2    | Nahaufnahme gepflegter, gefüllter Augenbrauen                     | Foto                                     |
| `studio-interior`                        | Studio-Seite, Galerie            | quer         | Behandlungsraum im Studio                                         | Foto: Pediküre-Lounge                    |
| `studio-detail`                          | Studio-Galerie                   | quer         | Detail: Nagellack-Fläschchen in Nude-, Rosé- und Beerentönen      | Foto                                     |
| `studio-lounge`                          | Startseite «Warum», Studio-Seite | 4 : 5 / quer | Frische Blumen am Empfang                                         | Foto: Blüten in Glasflaschen             |
| `team-group`                             | Studio-Seite, Hero               | 4 : 5 / quer | Die drei Inhaberinnen zusammen im Studio                          | Illustration – echtes Teamfoto einsetzen |
| `team-noemi`, `team-alessia`, `team-lea` | Team (Start & Studio)            | 4 : 5 hoch   | Porträts der drei Inhaberinnen, einheitliches Licht & Hintergrund | Monogramm – echte Porträts einsetzen     |
| `nails-hero`                             | Nails, Hero                      | 4 : 4.4      | Frisch modellierte Nägel in Mandelform, zartes Nude               | Illustration                             |
| `nails-work`                             | Nails, Handwerk (Bogen)          | hoch         | Maniküre am Arbeitstisch, Fokus auf Hände                         | Foto                                     |
| `nails-result-1`                         | Nails, Galerie                   | ca. 1 : 1    | Kurze Nägel in Kirschrot                                          | Foto                                     |
| `nails-result-2`                         | Nails, Galerie                   | ca. 1 : 1    | French Manicure in Mandelform                                     | Foto (mit Nail-Art-Akzent)               |
| `lashes-hero`                            | Lashes, Hero                     | 4 : 4.4      | Nahaufnahme Auge mit Volume-Wimpern                               | Illustration – kein passendes Foto       |
| `lashes-work`                            | Lashes, Ablauf (Bogen)           | 4 : 5 hoch   | Lash Artist setzt Extensions bei liegender Kundin                 | Illustration – kein passendes Foto       |
| `brows-hero`                             | Brows, Hero                      | 4 : 4.4      | Laminierte, nach oben gebürstete Augenbrauen                      | Illustration – kein passendes Foto       |
| `brows-work`                             | Brows, Brow Mapping              | quer         | Brow Artist vermisst eine Braue (Mapping-Faden oder Stift)        | Illustration – kein passendes Foto       |

## Bildnachweise

Alle eingebundenen Fotos stehen unter
[CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) (gemeinfrei, kommerzielle Nutzung
erlaubt, keine Namensnennung nötig). Gefunden über [Openverse](https://openverse.org); Nennung
hier trotzdem aus Fairness und zur Nachvollziehbarkeit.

| Datei             | Motiv                                     | Fotograf:in       | Quelle                                                                                                           |
| ----------------- | ----------------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `hero`            | Lange Mandelnägel mit French vor Farn     | Manjil Aryal      | [WordPress Photo Directory](https://wordpress.org/photos/photo/7606a14304/)                                      |
| `category-nails`  | Frischer Gel-Lack neben LED-Lampe         | – (rawpixel)      | [rawpixel.com/image/5920395](https://www.rawpixel.com/image/5920395/photo-image-background-public-domain-woman)  |
| `category-lashes` | Augen mit vollen, geschwungenen Wimpern   | Allef Vinicius    | [StockSnap](https://stocksnap.io/photo/people-women-BDYMWCGZV9)                                                  |
| `category-brows`  | Gepflegte, gefüllte Augenbrauen           | Alexandru Zdrobău | [StockSnap](https://stocksnap.io/photo/people-woman-5SLCOVL7HX)                                                  |
| `studio-interior` | Pediküre-Lounge mit zwei Sesseln          | Alina Kakshapati  | [WordPress Photo Directory](https://wordpress.org/photos/photo/27868db7d1/)                                      |
| `studio-detail`   | Nagellack-Fläschchen in einer Reihe       | – (rawpixel)      | [rawpixel.com/image/5906601](https://www.rawpixel.com/image/5906601/photo-image-public-domain-art-pink)          |
| `studio-lounge`   | Hartriegelblüten in alten Glasflaschen    | Kelly Ishmael     | [StockSnap](https://stocksnap.io/photo/flower-decoration-AZ7E91W5XA)                                             |
| `nails-work`      | Roter Nagellack wird am Tisch aufgetragen | – (rawpixel)      | [rawpixel.com/image/5920430](https://www.rawpixel.com/image/5920430/photo-image-background-design-public-domain) |
| `nails-result-1`  | Kurze kirschrote Nägel                    | Giulia Bertelli   | [StockSnap](https://stocksnap.io/photo/hands-chest-6NKXF0MA7N)                                                   |
| `nails-result-2`  | French in Mandelform mit Spitzen-Nail-Art | – (rawpixel)      | [rawpixel.com/image/5947104](https://www.rawpixel.com/image/5947104/free-public-domain-cc0-photo)                |
