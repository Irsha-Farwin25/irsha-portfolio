"use client";

import { useEffect, useRef } from "react";

/** Camera distance for the perspective projection; smaller is a stronger 3D effect. */
const CAMERA = 1100;
/** How far the pointer's influence reaches on screen, in px. */
const REACH = 150;
/** Seconds a signal takes to cross from one layer to the next. */
const HOP = 0.6;
/** Seconds between forward passes (a wave of signals from input to output). */
const PASS_EVERY = 3.2;
/** Most signals a single forward pass may have arriving in any one layer. */
const PASS_WIDTH = 5;

type Node = { layer: number; angle: number; glow: number; out: number[] };
type Edge = { a: number; b: number };
type Pulse = { edge: number; t: number; pass: number };

/** Layer sizes: a wide middle like a real network's hidden layers, fewer on small screens. */
const shapeFor = (width: number) => (width < 768 ? [4, 6, 7, 6, 3] : [5, 8, 10, 10, 8, 5, 3]);

/** A fully connected feed-forward network: every node wired to every node in the next layer. */
function build(sizes: number[]) {
  const nodes: Node[] = [];
  const layers: number[][] = [];
  sizes.forEach((count, l) => {
    const offset = l * 0.7; // each ring starts turned a little further than the last
    layers.push(
      Array.from({ length: count }, (_, k) => {
        nodes.push({ layer: l, angle: offset + (k / count) * Math.PI * 2, glow: 0, out: [] });
        return nodes.length - 1;
      })
    );
  });
  const edges: Edge[] = [];
  for (let l = 0; l < layers.length - 1; l++)
    for (const a of layers[l])
      for (const b of layers[l + 1]) {
        nodes[a].out.push(edges.length);
        edges.push({ a, b });
      }
  return { nodes, edges, layers };
}

/**
 * A neural network turning slowly in 3D behind the hero. Each layer is a ring of nodes, wired to
 * every node in the next; depth fades and shrinks the far side. Every few seconds a forward pass
 * sweeps from input to output, lighting the nodes it passes through, and the output nodes report
 * their probabilities. The pointer tilts the network and fires the nodes nearest it. Paused off
 * screen and in background tabs; a still frame for visitors who prefer reduced motion.
 */
