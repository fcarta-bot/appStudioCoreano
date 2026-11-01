"""Unisce lista di frequenza + traduzioni e crea parole/blocco-01.json."""
import csv, json, glob, sys
from romanizza import romanizza
from categorie import mappa, ADULTI
CAT, DOPPIE = mappa()
for d in DOPPIE: print("Parola in due categorie (tengo la prima):", d)

LISTA = "/home/claude/src/shiberu-yomitan/data/ko-frequency.tsv"
blocco = int(sys.argv[1]) if len(sys.argv) > 1 else 1
inizio, fine = (blocco - 1) * 1000, blocco * 1000

righe = list(csv.reader(open(LISTA, encoding="utf-8"), delimiter="\t"))[1:]
lemmi = [r[1] for r in righe[inizio:fine]]

trad = []
for f in sorted(glob.glob("trad_*.txt")):
    for riga in open(f, encoding="utf-8"):
        riga = riga.rstrip("\n")
        if riga:
            trad.append(riga.split("|"))
trad = trad[inizio:fine]

errori = 0
parole = []
for i, (ko, t) in enumerate(zip(lemmi, trad)):
    if t[0] != ko:
        print(f"Disallineato al rango {inizio+i+1}: lista={ko} traduzione={t[0]}")
        errori += 1
        break
    parole.append({"n": inizio + i + 1, "ko": ko, "rom": romanizza(ko),
                   "it": t[1], "multi": t[2] == "*",
                   "cat": CAT.get(ko, "base"), "adulti": ko in ADULTI})
if len(trad) != len(lemmi):
    print("Numero diverso:", len(lemmi), len(trad))
    errori += 1
sconosciute = set(CAT) - set(lemmi)
if sconosciute:
    print("Parole in categorie.py che non sono nel blocco:", sconosciute)
if errori:
    sys.exit(1)
out = f"/home/claude/progetto/sito/parole/blocco-{blocco:02d}.json"
json.dump(parole, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("OK", len(parole), "parole ->", out, "| con più significati:", sum(p["multi"] for p in parole))
