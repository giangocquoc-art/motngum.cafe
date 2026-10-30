"""Extract the HSK 3.0 (2025-11) level 1–6 source inventory from the pinned PDF.

Requires pypdf. The committed JSON is the reviewed output; this script keeps the
printed-page and row conventions reproducible without inventing IDs for source
tables that do not publish them (notably grammar and merged topic cells).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from pypdf import PdfReader


SOURCE_URL = "https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf"
SOURCE_EDITION = "HSK 3.0 syllabus, 2025-11"
PAGE_OFFSET = 2  # pypdf's zero-based page index = printed page + 2
TASK_RANGES = {1: (2, 5), 2: (6, 10), 3: (11, 17), 4: (18, 28), 5: (29, 36), 6: (37, 44)}
TOPIC_RANGES = {1: (56, 57), 2: (58, 59), 3: (60, 62), 4: (63, 65), 5: (66, 68), 6: (69, 71)}
VOCAB_RANGES = {1: (1, 300), 2: (301, 500), 3: (501, 1000), 4: (1001, 2000), 5: (2001, 3600), 6: (3601, 5400)}
# Vocabulary page boundaries are intentionally derived from the serial/level
# columns because adjacent levels share printed pages (p.89 contains 500 and 501).
CHAR_PAGES = {1: (353, 354), 2: (355, 355), 3: (356, 357), 4: (358, 360), 5: (361, 363), 6: (364, 366)}
GRAMMAR_PAGES = {1: (383, 385), 2: (386, 388), 3: (389, 391), 4: (392, 394), 5: (395, 397), 6: (398, 399)}
EXPECTED_TASKS = {1: 15, 2: 17, 3: 22, 4: 30, 5: 28, 6: 24}
EXPECTED_TOPICS = {1: [5, 15, 30], 2: [5, 18, 34], 3: [6, 22, 54], 4: [7, 31, 77], 5: [7, 29, 72], 6: [7, 25, 68]}
EXPECTED_CHARACTERS = {1: 246, 2: 125, 3: 284, 4: 441, 5: 431, 6: 413}


def clean_text(value: str) -> str:
    return "".join(value.split())


def source_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def printed_text(reader: PdfReader, page: int, *, layout: bool = False) -> str:
    return reader.pages[page + PAGE_OFFSET].extract_text(extraction_mode="layout" if layout else "plain") or ""


def cn_ordinal(value: str) -> int:
    digit = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10}
    if value == "十":
        return 10
    if "十" not in value:
        return digit[value]
    left, _, right = value.partition("十")
    return (digit[left] if left else 1) * 10 + (digit[right] if right else 0)


def extract_tasks(reader: PdfReader) -> dict[str, list[dict]]:
    output: dict[str, list[dict]] = {}
    heading = re.compile(r"^\s*([一二三四五六七八九十]+)、\s*(.+?)\s*$")
    bullet = re.compile(r"^\s*\s*(.*)$")
    for level, (start, end) in TASK_RANGES.items():
        tasks: list[dict] = []
        current = None
        active_requirement = None
        def flush() -> None:
            nonlocal current
            if current is None:
                return
            requirements = [clean_text(item) for item in current.pop("_requirements") if clean_text(item)]
            current["requirementCount"] = len(requirements)
            current["sourceHash"] = source_hash(current["title"] + "\n" + "\n".join(requirements))
            current.pop("title")
            tasks.append(current)
            current = None
        for page in range(start, end + 1):
            for line in printed_text(reader, page).splitlines():
                match = heading.match(line)
                if match:
                    flush()
                    current = {"id": f"hsk30:l{level}:task:{cn_ordinal(match.group(1)):03d}", "level": level,
                               "ordinal": cn_ordinal(match.group(1)), "title": clean_text(match.group(2)),
                               "printedPage": page, "_requirements": []}
                    active_requirement = None
                    continue
                if current is None or not line.strip():
                    continue
                stripped = line.strip()
                if stripped == "汉考国际" or stripped.isdigit() or set(stripped) <= {"-", " "}:
                    continue
                item = bullet.match(line)
                if item:
                    current["_requirements"].append(item.group(1))
                    active_requirement = len(current["_requirements"]) - 1
                elif active_requirement is not None:
                    current["_requirements"][active_requirement] += " " + stripped
                else:
                    current["_requirements"].append(stripped)
                    active_requirement = len(current["_requirements"]) - 1
        flush()
        ordinals = [item["ordinal"] for item in tasks]
        if len(tasks) != EXPECTED_TASKS[level] or ordinals != list(range(1, EXPECTED_TASKS[level] + 1)):
            raise ValueError(f"Task extraction mismatch at HSK {level}: {len(tasks)}; ordinals={ordinals}")
        output[str(level)] = tasks
    return output


def extract_topics(reader: PdfReader) -> dict[str, dict]:
    output: dict[str, dict] = {}
    for level, (start, end) in TOPIC_RANGES.items():
        rows: list[dict] = []
        official_counts = None
        for page in range(start, end + 1):
            raw = printed_text(reader, page, layout=True)
            page_row_ordinal = 0
            for line in raw.splitlines():
                stripped = line.strip()
                if not stripped:
                    continue
                count_match = re.fullmatch(r"(\d+)个\s+(\d+)个\s+(\d+)个", stripped)
                if count_match:
                    official_counts = [int(count_match.group(i)) for i in range(1, 4)]
                    continue
                if "HSK（" in stripped or "话题" in stripped or stripped.startswith("一级话题"):
                    continue
                if stripped == "汉考国际" or stripped.isdigit() or set(stripped) <= {"-", " "}:
                    continue
                cells = [match for match in re.finditer(r"\S.*?(?=\s{2,}|$)", line.rstrip())]
                page_row_ordinal += 1
                rows.append({"id": f"hsk30:l{level}:topic:p{page}:r{page_row_ordinal:03d}",
                             "level": level, "printedPage": page, "rowOrdinal": page_row_ordinal,
                             "sourceHash": source_hash(line.rstrip()), "visibleCellCount": len(cells)})
        if official_counts != EXPECTED_TOPICS[level]:
            raise ValueError(f"Topic footer mismatch at HSK {level}: {official_counts}")
        output[str(level)] = {
            "officialTierCounts": official_counts,
            "rows": rows,
            "hierarchyStatus": "raw page rows preserve merged cells and visual order; parent links require manual table reconciliation",
        }
    return output


def extract_vocabulary(reader: PdfReader) -> list[dict]:
    vocabulary: list[dict] = []
    expected_by_serial = {}
    for level, (first, last) in VOCAB_RANGES.items():
        for serial in range(first, last + 1):
            expected_by_serial[serial] = level
    # Adjacent grades share a printed page. Scan pages once and trust the
    # printed serial and level column rather than the page interval.
    for page in range(77, 212):
        for line in printed_text(reader, page, layout=True).splitlines():
            cells = re.split(r"\s{2,}", line.strip())
            if not cells or not cells[0].isdigit() or len(cells) < 4:
                continue
            serial = int(cells[0])
            match = re.fullmatch(r"([1-6])((?:（[^）]+）)*)", cells[1])
            if not match:
                continue
            level = int(match.group(1))
            if serial not in expected_by_serial or expected_by_serial[serial] != level:
                raise ValueError(f"Unexpected vocabulary row {serial} grade {level} on printed page {page}")
            if len(cells) > 5:
                raise ValueError(f"Unexpected vocabulary columns at row {serial}: {cells}")
            vocabulary.append({"id": f"hsk30:vocab:{serial:04d}", "serial": serial, "level": level,
                               "printedPage": page, "sourceHash": source_hash(line.strip())})
    vocabulary.sort(key=lambda item: item["serial"])
    serials = [item["serial"] for item in vocabulary]
    expected = list(range(1, 5401))
    if serials != expected:
        missing = sorted(set(expected) - set(serials))
        duplicates = sorted(serial for serial in set(serials) if serials.count(serial) > 1)
        raise ValueError(f"Vocabulary row coverage mismatch; missing={missing[:20]}, duplicates={duplicates[:20]}")
    return vocabulary


def extract_characters(reader: PdfReader) -> dict[str, list[dict]]:
    output: dict[str, list[dict]] = {}
    for level, (start, end) in CHAR_PAGES.items():
        chars: list[dict] = []
        for page in range(start, end + 1):
            for line in printed_text(reader, page).splitlines():
                match = re.match(r"^\s*(\d+)\s*[.．]\s*(\S+)\s*$", line)
                if not match:
                    continue
                ordinal, character = int(match.group(1)), match.group(2)
                if len(character) != 1:
                    raise ValueError(f"Unexpected character cell at HSK {level} p.{page}: {character}")
                chars.append({"id": f"hsk30:l{level}:hanzi:{ordinal:03d}", "level": level,
                              "ordinal": ordinal, "printedPage": page,
                              "sourceHash": source_hash(line.strip())})
        if len(chars) != EXPECTED_CHARACTERS[level] or [item["ordinal"] for item in chars] != list(range(1, EXPECTED_CHARACTERS[level] + 1)):
            raise ValueError(f"Character extraction mismatch at HSK {level}: {len(chars)}")
        output[str(level)] = chars
    return output


def extract_grammar_pages(reader: PdfReader) -> dict[str, list[dict]]:
    output: dict[str, list[dict]] = {}
    for level, (start, end) in GRAMMAR_PAGES.items():
        pages: list[dict] = []
        for page in range(start, end + 1):
            text = printed_text(reader, page, layout=True)
            pages.append({"id": f"hsk30:l{level}:grammar:p{page}", "level": level,
                          "printedPage": page, "sourceHash": source_hash(text),
                          "nonemptyLineCount": sum(bool(line.strip()) for line in text.splitlines()),
                          "rowCount": None})
        output[str(level)] = pages
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path, help="Pinned official HSK 3.0 syllabus PDF")
    parser.add_argument("output", type=Path, help="Destination JSON path")
    args = parser.parse_args()
    reader = PdfReader(str(args.pdf))
    inventory = {
        "schemaVersion": 1,
        "edition": SOURCE_EDITION,
        "sourceUrl": SOURCE_URL,
        "sourceSha256": hashlib.sha256(args.pdf.read_bytes()).hexdigest(),
        "printedPageConvention": "pypdf zero-based page index = printed page + 2 (the PDF's one-based page number = printed page + 3).",
        "scope": "HSK 3.0 levels 1–6 only. HSK 7–9 task section begins on printed page 45 and is excluded.",
        "extraction": {
            "tool": "pypdf layout/plain text extraction",
            "taskAndVocabularyRows": "Stable IDs, printed-page locators, and SHA-256 checks of normalized source rows are retained; full source wording is not copied into this repo.",
            "topicRows": "Stable row locators and source hashes are retained. Merged cells are not assigned guessed parent nodes; official tier totals come from printed page footers.",
            "grammarPages": "Printed-page locators, nonempty line counts, and source hashes are retained. The syllabus supplies no grammar serial IDs or official row total; wrapped table cells require editorial normalization.",
            "characterRows": "Stable per-level recognition-list IDs and source-row hashes are retained, not a claim of writing proficiency.",
        },
        "levelCounts": {
            str(level): {
                "tasks": EXPECTED_TASKS[level],
                "topicsByTier": EXPECTED_TOPICS[level],
                "vocabulary": VOCAB_RANGES[level][1] - VOCAB_RANGES[level][0] + 1,
                "recognitionCharacters": EXPECTED_CHARACTERS[level],
                "grammarPages": GRAMMAR_PAGES[level][1] - GRAMMAR_PAGES[level][0] + 1,
                "grammarItemCount": None,
            } for level in range(1, 7)
        },
        "tasks": extract_tasks(reader),
        "topics": extract_topics(reader),
        "vocabulary": extract_vocabulary(reader),
        "characters": extract_characters(reader),
        "grammarPages": extract_grammar_pages(reader),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "vocabulary": len(inventory["vocabulary"]),
                      "tasks": sum(len(items) for items in inventory["tasks"].values()),
                      "characters": sum(len(items) for items in inventory["characters"].values()),
                      "topicRows": sum(len(group["rows"]) for group in inventory["topics"].values()),
                      "grammarPages": sum(len(items) for items in inventory["grammarPages"].values())}, ensure_ascii=False))


if __name__ == "__main__":
    main()
