#!/usr/bin/env python3
"""
ClauMon Peek - Claude Code Usage Analytics
Parses local Claude Code session data and outputs JSON to public/data.json.
"""

import json
import os
import sys
from collections import defaultdict
from datetime import datetime, timezone, timedelta, date as date_type
from pathlib import Path

PRICING = {
    "claude-opus-4-6": {"input": 15.0, "output": 75.0, "cache_write": 18.75, "cache_read": 1.50},
    "claude-opus-4-20250918": {"input": 15.0, "output": 75.0, "cache_write": 18.75, "cache_read": 1.50},
    "claude-sonnet-4-6": {"input": 3.0, "output": 15.0, "cache_write": 3.75, "cache_read": 0.30},
    "claude-sonnet-4-20250514": {"input": 3.0, "output": 15.0, "cache_write": 3.75, "cache_read": 0.30},
    "claude-sonnet-4-5-20250514": {"input": 3.0, "output": 15.0, "cache_write": 3.75, "cache_read": 0.30},
    "claude-haiku-4-5-20251001": {"input": 0.80, "output": 4.0, "cache_write": 1.0, "cache_read": 0.08},
    "_default": {"input": 3.0, "output": 15.0, "cache_write": 3.75, "cache_read": 0.30},
}

def find_claude_dirs() -> list[Path]:
    """Auto-discover Claude data directories."""
    if os.environ.get("CLAUDE_DIR"):
        return [Path(os.environ["CLAUDE_DIR"])]

    home = Path.home()
    candidates = []
    # Default location
    default = home / ".claude"
    if default.is_dir() or default.is_symlink():
        candidates.append(default.resolve())
    # Scan for .claude-* variants (e.g. .claude-work, .claude-personal)
    for p in home.glob(".claude-*"):
        if p.is_dir() and (p / "projects").is_dir():
            candidates.append(p.resolve())
    # Deduplicate (symlinks may resolve to same path)
    seen = set()
    result = []
    for p in candidates:
        if p not in seen:
            seen.add(p)
            result.append(p)
    return result if result else [home / ".claude"]


CLAUDE_DIRS = find_claude_dirs()
CLAUDE_DIR = CLAUDE_DIRS[0]  # Primary for history/sessions
PROJECTS_DIR = CLAUDE_DIR / "projects"
SESSIONS_DIR = CLAUDE_DIR / "sessions"
HISTORY_FILE = CLAUDE_DIR / "history.jsonl"


def get_pricing(model: str) -> dict:
    for key in PRICING:
        if key in model:
            return PRICING[key]
    return PRICING["_default"]


def calc_cost(model: str, usage: dict) -> float:
    p = get_pricing(model)
    return (
        usage.get("input_tokens", 0) * p["input"] / 1_000_000
        + usage.get("output_tokens", 0) * p["output"] / 1_000_000
        + usage.get("cache_creation_input_tokens", 0) * p["cache_write"] / 1_000_000
        + usage.get("cache_read_input_tokens", 0) * p["cache_read"] / 1_000_000
    )


def normalize_model(model: str) -> str:
    if "opus" in model:
        return "Opus"
    if "sonnet" in model and "4-5" in model:
        return "Sonnet 4.5"
    if "sonnet" in model:
        return "Sonnet"
    if "haiku" in model:
        return "Haiku"
    if model in ("unknown", "<synthetic>", ""):
        return None
    return model


def shorten_tool(name: str) -> str:
    if name.startswith("mcp__"):
        parts = name.split("__")
        return parts[-1] if len(parts) > 1 else name
    return name


def prettify_project(name: str) -> str:
    username = Path.home().name
    name = name.replace(f"-Users-{username}-", "~/")
    parts = name.replace("-", "/").split("/")
    meaningful = [p for p in parts if len(p) > 1]
    if len(meaningful) >= 2:
        return "/".join(meaningful[-2:])
    return meaningful[-1] if meaningful else name


