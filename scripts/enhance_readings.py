#!/usr/bin/env python3
"""Extend the 64-hexagram corpus with grounded, composable deep-reading fields.

The migration preserves every classic quotation and calculated fact.  New copy is
derived only from the existing modern fields and trigram identities.
"""

from __future__ import annotations

import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "readings.json"
BUNDLE_PATH = ROOT / "data" / "readings.bundle.js"

TRIGRAM_ROLES = {
    1: ("乾", "主动、原则与承担"),
    2: ("兑", "交流、回应与协商"),
    3: ("离", "辨识、表达与显明"),
    4: ("震", "启动、震动与迅速反应"),
    5: ("巽", "渗透、调整与持续影响"),
    6: ("坎", "风险、试探与信息缺口"),
    7: ("艮", "边界、停止与重新定位"),
    8: ("坤", "承载、配合与现实基础"),
}


def tidy(text: str) -> str:
    value = re.sub(r"\s+", "", str(text or "")).strip("。；， ")
    value = value.replace("可先先", "可先").replace("先先", "先")
    value = re.sub(r"^就.{1,8}第\d爻而言[，,]", "", value)
    return value


def first_sentence(text: str, limit: int = 78) -> str:
    value = tidy(text)
    value = re.split(r"(?<=[。！？；])", value, maxsplit=1)[0].strip("。；")
    value = value.split("，这是", 1)[0]
    if len(value) > limit:
        candidates = [part for part in re.split(r"[，；]", value) if part]
        kept = ""
        for part in candidates:
            if kept and len(kept) + len(part) + 1 > limit:
                break
            kept = f"{kept}，{part}" if kept else part
        value = kept or value[:limit]
    return value.strip("。；，")


def quoted_action(text: str) -> str:
    value = tidy(text)
    quoted = re.findall(r"[“\"]([^”\"]{6,48})[”\"]", value)
    if quoted:
        return tidy(quoted[0])
    value = re.sub(r"^.{1,8}第\d爻可", "", value)
    value = value.split("，同时落实", 1)[0]
    value = value.split("，用结果", 1)[0]
    return first_sentence(value, 54)


def warning_core(text: str) -> str:
    value = tidy(text)
    prefixes = (
        "值得警惕的是", "这一位的风险不在快慢本身，而在", "若沿用旧惯性，可能出现",
        "需要警惕的是", "尤其要避免", "先避开",
    )
    for prefix in prefixes:
        if value.startswith(prefix):
            value = value[len(prefix):]
            break
    return first_sentence(value, 64)


def signal_summary(label: str) -> str:
    return {
        "暂停": "现实条件尚不足以支持扩大动作",
        "有利": "关键条件开始出现可利用的现实回应",
        "守正": "做法、位置与责任边界能够保持一致",
        "修正": "原有做法显出明确代价，需要及时调整",
        "观察": "已有信号仍不足以形成单一结论",
        "顺势": "现实反馈与当前方向开始相互支持",
        "谨慎": "信息缺口或可见代价正在扩大",
    }.get(label, "现实中出现了可以核对的新反馈")


def ensure_period(text: str) -> str:
    value = tidy(text)
    return f"{value}。" if value else ""


def enhance_hexagram(reading: dict) -> None:
    modern = reading["modern"]
    strength = first_sentence(modern["strengths"][0], 48)
    tension = first_sentence(modern["tensions"][0], 52)
    risk = first_sentence(modern["risks"][0], 48)
    avoid = first_sentence(modern["avoid"][0], 48)
    action = first_sentence(modern["actions"][0], 52)
    question = first_sentence(modern["questions"][0], 56)
    lower_name, lower_role = TRIGRAM_ROLES[reading["lower_trigram"]]
    upper_name, upper_role = TRIGRAM_ROLES[reading["upper_trigram"]]

    modern["extended"] = {
        "situation": {
            "direct": f"眼下的重点是{first_sentence(modern['core'], 64)}。",
            "support": f"已经可以利用的是：{strength}。",
            "constraint": f"仍需核实的是：{tension}。",
        },
        "relationship": {
            "inner": f"下卦{lower_name}，内部动力偏向{lower_role}。",
            "outer": f"上卦{upper_name}，外部处境更受{upper_role}影响。",
            "interaction": f"内部想以“{lower_role}”回应外部的“{upper_role}”；两边能否对接，要看“{tension}”是否得到确认。",
            "boundary": "这里只描述互动结构，不据此断定他人的真实想法。",
        },
        "opportunity": {
            "condition": f"当“{strength}”能够转化为真实回应、资源或权限时，机会才算出现。",
            "evidence": f"先用“{action}”取得一次可核对的反馈。",
        },
        "risk": {
            "trigger": f"如果开始出现“{avoid}”，风险会被放大。",
            "effect": f"最需要防止的是：{risk}。",
        },
        "paths": {
            "ready": f"如果关键条件得到确认，可以继续“{action}”，但仍以小步反馈决定是否扩大。",
            "not_ready": f"如果“{tension}”仍无证据支持，先停止加码，回到事实核对与边界澄清。",
        },
        "validation": {
            "do": action,
            "observe": question.rstrip("？?") + "？",
            "continue_if": f"出现与“{strength}”一致的现实反馈，而且新增代价仍可承受。",
            "pause_if": f"出现“{avoid}”或“{risk}”的迹象。",
        },
    }


