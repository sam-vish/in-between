"use client";

import { useEffect, useRef } from "react";
import { useReduced } from "@/lib/useReduced";
import {
  APEX_S,
  CHAT_HYPE,
  INK,
  actionAt,
  createWorld,
  drawFacecam,
  render,
  rng,
  type World,
} from "@/world/engine";

/*
 * The signature moment, told as a story. Scrolling moves through one 8-hour stream,
 * and only one idea is on screen at a time. Meters, chat and the timeline appear
 * only when the story needs them, then leave.
 *
 * Every value is a pure function of scroll progress, so it plays correctly backwards.
 * To change pacing, edit the ranges below. Too fast means a taller section, not easing.
 */

/** The full explanation, for screen readers and the reduced-motion version. */
const STEPS = [
  { n: 1, name: "Watch", copy: "We tune into your live stream." },
  { n: 2, name: "Listen", copy: "Chat, audio, voice, vision. When they all spike at once, that's a clip." },
  { n: 3, name: "Cut", copy: "We grab 20s before and 15s after, so the setup and your reaction are both in it." },
  { n: 4, name: "Ship", copy: "Vertical, captioned, titled, and in your Discord in about 2 minutes. Our team checks every clip first." },
];

/** The on-screen narration: one line at a time. */
const LINES = [
  { label: "Watch", text: "We tune into your live stream.", a: 0.015, b: 0.085 },
  { label: "Watch", text: "Hours go by. Nothing happens.", a: 0.095, b: 0.175 },
  { label: "Listen", text: "We listen to chat, audio, voice and vision.", a: 0.19, b: 0.272 },
  { label: "Listen", text: "When they all spike at once, that's a clip.", a: 0.28, b: 0.425 },
  // 0.44 to 0.525 is silence on purpose: the stamp gets the whole screen.
  { label: "Cut", text: "We grab 20s before and 15s after,", a: 0.54, b: 0.6 },
  { label: "Cut", text: "so the setup and your reaction are both in it.", a: 0.605, b: 0.67 },
  { label: "Ship", text: "Vertical, captioned, titled.", a: 0.69, b: 0.795 },
  { label: "Ship", text: "In your Discord in about 2 minutes.", a: 0.805, b: 0.895 },
  { label: "Ship", text: "Our team checks every clip first.", a: 0.905, b: 1.02 },
];

const METERS = ["Chat", "Audio", "Voice", "Vision"] as const;
/** Action second when each meter goes into the red. */
const METER_SPIKE = [0.9, 1.6, 2.3, 3.0];

const STREAM_LEN = 8 * 3600;
const MOMENT_T = 5 * 3600 + 47 * 60 + 12; // 05:47:12
const CAPTION = ["BRO", "WHAT", "WAS", "THAT"];

const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const smooth = (u: number) => u * u * (3 - 2 * u);
const easeOut3 = (u: number) => 1 - Math.pow(1 - u, 3);
/** In over [a, a+f], out over [b-f, b]. */
const windowed = (p: number, a: number, b: number, f = 0.012) => seg(p, a, a + f) * (1 - seg(p, b - f, b));

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");
const fmt = (t: number) => `${pad(t / 3600)}:${pad((t % 3600) / 60)}:${pad(t % 60)}`;

/** Maps page progress to action seconds. Negative is cruising and the fast-forward. */
function actionSeconds(p: number) {
  if (p < 0.09) return -70 + 1.5 * seg(p, 0, 0.09);
  if (p < 0.18) return -68.5 + 67.5 * smooth(seg(p, 0.09, 0.18));
  if (p < 0.41) return -1 + (APEX_S + 1) * seg(p, 0.18, 0.41);
  return APEX_S;
}
function streamTime(p: number) {
  const s = actionSeconds(p);
  if (s < -1) return (MOMENT_T - 4) * ((s + 70) / 69);
  return MOMENT_T - 4 + (s + 1) * (4 / (APEX_S + 1));
}

/** Idle chatter until the action, then each meter pins in sequence. */
function meterTarget(i: number, s: number, clock: number) {
  const flutter = 0.5 + 0.5 * Math.sin(clock * (5.3 + i * 1.7) + i * 2.1) * Math.sin(clock * 2.1 + i);
  const idle = 0.1 + flutter * 0.16;
  const hit = smooth(seg(s, METER_SPIKE[i], METER_SPIKE[i] + 0.35));
  const hot = 0.9 + 0.1 * Math.sin(clock * 19 + i * 2);
  return idle + (hot - idle) * hit;
}

