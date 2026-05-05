"""Carga y persistencia de datos de prueba desde archivos JSON."""
from __future__ import annotations

import json
from pathlib import Path
from threading import Lock
from typing import Any, Callable

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

_locks: dict[str, Lock] = {
    "buyer_notifications": Lock(),
    "seller_notifications": Lock(),
    "products": Lock(),
    "product_reservations": Lock(),
    "quotes": Lock(),
}


def _file(name: str) -> Path:
    return DATA_DIR / f"{name}.json"


def load(name: str) -> list[dict[str, Any]]:
    path = _file(name)
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def save(name: str, items: list[dict[str, Any]]) -> None:
    path = _file(name)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(items, f, indent=2, ensure_ascii=False)


def find_by_field(name: str, field: str, value: str) -> dict[str, Any] | None:
    for item in load(name):
        if item.get(field) == value:
            return item
    return None


def filter_by_field(name: str, field: str, value: str) -> list[dict[str, Any]]:
    return [item for item in load(name) if item.get(field) == value]


def find_first_matching(
    name: str, predicate: Callable[[dict[str, Any]], bool]
) -> dict[str, Any] | None:
    for item in load(name):
        if predicate(item):
            return item
    return None


def append(name: str, item: dict[str, Any]) -> None:
    with _locks[name]:
        items = load(name)
        items.append(item)
        save(name, items)


def update_first_matching(
    name: str,
    predicate: Callable[[dict[str, Any]], bool],
    patch: dict[str, Any],
) -> dict[str, Any] | None:
    with _locks[name]:
        items = load(name)
        for idx, item in enumerate(items):
            if predicate(item):
                items[idx] = {**item, **patch}
                save(name, items)
                return items[idx]
    return None
