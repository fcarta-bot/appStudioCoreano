// ===== LOGICA CONDIVISA =====
// ATTENZIONE: questa parte deve restare identica a quella in widget/codice.js

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

function leggiSalvato() {
  try { return localStorage.getItem("filtro") || ""; } catch (e) { return ""; }
}
function salva(testo) {
  try { localStorage.setItem("filtro", testo); } catch (e) {}
}

// ===== Audio (voce del telefono) =====
let voceKo = null;
function leggiImp(nome, base) {
  try { const v = localStorage.getItem(nome); return v === null ? base : v; } catch (e) { return base; }
}
function salvaImp(nome, valore) {
  try { localStorage.setItem(nome, valore); } catch (e) {}
}
function vociCoreane() {
  return speechSynthesis.getVoices().filter(v => (v.lang || "").toLowerCase().replace("_", "-").startsWith("ko"));
}
// voci coreane femminili note su iPhone/Mac (si usano se non è stata scelta una voce)
const VOCI_FEMMINILI = ["yuna", "sora", "jian", "suhyun", "heami", "sun-hi", "female", "여"];
function trovaVoce() {
  const voci = vociCoreane();
  const scelta = leggiImp("voce", "");
  voceKo = voci.find(v => v.voiceURI === scelta) ||
           voci.find(v => VOCI_FEMMINILI.some(n => v.name.toLowerCase().includes(n))) ||
           voci[0] || null;
}
if ("speechSynthesis" in window) {
  trovaVoce();
  speechSynthesis.addEventListener("voiceschanged", trovaVoce);
}

function avviso(testo) {
  let t = document.getElementById("avviso");
  if (!t) {
    t = document.createElement("div");
    t.id = "avviso";
    document.body.appendChild(t);
  }
  t.textContent = testo;
  t.classList.add("visibile");
  clearTimeout(avviso.timer);
  avviso.timer = setTimeout(() => t.classList.remove("visibile"), 6000);
}

function pronuncia(testo) {
  if (!("speechSynthesis" in window)) {
    avviso("Questo browser non può leggere le parole ad alta voce.");
    return;
  }
  trovaVoce();
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = "ko-KR";
  if (voceKo) u.voice = voceKo;
  u.pitch = parseFloat(leggiImp("tono", "1.2"));
  u.rate = parseFloat(leggiImp("velocita", "0.8"));
  u.onerror = e => avviso("Audio non riuscito (" + e.error + "). Controlla che il telefono non sia in silenzioso.");
  speechSynthesis.resume(); // su iPhone a volte resta in pausa
  // su Safari "cancel" subito prima di "speak" fa saltare l'audio: aspetto un attimo
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel();
    setTimeout(() => speechSynthesis.speak(u), 150);
  } else {
    speechSynthesis.speak(u);
  }
  if (!voceKo) {
    avviso("Sull'iPhone manca la voce coreana: Impostazioni → Accessibilità → " +
           "Contenuti letti ad alta voce → Voci → Coreano, e scaricane una.");
  }
}

function schedaParola(p, etichetta, attiva, etichette) {
  const div = document.createElement("div");
  div.className = "scheda" + (attiva ? " attiva" : "");
  div.innerHTML = `
    <div class="etichetta">${etichetta}</div>
    <div class="ko">${p.ko}</div>
    <div class="rom">${p.rom}</div>
    <div class="it">${p.it}</div>
    ${p.multi ? '<div class="nota">Questa parola ha più significati</div>' : ""}
    <div class="cat">${etichette[p.cat] || ""}</div>
    <button class="ascolta" aria-label="Ascolta">🔊 Ascolta</button>`;
  div.querySelector(".ascolta").onclick = () => pronuncia(p.ko);
  return div;
}

const fmtData = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function titoloGiorno(i, data) {
  if (i === 0) return "Oggi";
  if (i === 1) return "Ieri";
  const s = fmtData.format(data);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function creaPagina(st, i, ultimo) {
  const { indice, oggi, pool, etichette, filtro } = st;
  const data = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - i);
  const [p1, p2] = paroleDelGiorno(indice, data, pool);

  const pagina = document.createElement("section");
  pagina.className = "pagina";
  const testa = document.createElement("header");
  const nomeFiltro = filtro.cat.length ? filtro.cat.map(c => etichette[c] || c).join(", ") : "Tutti gli argomenti";
  testa.innerHTML = `<div class="riga-titolo"><h1>${titoloGiorno(i, data)}${i === 0 ? " <span>♥</span>" : ""}</h1>
      ${i === 0 ? '<button class="apri-filtri">⚙︎ Impostazioni</button>' : ""}</div>
    <p class="sotto">${i === 0 ? nomeFiltro + (filtro.adulti ? " · 18+" : "") : "Giorno " + (giornoNumero(indice.inizio, data) + 1)}</p>`;
  pagina.appendChild(testa);
  if (i === 0) testa.querySelector(".apri-filtri").onclick = apriFiltri;

  const schede = document.createElement("div");
  schede.className = "schede";
  if (i === 0) {
    const ora = oggi.getHours() % 2; // ore pari: prima parola, dispari: seconda
    const [a, b] = ora === 0 ? [p1, p2] : [p2, p1];
    schede.appendChild(schedaParola(a, "Parola di quest'ora", true, etichette));
    schede.appendChild(schedaParola(b, "L'altra parola di oggi", false, etichette));
  } else {
    schede.appendChild(schedaParola(p1, "Prima parola", false, etichette));
    schede.appendChild(schedaParola(p2, "Seconda parola", false, etichette));
  }
  pagina.appendChild(schede);

  const piede = document.createElement("p");
  piede.className = "suggerimento";
  piede.textContent = ultimo ? "Il primo giorno: da qui è cominciato tutto ♥"
                             : "↑ Scorri verso l'alto per il giorno prima";
  pagina.appendChild(piede);
  if (i === 0 || ultimo) {
    const crediti = document.createElement("footer");
    crediti.innerHTML = 'Parole: Shiberu Korean Word Frequency List 2026 by Shiberu ' +
      '(<a href="https://shiberu.app/korean-frequency-list">shiberu.app</a>), CC BY 4.0';
    pagina.appendChild(crediti);
  }
  return pagina;
}