def enhance_line(reading: dict, number: int, line: dict) -> None:
    modern = line["modern"]
    situation = first_sentence(modern["situation"], 74)
    tension = first_sentence(modern["tension"], 78)
    warning = warning_core(modern["warning"])
    advice = quoted_action(modern["advice"][number % len(modern["advice"])])
    signal = modern.get("signal") or {"label": "观察", "meaning": "先核实现实条件"}
    signal_meaning = signal_summary(signal.get("label", "观察"))

    modern["situation"] = ensure_period(situation)
    modern["tension"] = ensure_period(tension)
    modern["warning"] = ensure_period(warning)
    modern["advice"] = list(dict.fromkeys(ensure_period(quoted_action(item)) for item in modern.get("advice", []) if item))
    modern["extended"] = {
        "trigger": {
            "label": signal.get("label", "观察"),
            "observe": f"完成“{advice}”后，观察是否出现“{signal_meaning}”的现实反馈。",
            "threshold": f"只有当现实中出现与“{advice}”相关的反馈，才把它视为局面开始转向。",
        },
        "decision": {
            "continue_if": f"若反馈支持“{advice}”，可以保持小步推进。",
            "pause_if": f"若出现“{warning}”，先暂停扩大投入。",
        },
        "action": {
            "do": advice,
            "review": f"完成后记录{reading['name']}{line['title']}所指环节的事实变化，不用一次结果替代长期判断。",
        },
    }

    variants = (
        f"{situation} 当前拉扯在于：{tension} 当{signal_meaning}时，变化才有现实依据。先做“{advice}”；若出现“{warning}”，就暂停扩大动作。",
        f"这一爻把变化落在具体环节：{situation} {signal_meaning}，是接下来值得核对的信号。完成“{advice}”后再看反馈；同时留意{warning}。",
        f"局面正在显出边界：{situation} {tension} 可以用“{advice}”做一次验证；若{warning}，行动应当收束。",
    )
    line["interpretation"] = variants[(reading["id"] + number) % len(variants)]


def validate(readings: list[dict]) -> None:
    if len(readings) != 64:
        raise ValueError(f"expected 64 hexagrams, found {len(readings)}")
    line_count = 0
    for reading in readings:
        if "extended" not in reading.get("modern", {}):
            raise ValueError(f"missing hexagram extension: {reading['name']}")
        for number in range(1, 7):
            line = reading["lines"][str(number)]
            line_count += 1
            if not line.get("classic") or "extended" not in line.get("modern", {}):
                raise ValueError(f"missing line fact or extension: {reading['name']} {number}")
    if line_count != 384:
        raise ValueError(f"expected 384 lines, found {line_count}")


def main() -> None:
    readings = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    classic_facts = {
        (reading["id"], number): reading["lines"][str(number)]["classic"]
        for reading in readings
        for number in range(1, 7)
    }
    for reading in readings:
        enhance_hexagram(reading)
        for number in range(1, 7):
            enhance_line(reading, number, reading["lines"][str(number)])
    validate(readings)
    for reading in readings:
        for number in range(1, 7):
            if reading["lines"][str(number)]["classic"] != classic_facts[(reading["id"], number)]:
                raise ValueError(f"classic quotation changed: {reading['name']} {number}")
    JSON_PATH.write_text(json.dumps(readings, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    compact = json.dumps(readings, ensure_ascii=False, separators=(",", ":"))
    BUNDLE_PATH.write_text(f"window.__YIJING_READINGS__={compact};\n", encoding="utf-8")
    print(json.dumps({"hexagrams": len(readings), "lines": 384, "classic_facts_preserved": True}, ensure_ascii=False))


if __name__ == "__main__":
    main()
