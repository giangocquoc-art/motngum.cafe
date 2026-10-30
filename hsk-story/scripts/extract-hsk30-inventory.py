"""Extract the HSK 3.0 (2025-11) level 1–6 source inventory from the pinned PDF.

Requires pypdf and PyMuPDF (fitz). The committed JSON is the checked extraction
output. Page-level geometry has been visually reviewed; full cell-text
verification and educator mapping remain pending. Edition-scoped topic-cell and
grammar-row IDs are generated locators, not IDs published by the source.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

import fitz
from pypdf import PdfReader


SOURCE_URL = "https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf"
SOURCE_EDITION = "HSK 3.0 syllabus, 2025-11"
SOURCE_SHA256 = "ec74ce0439e837bbb15154be13e747ae798903b2fd3a331629df6c3b45504941"
NORMALIZATION_VERSION = 2
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


def geometry_cell_text(page: fitz.Page, bbox: tuple[float, float, float, float] | None) -> str:
    """Read horizontal text within one detected table cell, excluding diagonal watermark spans."""
    if bbox is None:
        return ""
    rect = fitz.Rect(bbox)
    lines: list[tuple[float, float, str]] = []
    for block in page.get_text("dict", clip=rect).get("blocks", []):
        for line in block.get("lines", []):
            dx, dy = line.get("dir", (1.0, 0.0))
            if abs(dx - 1.0) > 0.001 or abs(dy) > 0.001:
                continue
            line_bbox = fitz.Rect(line["bbox"])
            center = fitz.Point((line_bbox.x0 + line_bbox.x1) / 2, (line_bbox.y0 + line_bbox.y1) / 2)
            if not rect.contains(center):
                continue
            value = "".join(span["text"] for span in line.get("spans", []))
            if clean_text(value):
                lines.append((line_bbox.y0, line_bbox.x0, value))
    return "".join(clean_text(value) for _, _, value in sorted(lines))


def cell_bbox(bbox: tuple[float, float, float, float] | None) -> list[float] | None:
    return [round(value, 2) for value in bbox] if bbox is not None else None


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


def extract_topic_nodes(layout_doc: fitz.Document, level: int, start: int, end: int,
                        official_counts: list[int]) -> list[dict]:
    nodes: list[dict] = []
    tier_counts = [0, 0, 0]
    sibling_counts: dict[tuple[int, str | None], int] = {}
    current_ids: list[str | None] = [None, None, None]
    current_paths: list[str | None] = [None, None, None]
    footer_counts = None
    for printed_page in range(start, end + 1):
        page = layout_doc[printed_page + PAGE_OFFSET]
        tables = page.find_tables().tables
        if len(tables) != 1 or tables[0].col_count != 3:
            raise ValueError(f"Expected one 3-column topic table on printed page {printed_page}; found {[table.col_count for table in tables]}")
        table = tables[0]
        for table_row_ordinal, row in enumerate(table.rows):
            values = [geometry_cell_text(page, bbox) for bbox in row.cells]
            if values == ["一级话题", "二级话题", "三级话题"]:
                continue
            footer = [int(value[:-1]) for value in values if re.fullmatch(r"\d+个", value)]
            nonempty = [value for value in values if value]
            if len(footer) == 3 and len(nonempty) == 3:
                footer_counts = footer
                continue
            for column, value in enumerate(values):
                if not value:
                    continue
                tier = column + 1
                parent_id = current_ids[column - 1] if column else None
                parent_path = current_paths[column - 1] if column else None
                if tier > 1 and (parent_id is None or parent_path is None):
                    raise ValueError(f"Topic node has no preceding tier {tier - 1} parent on HSK {level} p.{printed_page}, row {table_row_ordinal}")
                sibling_key = (tier, parent_id)
                sibling_counts[sibling_key] = sibling_counts.get(sibling_key, 0) + 1
                sibling_ordinal = sibling_counts[sibling_key]
                segment = ("a" if tier == 1 else "b" if tier == 2 else "c") + f"{sibling_ordinal:02d}"
                path = segment if tier == 1 else f"{parent_path}.{segment}"
                node_id = f"hsk30:2025-11:l{level}:topic:{path}"
                nodes.append({
                    "id": node_id,
                    "level": level,
                    "tier": tier,
                    "levelOrdinal": tier_counts[column] + 1,
                    "siblingOrdinal": sibling_ordinal,
                    "parentId": parent_id,
                    "printedPage": printed_page,
                    "tableRowOrdinal": table_row_ordinal,
                    "columnOrdinal": column + 1,
                    "cellBoundingBox": cell_bbox(row.cells[column]),
                    "sourceHash": source_hash(value),
                })
                tier_counts[column] += 1
                current_ids[column] = node_id
                current_paths[column] = path
                for deeper in range(column + 1, 3):
                    current_ids[deeper] = None
                    current_paths[deeper] = None
    if footer_counts != official_counts:
        raise ValueError(f"Geometry topic footer mismatch at HSK {level}: {footer_counts}")
    if tier_counts != official_counts:
        raise ValueError(f"Topic cell count mismatch at HSK {level}: extracted={tier_counts}, footer={official_counts}")
    return nodes


def extract_topics(reader: PdfReader, layout_doc: fitz.Document) -> dict[str, dict]:
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
        nodes = extract_topic_nodes(layout_doc, level, *TOPIC_RANGES[level], official_counts)
        output[str(level)] = {
            "officialTierCounts": official_counts,
            "rows": rows,
            "nodes": nodes,
            "hierarchyStatus": "Tier cells and merged-cell parents are extracted from table geometry and carry across page continuations; node counts match printed official footers. Visual reconciliation and educator mapping are still pending.",
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


def extract_grammar_source_rows(layout_doc: fitz.Document) -> tuple[dict[str, list[dict]], dict[str, dict[int, int]]]:
    output: dict[str, list[dict]] = {}
    counts_by_page: dict[str, dict[int, int]] = {}
    header = ["类别", "类别名称", "细目", "语法内容"]
    for level, (start, end) in GRAMMAR_PAGES.items():
        items: list[dict] = []
        page_counts: dict[int, int] = {}
        effective_hashes: list[str | None] = [None, None, None, None]
        effective_cell_anchors: list[dict | None] = [None, None, None, None]
        level_ordinal = 0
        for printed_page in range(start, end + 1):
            page = layout_doc[printed_page + PAGE_OFFSET]
            tables = page.find_tables().tables
            if len(tables) != 1 or tables[0].col_count != 4:
                raise ValueError(f"Expected one 4-column grammar table on printed page {printed_page}; found {[table.col_count for table in tables]}")
            table = tables[0]
            page_count = 0
            for table_row_ordinal, row in enumerate(table.rows):
                values = [geometry_cell_text(page, bbox) for bbox in row.cells]
                if values == header:
                    continue
                if not any(values[2:]):
                    for column, value in enumerate(values):
                        if value:
                            effective_hashes[column] = source_hash(value)
                            effective_cell_anchors[column] = {
                                "id": f"hsk30:2025-11:l{level}:grammar:p{printed_page}:tr{table_row_ordinal:03d}:c{column + 1}",
                                "printedPage": printed_page,
                                "tableRowOrdinal": table_row_ordinal,
                                "columnOrdinal": column + 1,
                                "cellBoundingBox": cell_bbox(row.cells[column]),
                            }
                            for deeper in range(column + 1, 4):
                                effective_hashes[deeper] = None
                                effective_cell_anchors[deeper] = None
                    continue
                own_hashes = [source_hash(value) if value else None for value in values]
                for column, value in enumerate(values):
                    if value:
                        effective_hashes[column] = own_hashes[column]
                        effective_cell_anchors[column] = {
                            "id": f"hsk30:2025-11:l{level}:grammar:p{printed_page}:tr{table_row_ordinal:03d}:c{column + 1}",
                            "printedPage": printed_page,
                            "tableRowOrdinal": table_row_ordinal,
                            "columnOrdinal": column + 1,
                            "cellBoundingBox": cell_bbox(row.cells[column]),
                        }
                        for deeper in range(column + 1, 4):
                            effective_hashes[deeper] = None
                            effective_cell_anchors[deeper] = None
                level_ordinal += 1
                page_count += 1
                row_text = "\n".join(value for value in values if value)
                items.append({
                    "id": f"hsk30:2025-11:l{level}:grammar:p{printed_page}:r{page_count:03d}",
                    "level": level,
                    "ordinal": level_ordinal,
                    "printedPage": printed_page,
                    "pageRowOrdinal": page_count,
                    "tableRowOrdinal": table_row_ordinal,
                    "sourceCellHashes": own_hashes,
                    "effectiveCellHashes": effective_hashes.copy(),
                    "effectiveCellAnchors": [anchor.copy() if anchor else None for anchor in effective_cell_anchors],
                    "cellBoundingBoxes": [cell_bbox(bbox) if values[column] else None for column, bbox in enumerate(row.cells)],
                    "sourceHash": source_hash(row_text),
                })
            page_counts[printed_page] = page_count
        output[str(level)] = items
        counts_by_page[str(level)] = page_counts
    return output, counts_by_page


def extract_grammar_pages(reader: PdfReader, counts_by_page: dict[str, dict[int, int]]) -> dict[str, list[dict]]:
    output: dict[str, list[dict]] = {}
    for level, (start, end) in GRAMMAR_PAGES.items():
        pages: list[dict] = []
        for page in range(start, end + 1):
            text = printed_text(reader, page, layout=True)
            pages.append({"id": f"hsk30:l{level}:grammar:p{page}", "level": level,
                          "printedPage": page, "sourceHash": source_hash(text),
                          "nonemptyLineCount": sum(bool(line.strip()) for line in text.splitlines()),
                          "rowCount": None, "extractedSourceRowCount": counts_by_page[str(level)][page]})
        output[str(level)] = pages
    return output


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf", type=Path, help="Pinned official HSK 3.0 syllabus PDF")
    parser.add_argument("output", type=Path, help="Destination JSON path")
    args = parser.parse_args()
    source_sha256 = hashlib.sha256(args.pdf.read_bytes()).hexdigest()
    if source_sha256 != SOURCE_SHA256:
        raise ValueError(f"Pinned HSK 3.0 PDF SHA-256 mismatch: {source_sha256}")
    reader = PdfReader(str(args.pdf))
    layout_doc = fitz.open(str(args.pdf))
    if len(reader.pages) != 406 or len(layout_doc) != 406:
        raise ValueError(f"Unexpected pinned PDF page count: pypdf={len(reader.pages)}, PyMuPDF={len(layout_doc)}")
    topics = extract_topics(reader, layout_doc)
    grammar_source_rows, grammar_counts_by_page = extract_grammar_source_rows(layout_doc)
    grammar_pages = extract_grammar_pages(reader, grammar_counts_by_page)
    inventory = {
        "schemaVersion": 3,
        "edition": SOURCE_EDITION,
        "sourceUrl": SOURCE_URL,
        "sourceSha256": source_sha256,
        "printedPageConvention": "pypdf zero-based page index = printed page + 2 (the PDF's one-based page number = printed page + 3).",
        "scope": "HSK 3.0 levels 1–6 only. HSK 7–9 task section begins on printed page 45 and is excluded.",
        "normalizationVersion": NORMALIZATION_VERSION,
        "extraction": {
            "tool": f"pypdf {__import__('pypdf').__version__} plus PyMuPDF {fitz.VersionBind}",
            "taskAndVocabularyRows": "Stable IDs, printed-page locators, and SHA-256 checks of normalized source rows are retained; full source wording is not copied into this repo.",
            "topicRows": "Raw layout-line locators remain alongside geometry-derived tier-cell IDs, parent IDs, printed-page row anchors, cell bounding boxes, and normalized source hashes. Rotated watermark spans are excluded. Page-level geometry and parent continuation were visually reviewed against pp.56–71; individual cell text and educator mapping remain pending.",
            "grammarPages": "All 17 printed-page locators retain page hashes and extracted physical source-row counts. grammarSourceRows records geometry-derived row/page/cell anchors, explicit effective-cell source references with bounding boxes (including inherited cells across pages), and hashes of each source column; no table wording is copied. Page-level row geometry was visually reviewed, including headerless p399. These extraction row counts are not official grammar item counts; individual source text and educator mapping remain pending.",
            "characterRows": "Stable per-level recognition-list IDs and source-row hashes are retained, not a claim of writing proficiency.",
        },
        "levelCounts": {
            str(level): {
                "tasks": EXPECTED_TASKS[level],
                "topicsByTier": EXPECTED_TOPICS[level],
                "topicPageRows": len(topics[str(level)]["rows"]),
                "topicNodes": len(topics[str(level)]["nodes"]),
                "vocabulary": VOCAB_RANGES[level][1] - VOCAB_RANGES[level][0] + 1,
                "recognitionCharacters": EXPECTED_CHARACTERS[level],
                "grammarPages": GRAMMAR_PAGES[level][1] - GRAMMAR_PAGES[level][0] + 1,
                "grammarSourceRows": len(grammar_source_rows[str(level)]),
                "grammarItemCount": None,
            } for level in range(1, 7)
        },
        "tasks": extract_tasks(reader),
        "topics": topics,
        "vocabulary": extract_vocabulary(reader),
        "characters": extract_characters(reader),
        "grammarPages": grammar_pages,
        "grammarSourceRows": grammar_source_rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "vocabulary": len(inventory["vocabulary"]),
                      "tasks": sum(len(items) for items in inventory["tasks"].values()),
                      "characters": sum(len(items) for items in inventory["characters"].values()),
                      "topicRows": sum(len(group["rows"]) for group in inventory["topics"].values()),
                      "topicNodes": sum(len(group["nodes"]) for group in inventory["topics"].values()),
                      "grammarPages": sum(len(items) for items in inventory["grammarPages"].values()),
                      "grammarSourceRows": sum(len(items) for items in inventory["grammarSourceRows"].values())}, ensure_ascii=False))


if __name__ == "__main__":
    main()
