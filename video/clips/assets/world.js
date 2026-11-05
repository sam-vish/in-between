"use strict";
var IB = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/world/engine.ts
  var engine_exports = {};
  __export(engine_exports, {
    APEX_S: () => APEX_S,
    CHAT_CALM: () => CHAT_CALM,
    CHAT_HYPE: () => CHAT_HYPE,
    CRUISE_V: () => CRUISE_V,
    FLIP_DUR: () => FLIP_DUR,
    INK: () => INK,
    LAND_S: () => LAND_S,
    LANE_FAR: () => LANE_FAR,
    LANE_NEAR: () => LANE_NEAR,
    RAMP_S: () => RAMP_S,
    RAMP_X: () => RAMP_X,
    ROAD_Y: () => ROAD_Y,
    WORLD_H: () => WORLD_H,
    WORLD_W: () => WORLD_W,
    actionAt: () => actionAt,
    createWorld: () => createWorld,
    drawFacecam: () => drawFacecam,
    render: () => render,
    rng: () => rng,
    withAlpha: () => withAlpha
  });
  var WORLD_W = 1320;
  var WORLD_H = 720;
  var ROAD_Y = 360;
  var CRUISE_V = WORLD_W / 11;
  var LANE_NEAR = ROAD_Y + 13;
  var LANE_FAR = ROAD_Y - 13;
  var TAU = Math.PI * 2;
  var INK = {
    bg: "#0B0B0C",
    cream: "#EFE6D2",
    red: "#FF3B2F",
    magenta: "#FF4FA3",
    cyan: "#3FD6E8",
    amber: "#FFB547"
  };
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  var GLYPHS = {
    A: "010101111101101",
    B: "110101110101110",
    C: "011100100100011",
    D: "110101101101110",
    E: "111100110100111",
    F: "111100110100100",
    G: "011100101101011",
    H: "101101111101101",
    I: "111010010010111",
    K: "101101110101101",
    L: "100100100100111",
    M: "101111111101101",
    N: "110101101101101",
    O: "010101101101010",
    P: "110101110100100",
    Q: "010101101110011",
    R: "110101110101101",
    S: "011100010001110",
    T: "111010010010010",
    U: "101101101101111",
    V: "101101101101010",
    W: "101101111111101",
    X: "101101010101101",
    Y: "101101010010010",
    "2": "110001010100111",
    "4": "101101111001001",
    "0": "111101101101111",
    "1": "010110010010111",
    " ": "000000000000000"
  };
  function pixelText(g, text, x, y, color, scale = 1) {
    g.fillStyle = color;
    let cx = x;
    for (const ch of text) {
      const glyph = GLYPHS[ch] ?? GLYPHS[" "];
      for (let i = 0; i < 15; i++) {
        if (glyph[i] === "1") {
          g.fillRect(cx + i % 3 * scale, y + Math.floor(i / 3) * scale, scale, scale);
        }
      }
      cx += 4 * scale;
    }
  }
  var ROOFS = ["#1d1a2e", "#241b36", "#1a2433", "#2c1d33", "#17282e", "#282337", "#1f1f33"];
  var NEON = [INK.magenta, INK.cyan, INK.amber, INK.magenta, INK.cyan, "#8A7CFF"];
  var SIGNS = ["VIDEO", "TAPES", "24H", "DINER", "ARCADE", "MOTEL", "OPEN", "BAR", "RADIO", "TV", "NEON", "NIGHT", "PAWN"];
  var STREET_XS = [0, 220, 440, 660, 880, 1100];
  var STREET_W = 36;
  var HSTREETS = [
    [ROAD_Y - 36, 72],
    [ROAD_Y - 36 - 150 - 28, 28],
    [ROAD_Y + 36 + 150, 28],
    [ROAD_Y - 36 - 150 - 28 - 150 - 28, 28],
    [ROAD_Y + 36 + 150 + 28 + 150, 28]
  ];
  function glow(g, x, y, r, color, alpha) {
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, withAlpha(color, alpha));
    grad.addColorStop(0.45, withAlpha(color, alpha * 0.35));
    grad.addColorStop(1, withAlpha(color, 0));
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function withAlpha(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
  }
  function bakeBlock(g, lights, x, y, w, h, r) {
    const roll = r();
    if (roll < 0.1 && w > 90 && h > 70) {
      g.fillStyle = "#1b1b22";
      g.fillRect(x, y, w, h);
      g.fillStyle = "#3a3844";
      for (let px = x + 6; px < x + w - 10; px += 12) {
        g.fillRect(px, y + 4, 1, 16);
        g.fillRect(px, y + h - 20, 1, 16);
      }
      for (let i = 0; i < 9; i++) {
        if (r() < 0.6) {
          const cx = x + 8 + Math.floor(r() * ((w - 18) / 12)) * 12;
          const top = r() < 0.5;
          g.fillStyle = ["#3b3350", "#2c3f52", "#5a2f45", "#6a6455"][Math.floor(r() * 4)];
          g.fillRect(cx, top ? y + 6 : y + h - 18, 7, 12);
          g.fillStyle = "#0e0e14";
          g.fillRect(cx + 1, (top ? y + 6 : y + h - 18) + 3, 5, 3);
        }
      }
      lights.push(() => glow(g, x + w / 2, y + h / 2, 46, INK.amber, 0.12));
      return;
    }
    if (roll < 0.2 && w > 70 && h > 60) {
      g.fillStyle = "#10201b";
      g.fillRect(x, y, w, h);
      for (let i = 0; i < w * h * 35e-4; i++) {
        const tx = x + 6 + r() * (w - 12);
        const ty = y + 6 + r() * (h - 12);
        const s = 4 + r() * 5;
        g.fillStyle = r() < 0.5 ? "#17362b" : "#1d4032";
        g.beginPath();
        g.arc(tx, ty, s, 0, TAU);
        g.fill();
        g.fillStyle = "#28523f";
        g.fillRect(tx - 1, ty - 2, 2, 2);
      }
      const pw = Math.min(w * 0.45, 46);
      const ph = Math.min(h * 0.32, 22);
      const px = x + (w - pw) / 2;
      const py = y + (h - ph) / 2;
      g.fillStyle = "#2c3a40";
      g.fillRect(px - 2, py - 2, pw + 4, ph + 4);
      g.fillStyle = "#1a8fa3";
      g.fillRect(px, py, pw, ph);
      g.fillStyle = "#3FD6E8";
      for (let i = 0; i < 9; i++) g.fillRect(px + r() * (pw - 3), py + r() * (ph - 1), 3, 1);
      lights.push(() => glow(g, px + pw / 2, py + ph / 2, Math.max(pw, ph) * 1.1, INK.cyan, 0.3));
      return;
    }
    const parts = [];
    const split = r();
    if (split < 0.33 && w > 110) {
      const c = Math.floor(w * (0.35 + r() * 0.3));
      parts.push([x, y, c - 3, h], [x + c + 3, y, w - c - 3, h]);
    } else if (split < 0.66 && h > 90) {
      const c = Math.floor(h * (0.35 + r() * 0.3));
      parts.push([x, y, w, c - 3], [x, y + c + 3, w, h - c - 3]);
    } else {
      parts.push([x, y, w, h]);
    }
    g.fillStyle = "#14141b";
    g.fillRect(x, y, w, h);
    for (const [bx, by, bw, bh] of parts) {
      const base = ROOFS[Math.floor(r() * ROOFS.length)];
      g.fillStyle = "#0b0b11";
      g.fillRect(bx + 3, by + 3, bw, bh);
      g.fillStyle = base;
      g.fillRect(bx, by, bw - 2, bh - 2);
      g.fillStyle = withAlpha(INK.cream, 0.08);
      g.fillRect(bx, by, bw - 2, 1);
      g.fillRect(bx, by, 1, bh - 2);
      g.fillStyle = "rgba(0,0,0,.35)";
      g.fillRect(bx + 2, by + bh - 4, bw - 4, 2);
      g.fillRect(bx + bw - 4, by + 2, 2, bh - 4);
      const style = r();
      const isPad = style >= 0.32 && style < 0.5;
      if (style < 0.32) {
        const cols = Math.max(2, Math.floor((bw - 14) / 9));
        const rows = Math.max(2, Math.floor((bh - 14) / 8));
        for (let c = 0; c < cols; c++) {
          for (let w2 = 0; w2 < rows; w2++) {
            const on = r();
            g.fillStyle = on < 0.32 ? "#ffcf7a" : on < 0.42 ? INK.cyan : on < 0.47 ? INK.magenta : "#0f0f18";
            g.fillRect(bx + 7 + c * 9, by + 7 + w2 * 8, 5, 4);
          }
        }
        lights.push(() => glow(g, bx + bw / 2, by + bh / 2, Math.max(bw, bh) * 0.6, "#ffcf7a", 0.09));
      } else if (style < 0.5) {
        const cx = bx + bw / 2;
        const cy = by + bh / 2;
        const rad = Math.min(bw, bh) * 0.32;
        g.fillStyle = "#34323f";
        g.beginPath();
        g.arc(cx, cy, rad, 0, TAU);
        g.fill();
        g.strokeStyle = "#c9bfa8";
        g.lineWidth = 1;
        g.beginPath();
        g.arc(cx, cy, rad - 2, 0, TAU);
        g.stroke();
        g.fillStyle = "#c9bfa8";
        g.fillRect(cx - 3, cy - 4, 2, 8);
        g.fillRect(cx + 1, cy - 4, 2, 8);
        g.fillRect(cx - 1, cy - 1, 2, 2);
        for (let i = 0; i < 6; i++) {
          const a = i / 6 * TAU;
          const lx = cx + Math.cos(a) * (rad + 3);
          const ly = cy + Math.sin(a) * (rad + 3);
          g.fillStyle = INK.red;
          g.fillRect(lx, ly, 1, 1);
          lights.push(() => glow(g, lx, ly, 6, INK.red, 0.5));
        }
      } else {
        const units = 3 + Math.floor(bw * bh / 900);
        for (let i = 0; i < units; i++) {
          const uw = 5 + Math.floor(r() * 9);
          const uh = 4 + Math.floor(r() * 7);
          const ux = bx + 4 + r() * Math.max(1, bw - uw - 10);
          const uy = by + 4 + r() * Math.max(1, bh - uh - 10);
          g.fillStyle = "#0d0d14";
          g.fillRect(ux + 1, uy + 1, uw, uh);
          g.fillStyle = r() < 0.5 ? "#3a3b4a" : "#2e3140";
          g.fillRect(ux, uy, uw, uh);
          g.fillStyle = "#4f5163";
          g.fillRect(ux + 1, uy + 1, uw - 2, 1);
          if (uw > 8) {
            g.fillStyle = "#1a1b24";
            g.fillRect(ux + 2, uy + 2, uw - 4, Math.max(1, uh - 3));
          }
        }
        if (r() < 0.5) {
          const tx = bx + 10 + r() * Math.max(1, bw - 22);
          const ty = by + 10 + r() * Math.max(1, bh - 22);
          g.fillStyle = "#3b2f2a";
          g.beginPath();
          g.arc(tx, ty, 5, 0, TAU);
          g.fill();
          g.fillStyle = "#55443a";
          g.fillRect(tx - 2, ty - 2, 3, 2);
        }
      }
      if (r() < 0.62) {
        const c = NEON[Math.floor(r() * NEON.length)];
        const edge = r();
        if (edge < 0.5) {
          const ey = edge < 0.25 ? by + 2 : by + bh - 6;
          g.fillStyle = c;
          g.fillRect(bx + 3, ey, bw - 8, 1);
          lights.push(() => {
            const grad = g.createLinearGradient(0, ey - 14, 0, ey + 14);
            grad.addColorStop(0, withAlpha(c, 0));
            grad.addColorStop(0.5, withAlpha(c, 0.3));
            grad.addColorStop(1, withAlpha(c, 0));
            g.fillStyle = grad;
            g.fillRect(bx - 10, ey - 14, bw + 18, 28);
          });
        } else {
          const ex = edge < 0.75 ? bx + 2 : bx + bw - 5;
          g.fillStyle = c;
          g.fillRect(ex, by + 3, 1, bh - 8);
          lights.push(() => {
            const grad = g.createLinearGradient(ex - 14, 0, ex + 14, 0);
            grad.addColorStop(0, withAlpha(c, 0));
            grad.addColorStop(0.5, withAlpha(c, 0.3));
            grad.addColorStop(1, withAlpha(c, 0));
            g.fillStyle = grad;
            g.fillRect(ex - 14, by - 10, 28, bh + 18);
          });
        }
      }
      if (!isPad && r() < 0.55 && bw > 40 && bh > 26) {
        const word = SIGNS[Math.floor(r() * SIGNS.length)];
        const c = NEON[Math.floor(r() * NEON.length)];
        const scale = bw > 80 && word.length < 6 ? 2 : 1;
        const tw = word.length * 4 * scale;
        if (tw < bw - 8) {
          const tx = Math.floor(bx + (bw - tw) / 2);
          const ty = Math.floor(by + (bh - 5 * scale) / 2);
          g.fillStyle = "#0d0d14";
          g.fillRect(tx - 3, ty - 3, tw + 5, 5 * scale + 6);
          pixelText(g, word, tx, ty, c, scale);
          lights.push(() => glow(g, tx + tw / 2, ty + 2, tw * 0.9, c, 0.34));
        }
      }
    }
  }
  function createWorld(seed = 4, doc = document) {
    const city = doc.createElement("canvas");
    city.width = WORLD_W;
    city.height = WORLD_H;
    const g = city.getContext("2d", { alpha: false });
    const r = rng(seed);
    const lights = [];
    g.imageSmoothingEnabled = false;
    g.fillStyle = "#101016";
    g.fillRect(0, 0, WORLD_W, WORLD_H);
    const hs = [...HSTREETS].sort((a, b) => a[0] - b[0]);
    const rows = [];
    let ry = 0;
    for (const [sy, sh] of hs) {
      if (sy > ry) rows.push([ry, sy - ry]);
      ry = sy + sh;
    }
    if (ry < WORLD_H) rows.push([ry, WORLD_H - ry]);
    for (const [by, bh] of rows) {
      for (let i = 0; i < STREET_XS.length; i++) {
        const bx = STREET_XS[i] + STREET_W;
        const bw = (STREET_XS[i + 1] ?? WORLD_W) - bx;
        g.fillStyle = "#2b2a35";
        g.fillRect(bx, by, bw, bh);
        g.fillStyle = "#34333f";
        for (let t = bx; t < bx + bw; t += 8) {
          g.fillRect(t, by, 1, 5);
          g.fillRect(t, by + bh - 5, 1, 5);
        }
        bakeBlock(g, lights, bx + 6, by + 6, bw - 12, bh - 12, r);
      }
    }
    const road = (x, y, w, h) => {
      g.fillStyle = "#15151c";
      g.fillRect(x, y, w, h);
      for (let i = 0; i < w * h / 26; i++) {
        g.fillStyle = r() < 0.5 ? "#1a1a22" : "#111117";
        g.fillRect(x + r() * w, y + r() * h, 1, 1);
      }
    };
    for (const sx of STREET_XS) road(sx, 0, STREET_W, WORLD_H);
    for (const [sy, sh] of hs) road(0, sy, WORLD_W, sh);
    const isCross = (x) => STREET_XS.some((s) => x > s - 6 && x < s + STREET_W + 6);
    for (const [sy, sh] of hs) {
      const mid = sy + sh / 2;
      if (sh > 40) {
        for (let x = 0; x < WORLD_W; x += 1) {
          if (isCross(x)) continue;
          g.fillStyle = "#8d6c2c";
          g.fillRect(x, mid - 1, 1, 1);
          g.fillRect(x, mid + 1, 1, 1);
          if (x % 16 < 8) {
            g.fillStyle = "#57524a";
            g.fillRect(x, mid - 18, 1, 1);
            g.fillRect(x, mid + 18, 1, 1);
          }
        }
      } else {
        for (let x = 0; x < WORLD_W; x += 12) {
          if (isCross(x)) continue;
          g.fillStyle = "#4a463f";
          g.fillRect(x, mid, 6, 1);
        }
      }
    }
    for (const sx of STREET_XS) {
      const mid = sx + STREET_W / 2;
      for (let y = 0; y < WORLD_H; y += 12) {
        if (hs.some(([sy, sh]) => y > sy - 8 && y < sy + sh + 4)) continue;
        g.fillStyle = "#4a463f";
        g.fillRect(mid, y, 1, 6);
      }
    }
    for (const sx of STREET_XS) {
      const y0 = ROAD_Y - 34;
      for (let y = y0; y < ROAD_Y + 34; y += 5) {
        g.fillStyle = "#726c60";
        g.fillRect(sx - 6, y, 4, 3);
        g.fillRect(sx + STREET_W + 2, y, 4, 3);
      }
    }
    for (let i = 0; i < 26; i++) {
      const px = r() * WORLD_W;
      if (isCross(px) || isCross(px + 16)) continue;
      const top = r() < 0.5;
      const py = top ? ROAD_Y - 34 : ROAD_Y + 27;
      g.fillStyle = "rgba(0,0,0,.5)";
      g.fillRect(px + 1, py + 1, 16, 8);
      g.fillStyle = ["#3b3350", "#2c3f52", "#5a2f45", "#6a6455", "#27323a"][Math.floor(r() * 5)];
      g.fillRect(px, py, 16, 7);
      g.fillStyle = "#0e0e14";
      g.fillRect(px + 4, py + 1, 7, 5);
    }
    g.globalCompositeOperation = "lighter";
    for (const fn of lights) fn();
    for (let x = 12; x < WORLD_W; x += 44) {
      if (isCross(x)) continue;
      for (const y of [ROAD_Y - 38, ROAD_Y + 38]) {
        glow(g, x, y, 34, "#ffb35c", 0.26);
        g.fillStyle = "#ffe2b0";
        g.fillRect(x, y, 2, 2);
      }
    }
    for (const sx of STREET_XS) {
      for (const [sy, sh] of hs) {
        if (sh > 40) continue;
        glow(g, sx + 18, sy + sh / 2, 44, "#ffa85c", 0.15);
      }
      const c = r() < 0.5 ? INK.magenta : INK.cyan;
      glow(g, sx + 100, ROAD_Y + (r() - 0.5) * 30, 80, c, 0.09);
    }
    g.globalCompositeOperation = "source-over";
    return { city, seed };
  }
  var RAMP_S = 3.1;
  var FLIP_DUR = 1.3;
  var LAND_S = RAMP_S + FLIP_DUR;
  var APEX_S = RAMP_S + FLIP_DUR * 0.5;
  var X0 = 330;
  var RAMP_X = X0 + CRUISE_V * RAMP_S;
  var easeOut = (u) => 1 - (1 - u) * (1 - u);
  var clamp01 = (v) => v < 0 ? 0 : v > 1 ? 1 : v;
  function actionAt(s) {
    let x = X0 + CRUISE_V * s;
    let y = LANE_NEAR;
    let z = 0;
    let roll = 0;
    let yaw = 0;
    let crashed = 0;
    let shake = 0;
    if (s >= RAMP_S && s < LAND_S) {
      const u = (s - RAMP_S) / FLIP_DUR;
      z = 4 * u * (1 - u);
      roll = u * TAU * 2;
      yaw = u * 0.5;
      y = LANE_NEAR - easeOut(u) * 14;
    } else if (s >= LAND_S) {
      crashed = s - LAND_S;
      const d = Math.min(crashed, 1.4);
      const skid = CRUISE_V * (d - d * d / (2 * 1.4));
      x = X0 + CRUISE_V * LAND_S + skid;
      y = LANE_NEAR - 14 - d * 4;
      yaw = 0.5 + easeOut(clamp01(d / 1.4)) * 2.6;
      shake = Math.max(0, 1 - crashed * 3.5);
    }
    let police = Infinity;
    if (s > 1.2) {
      const u = clamp01((s - 1.2) / 1.9);
      police = 170 - easeOut(u) * 118;
      if (s > LAND_S) {
        const parked = clamp01((s - LAND_S) / 1.4);
        police = 52 - easeOut(parked) * 16 + (x - (X0 + CRUISE_V * s)) * 1;
      }
    }
    let shock = 0;
    if (s > RAMP_S - 0.15) shock = clamp01((s - (RAMP_S - 0.15)) / 0.15);
    if (s > LAND_S + 2.2) shock = 1 - clamp01((s - LAND_S - 2.2) / 0.8);
    return { x, y, z, roll, yaw, police, strobe: s, shake, crashed, shock };
  }
  var HERO = { body: "#EFE6D2", dark: "#B8AE97", stripe: "#FF3B2F" };
  var NPCS = [
    { body: "#4a3f6b", dark: "#352c50" },
    { body: "#2c5266", dark: "#1f3a49" },
    { body: "#7a3350", dark: "#592439" },
    { body: "#6b6658", dark: "#4d493e" }
  ];
  function drawCarBody(g, p, underside) {
    if (underside) {
      g.fillStyle = "#1a1a20";
      g.fillRect(-12, -6, 24, 12);
      g.fillStyle = "#35353f";
      g.fillRect(-9, -2, 18, 4);
      g.fillStyle = "#0a0a0e";
      g.fillRect(-9, -7, 5, 2);
      g.fillRect(4, -7, 5, 2);
      g.fillRect(-9, 5, 5, 2);
      g.fillRect(4, 5, 5, 2);
      return;
    }
    g.fillStyle = "#0a0a0e";
    g.fillRect(-9, -7, 5, 2);
    g.fillRect(4, -7, 5, 2);
    g.fillRect(-9, 5, 5, 2);
    g.fillRect(4, 5, 5, 2);
    g.fillStyle = p.dark;
    g.fillRect(-12, -6, 24, 12);
    g.fillStyle = p.body;
    g.fillRect(-12, -5, 23, 10);
    g.fillRect(-10, -6, 20, 1);
    g.fillRect(11, -4, 1, 8);
    if (p.stripe) {
      g.fillStyle = p.stripe;
      g.fillRect(-12, -1, 24, 2);
    }
    g.fillStyle = "#121a2a";
    g.fillRect(-4, -4, 9, 8);
    g.fillStyle = "#34506e";
    g.fillRect(3, -3, 2, 6);
    g.fillStyle = p.dark;
    g.fillRect(-2, -3, 4, 6);
    g.fillStyle = "#FF3B2F";
    g.fillRect(-12, -5, 1, 2);
    g.fillRect(-12, 3, 1, 2);
    g.fillStyle = "#fff4cc";
    g.fillRect(11, -5, 1, 2);
    g.fillRect(11, 3, 1, 2);
  }
  function headlights(g, x, y, yaw, a = 0.26) {
    g.save();
    g.globalCompositeOperation = "lighter";
    g.translate(x, y);
    g.rotate(yaw);
    const grad = g.createLinearGradient(12, 0, 74, 0);
    grad.addColorStop(0, `rgba(255,236,190,${a})`);
    grad.addColorStop(1, "rgba(255,236,190,0)");
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(12, -5);
    g.lineTo(74, -20);
    g.lineTo(74, 20);
    g.lineTo(12, 5);
    g.closePath();
    g.fill();
    g.restore();
  }
  function drawRamp(g, x, y) {
    g.fillStyle = "rgba(0,0,0,.55)";
    g.fillRect(x - 14, y - 9, 30, 20);
    g.fillStyle = "#4b4538";
    g.fillRect(x - 15, y - 10, 30, 20);
    g.fillStyle = "#6d6450";
    g.fillRect(x - 15, y - 10, 30, 2);
    for (let i = 0; i < 6; i++) {
      g.fillStyle = i % 2 ? "#1a1a1e" : INK.amber;
      g.fillRect(x + 11, y - 10 + i * 3.4, 4, 3.4);
      g.fillStyle = i % 2 ? INK.amber : "#1a1a1e";
      g.fillRect(x - 15, y - 10 + i * 3.4, 3, 3.4);
    }
    g.fillStyle = "#8a7f66";
    for (let i = 0; i < 4; i++) g.fillRect(x - 9 + i * 5, y - 7, 1, 14);
  }
  function cone(g, x, y) {
    g.fillStyle = "#ff7a2f";
    g.fillRect(x, y, 2, 2);
    g.fillStyle = "#fff";
    g.fillRect(x, y, 1, 1);
  }
  function wrapDraw(g, city, camX, camY, vw, vh) {
    const sx = (camX % WORLD_W + WORLD_W) % WORLD_W;
    const sy = Math.max(0, Math.min(WORLD_H - vh, Math.round(camY)));
    const dx = -Math.round(sx);
    g.drawImage(city, dx, -sy);
    if (dx + WORLD_W < vw) g.drawImage(city, dx + WORLD_W, -sy);
    return { camX: Math.round(sx), camY: sy };
  }
  function render(g, world, opts) {
    const { vw, vh, s } = opts;
    const focusX = opts.focusX ?? 0.38;
    const showAction = opts.showAction ?? true;
    const a = actionAt(s);
    const policeCount = opts.police ?? 1;
    g.imageSmoothingEnabled = false;
    const shakeR = rng(Math.floor(s * 30) + 1);
    const sx = a.shake ? (shakeR() - 0.5) * 6 * a.shake : 0;
    const sy = a.shake ? (shakeR() - 0.5) * 6 * a.shake : 0;
    const camX = a.x - vw * focusX + sx;
    const camY = ROAD_Y - vh * (opts.focusY ?? 0.5) + sy;
    const c = wrapDraw(g, world.city, camX, camY, vw, vh);
    const toSX = (wx) => {
      const d = ((wx - camX) % WORLD_W + WORLD_W) % WORLD_W;
      return d > WORLD_W - 60 ? d - WORLD_W : d;
    };
    const toSY = (wy) => wy - c.camY;
    for (let i = 0; i < 5; i++) {
      const base = i * 264 + 40;
      const wx = base - CRUISE_V * s;
      const px = toSX(wx);
      if (px < -30 || px > vw + 30) continue;
      const py = toSY(LANE_FAR + (i % 2 ? -5 : 2));
      g.save();
      g.translate(Math.round(px), Math.round(py));
      g.rotate(Math.PI);
      g.fillStyle = "rgba(0,0,0,.5)";
      g.fillRect(-12, -5, 25, 12);
      drawCarBody(g, NPCS[i % NPCS.length], false);
      g.restore();
      headlights(g, Math.round(px), Math.round(py), Math.PI, 0.13);
    }
    if (showAction) {
      const rx = toSX(RAMP_X);
      if (s > -2.4 && s < 11 && rx > -40 && rx < vw + 40) {
        drawRamp(g, Math.round(rx), Math.round(toSY(LANE_NEAR)));
        for (let i = 0; i < 4; i++) cone(g, Math.round(rx - 34 - i * 12), Math.round(toSY(LANE_NEAR + 9 - i)));
      }
    }
    if (a.crashed > 0) {
      const lx = toSX(actionAt(LAND_S).x);
      const ly = toSY(actionAt(LAND_S).y);
      g.fillStyle = "rgba(0,0,0,.55)";
      const end = a.x - actionAt(LAND_S).x;
      for (let i = 0; i < end; i += 1) {
        const wy = ly - i / Math.max(1, end) * 4;
        g.fillRect(lx + i, wy - 4, 1, 1);
        g.fillRect(lx + i, wy + 4, 1, 1);
      }
    }
    particles(g, s, toSX, toSY);
    const carSX = Math.round(a.x - camX);
    const carSY = Math.round(toSY(a.y));
    if (showAction && a.police !== Infinity) {
      for (let k = 0; k < policeCount; k++) {
        const dist = a.police + Math.floor((k + 1) / 2) * 26;
        const px = Math.round(carSX - dist);
        const py = Math.round(toSY(LANE_NEAR + (k === 0 ? 0 : k % 2 ? -18 : 9)));
        if (px < -40 || px > vw + 40) continue;
        policeCar(g, px, py, s + k * 0.13, 0.5 / (1 + (policeCount - 1) * 0.45));
      }
    }
    const lift = a.z;
    g.save();
    g.translate(carSX + lift * 12, carSY + lift * 26);
    g.rotate(a.yaw);
    g.scale(1 - lift * 0.22, 1 - lift * 0.22);
    g.fillStyle = `rgba(0,0,0,${0.6 - lift * 0.3})`;
    g.fillRect(-13, -7, 26, 14);
    g.restore();
    if (lift === 0 && a.crashed === 0) headlights(g, carSX, carSY, a.yaw);
    const size = 1 + lift * 0.85;
    const cosR = Math.cos(a.roll);
    g.save();
    g.translate(carSX, carSY - lift * 10);
    g.rotate(a.yaw);
    g.scale(size, size * Math.max(0.16, Math.abs(cosR)));
    drawCarBody(g, HERO, cosR < 0);
    g.restore();
    if (s > RAMP_S - 0.02 && s < RAMP_S + 0.22) {
      const k = 1 - (s - RAMP_S) / 0.22;
      g.save();
      g.globalCompositeOperation = "lighter";
      glow(g, carSX, carSY, 60, INK.amber, 0.55 * clamp01(k));
      g.restore();
    }
    const v = g.createRadialGradient(vw / 2, vh / 2, Math.min(vw, vh) * 0.3, vw / 2, vh / 2, Math.max(vw, vh) * 0.72);
    v.addColorStop(0, "rgba(6,6,12,0)");
    v.addColorStop(1, "rgba(6,6,12,.62)");
    g.fillStyle = v;
    g.fillRect(0, 0, vw, vh);
    if (opts.grade) {
      g.save();
      g.globalCompositeOperation = "multiply";
      g.fillStyle = opts.grade;
      g.fillRect(0, 0, vw, vh);
      g.restore();
    }
  }
  function policeCar(g, x, y, t, lightAlpha = 0.5) {
    const paint = { body: "#2a2c3a", dark: "#171822" };
    g.fillStyle = "rgba(0,0,0,.5)";
    g.fillRect(x - 12, y - 5, 26, 12);
    g.save();
    g.translate(x, y);
    drawCarBody(g, paint, false);
    g.fillStyle = "#B9B3A4";
    g.fillRect(-7, -6, 14, 1);
    g.fillRect(-7, 5, 14, 1);
    g.fillRect(-7, -5, 3, 10);
    g.fillRect(5, -5, 2, 10);
    g.restore();
    const phase = Math.floor(t * 10) % 2 === 0;
    g.fillStyle = phase ? INK.magenta : "#2a2030";
    g.fillRect(x - 2, y - 4, 3, 4);
    g.fillStyle = phase ? "#1d3036" : INK.cyan;
    g.fillRect(x - 2, y, 3, 4);
    g.save();
    g.globalCompositeOperation = "lighter";
    glow(g, x, y - 2, 52, phase ? INK.magenta : INK.cyan, lightAlpha);
    g.restore();
    headlights(g, x, y, 0, 0.12);
  }
  function particles(g, s, toSX, toSY) {
    const launch = actionAt(RAMP_S);
    const land = actionAt(LAND_S);
    const burst = (seed, count, t0, ox, oy, life, spd, colors) => {
      if (s < t0 || s > t0 + life) return;
      const age = s - t0;
      const r = rng(seed);
      for (let i = 0; i < count; i++) {
        const ang = r() * TAU;
        const v = spd * (0.3 + r() * 0.9);
        const l = life * (0.45 + r() * 0.55);
        const col = colors[Math.floor(r() * colors.length)];
        if (age > l) continue;
        const x = ox + Math.cos(ang) * v * age;
        const y = oy + Math.sin(ang) * v * age + 40 * age * age;
        g.fillStyle = col;
        g.globalAlpha = 1 - age / l;
        g.fillRect(Math.round(toSX(x)), Math.round(toSY(y)), 1 + (i % 3 === 0 ? 1 : 0), 1);
      }
      g.globalAlpha = 1;
    };
    burst(11, 26, RAMP_S, launch.x, launch.y, 0.7, 95, [INK.amber, "#fff1c9", INK.red]);
    burst(23, 46, LAND_S, land.x, land.y, 1.1, 140, [INK.amber, "#fff1c9", INK.red, "#ff7a2f"]);
    if (s > LAND_S && s < LAND_S + 3) {
      const r = rng(37);
      const age = s - LAND_S;
      for (let i = 0; i < 16; i++) {
        const ox = land.x + r() * 60 - 8;
        const oy = land.y + (r() - 0.5) * 16;
        const delay = r() * 0.8;
        const l = 1.2 + r() * 1.2;
        const t = age - delay;
        if (t < 0 || t > l) continue;
        const rad = 4 + t * 9;
        g.fillStyle = `rgba(150,145,160,${0.28 * (1 - t / l)})`;
        g.beginPath();
        g.arc(toSX(ox), toSY(oy - t * 12), rad, 0, TAU);
        g.fill();
      }
    }
  }
  function drawFacecam(g, x, y, w, h, t, shock, punch = 0) {
    g.save();
    g.beginPath();
    g.rect(x, y, w, h);
    g.clip();
    const bg = g.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "#3a1a4d");
    bg.addColorStop(0.55, "#1b1533");
    bg.addColorStop(1, "#0f2b3a");
    g.fillStyle = bg;
    g.fillRect(x, y, w, h);
    const u = h / 45;
    g.fillStyle = INK.magenta;
    g.fillRect(x, y + 5 * u, w * 0.4, 1 * u);
    g.fillStyle = INK.cyan;
    g.fillRect(x + w * 0.62, y + 8 * u, w * 0.38, 1 * u);
    g.save();
    g.globalCompositeOperation = "lighter";
    glow(g, x + w * 0.15, y + 5 * u, 30 * u, INK.magenta, 0.5);
    glow(g, x + w * 0.85, y + 8 * u, 30 * u, INK.cyan, 0.45);
    g.restore();
    g.fillStyle = "#0e0c18";
    g.fillRect(x + w * 0.72, y + 18 * u, w * 0.24, 1 * u);
    g.fillStyle = "#57526b";
    g.fillRect(x + w * 0.75, y + 14 * u, 2 * u, 4 * u);
    g.fillRect(x + w * 0.81, y + 15 * u, 2 * u, 3 * u);
    const bob = Math.sin(t * TAU * 0.45) * 0.5 * u;
    const cx = x + w / 2 + Math.sin(t * TAU * 0.27) * 0.8 * u;
    const cy = y + h * 0.56 + bob - shock * 3 * u;
    const s = 1 + punch * 0.16;
    g.translate(cx, cy);
    g.scale(s, s);
    const ink = "#08070d";
    g.fillStyle = "#17121f";
    g.fillRect(-19 * u, -5 * u, 38 * u, 40 * u);
    g.fillStyle = ink;
    g.beginPath();
    g.ellipse(0, 20 * u, 21 * u, 14 * u, 0, 0, TAU);
    g.fill();
    g.fillRect(-3 * u, 3 * u, 6 * u, 7 * u);
    g.beginPath();
    g.ellipse(0, -3 * u, 8 * u, 9.5 * u, 0, 0, TAU);
    g.fill();
    g.fillStyle = withAlpha(INK.cyan, 0.5);
    g.fillRect(6 * u, -8 * u, 1 * u, 8 * u);
    g.fillStyle = withAlpha(INK.magenta, 0.5);
    g.fillRect(-7 * u, -8 * u, 1 * u, 8 * u);
    g.strokeStyle = "#2b2838";
    g.lineWidth = 2 * u;
    g.beginPath();
    g.arc(0, -4 * u, 9 * u, Math.PI, 0);
    g.stroke();
    g.fillStyle = "#3a3648";
    g.fillRect(-11 * u, -6 * u, 4 * u, 7 * u);
    g.fillRect(7 * u, -6 * u, 4 * u, 7 * u);
    g.fillStyle = INK.red;
    g.fillRect(8 * u, -2 * u, 1 * u, 1 * u);
    g.strokeStyle = "#3a3648";
    g.lineWidth = 1 * u;
    g.beginPath();
    g.moveTo(-9 * u, 1 * u);
    g.quadraticCurveTo(-7 * u, 6 * u, -1 * u, 4.5 * u);
    g.stroke();
    const eye = 0.7 + shock * 0.9;
    g.fillStyle = withAlpha(INK.cream, 0.55 + shock * 0.45);
    g.fillRect(-4 * u, -5 * u, 2 * u * eye, 1 * u * eye);
    g.fillRect(2 * u, -5 * u, 2 * u * eye, 1 * u * eye);
    if (shock > 0.05) {
      g.fillStyle = withAlpha(INK.cream, 0.8 * shock);
      g.beginPath();
      g.ellipse(0, 1.5 * u, 2.6 * u * shock, 3 * u * shock, 0, 0, TAU);
      g.fill();
    }
    if (shock > 0.01) {
      const up = shock * 15 * u;
      g.fillStyle = "#17121f";
      g.fillRect(-16 * u, 14 * u - up, 5 * u, 16 * u);
      g.fillRect(11 * u, 14 * u - up, 5 * u, 16 * u);
      g.fillStyle = ink;
      g.fillRect(-16 * u, 13 * u - up, 6 * u, 5 * u);
      g.fillRect(10 * u, 13 * u - up, 6 * u, 5 * u);
    }
    g.restore();
  }
  var CHAT_CALM = [
    ["nightshift_42", "3am city vibes", INK.cyan],
    ["mod_pancake", "hydrate check", INK.amber],
    ["lowkey_ren", "how long u been on", INK.magenta],
    ["vibe_tech", "6 hours go sleep", INK.cyan],
    ["toast_ghost", "nah he lives here", "#9EE37D"],
    ["kaibo", "what song is this", INK.amber],
    ["sir_lags", "buffering lol", INK.magenta],
    ["juno_w", "cruise simulator", INK.cyan]
  ];
  var CHAT_HYPE = [
    ["kaibo", "BRO", INK.amber],
    ["nightshift_42", "NO WAYYYY", INK.cyan],
    ["juno_w", "WHAT WAS THAT", INK.cyan],
    ["toast_ghost", "CLIP IT", "#9EE37D"],
    ["sir_lags", "LMAOOOOOO", INK.magenta],
    ["vibe_tech", "HE'S FLYING", INK.cyan],
    ["mod_pancake", "CLIP THAT", INK.amber],
    ["lowkey_ren", "NAHHHHH", INK.magenta],
    ["fresh_hex", "??????????", INK.red],
    ["boss_noodle", "I'M CRYING", "#9EE37D"],
    ["dan_dan", "THE COPS TOO", INK.cyan],
    ["wren.gg", "HE DID NOT SEE IT", INK.amber],
    ["peach", "RUN IT BACK", INK.magenta],
    ["ozzy", "BROOOOOOO", "#9EE37D"]
  ];
  return __toCommonJS(engine_exports);
})();