def parse_sessions():
    sessions = []
    session_meta = {}

    for claude_dir in CLAUDE_DIRS:
        sessions_dir = claude_dir / "sessions"
        for f in sessions_dir.glob("*.json"):
            try:
                with open(f) as fh:
                    meta = json.load(fh)
                    session_meta[meta.get("sessionId", "")] = meta
            except Exception:
                pass

    # Collect files with their source account tag
    jsonl_files = []  # list of (filepath, account_name)
    for claude_dir in CLAUDE_DIRS:
        account = claude_dir.name.replace(".claude-", "").replace(".claude", "default")
        projects_dir = claude_dir / "projects"
        for f in projects_dir.glob("*/*.jsonl"):
            jsonl_files.append((f, account))
        for f in projects_dir.glob("*/*/subagents/*.jsonl"):
            jsonl_files.append((f, account))
    total = len(jsonl_files)
    print(f"Parsing {total} session files...")

    for i, (filepath, account) in enumerate(jsonl_files):
        if i % 100 == 0:
            print(f"  {i}/{total}...", end="\r")

        # For subagent files, use the top-level project dir name (grandparent of subagents/)
        is_subagent = "subagents" in filepath.parts
        if is_subagent:
            proj_idx = filepath.parts.index("subagents") - 2
            project_name = filepath.parts[proj_idx] if proj_idx >= 0 else filepath.parent.name
        else:
            project_name = filepath.parent.name

        session = {
            "project": project_name,
            "account": account,
            "is_subagent": is_subagent,
            "session_id": filepath.stem,
            "messages": 0, "assistant_messages": 0, "user_messages": 0,
            "models": defaultdict(int),
            "input_tokens": 0, "output_tokens": 0,
            "cache_write_tokens": 0, "cache_read_tokens": 0,
            "cost": 0.0,
            "tools": defaultdict(int),
            "timestamps": [],
            "start_time": None, "end_time": None, "cwd": None,
            # per-model token tracking for model_breakdown
            "model_tokens": defaultdict(lambda: {
                "input_tokens": 0, "output_tokens": 0,
                "cache_write_tokens": 0, "cache_read_tokens": 0, "cost": 0.0,
            }),
            # user message content lengths for input_length_dist
            "user_content_lengths": [],
        }

        try:
            with open(filepath) as fh:
                for line in fh:
                    try:
                        d = json.loads(line)
                        msg_type = d.get("type")
                        if msg_type == "assistant":
                            session["assistant_messages"] += 1
                            msg = d.get("message", {})
                            model = msg.get("model", "unknown")
                            norm = normalize_model(model)
                            if norm:
                                session["models"][norm] += 1
                            usage = msg.get("usage", {})
                            inp = usage.get("input_tokens", 0)
                            out = usage.get("output_tokens", 0)
                            cw = usage.get("cache_creation_input_tokens", 0)
                            cr = usage.get("cache_read_input_tokens", 0)
                            session["input_tokens"] += inp
                            session["output_tokens"] += out
                            session["cache_write_tokens"] += cw
                            session["cache_read_tokens"] += cr
                            cost = calc_cost(model, usage)
                            session["cost"] += cost
                            if norm:
                                mt = session["model_tokens"][norm]
                                mt["input_tokens"] += inp
                                mt["output_tokens"] += out
                                mt["cache_write_tokens"] += cw
                                mt["cache_read_tokens"] += cr
                                mt["cost"] += cost
                            for block in msg.get("content", []):
                                if isinstance(block, dict) and block.get("type") == "tool_use":
                                    session["tools"][block.get("name", "unknown")] += 1
                            ts = d.get("timestamp")
                            if ts:
                                session["timestamps"].append(ts)
                            if not session["cwd"]:
                                session["cwd"] = d.get("cwd")
                        elif msg_type == "user":
                            session["user_messages"] += 1
                            ts = d.get("timestamp")
                            if ts:
                                session["timestamps"].append(ts)
                            # Collect user message content lengths
                            msg = d.get("message", {})
                            content = msg.get("content", "")
                            if isinstance(content, str):
                                session["user_content_lengths"].append(len(content))
                            elif isinstance(content, list):
                                for block in content:
                                    if isinstance(block, dict) and block.get("type") == "text":
                                        session["user_content_lengths"].append(len(block.get("text", "")))
                    except json.JSONDecodeError:
                        pass
        except Exception:
            continue

        session["messages"] = session["assistant_messages"] + session["user_messages"]
        if session["timestamps"]:
            session["timestamps"].sort()
            session["start_time"] = session["timestamps"][0]
            session["end_time"] = session["timestamps"][-1]

        meta = session_meta.get(session["session_id"], {})
        if meta:
            if not session["cwd"]:
                session["cwd"] = meta.get("cwd")
            if not session["start_time"] and meta.get("startedAt"):
                session["start_time"] = datetime.fromtimestamp(
                    meta["startedAt"] / 1000, tz=timezone.utc
                ).isoformat()

        if session["messages"] > 0:
            sessions.append(session)

    print(f"\nParsed {len(sessions)} sessions with data.")
    return sessions


