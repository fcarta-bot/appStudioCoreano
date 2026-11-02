"""Romanizzazione (Revised Romanization) con alcune regole di pronuncia.

Prima trasforma l'hangul nella forma pronunciata (assimilazioni più comuni),
poi usa korean_romanizer.
"""
from korean_romanizer.romanizer import Romanizer

BASE = 0xAC00
# indici delle consonanti finali (jongseong)
F = {c: i for i, c in enumerate(
    ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ",
     "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"])}
FI = {v: k for k, v in F.items()}
# indici delle consonanti iniziali (choseong)
I = {c: i for i, c in enumerate(
    ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ",
     "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"])}
II = {v: k for k, v in I.items()}

K_LIKE = {"ㄱ", "ㄲ", "ㅋ", "ㄳ", "ㄺ"}
T_LIKE = {"ㄷ", "ㅅ", "ㅆ", "ㅈ", "ㅊ", "ㅌ", "ㅎ"}
P_LIKE = {"ㅂ", "ㅍ", "ㅄ", "ㄿ"}


def split(ch):
    n = ord(ch) - BASE
    return [II[n // 588], (n % 588) // 28, FI[n % 28]]


def join(s):
    return chr(BASE + I[s[0]] * 588 + s[1] * 28 + F[s[2]])


ASPIRATA = {"ㄱ": "ㅋ", "ㄷ": "ㅌ", "ㅅ": "ㅌ", "ㅈ": "ㅊ", "ㅊ": "ㅊ", "ㅌ": "ㅌ", "ㅂ": "ㅍ"}
DOPPIA_H = {"ㄺ": ("ㄹ", "ㅋ"), "ㄼ": ("ㄹ", "ㅍ"), "ㄵ": ("ㄴ", "ㅊ")}


def pronuncia(parola):
    out = []
    syl = [split(c) if 0xAC00 <= ord(c) <= 0xD7A3 else c for c in parola]
    # aspirazione (consonante + ㅎ) solo per verbi/aggettivi (-다) e avverbi (-히):
    # nei sostantivi la regola ufficiale mantiene la "h" (북한 = Bukhan)
    aspira = parola.endswith("다") or parola.endswith("히")
    for i in range(len(syl) - 1):
        a, b = syl[i], syl[i + 1]
        if not isinstance(a, list) or not isinstance(b, list):
            continue
        fin, ini = a[2], b[0]
        # eccezioni: 밟 si legge "bap" davanti a consonante; ㄺ davanti a ㄱ si legge ㄹ (밝기 = balgi)
        if fin == "ㄼ" and a[0] == "ㅂ" and a[1] == 0 and ini != "ㅇ":
            a[2] = "ㅂ"
            fin = "ㅂ"
        if fin == "ㄺ" and ini == "ㄱ":
            a[2] = "ㄹ"
            continue
        if ini == "ㅎ" and fin in DOPPIA_H:
            a[2], b[0] = DOPPIA_H[fin]
            continue
        if ini == "ㅎ" and aspira and fin in ASPIRATA:
            a[2], b[0] = "", ASPIRATA[fin]
            continue
        # palatalizzazione: ㄷ/ㅌ + 이
        if b[1] == 20 and ini == "ㅇ" and fin in ("ㄷ", "ㅌ"):
            a[2] = ""
            b[0] = "ㅈ" if fin == "ㄷ" else "ㅊ"
            continue
        # nasalizzazione davanti a ㄴ/ㅁ
        if ini in ("ㄴ", "ㅁ"):
            if fin in K_LIKE:
                a[2] = "ㅇ"
            elif fin in T_LIKE:
                a[2] = "ㄴ"
            elif fin in P_LIKE:
                a[2] = "ㅁ"
        # ㄹ: ㄴ+ㄹ / ㄹ+ㄴ -> ㄹㄹ
        if (fin == "ㄴ" and ini == "ㄹ") or (fin == "ㄹ" and ini == "ㄴ"):
            a[2] = "ㄹ"
            b[0] = "ㄹ"
        # ㅁ/ㅇ + ㄹ -> ㄴ
        elif fin in ("ㅁ", "ㅇ") and ini == "ㄹ":
            b[0] = "ㄴ"
        # ㄱ/ㅂ + ㄹ -> ㅇ/ㅁ + ㄴ
        elif fin in K_LIKE and ini == "ㄹ":
            a[2], b[0] = "ㅇ", "ㄴ"
        elif fin in P_LIKE and ini == "ㄹ":
            a[2], b[0] = "ㅁ", "ㄴ"
    for s in syl:
        out.append(join(s) if isinstance(s, list) else s)
    return "".join(out)


def romanizza(parola):
    return Romanizer(pronuncia(parola)).romanize().replace("lr", "ll")


if __name__ == "__main__":
    for w in ["감사합니다", "같이", "신라", "굳이", "국민", "정리", "독립", "십리",
              "괜찮다", "많이", "있다", "한국말", "끝나다", "옛날", "음료"]:
        print(w, pronuncia(w), romanizza(w))
