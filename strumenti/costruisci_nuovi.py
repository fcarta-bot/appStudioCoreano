"""Blocchi dal 2 in poi: legge i file t2_*.txt (ko|it|segni|categoria)
segni: * = più significati, ! = 18+.  Categoria: codice breve (vuoto = base)."""
import csv, json, glob, sys
from romanizza import romanizza

LISTA = "/home/claude/src/shiberu-yomitan/data/ko-frequency.tsv"
CODICI = {"pe": "persone", "co": "corpo", "ci": "cibo", "ca": "casa", "lu": "luoghi",
          "na": "natura", "te": "tempo", "st": "studio", "so": "soldi", "tc": "tecnologia",
          "se": "societa", "em": "emozioni", "de": "descrivere", "nu": "numeri",
          "cm": "comunicare", "sv": "svago", "vi": "viaggi", "az": "azioni", "ba": "base", "": "base"}

# frammenti grammaticali e parole scritte male nel corpus: restano nei file ma non escono mai
SALTA = set("시키 스다 겠 거리다 드 도다 디 블다 떠다 히 스럽 혀다 다그다 그라다 던 었 헤다 모다 짤다".split())

lemmi = [r[1] for r in list(csv.reader(open(LISTA, encoding="utf-8"), delimiter="\t"))[1:]]
righe = []
for f in sorted(glob.glob("t2_*.txt")):
    inizio = int(f[3:8]) - 1
    if inizio != 1000 + len(righe):
        sys.exit(f"{f}: mi aspettavo l'inizio {1000 + len(righe) + 1}")
    for n, r in enumerate(open(f, encoding="utf-8").read().splitlines()):
        if not r.strip():
            continue
        c = r.split("|")
        if len(c) != 4 or c[3] not in CODICI:
            sys.exit(f"{f}: riga malformata: {r}")
        pos = 1000 + len(righe)
        if c[0] != lemmi[pos]:
            sys.exit(f"{f}: disallineato al rango {pos + 1}: lista={lemmi[pos]} file={c[0]}")
        righe.append(c)

print("parole tradotte dalla 1001:", len(righe))
for b in range(len(righe) // 1000):
    parole = []
    for k, (ko, it, segni, cat) in enumerate(righe[b * 1000:(b + 1) * 1000]):
        parole.append({"n": 1001 + b * 1000 + k, "ko": ko, "rom": romanizza(ko), "it": it,
                       "multi": "*" in segni, "cat": CODICI[cat], "adulti": "!" in segni, "salta": ko in SALTA})
    out = f"/home/claude/progetto/sito/parole/blocco-{b + 2:02d}.json"
    json.dump(parole, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("scritto", out)
