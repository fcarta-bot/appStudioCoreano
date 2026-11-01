// ===== Logica delle parole del giorno =====
// ATTENZIONE: la funzione paroleDelGiorno() deve restare identica
// a quella nello script del widget (widget-scriptable.js).

const GIORNI_PER_BLOCCO = 500; // 1000 parole / 2 al giorno

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

// restituisce { blocco, indici: [i1, i2] } per una certa data
function paroleDelGiorno(indice, data) {
  const giorno = giornoNumero(indice.inizio, data);
  const totaleGiorni = indice.blocchi * GIORNI_PER_BLOCCO;
  const g = giorno % totaleGiorni; // finiti i blocchi, ricomincia
  const blocco = Math.floor(g / GIORNI_PER_BLOCCO) + 1;
  const pos = g % GIORNI_PER_BLOCCO;
  const ordine = ordineMescolato(1000, blocco);
  return { blocco, indici: [ordine[pos * 2], ordine[pos * 2 + 1]] };
}

// ===== Pagina =====
const cacheBlocchi = {};
async function caricaBlocco(n) {
  if (!cacheBlocchi[n]) {
    const nome = "parole/blocco-" + String(n).padStart(2, "0") + ".json";
    cacheBlocchi[n] = fetch(nome).then(r => r.json());
  }
  return cacheBlocchi[n];
}

function pronuncia(testo) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(testo);
  u.lang = "ko-KR";
  u.rate = 0.8;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

function schedaParola(p, etichetta, attiva) {
  const div = document.createElement("div");
  div.className = "scheda" + (attiva ? " attiva" : "");
  div.innerHTML = `
    <div class="etichetta">${etichetta}</div>
    <div class="ko">${p.ko}</div>
    <div class="rom">${p.rom}</div>
    <div class="it">${p.it}</div>
    ${p.multi ? '<div class="nota">Questa parola ha più significati</div>' : ""}
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

// crea la pagina del giorno "i" (0 = oggi, 1 = ieri, ...)
async function creaPagina(indice, oggi, i, ultimo) {
  const data = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - i);
  const { blocco, indici } = paroleDelGiorno(indice, data);
  const parole = await caricaBlocco(blocco);

  const pagina = document.createElement("section");
  pagina.className = "pagina";
  const testa = document.createElement("header");
  testa.innerHTML = `<h1>${titoloGiorno(i, data)}${i === 0 ? " <span>♥</span>" : ""}</h1>
    <p class="sotto">${i === 0 ? "오늘의 단어 · le parole di oggi" : "Giorno " + (giornoNumero(indice.inizio, data) + 1)}</p>`;
  pagina.appendChild(testa);

  const schede = document.createElement("div");
  schede.className = "schede";
  if (i === 0) {
    const ora = oggi.getHours() % 2; // ore pari: prima parola, dispari: seconda
    schede.appendChild(schedaParola(parole[indici[ora]], "Parola di quest'ora", true));
    schede.appendChild(schedaParola(parole[indici[1 - ora]], "L'altra parola di oggi", false));
  } else {
    schede.appendChild(schedaParola(parole[indici[0]], "Prima parola", false));
    schede.appendChild(schedaParola(parole[indici[1]], "Seconda parola", false));
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

async function avvia() {
  const indice = await fetch("parole/indice.json").then(r => r.json());
  const oggi = new Date();
  const totale = giornoNumero(indice.inizio, oggi) + 1; // pagine da mostrare
  const libro = document.getElementById("libro");
  libro.innerHTML = "";

  // le pagine si creano a gruppi, man mano che si scorre
  let fatte = 0;
  const segnaposto = document.createElement("div");
  segnaposto.className = "segnaposto";
  async function aggiungi(n) {
    const fino = Math.min(totale, fatte + n);
    for (; fatte < fino; fatte++) {
      libro.insertBefore(await creaPagina(indice, oggi, fatte, fatte === totale - 1), segnaposto);
    }
    if (fatte >= totale) segnaposto.remove();
  }
  libro.appendChild(segnaposto);
  await aggiungi(5);
  new IntersectionObserver(voci => {
    if (voci.some(v => v.isIntersecting)) aggiungi(10);
  }, { root: libro, rootMargin: "200% 0px" }).observe(segnaposto);
}

avvia().catch(e => {
  document.getElementById("libro").textContent = "Errore nel caricamento: " + e.message;
});