let stato = null;
let osservatore = null;

function disegnaLibro() {
  const libro = document.getElementById("libro");
  libro.innerHTML = "";
  libro.scrollTop = 0;
  if (osservatore) osservatore.disconnect();
  const totale = giornoNumero(stato.indice.inizio, stato.oggi) + 1;
  let fatte = 0;
  const segnaposto = document.createElement("div");
  segnaposto.className = "segnaposto";
  libro.appendChild(segnaposto);
  function aggiungi(n) {
    const fino = Math.min(totale, fatte + n);
    for (; fatte < fino; fatte++) {
      libro.insertBefore(creaPagina(stato, fatte, fatte === totale - 1), segnaposto);
    }
    if (fatte >= totale) segnaposto.remove();
  }
  aggiungi(5);
  osservatore = new IntersectionObserver(voci => {
    if (voci.some(v => v.isIntersecting)) aggiungi(10);
  }, { root: libro, rootMargin: "200% 0px" });
  osservatore.observe(segnaposto);
}

function applicaFiltro(testo) {
  stato.testoFiltro = testo;
  stato.filtro = leggiFiltro(testo);
  stato.pool = creaPool(stato.blocchi, stato.filtro);
  disegnaLibro();
}

// ===== Pannello argomenti =====
function apriFiltri() {
  const pannello = document.getElementById("filtri");
  const lista = pannello.querySelector(".lista-cat");
  const f = stato.filtro;
  const conteggi = {};
  stato.blocchi.flat().forEach(p => { conteggi[p.cat] = (conteggi[p.cat] || 0) + 1; });
  lista.innerHTML = Object.entries(stato.etichette).map(([k, nome]) => `
    <label><input type="checkbox" value="${k}" ${f.cat.includes(k) ? "checked" : ""}>
      ${nome} <small>${conteggi[k] || 0}</small></label>`).join("");
  pannello.querySelector("#adulti").checked = f.adulti;
  aggiornaTesto();
  pannello.hidden = false;
}

function testoDalPannello() {
  const pannello = document.getElementById("filtri");
  const cat = [...pannello.querySelectorAll(".lista-cat input:checked")].map(i => i.value);
  if (pannello.querySelector("#adulti").checked) cat.push("18+");
  return cat.join(", ");
}

function aggiornaTesto() {
  const t = testoDalPannello();
  document.getElementById("testo-widget").textContent = t || "(lascia vuoto: tutti gli argomenti)";
}

function preparaVoce() {
  const sel = document.getElementById("scelta-voce");
  function riempi() {
    trovaVoce();
    const voci = vociCoreane();
    sel.innerHTML = voci.length
      ? voci.map(v => `<option value="${v.voiceURI}" ${voceKo && v.voiceURI === voceKo.voiceURI ? "selected" : ""}>${v.name}</option>`).join("")
      : "<option>Nessuna voce coreana sul telefono</option>";
  }
  riempi();
  speechSynthesis.addEventListener("voiceschanged", riempi);
  sel.onchange = () => { salvaImp("voce", sel.value); trovaVoce(); pronuncia("안녕하세요"); };
  for (const gruppo of ["tono", "velocita"]) {
    const base = gruppo === "tono" ? "1.2" : "0.8";
    document.querySelectorAll(`[data-${gruppo}]`).forEach(b => {
      b.classList.toggle("scelto", b.dataset[gruppo] === leggiImp(gruppo, base));
      b.onclick = () => {
        salvaImp(gruppo, b.dataset[gruppo]);
        document.querySelectorAll(`[data-${gruppo}]`).forEach(x => x.classList.toggle("scelto", x === b));
        pronuncia("안녕하세요");
      };
    });
  }
}

function preparaPannello() {
  const pannello = document.getElementById("filtri");
  if ("speechSynthesis" in window) preparaVoce();
  pannello.addEventListener("change", aggiornaTesto);
  pannello.querySelector(".tutti").onclick = () => {
    pannello.querySelectorAll(".lista-cat input").forEach(i => { i.checked = false; });
    aggiornaTesto();
  };
  pannello.querySelector(".copia").onclick = async e => {
    try { await navigator.clipboard.writeText(testoDalPannello()); e.target.textContent = "Copiato ✓"; }
    catch (err) { e.target.textContent = "Copia a mano"; }
    setTimeout(() => { e.target.textContent = "Copia"; }, 1500);
  };
  pannello.querySelector(".chiudi").onclick = () => {
    const t = testoDalPannello();
    salva(t);
    applicaFiltro(t);
    pannello.hidden = true;
  };
}

async function avvia() {
  const indice = await fetch("parole/indice.json").then(r => r.json());
  const etichette = await fetch("parole/categorie.json").then(r => r.json());
  const blocchi = [];
  for (let n = 1; n <= indice.blocchi; n++) {
    blocchi.push(await fetch("parole/blocco-" + String(n).padStart(2, "0") + ".json").then(r => r.json()));
  }
  stato = { indice, etichette, blocchi, oggi: new Date() };
  preparaPannello();
  applicaFiltro(leggiSalvato());
}

avvia().catch(e => {
  document.getElementById("libro").textContent = "Errore nel caricamento: " + e.message;
});
