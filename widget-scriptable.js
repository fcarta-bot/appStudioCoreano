// Widget "Parole coreane" per l'app Scriptable (iPhone)
// Questo script scarica ogni volta l'ultima versione del widget dal sito,
// quindi non dovrai più reincollarlo quando lo aggiorniamo.
// Funziona sia sulla schermata Home sia sulla schermata di blocco.

const URL_SITO = "https://fcarta-bot.github.io/appStudioCoreano/";

const fm = FileManager.local();
const cartella = fm.joinPath(fm.documentsDirectory(), "parole-coreane");
if (!fm.fileExists(cartella)) fm.createDirectory(cartella);
const percorso = fm.joinPath(cartella, "codice.js");

try {
  const testo = await new Request(URL_SITO + "widget/codice.js?v=" + Date.now()).loadString();
  if (testo.includes("module.exports")) fm.writeString(percorso, testo);
} catch (e) {
  // senza internet usa la copia salvata
}

let widget;
try {
  const creaWidget = importModule(percorso);
  widget = await creaWidget(URL_SITO, args.widgetParameter);
} catch (e) {
  widget = new ListWidget();
  widget.addText("Errore: " + e.message);
}

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  await widget.presentLarge(); // anteprima quando lo avvii dall'app
}
Script.complete();