export function NeuralField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let net = build(shapeFor(0));
    let pulses: Pulse[] = [];
    let probs: number[] = [];
    /** One colour per layer, blending from the primary accent (input) to the second (output). */
    let layerColors: string[] = [];
    let dark = true;
    const pointer = { x: 0, y: 0, on: false };
    let yaw = 0;

    // Projected position, scale and nearness (0 far … 1 near) of every node, refreshed each frame.
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let ps = new Float32Array(0);
    let pf = new Float32Array(0);

    const readColors = () => {
      const root = document.documentElement;
      const s = getComputedStyle(root);
      const primary = s.getPropertyValue("--primary").trim();
      const accent = s.getPropertyValue("--chart-2").trim();
      dark = root.classList.contains("dark");
      // Let the browser mix the colours, so the canvas gets a plain colour it understands.
      const probe = document.createElement("span");
      document.body.appendChild(probe);
      const last = net.layers.length - 1;
      layerColors = net.layers.map((_, l) => {
        probe.style.color = `color-mix(in oklch, ${accent} ${Math.round((l / last) * 100)}%, ${primary})`;
        return getComputedStyle(probe).color;
      });
      probe.remove();
    };

    const resize = () => {
      const box = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      net = build(shapeFor(width));
      const n = net.nodes.length;
      px = new Float32Array(n);
      py = new Float32Array(n);
      ps = new Float32Array(n);
      pf = new Float32Array(n);
      pulses = [];
      probs = softmax(net.layers[net.layers.length - 1].length, -1);
      readColors();
      if (reduce) frame(0);
    };

    /** Random scores, softmaxed, with the given output strongly on top. */
    function softmax(count: number, top: number) {
      const raw = Array.from({ length: count }, (_, i) => Math.exp((i === top ? 3 : 0) + Math.random() * 1.2));
      const sum = raw.reduce((a, b) => a + b, 0);
      return raw.map((v) => v / sum);
    }

    const project = (time: number) => {
      const L = net.layers.length;
      const spanX = width * 0.47;
      const cx = width / 2;
      const cy = height * 0.46 + (pointer.on ? (pointer.y - height * 0.46) * 0.04 : 0);
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);
      net.nodes.forEach((node, i) => {
        const l = node.layer;
        // Rings bulge in the middle layers, like a network's hidden width.
        const radius = height * (0.15 + 0.2 * Math.sin((Math.PI * (l + 0.5)) / L));
        const a = node.angle + time * (0.09 + 0.012 * l);
        const x = -spanX + (2 * spanX * l) / (L - 1);
        const y = Math.sin(a) * radius;
        const z = Math.cos(a) * radius;
        // Turn about the vertical axis, then project.
        const xr = x * cos + z * sin;
        const zr = -x * sin + z * cos;
        const scale = CAMERA / (CAMERA + zr);
        px[i] = cx + xr * scale;
        py[i] = cy + y * scale;
        ps[i] = scale;
        pf[i] = Math.min(1, Math.max(0, 0.5 - zr / (radius * 2.4 + 1)));
      });
    };

    const near = (i: number) => {
      if (!pointer.on) return 0;
      const d = Math.hypot(px[i] - pointer.x, py[i] - pointer.y);
      return d < REACH ? 1 - d / REACH : 0;
    };

    // How many signals each forward pass has sent into each layer, so a pass stays a clean wave.
    const passLoad = new Map<number, number[]>();
    let passId = 0;

    const send = (node: number, pass: number, count: number) => {
      const out = net.nodes[node].out;
      for (let k = 0; k < count && out.length; k++) {
        if (pass) {
          const load = passLoad.get(pass)!;
          const next = net.nodes[node].layer + 1;
          if (load[next] >= PASS_WIDTH) return;
          load[next]++;
        }
        pulses.push({ edge: out[Math.floor(Math.random() * out.length)], t: 0, pass });
      }
    };

    const forwardPass = () => {
      passId++;
      passLoad.set(passId, new Array(net.layers.length).fill(0));
      const inputs = net.layers[0];
      for (let k = 0; k < 2; k++) {
        const node = inputs[Math.floor(Math.random() * inputs.length)];
        net.nodes[node].glow = 1;
        send(node, passId, 2);
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      // Light adds up on a dark page, so crossings glow; on a light page it would wash out.
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      // On a light page lines stack up dark instead of glowing, so it runs at half strength there.
      const strength = dark ? 1 : 0.5;

      // The weights: hairlines, fainter on the far side, brighter near the pointer.
      ctx.lineWidth = 0.75;
      for (const e of net.edges) {
        const depth = (pf[e.a] + pf[e.b]) / 2;
        const lit = Math.max(net.nodes[e.a].glow * net.nodes[e.b].glow, (near(e.a) + near(e.b)) / 2);
        ctx.globalAlpha = (0.04 + 0.11 * depth + 0.3 * lit) * strength;
        ctx.strokeStyle = layerColors[net.nodes[e.a].layer];
        ctx.beginPath();
        ctx.moveTo(px[e.a], py[e.a]);
        ctx.lineTo(px[e.b], py[e.b]);
        ctx.stroke();
      }

      // Signals: a bright head with a fading trail along its edge.
      for (const p of pulses) {
        const e = net.edges[p.edge];
        const color = layerColors[net.nodes[e.b].layer];
        const x = px[e.a] + (px[e.b] - px[e.a]) * p.t;
        const y = py[e.a] + (py[e.b] - py[e.a]) * p.t;
        const back = Math.max(0, p.t - 0.35);
        const tx = px[e.a] + (px[e.b] - px[e.a]) * back;
        const ty = py[e.a] + (py[e.b] - py[e.a]) * back;
        const s = (ps[e.a] + ps[e.b]) / 2;
        const trail = ctx.createLinearGradient(tx, ty, x, y);
        trail.addColorStop(0, "transparent");
        trail.addColorStop(1, color);
        ctx.globalAlpha = (p.pass ? 0.75 : 0.45) * strength;
        ctx.strokeStyle = trail;
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.18 * strength;
        ctx.beginPath();
        ctx.arc(x, y, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = Math.min(1, 0.9 * strength);
        ctx.beginPath();
        ctx.arc(x, y, 1.6 * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // Neurons: small and dim at the back, larger and brighter at the front, glowing when hit.
      net.nodes.forEach((node, i) => {
        const lit = Math.min(1, node.glow + near(i));
        const s = ps[i];
        ctx.fillStyle = layerColors[node.layer];
        if (lit > 0.02) {
          ctx.globalAlpha = 0.22 * lit * strength;
          ctx.beginPath();
          ctx.arc(px[i], py[i], (5 + 9 * lit) * s, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = Math.min(1, (0.3 + 0.45 * pf[i] + 0.4 * lit) * strength);
        ctx.beginPath();
        ctx.arc(px[i], py[i], (1.6 + 1.6 * pf[i]) * s, 0, Math.PI * 2);
        ctx.fill();
      });

      // The output layer's probabilities, beside each output node (wide screens only).
      // Dark mode only: on a light page the labels read as stray text at the screen edge.
      if (width >= 1280 && dark) {
        ctx.globalCompositeOperation = "source-over";
        ctx.font = "10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textBaseline = "middle";
        const outputs = net.layers[net.layers.length - 1];
        const color = layerColors[layerColors.length - 1];
        outputs.forEach((i, k) => {
          const top = probs[k] === Math.max(...probs);
          ctx.globalAlpha = (0.18 + 0.3 * pf[i] + 0.4 * net.nodes[i].glow + (top ? 0.12 : 0)) * strength;
          ctx.fillStyle = color;
          ctx.fillText(probs[k].toFixed(2), px[i] + 9 * ps[i], py[i]);
        });
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    let raf = 0;
    let last = 0;
    let clock = 0;
    let sincePass = PASS_EVERY - 0.8;
    let sinceAmbient = 0;
    let sincePointer = 0;
    let visible = true;

    function frame(now: number) {
      const dt = reduce ? 0 : Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      clock += dt;

      // Ease the turn towards a slow sway, plus a tilt that follows the pointer.
      const target = -0.28 + Math.sin(clock * 0.15) * 0.1 + (pointer.on ? ((pointer.x - width / 2) / width) * 0.35 : 0);
      yaw += (target - yaw) * Math.min(1, dt * 2.5);
      if (reduce) yaw = -0.28;
      project(reduce ? 2 : clock);

      if (!reduce) {
        sincePass += dt;
        if (sincePass > PASS_EVERY) {
          sincePass = 0;
          forwardPass();
        }
        // Between passes, a stray signal now and then keeps the network alive.
        sinceAmbient += dt;
        if (sinceAmbient > 0.7) {
          sinceAmbient = 0;
          const node = Math.floor(Math.random() * net.nodes.length);
          if (net.nodes[node].out.length) send(node, 0, 1);
        }
        // The pointer fires the node nearest it.
        sincePointer += dt;
        if (pointer.on && sincePointer > 0.3) {
          sincePointer = 0;
          let best = -1;
          let bestD = REACH;
          for (let i = 0; i < net.nodes.length; i++) {
            const d = Math.hypot(px[i] - pointer.x, py[i] - pointer.y);
            if (d < bestD && net.nodes[i].out.length) [best, bestD] = [i, d];
          }
          if (best >= 0) {
            net.nodes[best].glow = 1;
            send(best, 0, 2);
          }
        }

        for (const n of net.nodes) n.glow = Math.max(0, n.glow - dt * 1.1);
        const outputs = net.layers[net.layers.length - 1];
        pulses = pulses.filter((p) => {
          p.t += dt / HOP;
          if (p.t < 1) return true;
          // Arrived: the neuron fires; a forward pass carries on, a stray signal sometimes does.
          const node = net.edges[p.edge].b;
          net.nodes[node].glow = 1;
          const k = outputs.indexOf(node);
          if (k >= 0) probs = softmax(outputs.length, k);
          else if (p.pass) send(node, p.pass, Math.random() < 0.5 ? 2 : 1);
          else if (Math.random() < 0.5) send(node, 0, 1);
          return false;
        });
        if (passLoad.size > 4) passLoad.delete(passLoad.keys().next().value!);
      }

      draw();
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    const start = () => {
      if (reduce || raf || !visible || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    start();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    // Theme switches toggle a class on <html>; re-read the colours when they do.
    const mo = new MutationObserver(() => {
      readColors();
      if (reduce) frame(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme", "style"] });
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const section = canvas.closest("section");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const box = canvas.getBoundingClientRect();
      pointer.x = e.clientX - box.left;
      pointer.y = e.clientY - box.top;
      pointer.on = true;
    };
    const onLeave = () => (pointer.on = false);
    if (fine && section && !reduce) {
      section.addEventListener("pointermove", onMove);
      section.addEventListener("pointerleave", onLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      section?.removeEventListener("pointermove", onMove);
      section?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}
