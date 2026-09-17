import csv
import json
import os

INPUT_CSV = "data/glossar.csv"
OUTPUT_JS = "data/glossar-data.js"

def convert_csv_to_js():
    if not os.path.exists(INPUT_CSV):
        print(f"[ ERROR ]: Datei {INPUT_CSV} nicht gefunden.")
        return

    glossary = []

    with open(INPUT_CSV, mode="r", encoding="utf-8") as f:
        # DictReader nutzt automatisch die Spaltenköpfe aus Zeile 1
        reader = csv.DictReader(f)
        for row in reader:
            term = row.get("term", "").strip()
            if not term:
                continue

            first_letter = term[0].upper()
            
            # Listen verarbeiten (Kategorien, Tags, Querverweise)
            categories = [c.strip() for c in row.get("category", "").split(",") if c.strip()]
            tags = [t.strip() for t in row.get("tags", "").split(";") if t.strip()]
            cross_refs = [r.strip() for r in row.get("cross_references", "").split(";") if r.strip()]

            glossary.append({
                "id": term.lower().replace(" ", "-").replace("/", "-"),
                "term": term,
                "letter": first_letter if first_letter.isalpha() else "#",
                "categories": categories if categories else ["Allgemein"],
                "definition": row.get("definition", "").strip(),
                "example": row.get("example", "").strip(),
                "tags": tags,
                "cross_references": cross_refs
            })

    # Alphabetisch nach Begriff sortieren
    glossary.sort(key=lambda x: x["term"].lower())

    # Ensure output directory exists
    os.makedirs(os.path.dirname(OUTPUT_JS), exist_ok=True)

    # JS-Datei schreiben
    js_content = f"// AUTOMATICALLY GENERATED VIA GITHUB ACTIONS\nconst glossaryData = {json.dumps(glossary, ensure_ascii=False, indent=2)};"
    
    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write(js_content)

    print(f"[ SUCCESS ]: {len(glossary)} Begriffe erfolgreich in {OUTPUT_JS} konvertiert!")

if __name__ == "__main__":
    convert_csv_to_js()