def compute_command_frequency() -> list:
    """Parse history.jsonl and count slash command frequencies."""
    freq = defaultdict(int)
    if not HISTORY_FILE.exists():
        return []
    try:
        with open(HISTORY_FILE) as fh:
            for line in fh:
                try:
                    d = json.loads(line)
                    display = d.get("display", "")
                    if display.startswith("/"):
                        # Extract first word (command name without leading slash)
                        cmd = display[1:].split()[0] if display[1:].strip() else ""
                        if cmd:
                            freq[cmd] += 1
                except json.JSONDecodeError:
                    pass
    except Exception:
        pass
    return sorted(freq.items(), key=lambda x: x[1], reverse=True)[:15]


def compute_input_length_dist(sessions) -> dict:
    """Bucket user message content lengths."""
    dist = {"0-50": 0, "51-200": 0, "201-500": 0, "501-1000": 0, "1000+": 0}
    for s in sessions:
        for length in s.get("user_content_lengths", []):
            if length <= 50:
                dist["0-50"] += 1
            elif length <= 200:
                dist["51-200"] += 1
            elif length <= 500:
                dist["201-500"] += 1
            elif length <= 1000:
                dist["501-1000"] += 1
            else:
                dist["1000+"] += 1
    return dist


def compute_concurrent_sessions(sessions) -> dict:
    """
    For sessions with start/end times, compute minutes where N+ sessions overlap.
    Returns {"x2": int, "x3": int, "x4": int, "x5": int} in minutes.
    """
    intervals = []
    for s in sessions:
        if s.get("is_subagent"):
            continue  # Exclude subagent sessions from concurrent calculation
        if s["start_time"] and s["end_time"] and s["start_time"] != s["end_time"]:
            try:
                start = datetime.fromisoformat(s["start_time"].replace("Z", "+00:00"))
                end = datetime.fromisoformat(s["end_time"].replace("Z", "+00:00"))
                if start < end:
                    intervals.append((start, end))
            except Exception:
                pass

    if not intervals:
        return {"x2": 0, "x3": 0, "x4": 0, "x5": 0}

    # Collect all boundary points
    points = sorted(set(
        [t for iv in intervals for t in iv]
    ))

    x2 = x3 = x4 = x5 = 0.0
    for i in range(len(points) - 1):
        seg_start = points[i]
        seg_end = points[i + 1]
        # Count how many intervals cover this segment
        mid = seg_start + (seg_end - seg_start) / 2
        count = sum(1 for (a, b) in intervals if a <= mid < b)
        minutes = (seg_end - seg_start).total_seconds() / 60
        if count >= 2:
            x2 += minutes
        if count >= 3:
            x3 += minutes
        if count >= 4:
            x4 += minutes
        if count >= 5:
            x5 += minutes

    return {
        "x2": int(round(x2)),
        "x3": int(round(x3)),
        "x4": int(round(x4)),
        "x5": int(round(x5)),
    }


