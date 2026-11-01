// Widget "Parole coreane" per l'app Scriptable (iPhone)
// 1) Cambia URL_SITO con l'indirizzo della tua web app (con la "/" finale)
// 2) Aggiungi un widget Scriptable GRANDE alla Home e scegli questo script

const URL_SITO = "https://fcarta-bot.github.io/appStudioCoreano/";

// ===== Logica (identica a sito/app.js) =====
const GIORNI_PER_BLOCCO = 500;

function mulberry32(seme) {
  return function () {
    seme |= 0; seme = (seme + 0x6D2B79F5) | 0;
    let t = Math.imul(seme ^ (seme >>> 15), 1 | seme);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ordineMescolato(n, seme) {
  const caso = mulberry32(seme);
  const ordine = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(caso() * (i + 1));
    [ordine[i], ordine[j]] = [ordine[j], ordine[i]];
  }
  return ordine;
}

function giornoNumero(inizio, data) {
  const [a, m, g] = inizio.split("-").map(Number);
  const d0 = new Date(a, m - 1, g);
  const d1 = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  return Math.max(0, Math.round((d1 - d0) / 86400000));
}

function paroleDelGiorno(indice, data) {
  const giorno = giornoNumero(indice.inizio, data);
  const totaleGiorni = indice.blocchi * GIORNI_PER_BLOCCO;
  const g = giorno % totaleGiorni;
  const blocco = Math.floor(g / GIORNI_PER_BLOCCO) + 1;
  const pos = g % GIORNI_PER_BLOCCO;
  const ordine = ordineMescolato(1000, blocco);
  return { blocco, indici: [ordine[pos * 2], ordine[pos * 2 + 1]] };
}

// ===== Scarica i dati (e li salva per quando non c'è internet) =====
const fm = FileManager.local();
const cartella = fm.joinPath(fm.documentsDirectory(), "parole-coreane");
if (!fm.fileExists(cartella)) fm.createDirectory(cartella);

async function caricaJSON(nomeFile) {
  const percorso = fm.joinPath(cartella, nomeFile.replace("/", "_"));
  try {
    const dati = await new Request(URL_SITO + nomeFile).loadJSON();
    fm.writeString(percorso, JSON.stringify(dati));
    return dati;
  } catch (e) {
    if (fm.fileExists(percorso)) return JSON.parse(fm.readString(percorso));
    throw e;
  }
}

// ===== Costruisce il widget =====
async function creaWidget() {
  const w = new ListWidget();
  const sfondo = new LinearGradient();
  sfondo.colors = [new Color("#ffe3ea"), new Color("#fdf6f0")];
  sfondo.locations = [0, 1];
  w.backgroundGradient = sfondo;
  w.setPadding(20, 20, 20, 20);
  w.url = URL_SITO;

  // si aggiorna all'inizio dell'ora successiva (iOS può ritardare un po')
  const prossimaOra = new Date();
  prossimaOra.setHours(prossimaOra.getHours() + 1, 0, 5, 0);
  w.refreshAfterDate = prossimaOra;

  try {
    const indice = await caricaJSON("parole/indice.json");
    const oggi = new Date();
    const { blocco, indici } = paroleDelGiorno(indice, oggi);
    const nome = "parole/blocco-" + String(blocco).padStart(2, "0") + ".json";
    const parole = await caricaJSON(nome);
    const quale = oggi.getHours() % 2; // ore pari: prima parola, dispari: seconda
    const p = parole[indici[quale]];

    const titolo = w.addText("오늘의 단어 ♥  " + (quale + 1) + "/2");
    titolo.font = Font.semiboldSystemFont(14);
    titolo.textColor = new Color("#e0607e");

    w.addSpacer();

    const ko = w.addText(p.ko);
    ko.font = Font.boldSystemFont(64);
    ko.textColor = new Color("#2b2a33");
    ko.centerAlignText();
    ko.minimumScaleFactor = 0.5;
    ko.lineLimit = 1;

    w.addSpacer(8);

    const rom = w.addText(p.rom);
    rom.font = Font.italicSystemFont(24);
    rom.textColor = new Color("#e0607e");
    rom.centerAlignText();

    w.addSpacer(14);

    // parole con più significati: "..." al posto della traduzione
    const it = w.addText(p.multi ? "..." : p.it);
    it.font = Font.mediumSystemFont(26);
    it.textColor = new Color("#2b2a33");
    it.centerAlignText();
    it.minimumScaleFactor = 0.6;

    w.addSpacer();

    const piede = w.addText("Tocca per aprire l'app");
    piede.font = Font.systemFont(11);
    piede.textColor = new Color("#8a8796");
    piede.centerAlignText();
  } catch (e) {
    const err = w.addText("Non riesco a caricare le parole. Controlla l'indirizzo URL_SITO.");
    err.font = Font.systemFont(14);
    err.textColor = Color.red();
  }
  return w;
}

const widget = await creaWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentLarge(); // anteprima quando lo avvii dall'app
}
Script.complete();
