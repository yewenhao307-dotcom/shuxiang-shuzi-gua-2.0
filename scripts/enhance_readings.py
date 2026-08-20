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
        "止损": "风险已经露头，需要先缩小暴露面",
        "通达": "眼前阻力较少，但承载力仍要跟上",
        "可行": "已有可用条件，下一步在于把它落实",
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
            "direct": ensure_period(first_sentence(modern['core'], 64)),
            "support": ensure_period(strength),
            "constraint": ensure_period(tension),
        },
        "relationship": {
            "inner": f"下卦{lower_name}，内部动力偏向{lower_role}。",
            "outer": f"上卦{upper_name}，外部处境更受{upper_role}影响。",
            "interaction": f"内部偏向{lower_role}，外部则更受{upper_role}影响；两者相接时，{tension}。",
            "boundary": "这里只描述互动结构，不据此断定他人的真实想法。",
        },
        "opportunity": {
            "condition": f"当“{strength}”能够转化为真实回应、资源或权限时，机会才算出现。",
            "evidence": f"先做一遍“{action}”，看现实如何回应。",
        },
        "risk": {
            "trigger": f"如果开始出现“{avoid}”，风险会被放大。",
            "effect": f"最需要防止的是：{risk}。",
        },
        "paths": {
            "ready": f"条件若已落地，可以继续“{action}”，但不必一下铺开。",
            "not_ready": f"若{tension}仍悬而未决，先停在这里，把事实和边界问清。",
        },
        "validation": {
            "do": action,
            "observe": question.rstrip("？?") + "？",
            "continue_if": f"{strength}不只停在设想里，新增代价也仍可承受。",
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
    observe_frames = (
        f"接下来留意：{signal_meaning}。",
        f"先看现实里是否出现这样的迹象：{signal_meaning}。",
        f"判断有没有变化，关键看{signal_meaning}。",
    )
    threshold_frames = (
        f"“{advice}”做过以后，再比较前后的差别。",
        f"若没有新的事实出现，就不急着把它解释成转机。",
        f"这一步能带来可核对的变化，才算条件开始松动。",
    )
    modern["extended"] = {
        "trigger": {
            "label": signal.get("label", "观察"),
            "observe": observe_frames[(reading["id"] + number) % len(observe_frames)],
            "threshold": threshold_frames[(reading["id"] * 2 + number) % len(threshold_frames)],
        },
        "decision": {
            "continue_if": f"若“{advice}”确实带来改善，可以沿这个方向再走一步。",
            "pause_if": f"一旦出现“{warning}”，就先停下来复核。",
        },
        "action": {
            "do": advice,
            "review": f"做完后记下前后变化，不用一次结果代替长期判断。",
        },
    }

    situation_sentence = ensure_period(situation)
    tension_sentence = ensure_period(tension)
    warning_sentence = ensure_period(warning)
    advice_sentence = ensure_period(advice)
    variants = (
        f"{situation_sentence}{tension_sentence}眼下可先“{advice}”。{warning_sentence}",
        f"{situation_sentence}{signal_meaning}，是接下来要看的信号。{advice_sentence}{warning_sentence}",
        f"{situation_sentence}{warning_sentence}不妨从“{advice}”开始，再看局面有没有实质变化。",
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