def compute_weekday_avg(daily: dict) -> list:
    """Group daily data by weekday and compute averages."""
    day_names = ["월", "화", "수", "목", "금", "토", "일"]
    # weekday -> list of (sessions, messages, cost)
    buckets = defaultdict(list)
    for date_str, d in daily.items():
        try:
            dt = datetime.strptime(date_str, "%Y-%m-%d")
            wd = dt.weekday()  # 0=Mon..6=Sun
            buckets[wd].append((d["sessions"], d["messages"], d["cost"]))
        except Exception:
            pass

    result = []
    for wd in range(7):
        entries = buckets.get(wd, [])
        if entries:
            avg_sessions = sum(e[0] for e in entries) / len(entries)
            avg_messages = sum(e[1] for e in entries) / len(entries)
            avg_cost = sum(e[2] for e in entries) / len(entries)
        else:
            avg_sessions = avg_messages = avg_cost = 0.0
        result.append({
            "day": day_names[wd],
            "sessions": round(avg_sessions, 1),
            "messages": round(avg_messages, 1),
            "cost": round(avg_cost, 2),
        })
    return result


def compute_period_comparison(daily: dict) -> dict:
    """Compute current vs previous period totals for 1W and 1M."""
    today = datetime.now(timezone.utc).date()

    def sum_period(start_date, end_date):
        sessions = messages = cost = 0
        d = start_date
        while d < end_date:
            key = d.strftime("%Y-%m-%d")
            if key in daily:
                entry = daily[key]
                sessions += entry.get("sessions", 0)
                messages += entry.get("messages", 0)
                cost += entry.get("cost", 0.0)
            d += timedelta(days=1)
        return sessions, messages, cost

    def pct_change(current, previous):
        if previous == 0:
            return None
        return round((current - previous) / previous * 100, 1)

    result = {}
    for label, days in [("1w", 7), ("1m", 30)]:
        curr_end = today
        curr_start = today - timedelta(days=days)
        prev_end = curr_start
        prev_start = curr_start - timedelta(days=days)

        cs, cm, cc = sum_period(curr_start, curr_end)
        ps, pm, pc = sum_period(prev_start, prev_end)

        result[label] = {
            "sessions": {"current": cs, "previous": ps, "pct": pct_change(cs, ps)},
            "messages": {"current": cm, "previous": pm, "pct": pct_change(cm, pm)},
            "cost": {"current": round(cc, 2), "previous": round(pc, 2), "pct": pct_change(cc, pc)},
        }

    return result


