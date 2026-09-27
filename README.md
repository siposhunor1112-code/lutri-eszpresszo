# Lutri Eszpresszó – weboldal

Statikus, egyoldalas weboldal a békásmegyeri Lutri Eszpresszónak (Lutri Söröző Békásmegyer, 1039 Budapest, Heltai Jenő tér 2.).
Nincs szükség build lépésre: a `public/` mappa bármilyen statikus tárhelyen kiszolgálható (Cloudflare Workers, Netlify, GitHub Pages).

## Fájlok

- `public/` – maga a weboldal (ez kerül ki a netre):
  - `index.html` – az oldal szerkezete, szövegei és az itallap
  - `styles.css` – megjelenés (színek a `:root` változókban)
  - `script.js` – elérhetőség, nyitvatartás, kaparós tippek, fröccsfajták és minden mozgás
  - `manifest.webmanifest`, `sw.js` – telefonra „telepíthető” (Kezdőképernyőhöz adás), és net nélkül is megnyílik
  - `404.html` – „Nincs telitalálat” oldal a nem létező címekhez
  - `_headers` – biztonsági és gyorsítótár-beállítások a Cloudflare-nek
  - `assets/` – ikonok, megosztási kép (`og.jpg`) és betűtípusok
- `wrangler.jsonc` – Cloudflare-beállítás (a `public/` mappát teszi ki, a 404-oldallal együtt)
- `tools/images.js` – újragyártja a megosztási képet és az ikonokat (`node tools/images.js`, Playwright kell hozzá)

## Megjelenés

- Retró pesti presszó, éjszakai neonnal: eszpresszó-fekete háttér, krém szöveg, piros neon cégér, réz kiemelések,
  az itallap krémszínű „papíron” – `public/styles.css`, `:root`
- Három betűtípus saját tárhelyről (SIL Open Font License, `public/assets/fonts/`): Yellowtail (a neon „Lutri” felirat),
  Fraunces (címek) és Manrope (szöveg)
- Nincs szükség fotóra: a csésze, a pohár, a napernyő és a tévé kódból rajzolt kép (SVG)

## Szekciók

- **Nyitókép**: neon cégér, ami betöltéskor pislogva „felgyullad” (kattintásra le- és felkapcsolható), napszak szerinti köszönés,
  élő nyitva/zárva jelzés és az aktuális időjárás
- **01 A hely**: bemutatkozás, gőzölgő csésze, három erősség (kávé reggel héttől, nagy terasz, meccs több képernyőn)
- **02 Egy nap a Lutriban**: idővonal 7-től 23 óráig – a „Most” pont élőben mutatja, hol tart a nap
- **03 Itallap**: kávé, sör, bor & fröccs, rövidek, üdítők. Kinyomtatva csak az itallap jelenik meg
- **04 Fröccsiskola**: kilenc fröccsfajta; kattintásra megtelik a pohár a megfelelő arányban (fehér, rozé vagy vörös borral)
- **05 Lutri – kaparós sorsjegy**: ujjal vagy egérrel lekaparható, napszaknak (és kánikulának) megfelelő italtippet rejt.
  Csak játék, nem nyereményjáték – az oldal ezt ki is írja
- **06 Terasz & meccs**: élő időjárás Békásmegyerről ([Open-Meteo](https://open-meteo.com/), kulcs nélkül) és egy
  „teraszidő-e?” ítélet, mellette a sportközvetítések
- **A vendégek szerint**: a Google-értékelések visszatérő témái (családias, kedves kiszolgálás, barátságos árak)
- **07 Hol vagyunk**: cím, nyitvatartás (a mai nap kiemelve), útvonaltervezés Google és Apple Térképpel, megosztás gomb
  (telefonon), térkép kattintásra (addig nem tölt be semmit a Google-tól)
- Telefonon alul mindig ott az **Útvonal**, **Itallap** (és ha van telefonszám, **Hívás**) és **Facebook** gomb
- Telefonra optimalizálva (320 px-től), notch-os telefonokon a szélek szabadon maradnak; aki kikapcsolta az animációkat
  (`prefers-reduced-motion`), annak minden mozdulatlan
- Keresőknek: leírás, megosztási kép (Facebookon, Messengerben szép előnézet), és strukturált adat (`BarOrPub`) a nyitvatartással

## Tartalom szerkesztése

- `public/script.js` eleje:
  - `SHOP.phone` – ha megvan a telefonszám, ide kell beírni (pl. `"+36 30 123 4567"`); amíg `null`, a hívás gombok nem látszanak
  - `SHOP.facebook` – a Facebook-oldal címe
  - `SHOP.hours` – napokra bontott nyitvatartás; ebből számolja az oldal budapesti idő szerint, hogy most nyitva van-e,
    és ebből dolgozik az idővonal is
  - `TIPS` – a kaparós sorsjegy tippjei napszakonként (`morning`, `afternoon`, `evening`, és `hot` kánikulára)
  - `SPRITZ` – a Fröccsiskola fajtái (bor és szóda decilitterben)
- Itallap: `public/index.html`, `<section id="itallap">`. Egy tétel:
  `<li><span class="item">Név</span><i></i><b class="price"></b><em>rövid leírás</em></li>`.
  **Ár megadása**: a `<b class="price"></b>` közé kell írni, pl. `<b class="price">450 Ft</b>` – ilyenkor pontozott vonal vezet
  a névtől az árig. Üresen hagyva az ár nem jelenik meg
- Ha a nyitvatartás változik, a `public/index.html`-ben is írd át (a `#hours` lista, a lábléc és a `application/ld+json` rész)
  – ez a JavaScript nélküli változat és a keresők miatt kell
- Nagyobb módosítás után a `public/sw.js` elején a `VERSION` értékét érdemes eggyel növelni (`lutri-v2`), hogy a telefonra
  telepített változat is biztosan frissüljön

## Honnan jöttek az adatok (élesítés előtt egyeztesd a hellyel!)

Nyilvános forrásokból (Facebook-oldal, Google-adatlap és értékelések, Turul Gasztronómia, kocsmatour.hu, Heineken
„csapolt üzletlista”):

- Cím: 1039 Budapest, Heltai Jenő tér 2., a békásmegyeri piaccal szemben
- Nyitvatartás: hétfőtől szombatig 7:00–23:00, vasárnap 9:00–23:00
- Kicsi belső tér kétszemélyes asztalokkal, nagy terasz hatalmas napernyőkkel, sportközvetítés több képernyőn, csapolt Kronenbourg
- **Telefonszám nem volt elérhető** – `SHOP.phone`
- **Az itallap tételei általános presszó-kínálat** (csak a csapolt Kronenbourg biztos), **árak nincsenek megadva** – kérlek, nézd át
- Van egy másik, újpesti „Lutri Presszó” is (1041 Budapest, Závodszky Zoltán u. 3.); ez az oldal a békásmegyeri helyről szól

## Saját fotók

Ha vannak fotók a helyről (terasz, pult, meccsnézés), tedd őket a `public/assets/` mappába, és beépíthetők a nyitóképbe
vagy a „A hely” szekcióba.

## Helyi megtekintés

```sh
python3 -m http.server 8000 -d public
# majd: http://localhost:8000
```
