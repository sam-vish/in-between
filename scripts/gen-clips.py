#!/usr/bin/env python3
"""Writes one HyperFrames composition per sample clip. Same world, different seed and captions."""
import json, os, shutil

VARIANTS = {
  "flip": {"seed": 4, "police": 1, "hook": "HE DID NOT SEE THAT COMING", "caps": ["BRO", "WHAT", "WAS", "THAT"], "hot": 1, "grade": None, "start": 1.5, "focusX": 0.5},
  "cops": {"seed": 11, "police": 5, "hook": "CINCO VIATURAS ATRÁS DELE", "caps": ["MANO,", "OLHA", "ISSO"], "hot": 1, "grade": None, "start": 1.6, "focusX": 0.84},
  "dawn": {"seed": 23, "police": 2, "hook": "NADIE LO VIO VENIR", "caps": ["NO", "PUEDE", "SER"], "hot": 2, "grade": "#FFC3A6", "start": 1.5, "focusX": 0.5},
}

TEMPLATE = open("video/clips/template.html").read()
for name, v in VARIANTS.items():
    d = f"video/clips/{name}"
    os.makedirs(f"{d}/assets", exist_ok=True)
    for f in ["gsap.min.js", "world.js", "anton-latin-400-normal.woff2"]:
        shutil.copy(f"video/clips/assets/{f}", f"{d}/assets/{f}")
    caps = "".join(
        f'<span style="{"color:#FFB547" if i == v["hot"] else ""}">{w}</span>' for i, w in enumerate(v["caps"])
    )
    html = TEMPLATE.replace("__HOOK__", v["hook"]).replace("__CAPS__", caps).replace("__CONFIG__", json.dumps(v))
    open(f"{d}/index.html", "w").write(html)
    open(f"{d}/hyperframes.json", "w").write('{ "paths": { "assets": "assets" }, "authoringSkill": "hyperframes" }\n')
    open(f"{d}/meta.json", "w").write(json.dumps({"id": f"inbetween-{name}", "name": f"Inbetween sample {name}"}))