def compute_weekly_timeline(sessions) -> list:
    """Return sessions in the last 7 days with start/end hours for Gantt chart."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(days=7)
    result = []

    for s in sessions:
        if not s["start_time"] or not s["end_time"]:
            continue
        try:
            start = datetime.fromisoformat(s["start_time"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(s["end_time"].replace("Z", "+00:00"))
            if start < cutoff:
                continue
            date_str = start.strftime("%Y-%m-%d")
            start_hour = start.hour + start.minute / 60
            end_hour = end.hour + end.minute / 60
            # Clamp same-minute sessions to +0.1 duration for visibility
            if end_hour <= start_hour:
                end_hour = start_hour + 0.1
            result.append({
                "date": date_str,
                "start_hour": round(start_hour, 2),
                "end_hour": round(end_hour, 2),
                "project": prettify_project(s["project"]),
                "concurrent": 1,  # filled in below
            })
        except Exception:
            pass

    # Mark concurrent count per entry
    for i, entry in enumerate(result):
        count = 1
        for j, other in enumerate(result):
            if i == j:
                continue
            if entry["date"] == other["date"]:
                # Overlap check on hours
                if entry["start_hour"] < other["end_hour"] and entry["end_hour"] > other["start_hour"]:
                    count += 1
        entry["concurrent"] = count

    return sorted(result, key=lambda x: (x["date"], x["start_hour"]))


def compute_model_breakdown(sessions) -> list:
    """Aggregate per-model token and cost totals."""
    agg = defaultdict(lambda: {
        "input_tokens": 0, "output_tokens": 0,
        "cache_read": 0, "cache_write": 0, "cost": 0.0,
    })
    for s in sessions:
        for model, mt in s.get("model_tokens", {}).items():
            a = agg[model]
            a["input_tokens"] += mt["input_tokens"]
            a["output_tokens"] += mt["output_tokens"]
            a["cache_read"] += mt["cache_read_tokens"]
            a["cache_write"] += mt["cache_write_tokens"]
            a["cost"] += mt["cost"]

    result = []
    for model, a in agg.items():
        result.append({
            "model": model,
            "input_tokens": a["input_tokens"],
            "output_tokens": a["output_tokens"],
            "cache_read": a["cache_read"],
            "cache_write": a["cache_write"],
            "cost": round(a["cost"], 2),
        })
    return sorted(result, key=lambda x: x["cost"], reverse=True)


def compute_highlights(daily: dict, top_sessions: list, heatmap: list, cache_savings: float, total_cost: float, model_usage: dict) -> dict:
    """Compute highlight statistics for summary cards."""
    day_names = ["월", "화", "수", "목", "금", "토", "일"]

    # most_expensive_day
    most_expensive_day = {"date": "", "cost": 0.0}
    for date_str, d in daily.items():
        if d["cost"] > most_expensive_day["cost"]:
            most_expensive_day = {"date": date_str, "cost": d["cost"]}

    # longest_session: reuse top_sessions[0]
    longest_session = {}
    if top_sessions:
        s = top_sessions[0]
        longest_session = {
            "duration_min": s["duration_min"],
            "project": s["project"],
            "date": s["date"],
        }

    # busiest_hour: find max in heatmap
    busiest_hour = {"weekday": "", "hour": 0, "count": 0}
    for wd in range(7):
        for hr in range(24):
            if heatmap[wd][hr] > busiest_hour["count"]:
                busiest_hour = {"weekday": day_names[wd], "hour": hr, "count": heatmap[wd][hr]}

    # cache_vs_cost
    cache_vs_cost = cache_savings > total_cost

    # favorite_model: highest count model
    favorite_model = {"model": "", "pct": 0.0}
    if model_usage:
        total_count = sum(v["count"] for v in model_usage.values())
        best_model = max(model_usage.items(), key=lambda x: x[1]["count"])
        pct = round(best_model[1]["count"] / max(total_count, 1) * 100, 1)
        favorite_model = {"model": best_model[0], "pct": pct}

    return {
        "most_expensive_day": most_expensive_day,
        "longest_session": longest_session,
        "busiest_hour": busiest_hour,
        "cache_vs_cost": cache_vs_cost,
        "favorite_model": favorite_model,
    }


def compute_streak(dates: list) -> dict:
    """Calculate current and longest consecutive day streaks."""
    if not dates:
        return {"current": 0, "longest": 0, "longest_start": "", "longest_end": ""}

    parsed = sorted(set(
        datetime.strptime(d, "%Y-%m-%d").date() for d in dates
    ))

    today_str = datetime.now().strftime("%Y-%m-%d")
    today = datetime.strptime(today_str, "%Y-%m-%d").date()
    yesterday = today - timedelta(days=1)

    # Find longest streak
    longest = 1
    longest_start = parsed[0]
    longest_end = parsed[0]
    cur_start = parsed[0]
    cur_len = 1

    for i in range(1, len(parsed)):
        if (parsed[i] - parsed[i - 1]).days == 1:
            cur_len += 1
            if cur_len > longest:
                longest = cur_len
                longest_start = cur_start
                longest_end = parsed[i]
        else:
            cur_start = parsed[i]
            cur_len = 1

    # Find current streak (ending today or yesterday)
    current = 0
    last = parsed[-1]
    if last == today or last == yesterday:
        current = 1
        for i in range(len(parsed) - 2, -1, -1):
            if (parsed[i + 1] - parsed[i]).days == 1:
                current += 1
            else:
                break

    return {
        "current": current,
        "longest": longest,
        "longest_start": longest_start.strftime("%Y-%m-%d"),
        "longest_end": longest_end.strftime("%Y-%m-%d"),
    }


def compute_analytics(sessions):
    daily = defaultdict(lambda: {
        "cost": 0.0, "input_tokens": 0, "output_tokens": 0,
        "cache_write_tokens": 0, "cache_read_tokens": 0,
        "sessions": 0, "messages": 0, "tools": 0,
        "models": defaultdict(int),
    })

    total_cost = 0.0
    total_input = 0
    total_output = 0
    total_cache_write = 0
    total_cache_read = 0
    total_messages = 0
    total_tools = 0
    model_usage = defaultdict(lambda: {"count": 0, "cost": 0.0})
    tool_usage = defaultdict(int)
    project_stats = defaultdict(lambda: {"sessions": 0, "cost": 0.0, "tokens": 0, "messages": 0})
    session_durations = []
    heatmap = [[0] * 24 for _ in range(7)]

    for s in sessions:
        total_cost += s["cost"]
        total_input += s["input_tokens"]
        total_output += s["output_tokens"]
        total_cache_write += s["cache_write_tokens"]
        total_cache_read += s["cache_read_tokens"]
        total_messages += s["messages"]
        tool_count = sum(s["tools"].values())
        total_tools += tool_count

        for tool, count in s["tools"].items():
            tool_usage[shorten_tool(tool)] += count

        for model, count in s["models"].items():
            model_usage[model]["count"] += count
            model_usage[model]["cost"] += s["cost"]

        proj_name = prettify_project(s["project"])
        project_stats[proj_name]["sessions"] += 1
        project_stats[proj_name]["cost"] += s["cost"]
        project_stats[proj_name]["tokens"] += s["input_tokens"] + s["output_tokens"]
        project_stats[proj_name]["messages"] += s["messages"]

        if s["start_time"]:
            try:
                dt = datetime.fromisoformat(s["start_time"].replace("Z", "+00:00"))
                date_str = dt.strftime("%Y-%m-%d")
                d = daily[date_str]
                d["cost"] += s["cost"]
                d["input_tokens"] += s["input_tokens"]
                d["output_tokens"] += s["output_tokens"]
                d["cache_write_tokens"] += s["cache_write_tokens"]
                d["cache_read_tokens"] += s["cache_read_tokens"]
                d["sessions"] += 1
                d["messages"] += s["messages"]
                d["tools"] += tool_count
                for model, count in s["models"].items():
                    d["models"][model] += count
                heatmap[dt.weekday()][dt.hour] += 1
            except Exception:
                pass

        if s["start_time"] and s["end_time"] and s["start_time"] != s["end_time"]:
            try:
                start = datetime.fromisoformat(s["start_time"].replace("Z", "+00:00"))
                end = datetime.fromisoformat(s["end_time"].replace("Z", "+00:00"))
                dur = (end - start).total_seconds() / 60
                if 0 < dur < 1440:
                    session_durations.append({
                        "duration_min": round(dur, 1),
                        "project": prettify_project(s["project"]),
                        "date": start.strftime("%Y-%m-%d %H:%M"),
                        "cost": round(s["cost"], 2),
                        "messages": s["messages"],
                    })
            except Exception:
                pass

    sorted_dates = sorted(daily.keys())
    durations_list = [d["duration_min"] for d in session_durations]
    avg_dur = sum(durations_list) / len(durations_list) if durations_list else 0
    total_dur = sum(durations_list)

    # Convert daily to plain dict (no defaultdict, round cost)
    daily_plain = {}
    daily_models_plain = {}
    for date_str in sorted_dates:
        d = daily[date_str]
        daily_plain[date_str] = {
            "cost": round(d["cost"], 2),
            "input_tokens": d["input_tokens"],
            "output_tokens": d["output_tokens"],
            "cache_write_tokens": d["cache_write_tokens"],
            "cache_read_tokens": d["cache_read_tokens"],
            "sessions": d["sessions"],
            "messages": d["messages"],
            "tools": d["tools"],
            "cost_per_message": round(d["cost"] / max(d["messages"], 1), 4),
        }
        daily_models_plain[date_str] = dict(d["models"])

    # New statistics
    command_frequency = compute_command_frequency()
    input_length_dist = compute_input_length_dist(sessions)
    concurrent = compute_concurrent_sessions(sessions)
    weekday_avg = compute_weekday_avg(daily_plain)
    period_comparison = compute_period_comparison(daily_plain)
    weekly_timeline = compute_weekly_timeline(sessions)
    model_breakdown = compute_model_breakdown(sessions)

    top_sessions_list = sorted(session_durations, key=lambda x: x["duration_min"], reverse=True)[:5]
    cache_savings = round(total_cache_read * (3.0 - 0.30) / 1_000_000, 1)

    highlights = compute_highlights(
        daily_plain, top_sessions_list, heatmap,
        cache_savings, round(total_cost, 2), dict(model_usage),
    )
    streak = compute_streak(sorted_dates)

    return {
        "total_cost": round(total_cost, 2),
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "total_cache_write_tokens": total_cache_write,
        "total_cache_read_tokens": total_cache_read,
        "total_sessions": len(sessions),
        "total_messages": total_messages,
        "total_tools": total_tools,
        "model_usage": {k: {"count": v["count"], "cost": round(v["cost"], 2)} for k, v in model_usage.items()},
        "tool_usage": [[k, v] for k, v in sorted(tool_usage.items(), key=lambda x: x[1], reverse=True)[:15]],
        "project_stats": [
            [k, {kk: round(vv, 2) if isinstance(vv, float) else vv for kk, vv in v.items()}]
            for k, v in sorted(project_stats.items(), key=lambda x: x[1]["cost"], reverse=True)[:12]
        ],
        "daily": daily_plain,
        "daily_models": daily_models_plain,
        "heatmap": heatmap,
        "avg_duration_min": round(avg_dur, 1),
        "total_duration_min": round(total_dur, 1),
        "session_count_with_duration": len(session_durations),
        "top_sessions": top_sessions_list,
        "dates": sorted_dates,
        "cache_hit_rate": round(
            total_cache_read / max(total_cache_read + total_cache_write, 1) * 100, 1
        ),
        "cache_savings": cache_savings,
        # New statistics
        "command_frequency": command_frequency,
        "input_length_dist": input_length_dist,
        "concurrent": concurrent,
        "weekday_avg": weekday_avg,
        "period_comparison": period_comparison,
        "weekly_timeline": weekly_timeline,
        "model_breakdown": model_breakdown,
        "highlights": highlights,
        "streak": streak,
    }


def main():
    print("ClauMon Peek - Claude Code Analytics")
    print("=" * 40)
    for d in CLAUDE_DIRS:
        print(f"  Data: {d}")
    if len(CLAUDE_DIRS) > 1:
        print(f"  ({len(CLAUDE_DIRS)} directories detected)")

    sessions = parse_sessions()
    if not sessions:
        print("No session data found.")
        sys.exit(1)

    # Compute combined analytics
    combined = compute_analytics(sessions)

    # Compute per-account analytics
    accounts = {}
    account_names = sorted(set(s["account"] for s in sessions))
    if len(account_names) > 1:
        for acc in account_names:
            acc_sessions = [s for s in sessions if s["account"] == acc]
            if acc_sessions:
                accounts[acc] = compute_analytics(acc_sessions)
                print(f"  Account '{acc}': {len(acc_sessions)} sessions, ${accounts[acc]['total_cost']:.2f}")

    # Build output: combined data + accounts list + per-account data
    output = combined
    output["accounts"] = account_names if len(account_names) > 1 else []
    output["account_data"] = accounts

    output_dir = Path(__file__).parent / "public"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "data.json"

    with open(output_path, "w") as f:
        json.dump(output, f, ensure_ascii=False)

    print(f"\nOutput: {output_path}")
    print(f"  Sessions: {combined['total_sessions']}")
    print(f"  Cost: ${combined['total_cost']}")
    print(f"  Accounts: {account_names}")

    with open(output_path) as f:
        json.load(f)
    print("  JSON validation: OK")


if __name__ == "__main__":
    main()
