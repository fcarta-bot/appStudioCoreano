# Coreano – parole del giorno

Web app + widget per iPhone. Ogni giorno escono 2 parole coreane (prese dalle
più frequenti, mescolate a blocchi da 1.000). Nelle ore pari il widget mostra
la prima parola, nelle ore dispari la seconda. Le parole con più significati
mostrano "..." nel widget; nella web app la traduzione completa è sempre visibile.

La web app è un "libro": una pagina per giorno a schermo intero. La prima è oggi;
trascinando verso l'alto si va al giorno prima, fino al primo giorno.

## Contenuto

- `sito/` → la web app da pubblicare
  - `index.html`, `app.js` → la pagina
  - `parole/blocco-01.json` → le prime 1.000 parole (coreano, romanizzazione, italiano)
  - `parole/indice.json` → data di inizio e numero di blocchi disponibili
- `widget-scriptable.js` → lo script da incollare in Scriptable (si incolla una volta sola)
- `widget/codice.js` → il codice vero del widget: lo script lo scarica da qui ogni volta, quindi gli aggiornamenti arrivano da soli
- `tools/` → gli script Python usati per creare i blocchi (servono solo a te)

## 1. Pubblicare la web app (gratis, con GitHub Pages)

1. Crea un account su github.com (se non ce l'hai).
2. Crea un nuovo repository pubblico chiamato `coreano`.
3. Clicca "uploading an existing file" e carica **il contenuto** della cartella
   `sito/` (index.html, app.js, manifest.json, le icone e la cartella `parole`).
4. Vai su Settings → Pages → Source: "Deploy from a branch", branch `main`,
   cartella `/ (root)` → Save.
5. Dopo un paio di minuti il sito sarà su
   `https://fcarta-bot.github.io/appStudioCoreano/`

## 2. Installare la web app sull'iPhone di lei

Apri l'indirizzo in Safari → tasto Condividi → "Aggiungi alla schermata Home".
Comparirà un'icona come un'app vera.

## 3. Il widget

1. Installa **Scriptable** dall'App Store (gratis).
2. Apri Scriptable → "+" → incolla tutto `widget-scriptable.js`.
3. Nella riga `const URL_SITO = ...` metti l'indirizzo del sito (con la `/` finale).
4. Premi ▶︎ per vedere l'anteprima.
5. Sulla Home: tieni premuto → "+" → Scriptable → formato **grande** →
   tieni premuto il widget → Modifica widget → Script: scegli questo.

Nota: è iOS a decidere quando aggiornare i widget. Lo script chiede
l'aggiornamento allo scoccare di ogni ora, ma può arrivare qualche minuto dopo.

## Cambiare la data di inizio

In `sito/parole/indice.json` modifica `"inizio"` (formato AAAA-MM-GG).

## Aggiungere un nuovo blocco da 1.000 parole

1. Metti il file `blocco-02.json` nella cartella `parole/`.
2. In `indice.json` porta `"blocchi"` a 2.
   Il blocco 1 dura 500 giorni; poi si passa automaticamente al blocco 2.

## Crediti

Lista di frequenza: Shiberu Korean Word Frequency List 2026 by Shiberu
(https://shiberu.app/korean-frequency-list), licenza CC BY 4.0.
Romanizzazione calcolata in automatico (Revised Romanization, con le principali
regole di pronuncia); traduzioni italiane fatte da Claude: alcune potrebbero
essere imprecise.