const CHAT = (() => {
  const r = rng(9);
  return Array.from({ length: 34 }, () => CHAT_HYPE[Math.floor(r() * CHAT_HYPE.length)]);
})();

export function SignalChain() {
  const reduced = useReduced();
  return reduced ? <StaticChain /> : <ScrubChain />;
}

function ScrubChain() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current!;
    const q = <T extends HTMLElement = HTMLElement>(s: string) => el.querySelector<T>(`[data-x="${s}"]`)!;
    const qa = (s: string) => Array.from(el.querySelectorAll<HTMLElement>(`[data-x="${s}"]`));

    const canvas = q<HTMLCanvasElement>("stage");
    const g = canvas.getContext("2d", { alpha: false })!;
    const phoneCanvas = q<HTMLCanvasElement>("phone-canvas");
    const pg = phoneCanvas.getContext("2d", { alpha: false })!;
    const tlCanvas = q<HTMLCanvasElement>("tl-canvas");
    const tg = tlCanvas.getContext("2d")!;

    const world: World = createWorld(4);

    const stage = q("sticky");
    const dim = q("dim");
    const corner = q("corner");
    const hudTime = q("hud-time");
    const bigTime = q("big-time");
    const hint = q("hint");
    const stamp = q("stamp");
    const lines = qa("line");
    const chat = q("chat");
    const chatWrap = q("chat-wrap");
    const meterEls = qa("meter-fill");
    const meterBank = q("meter-bank");
    const tlWrap = q("tl-wrap");
    const tl = q("timeline");
    const tlWin = q("tl-window");
    const tlHead = q("tl-head");
    const tlIn = q("tl-in");
    const tlOut = q("tl-out");
    const tlLabel = q("tl-label");
    const phone = q("phone");
    const phoneInner = q("phone-inner");
    const hook = q("hook");
    const capWords = qa("cap");
    const notif = q("notif");
    const notifHuman = q("notif-human");
    const notifAge = q("notif-age");

    let W = 0;
    let H = 0;
    let px = 4;
    let vw = 0;
    let vh = 0;
    let portrait = false;
    let phoneRect = { x: 0, y: 0, w: 0, h: 0 };
    let tlRect = { x: 0, y: 0, w: 0, h: 0 };
    let dirty = true;
    let cardOverClip = false;

    function layout() {
      W = stage.clientWidth;
      H = stage.clientHeight;
      portrait = W < 768;
      px = portrait ? 2 : clamp(Math.round(W / 380), 3, 6);
      vw = Math.ceil(W / px);
      vh = Math.ceil(H / px);
      canvas.width = vw;
      canvas.height = vh;

      // Reserve room for the tallest narration line, so nothing ever sits under it.
      const tallest = lines.reduce((m, n) => Math.max(m, n.offsetHeight), 0);
      stage.style.setProperty("--nh", `${tallest}px`);

      const stageBox = stage.getBoundingClientRect();
      const t = tl.getBoundingClientRect();
      tlRect = { x: t.left - stageBox.left, y: t.top - stageBox.top, w: t.width, h: t.height };
      tlCanvas.width = Math.max(40, Math.round(t.width));
      tlCanvas.height = Math.max(10, Math.round(t.height));

      if (portrait) {
        const top = 72;
        const room = Math.max(190, H - tallest - 34 - top);
        const h = Math.min(room, 620);
        const w = (h * 9) / 16;
        phoneRect = { x: (W - w) / 2, y: top + (room - h) / 2, w, h };
      } else {
        const top = 80;
        const room = H - top - 28;
        const h = Math.min(room, 680);
        const w = (h * 9) / 16;
        phoneRect = { x: W * 0.46, y: top + (room - h) / 2, w, h };
      }
      phone.style.left = `${phoneRect.x}px`;
      phone.style.top = `${phoneRect.y}px`;
      phone.style.width = `${phoneRect.w}px`;
      phone.style.height = `${phoneRect.h}px`;
      phone.style.setProperty("--pw", `${phoneRect.w}px`);

      // Beside the phone if there's room, otherwise over its lower edge.
      const nw = notif.offsetWidth;
      const beside = phoneRect.x + phoneRect.w + 24;
      cardOverClip = beside + nw > W - 12;
      notif.style.left = `${cardOverClip ? Math.max(10, W - 10 - nw) : beside}px`;
      notif.style.top = cardOverClip
        ? `${phoneRect.y + phoneRect.h - notif.offsetHeight - 10}px`
        : `${phoneRect.y + phoneRect.h * 0.3}px`;

      el.querySelectorAll<HTMLElement>(".meter").forEach((m) => (m.dataset.orient = portrait ? "h" : "v"));
      dirty = true;
    }

    const meterState = METERS.map(() => ({ v: 0.1, vel: 0 }));

    function tapeBands(p: number, t: number) {
      // VHS fast-forward bars, only while the tape is racing.
      const k = seg(p, 0.095, 0.11) * (1 - seg(p, 0.16, 0.18));
      if (k <= 0) return;
      const r = rng(Math.floor(t * 24) + 3);
      for (let b = 0; b < 3; b++) {
        const y = Math.floor(((t * (70 + b * 40) + b * 97) % (vh + 30)) - 15);
        const h = 3 + (b % 2) * 2;
        for (let i = 0; i < vw; i += 2) {
          if (r() < 0.55) {
            g.fillStyle = `rgba(239,230,210,${0.2 * k * (0.4 + r() * 0.6)})`;
            g.fillRect(i, y + Math.floor(r() * h), 2 + Math.floor(r() * 4), 1);
          }
        }
      }
    }

    function glitch(p: number) {
      // The freeze frame tears for a moment as the stamp lands.
      const k = seg(p, 0.432, 0.44) * (1 - seg(p, 0.452, 0.465));
      if (k <= 0) return;
      const r = rng(Math.floor(p * 900));
      for (let i = 0; i < 9; i++) {
        const y = Math.floor(r() * vh);
        const h = 2 + Math.floor(r() * 12);
        const dx = Math.floor((r() - 0.5) * 34 * k);
        g.drawImage(canvas, 0, y, vw, h, dx, y, vw, h);
      }
    }

    function drawTimeline(viewA: number, viewB: number, playT: number) {
      const w = tlCanvas.width;
      const h = tlCanvas.height;
      tg.clearRect(0, 0, w, h);
      const span = viewB - viewA;
      const inA = MOMENT_T - 20;
      const inB = MOMENT_T + 15;
      for (let x = 0; x < w; x += 4) {
        const t = viewA + (x / w) * span;
        const bucket = Math.floor(t / Math.max(1, span / (w / 4)));
        const r = Math.abs(Math.sin(bucket * 12.9898) * 43758.5453) % 1;
        const d = (t - MOMENT_T) / 14;
        const lv = clamp(0.08 + r * 0.2 + Math.exp(-d * d) * 0.95);
        const barH = Math.max(1, lv * h);
        const inWin = t >= inA && t <= inB;
        tg.fillStyle = inWin ? INK.red : t <= playT ? "rgba(239,230,210,.55)" : "rgba(239,230,210,.18)";
        tg.fillRect(x, h - barH, 3, barH);
      }
    }

    let raf = 0;
    let running = false;
    let last = performance.now();
    let pSmooth = 0;
    let prevP = -1;

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const box = el.getBoundingClientRect();
      const travel = box.height - H;
      const raw = clamp(-box.top / Math.max(1, travel));
      pSmooth += (raw - pSmooth) * (1 - Math.exp(-dt * 11));
      if (Math.abs(raw - pSmooth) < 0.00004) pSmooth = raw;
      const p = pSmooth;

      const s = actionSeconds(p);
      const a = actionAt(s);
      const t = streamTime(p);

      // Meters only do work while they're on screen.
      const metersOn = windowed(p, 0.195, 0.43, 0.018);
      if (metersOn > 0) {
        const clock = s + now / 1400;
        meterState.forEach((m, i) => {
          const target = meterTarget(i, s, clock);
          m.vel += (target - m.v) * 150 * dt - m.vel * 13 * dt;
          m.v += m.vel * dt;
          const v = clamp(m.v);
          meterEls[i].style.clipPath = portrait
            ? `inset(0 ${(1 - v) * 100}% 0 0)`
            : `inset(${(1 - v) * 100}% 0 0 0)`;
        });
      }

      if (p === prevP && !dirty && a.police === Infinity) return;
      prevP = p;
      dirty = false;

      /* ── the stream ── */
      render(g, world, {
        vw,
        vh,
        s,
        focusX: portrait ? 0.5 : 0.56,
        focusY: portrait ? 0.4 : 0.42,
        showAction: s > -2.4,
      });

      // The streamer only shows up when there's something to react to.
      const camO = windowed(p, 0.285, 0.43, 0.012);
      if (camO > 0) {
        const pu = seg(s, 3.1, 3.25);
        const punch = pu > 0 && pu < 1 ? Math.sin(pu * Math.PI) : 0;
        const fw = portrait ? 66 : Math.round(256 / px);
        const fh = portrait ? 50 : Math.round(192 / px);
        const fx = vw - fw - (portrait ? 6 : Math.round(24 / px));
        const fy = Math.ceil((portrait ? 68 : 84) / px);
        g.globalAlpha = camO;
        g.fillStyle = "#0B0B0C";
        g.fillRect(fx - 1, fy - 1, fw + 2, fh + 2);
        drawFacecam(g, fx, fy, fw, fh, s, a.shock, punch);
        g.globalAlpha = 1;
      }

      tapeBands(p, p * 240);
      glitch(p);

      /* ── one line at a time ── */
      LINES.forEach((l, i) => {
        const o = windowed(p, l.a, l.b);
        const node = lines[i];
        node.style.opacity = String(o);
        node.style.visibility = o < 0.01 ? "hidden" : "visible";
        node.style.transform = `translateY(${(1 - seg(p, l.a, l.a + 0.012)) * 14}px)`;
      });
      hint.style.opacity = String(1 - seg(p, 0.002, 0.012));

      /* ── clocks: the big one is the story during the fast-forward ── */
      const bigO = windowed(p, 0.098, 0.178, 0.012);
      bigTime.style.opacity = String(bigO);
      bigTime.textContent = fmt(t);
      hudTime.textContent = fmt(t);
      corner.style.opacity = String((1 - bigO) * (1 - seg(p, 0.436, 0.44)));

      /* ── signals ── */
      meterBank.style.opacity = String(metersOn);
      chatWrap.style.opacity = String(windowed(p, 0.29, 0.43, 0.012));
      const idx = 26 * seg(p, 0.29, 0.43);
      chat.style.transform = `translate3d(0, ${-(idx * (portrait ? 20 : 26))}px, 0)`;

      /* ── stamp, alone ── */
      const sU = seg(p, 0.436, 0.452);
      const sOut = seg(p, 0.515, 0.53);
      stamp.style.opacity = String(sU <= 0 ? 0 : (sU > 0.15 ? 1 : sU / 0.15) * (1 - sOut));
      stamp.style.transform = `translate(-50%, -50%) rotate(-3deg) scale(${1.3 - 0.3 * easeOut3(sU)})`;

      /* ── timeline: 8 hours collapses into a 35 second window ── */
      dim.style.opacity = String(0.95 * smooth(seg(p, 0.52, 0.56)));
      const tlO = windowed(p, 0.535, 0.7, 0.014);
      tlWrap.style.opacity = String(tlO);
      tlWrap.style.visibility = tlO < 0.01 ? "hidden" : "visible";
      const z = smooth(seg(p, 0.555, 0.635));
      const halfSpan = Math.exp(Math.log(STREAM_LEN / 2) + (Math.log(62) - Math.log(STREAM_LEN / 2)) * z);
      const centre = STREAM_LEN / 2 + (MOMENT_T - STREAM_LEN / 2) * z;
      const viewA = centre - halfSpan;
      const viewB = centre + halfSpan;
      const span = viewB - viewA;
      const toPct = (v: number) => ((v - viewA) / span) * 100;
      const winL = toPct(MOMENT_T - 20);
      const winR = toPct(MOMENT_T + 15);
      tlHead.style.left = `${toPct(t)}%`;
      tlWin.style.left = `${winL}%`;
      tlWin.style.width = `${winR - winL}%`;
      tlIn.style.opacity = tlOut.style.opacity = String(seg(p, 0.61, 0.635));
      tlIn.style.left = `${winL}%`;
      tlOut.style.left = `${winR}%`;
      tlLabel.textContent = z > 0.5 ? "35 SECONDS" : "8 HOURS";
      if (tlO > 0) drawTimeline(viewA, viewB, t);

      /* ── the window lifts off the timeline and becomes a phone ── */
      const m = smooth(seg(p, 0.67, 0.74));
      const from = {
        x: tlRect.x + (tlRect.w * winL) / 100,
        y: tlRect.y,
        w: Math.max(6, (tlRect.w * (winR - winL)) / 100),
        h: tlRect.h,
      };
      const sx = (from.w + (phoneRect.w - from.w) * m) / phoneRect.w;
      const sy = (from.h + (phoneRect.h - from.h) * m) / phoneRect.h;
      const tx = from.x + (phoneRect.x - from.x) * m - phoneRect.x;
      const ty = from.y + (phoneRect.y - from.y) * m - phoneRect.y;
      phone.style.opacity = p > 0.67 ? "1" : "0";
      phone.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sx}, ${sy})`;
      phoneInner.style.opacity = String(seg(p, 0.715, 0.74));

      /* ── the clip, scrubbed by hand ── */
      if (p > 0.68) {
        const replay = 0.9 + 4.4 * seg(p, 0.74, 0.92);
        const ra = actionAt(replay);
        const cw = phoneCanvas.width;
        const ch = phoneCanvas.height;
        const camH = Math.floor(ch * 0.4);
        pg.save();
        pg.beginPath();
        pg.rect(0, camH, cw, ch - camH);
        pg.clip();
        pg.translate(0, camH);
        render(pg, world, { vw: cw, vh: ch - camH, s: replay, focusX: 0.5 });
        pg.restore();
        const rp = seg(replay, 3.1, 3.25);
        drawFacecam(pg, 0, 0, cw, camH, replay, ra.shock, rp > 0 && rp < 1 ? Math.sin(rp * Math.PI) : 0);
        pg.fillStyle = INK.bg;
        pg.fillRect(0, camH - 1, cw, 2);

        hook.style.opacity = String(seg(p, 0.74, 0.755));
        const words = [3.05, 3.4, 3.72, 4.05];
        capWords.forEach((w, i) => {
          const u = seg(replay, words[i], words[i] + 0.1);
          w.style.opacity = u > 0 ? "1" : "0";
          w.style.transform = `scale(${1.35 - 0.35 * u})`;
        });

        // When the card sits over the clip, it waits until the car has landed.
        const nStart = cardOverClip ? 0.885 : 0.81;
        const nU = easeOut3(seg(p, nStart, nStart + 0.03));
        notif.style.opacity = String(seg(p, nStart, nStart + 0.015));
        notif.style.transform = `translate3d(${(1 - nU) * 30}px, 0, 0)`;
        notifHuman.style.opacity = String(seg(p, 0.91, 0.925));
        const age = 102 * seg(p, 0.74, nStart + 0.015); // 01:42
        notifAge.textContent = `${pad(age / 60)}:${pad(age % 60)}`;
      } else {
        notif.style.opacity = "0";
      }
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(frame);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "120px" },
    );

    layout();
    io.observe(el);
    const ro = new ResizeObserver(layout);
    ro.observe(stage);
    document.fonts?.ready.then(layout);

    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="how" ref={root} aria-labelledby="how-title" className="relative h-[760svh] md:h-[900svh]">
      <div data-x="sticky" className="sticky top-0 h-svh overflow-hidden bg-phosphor">
        <canvas data-x="stage" aria-hidden className="pix absolute inset-0 h-full w-full" />

        {/* Readable floor for the narration. A plain fade, nothing on the text itself. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-[linear-gradient(to_top,#0b0b0c_18%,rgb(11_11_12/0.72)_52%,transparent)]"
        />
        <div data-x="dim" aria-hidden className="pointer-events-none absolute inset-0 bg-[#08080a] opacity-0" />

        <h2 id="how-title" className="sr-only">
          How it works
        </h2>
        <ol className="sr-only">
          {STEPS.map((st) => (
            <li key={st.n}>
              {st.name}. {st.copy}
            </li>
          ))}
        </ol>

        {/* Small clock, corner */}
        <div
          data-x="corner"
          aria-hidden
          className="hud absolute left-[var(--gutter)] top-[66px] flex items-center gap-2 rounded-sm bg-[#0b0b0c] px-2 py-0.5 text-[1.2rem] text-cream md:top-[76px] md:text-[1.45rem]"
        >
          <span className="rec-dot" />
          <span data-x="hud-time" className="tabular-nums">
            00:00:00
          </span>
        </div>

        {/* Big clock, fast-forward only */}
        <div
          data-x="big-time"
          aria-hidden
          className="hud absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 text-[21vw] leading-none tracking-[-0.02em] text-cream tabular-nums opacity-0 md:text-[min(15vw,28vh)]"
        >
          00:00:00
        </div>

        <div
          data-x="hint"
          aria-hidden
          className="hud absolute bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[1.3rem] text-cream"
        >
          ▼ KEEP SCROLLING
        </div>

        {/* Meters: stacked bars on phones, a small vertical bank on desktop. */}
        <div
          data-x="meter-bank"
          aria-hidden
          className="absolute bottom-[calc(var(--nh,120px)+40px)] left-[var(--gutter)] flex w-[calc(100%-var(--gutter)*2)] flex-col gap-1 opacity-0 md:bottom-[calc(var(--nh,160px)+56px)] md:w-auto md:flex-row md:gap-3"
        >
          {METERS.map((m) => (
            <div key={m} className="flex items-center gap-2 md:flex-col md:gap-1">
              <div className="hud w-[3.2em] flex-none text-[1rem] uppercase md:order-2 md:w-auto md:text-[1.1rem]">{m}</div>
              <div
                className="meter h-[12px] flex-1 [--seg:7px] md:order-1 md:h-[min(26vh,220px)] md:w-[min(4.2vw,56px)] md:flex-none md:[--seg:9px]"
                data-orient="v"
              >
                <div className="meter-track" />
                <div data-x="meter-fill" className="meter-fill" style={{ clipPath: "inset(90% 0 0 0)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Chat: only when it's losing it */}
        <div
          data-x="chat-wrap"
          aria-hidden
          className="pointer-events-none absolute left-[var(--gutter)] top-[100px] h-[80px] w-[46%] overflow-hidden rounded-sm bg-[#0b0b0c]/85 px-2 opacity-0 md:left-auto md:right-[24px] md:top-[calc(84px+192px+10px)] md:h-[182px] md:w-[256px]"
        >
          <div data-x="chat" className="hud will-change-transform">
            {CHAT.map(([who, msg, color], i) => (
              <div
                key={i}
                className="h-[20px] truncate text-[0.98rem] leading-[20px] md:h-[26px] md:text-[1.2rem] md:leading-[26px]"
              >
                <span style={{ color }}>{who}</span>
                <span className="text-cream">: {msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stamp */}
        <div
          data-x="stamp"
          aria-hidden
          className="stamp absolute left-1/2 top-[56%] z-10 text-[12.4vw] opacity-0 md:left-[56%] md:top-[60%] md:text-[min(7vw,13vh)]"
        >
          Moment detected
        </div>

        {/* Timeline: only for the cut */}
        <div
          data-x="tl-wrap"
          aria-hidden
          className="absolute inset-x-[var(--gutter)] top-[30%] z-10 opacity-0 md:top-[26%]"
        >
          <p data-x="tl-label" className="display mb-3 text-[2.6rem] text-cream md:text-[min(5vw,9vh)]">
            8 HOURS
          </p>
          <div data-x="timeline" className="relative h-[84px] md:h-[130px]">
            <canvas data-x="tl-canvas" className="absolute inset-0 h-full w-full" />
            <div data-x="tl-window" className="absolute inset-y-0 border-2 border-signal" />
            <div data-x="tl-head" className="absolute inset-y-0 w-[2px] bg-cream" />
          </div>
          <div className="relative mt-2 h-6">
            <div data-x="tl-in" className="hud absolute -translate-x-1/2 text-[1.35rem] text-cream opacity-0">
              -20s
            </div>
            <div data-x="tl-out" className="hud absolute -translate-x-1/2 text-[1.35rem] text-cream opacity-0">
              +15s
            </div>
          </div>
        </div>

        {/* The phone: starts life as the timeline window. */}
        <div
          data-x="phone"
          aria-hidden
          className="absolute z-20 origin-top-left overflow-hidden rounded-[22px] bg-signal/25 opacity-0 will-change-transform"
        >
          <div data-x="phone-inner" className="absolute inset-0 bg-phosphor opacity-0">
            <canvas data-x="phone-canvas" width={135} height={240} className="pix absolute inset-0 h-full w-full" />
            <div
              data-x="hook"
              className="display absolute inset-x-[6%] top-[3%] bg-cream px-[0.4em] pb-[0.1em] pt-[0.22em] text-center text-[calc(var(--pw)*0.074)] text-ink opacity-0"
            >
              He did not see that coming
            </div>
            <div className="display absolute inset-x-0 top-[33%] flex flex-wrap justify-center gap-x-[0.26em] px-[6%] text-[calc(var(--pw)*0.17)] leading-none text-cream [text-shadow:0_3px_0_#000,2px_0_0_#000,-2px_0_0_#000]">
              {CAPTION.map((w, i) => (
                <span key={w} data-x="cap" className="inline-block opacity-0" style={{ color: i === 1 ? "#FFB547" : undefined }}>
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Clip-ready card */}
        <div
          data-x="notif"
          aria-hidden
          className="absolute z-30 w-[min(72vw,320px)] rounded-[6px] bg-[#191720] p-3 opacity-0 md:p-4"
        >
          <div className="hud flex items-center justify-between gap-3 text-[1rem] text-cream-dim md:text-[1.15rem]">
            <span># clips</span>
            <span>
              T+
              <span data-x="notif-age" className="tabular-nums">
                00:00
              </span>
            </span>
          </div>
          <div className="hud mt-1 flex items-center gap-2 text-[1.4rem] leading-none text-cream md:text-[1.7rem]">
            <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-go text-[1rem] text-ink">✓</span>
            Clip ready · 01:42 after moment
          </div>
          <div data-x="notif-human" className="mt-2 text-[0.88rem] text-cream-dim opacity-0 md:text-[0.95rem]">
            Checked by a human on our team.
          </div>
        </div>

        {/* Narration. Lines stack in one spot and only one shows. */}
        <div
          aria-hidden
          className="absolute bottom-6 left-[var(--gutter)] right-[var(--gutter)] z-10 md:bottom-10 md:right-auto md:w-[min(40vw,560px)]"
        >
          {LINES.map((l) => (
            <div key={l.text} data-x="line" className="absolute inset-x-0 bottom-0 opacity-0">
              <p className="hud mb-1.5 text-[1.3rem] uppercase text-signal md:text-[1.5rem]">{l.label}</p>
              <p className="display text-[2.35rem] md:text-[min(3.9vw,7.4vh)]">{l.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Reduced motion: the same story as four still frames, nothing pinned or scrubbed. */
function StaticChain() {
  const frames = [-6, 2.8, APEX_S, 4.9];
  const canvases = useRef<Array<HTMLCanvasElement | null>>([]);

  useEffect(() => {
    const world = createWorld(4);
    canvases.current.forEach((c, i) => {
      if (!c) return;
      const g = c.getContext("2d")!;
      const s = frames[i];
      render(g, world, { vw: c.width, vh: c.height, s, focusX: 0.5, showAction: s > -2.4 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="how" aria-labelledby="how-title" className="px-[var(--gutter)] py-24">
      <h2 id="how-title" className="display mb-14 text-[3.4rem] md:text-[5.4rem]">
        How it works
      </h2>
      <ol className="mx-auto grid max-w-[880px] gap-16">
        {STEPS.map((st, i) => (
          <li key={st.n}>
            <canvas
              ref={(c) => {
                canvases.current[i] = c;
              }}
              width={320}
              height={160}
              aria-hidden
              className="pix block aspect-[2/1] w-full rounded-sm"
            />
            <p className="display mt-5 text-[2.6rem]">{st.name}</p>
            <p className="mt-2 max-w-[46ch] text-[1.1rem]">{st.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
