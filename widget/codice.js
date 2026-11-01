// Codice del widget "Parole coreane" (scaricato in automatico dallo script in Scriptable).
// Si adatta alla dimensione scelta: Home (piccolo/medio/grande) o schermata di blocco.

module.exports = async function creaWidget(URL_SITO, parametro) {

  // ===== LOGICA CONDIVISA (identica a app.js) =====
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
  
  // numero di giorni passati dalla data di inizio (ora locale del telefono)
  function giornoNumero(inizio, data) {
    const [a, m, g] = inizio.split("-").map(Number);
    const d0 = new Date(a, m - 1, g);
    const d1 = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    return Math.max(0, Math.round((d1 - d0) / 86400000));
  }
  
  // filtro scritto come testo, per esempio "cibo, emozioni, 18+"
  function leggiFiltro(testo) {
    const parti = String(testo || "").toLowerCase().split(/[,;]+/).map(s => s.trim()).filter(Boolean);
    return { adulti: parti.includes("18+"), cat: parti.filter(s => s !== "18+") };
  }
  
  function ammessa(p, filtro) {
    if (p.adulti && !filtro.adulti) return false;
    return filtro.cat.length === 0 || filtro.cat.includes(p.cat);
  }
  
  // tutte le parole ammesse, blocco dopo blocco, ognuno mescolato a modo suo
  function creaPool(blocchi, filtro) {
    const pool = [];
    blocchi.forEach((parole, b) => {
      for (const i of ordineMescolato(parole.length, b + 1)) {
        if (ammessa(parole[i], filtro)) pool.push(parole[i]);
      }
    });
    if (pool.length < 2) return creaPool(blocchi, { adulti: filtro.adulti, cat: [] });
    return pool;
  }
  
  // le due parole di una certa data
  function paroleDelGiorno(indice, data, pool) {
    const coppie = Math.floor(pool.length / 2);
    const k = giornoNumero(indice.inizio, data) % coppie; // finite le parole, ricomincia
    return [pool[2 * k], pool[2 * k + 1]];
  }
  // ===== FINE LOGICA CONDIVISA =====

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

  const famiglia = config.widgetFamily || "large";
  const w = new ListWidget();
  w.url = URL_SITO;
  const prossimaOra = new Date();
  prossimaOra.setHours(prossimaOra.getHours() + 1, 0, 5, 0);
  w.refreshAfterDate = prossimaOra; // iOS può ritardare un po'

  let p, quale;
  try {
    const indice = await caricaJSON("parole/indice.json");
    const blocchi = [];
    for (let n = 1; n <= indice.blocchi; n++) {
      blocchi.push(await caricaJSON("parole/blocco-" + String(n).padStart(2, "0") + ".json"));
    }
    // il campo "Parameter" del widget, per esempio "cibo, emozioni, 18+"
    const pool = creaPool(blocchi, leggiFiltro(parametro));
    const oggi = new Date();
    const coppia = paroleDelGiorno(indice, oggi, pool);
    quale = oggi.getHours() % 2; // ore pari: prima parola, dispari: seconda
    p = coppia[quale];
  } catch (e) {
    const err = w.addText(famiglia.startsWith("accessory") ? "Errore" :
      "Non riesco a caricare le parole. Controlla la connessione.");
    err.font = Font.systemFont(13);
    return w;
  }
  const traduzione = p.multi ? "..." : p.it;

  // ===== Schermata di blocco: iOS usa solo testo bianco/trasparente =====
  if (famiglia === "accessoryInline") {
    w.addText(p.ko + " · " + p.rom);
    return w;
  }
  if (famiglia === "accessoryCircular") {
    w.addAccessoryWidgetBackground = true; // fondo sfocato: si legge anche su sfondi chiari
    const ko = w.addText(p.ko);
    ko.font = Font.heavySystemFont(20);
    ko.centerAlignText();
    ko.minimumScaleFactor = 0.4;
    ko.lineLimit = 1;
    return w;
  }
  if (famiglia === "accessoryRectangular") {
    w.addAccessoryWidgetBackground = true; // fondo sfocato: si legge anche su sfondi chiari
    w.setPadding(4, 8, 4, 8);
    const riga = w.addStack();
    riga.centerAlignContent();
    const ko = riga.addText(p.ko);
    ko.font = Font.heavySystemFont(22);
    ko.minimumScaleFactor = 0.5;
    ko.lineLimit = 1;
    riga.addSpacer(6);
    const rom = riga.addText(p.rom);
    rom.font = Font.semiboldSystemFont(13);
    rom.minimumScaleFactor = 0.6;
    rom.lineLimit = 1;
    const it = w.addText(traduzione);
    it.font = Font.boldSystemFont(15);
    it.minimumScaleFactor = 0.6;
    it.lineLimit = 2;
    return w;
  }

  // ===== Schermata Home =====
  const grande = famiglia === "large" || famiglia === "extraLarge";
  const medio = famiglia === "medium";
  const sfondo = new LinearGradient();
  sfondo.colors = [new Color("#ffe3ea"), new Color("#fdf6f0")];
  sfondo.locations = [0, 1];
  w.backgroundGradient = sfondo;
  w.setPadding(grande ? 20 : 12, 14, grande ? 20 : 12, 14);

  const titolo = w.addText("오늘의 단어 ♥  " + (quale + 1) + "/2");
  titolo.font = Font.semiboldSystemFont(grande ? 14 : 11);
  titolo.textColor = new Color("#e0607e");
  w.addSpacer();

  const ko = w.addText(p.ko);
  ko.font = Font.boldSystemFont(grande ? 64 : medio ? 40 : 32);
  ko.textColor = new Color("#2b2a33");
  ko.centerAlignText();
  ko.minimumScaleFactor = 0.4;
  ko.lineLimit = 1;
  w.addSpacer(grande ? 8 : 2);

  const rom = w.addText(p.rom);
  rom.font = Font.italicSystemFont(grande ? 24 : 15);
  rom.textColor = new Color("#e0607e");
  rom.centerAlignText();
  rom.lineLimit = 1;
  rom.minimumScaleFactor = 0.6;
  w.addSpacer(grande ? 14 : 4);

  const it = w.addText(traduzione);
  it.font = Font.mediumSystemFont(grande ? 26 : 15);
  it.textColor = new Color("#2b2a33");
  it.centerAlignText();
  it.minimumScaleFactor = 0.5;
  it.lineLimit = 2;
  w.addSpacer();

  if (grande) {
    const piede = w.addText("Tocca per aprire l'app");
    piede.font = Font.systemFont(11);
    piede.textColor = new Color("#8a8796");
    piede.centerAlignText();
  }
  return w;
};
