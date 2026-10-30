"""Source-free regression tests for task extraction and cross-page wraps.

Run with the pinned dependencies from scripts/requirements-hsk30-inventory.txt:
    python hsk-story/tests/hsk30-extractor.test.py
"""
from __future__ import annotations

import hashlib
import importlib.util
import sys
import unittest
from pathlib import Path


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "extract-hsk30-inventory.py"
SPEC = importlib.util.spec_from_file_location("extract_hsk30_inventory", SCRIPT)
EXTRACTOR = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
sys.modules[SPEC.name] = EXTRACTOR
SPEC.loader.exec_module(EXTRACTOR)


class FakePage:
    def __init__(self) -> None:
        self.text = ""

    def extract_text(self, extraction_mode: str = "plain") -> str:
        return self.text


class FakeReader:
    def __init__(self) -> None:
        self.pages = [FakePage() for _ in range(406)]

    def add(self, printed_page: int, lines: list[str]) -> None:
        page = self.pages[printed_page + EXTRACTOR.PAGE_OFFSET]
        page.text = "\n".join(filter(None, [page.text, *lines]))


def chinese_ordinal(value: int) -> str:
    digits = {1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六", 7: "七", 8: "八", 9: "九"}
    if value <= 9:
        return digits[value]
    if value == 10:
        return "十"
    tens, units = divmod(value, 10)
    return ("十" if tens == 1 else digits[tens] + "十") + (digits[units] if units else "")


def fixture_reader() -> FakeReader:
    reader = FakeReader()
    for level, (start, _end) in EXTRACTOR.TASK_RANGES.items():
        count = EXTRACTOR.EXPECTED_TASKS[level]
        if level == 1:
            reader.add(2, [line for number in range(1, 8) for line in (
                f"{chinese_ordinal(number)}、普通任务{number}", " 普通要求"
            )])
            reader.add(3, ["八、上学问候", " 到校先和老师问好。"])
            reader.add(4, ["不舒服时告诉老师。", *[
                line for number in range(9, count + 1) for line in (
                    f"{chinese_ordinal(number)}、普通任务{number}", " 普通要求"
                )
            ]])
        elif level == 6:
            reader.add(start, [line for number in range(1, count) for line in (
                f"{chinese_ordinal(number)}、普通任务{number}", " 普通要求"
            )])
            reader.add(43, ["二十四、读懂文章", " 先读懂文章内容，"])
            reader.add(44, ["再用自己的话说一遍。"])
        else:
            reader.add(start, [line for number in range(1, count + 1) for line in (
                f"{chinese_ordinal(number)}、普通任务{number}", " 普通要求"
            )])
    return reader


def normalized_hash(title: str, requirement: str) -> str:
    normalized = lambda value: "".join(value.split())
    return hashlib.sha256(f"{normalized(title)}\n{normalized(requirement)}".encode("utf-8")).hexdigest()


class TaskExtractorWrapTests(unittest.TestCase):
    def test_page_break_continuations_stay_with_the_active_bullet(self) -> None:
        tasks = EXTRACTOR.extract_tasks(fixture_reader())

        self.assertEqual([len(tasks[str(level)]) for level in range(1, 7)], [15, 17, 22, 30, 28, 24])

        hsk1 = tasks["1"][7]
        self.assertEqual((hsk1["id"], hsk1["printedPage"], hsk1["requirementCount"]),
                         ("hsk30:l1:task:008", 3, 1))
        self.assertEqual(hsk1["sourceHash"], normalized_hash(
            "上学问候", "到校先和老师问好。不舒服时告诉老师。"
        ))

        hsk6 = tasks["6"][23]
        self.assertEqual((hsk6["id"], hsk6["printedPage"], hsk6["requirementCount"]),
                         ("hsk30:l6:task:024", 43, 1))
        self.assertEqual(hsk6["sourceHash"], normalized_hash(
            "读懂文章", "先读懂文章内容，再用自己的话说一遍。"
        ))


if __name__ == "__main__":
    unittest.main()
