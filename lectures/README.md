# Přednášky

Přednášky jsou HTML prezentace s živými animacemi a interaktivními prvky.
Každá je zhruba na 90 minut a otevírá se přímo v prohlížeči (Chrome nebo
Edge), bez instalace a bez serveru. PDF se z HTML generuje skriptem, takže se
upravuje jen HTML.

Slidy jsou anglicky. Každá přednáška je rozdělená do částí; název části je
pod nadpisem každého slidu a každou část uzavírá kontrolní otázka.

## Pořadí v kurzu

| # | složka | téma |
| --- | --- | --- |
| 1 | `01-cnn-foundations` | konvoluce krok za krokem, tvary tensorů, trénování, data a diagnostika |
| 2 | `02-cnn-architectures` | backbone, neck, head; klasifikace, detekce, segmentace, attention |
| — | *(blok konvenčních metod)* | modely kamer, geometrie více pohledů, konvenční VSLAM |
| 3 | `03-neural-3d-reconstruction` | reprezentace 3D, naučená hloubka, NeRF, 3D Gaussian Splatting, dynamické scény |

Přednáška 3 je bonusová a přednáší se až na konci kurzu, po bloku
konvenčních metod (kalibrace, epipolární geometrie, triangulace, bundle
adjustment, VSLAM), který předpokládá jako známý. Staví hlavně na obrázcích a
na otázce *proč* se metody používají. Slidy s detaily mechanismu mají oranžový
štítek **optional detail** a dají se přeskočit.

## Spuštění a ovládání

Otevřete `<přednáška>/web/index.html` a stiskněte **F** pro celou obrazovku.

| klávesa | akce |
| --- | --- |
| → · mezerník · PageDown · klik | další krok (pak další slide) |
| ← · PageUp | předchozí krok |
| Shift + → / ← | další / předchozí slide bez kroků |
| O | přehled všech slidů |
| R | restart animace slidu |
| číslo + Enter | skok na slide |
| H | nápověda |

Prezentační klikátka posílají PageDown/PageUp, takže fungují bez nastavení.
Adresa (`#/14/3`) si pamatuje slide a krok.

## PDF

Ze složky `lectures/`:

    python shared/export_pdf.py all                      # všechny přednášky
    python shared/export_pdf.py 02-cnn-architectures     # jedna přednáška

Výsledek je `<přednáška>/<přednáška>.pdf`, jedna strana 16:9 na slide, každý
slide v konečném stavu všech kroků. Stačí Python a nainstalovaný Chrome nebo
Edge (případně proměnná `CHROME` s cestou k prohlížeči). Pokud je
nainstalovaný `pikepdf` (`pip install pikepdf`), PDF se navíc bezztrátově
přebalí a je o 10–25 % menší (pixelově shodné). Po každé úpravě HTML stačí
příkaz spustit znovu.

## Struktura

    lectures/
    ├── shared/                  společný engine všech přednášek
    │   ├── deck.js              slidy, kroky, ovládání, tisk, SVG nástroje
    │   ├── kit.js               diagramy, kvádry, posuvníky, grafy, tabulky
    │   ├── deck.css             vzhled a pravidla pro tisk
    │   ├── export_pdf.py        export do PDF přes headless Chrome/Edge
    │   └── logo-cvut-en.svg
    ├── 01-cnn-foundations/
    │   ├── web/                 index.html, viz*.js, README
    │   ├── assets/              obrázky použité ve slidech
    │   └── 01-cnn-foundations.pdf
    ├── 02-cnn-architectures/    (stejná struktura)
    └── 03-neural-3d-reconstruction/
        └── assets/generate/     skripty, které vyrábějí obrázky přednášky 3

Úprava v `shared/` se projeví ve všech přednáškách. Postup přidání slidu nebo
animace popisuje `01-cnn-foundations/web/README.md`.
