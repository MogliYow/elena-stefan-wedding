"use strict";
var OgnenSilk = (() => {
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
  var silkRelief_exports = {};
  __export(silkRelief_exports, {
    mountSilk: () => mountSilk
  });
  const width = 690;
  const height = 353;
  const marginX = 220;
  const marginY = 42;
  const canvasWidth = width + 2 * marginX;
  const canvasHeight = height + marginY + 225;
  function ease(p, a, b) {
    const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }
  const cutouts = [
    ["leftTail", 44, 152, 270, 201, "M45 353V254L95 202Q147 202 177 192Q232 175 289 153L312 166Q294 202 263 249L190 353Z"],
    ["rightTail", 347, 153, 298, 200, "M349 168L371 153Q391 165 423 194Q451 223 473 244Q492 259 528 261L551 253L645 270V353H394Q388 261 353 195Z"],
    ["leftLoop", 72, 0, 244, 206, "M73 0H308L316 143L288 165Q245 180 206 190Q156 208 121 197Q88 196 84 168Q65 127 77 97Z"],
    ["rightLoop", 358, 0, 244, 234, "M362 104L401 0H568Q584 60 589 110L601 185Q595 208 534 224Q489 235 460 219Q433 211 410 187Q392 165 362 160Z"],
    ["leftWrap", 286, 90, 72, 109, "M285 113Q295 88 317 99Q331 86 350 101L355 108Q343 126 334 146Q317 181 303 198Q288 197 285 166Z"],
    ["rightWrap", 299, 94, 83, 106, "M351 99Q381 104 378 137Q383 173 362 184Q345 197 301 195Q321 168 332 146Q347 110 351 99Z"]
  ];
  function makeCloth(image) {
    const density = image.naturalWidth / width;
    function piece(kind, x, y, w, h, path) {
      const surface = document.createElement("canvas");
      surface.width = Math.ceil(w * density);
      surface.height = Math.ceil(h * density);
      const ctx = surface.getContext("2d");
      ctx.scale(surface.width / w, surface.height / h);
      if (path) {
        ctx.translate(-x, -y);
        ctx.clip(new Path2D(path));
        ctx.drawImage(image, 0, 0, width, height);
      } else {
        const tileWidth = 58;
        for (let i = 0; i < Math.ceil(w / tileWidth); i++) {
          ctx.save();
          ctx.translate((i + i % 2) * tileWidth, 0);
          ctx.scale(i % 2 ? -1 : 1, 1);
          ctx.drawImage(image, 8 * density, 110 * density, tileWidth * density, 77 * density, 0, 0, tileWidth, h);
          ctx.restore();
        }
      }
      return { piece: kind, x, y, w, h, surface };
    }
    return [
      piece("leftBand", 0, 110, 335, 77),
      piece("rightBand", 334, 110, 356, 77),
      ...cutouts.map(([kind, x, y, w, h, path]) => piece(kind, x, y, w, h, path))
    ];
  }
  function pose(p) {
    return {
      tension: ease(p, 0, 0.135),
      rightLoop: ease(p, 0.057, 0.306),
      leftLoop: ease(p, 0.237, 0.463),
      unroll: ease(p, 0.34, 0.545),
      apart: ease(p, 0.475, 0.72),
      sweep: ease(p, 0.65, 0.92)
    };
  }
  function station(kind, x, y, k) {
    const right = kind.startsWith("right");
    const sign = right ? 1 : -1;
    const knotX = 334, knotY = 149;
    const dx = x - knotX, dy = y - knotY;
    const shift = sign * (k.apart * (right ? 204 : 198) + k.sweep * 620);
    const fall = k.apart * (right ? 30 : 3) + k.sweep * (right ? 122 : 81);
    function project(px, py, z) {
      return { x: px + z * 0.09, y: py - z * 0.27 };
    }
    if (kind.endsWith("Band")) {
      const t = 1 - Math.min(1, Math.abs(dx) / (right ? 356 : 334));
      const free = ease(k.apart, 0, 1);
      const sag = Math.sin(Math.PI * t);
      const endShift = shift * t + sign * k.sweep * 605 * (1 - t);
      const turn = 1 - 0.8 * t * t + 0.2 * t * t * k.unroll;
      const bend = k.unroll * ease(t, 0.63, 1);
      const edge = dy * turn;
      const edgeAngle = -sign * 1.03 * bend;
      return project(x + endShift - sign * bend * (right ? 80 : 70) - edge * Math.sin(edgeAngle), knotY + edge * Math.cos(edgeAngle) + fall * t + bend * (right ? 81 : 85) + sag * (k.apart * 38 + k.tension * 9) + k.sweep * 76 * (1 - t), 13 * sag * k.apart);
    }
    if (kind.endsWith("Loop")) {
      const t = right ? k.rightLoop : k.leftLoop;
      const lift = Math.sin(Math.PI * t);
      const s = Math.min(1, Math.abs(dx) / 245);
      const contracted = (1 - t) * (1 - 0.14 * t * s);
      return project(
        knotX + dx * contracted + sign * s * lift * 5,
        knotY + dy * (1 - t) * (1 - 0.48 * t) - s * lift * 19 + s * s * lift * 23,
        s * lift * 32
      );
    }
    if (kind.endsWith("Tail")) {
      const t = Math.min(1, Math.max(0, (Math.abs(dx) - 27) / (right ? 267 : 247)));
      const root = ease(t, 0, 0.65);
      const feed = right ? k.rightLoop : k.leftLoop;
      const flick = Math.sin(Math.PI * feed);
      const strandShift = -sign * (k.apart * (right ? 198 : 204) + k.sweep * 620);
      const strandFall = k.apart * (right ? 3 : 30) + k.sweep * (right ? 81 : 122);
      const rootX = knotX + strandShift;
      const extra = (right ? 164 : 98) * feed + (right ? 30 : 0) * k.tension;
      const angle = sign * ((right ? 0.29 : 0.19) * feed + 0.24 * k.apart) * root;
      const drapeX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const drapeY = dx * Math.sin(angle) + dy * Math.cos(angle);
      return project(
        rootX + drapeX * (1 - 0.1 * k.apart) + sign * t * (right ? 29 : 22) * feed + sign * Math.sin(Math.PI * t) * flick * 14,
        knotY + strandFall + drapeY + t * extra - Math.sin(Math.PI * t) * flick * 28,
        Math.sin(Math.PI * t) * (flick * 31 + k.apart * 13)
      );
    }
    const open = k.unroll;
    const a = sign * (0.44 * open + 0.27 * k.apart) + 0.1 * k.tension;
    const u = dx * (1 + 0.48 * open), v = dy * (1 - 0.55 * open);
    return project(
      knotX + shift + u * Math.cos(a) - v * Math.sin(a) + sign * open * 13,
      knotY + fall + u * Math.sin(a) + v * Math.cos(a) - open * 4,
      Math.sin(open * Math.PI) * 13
    );
  }
  function drawCloth(ctx, cloth, k) {
    const { piece, x, y, w, h, surface } = cloth;
    if (piece === "leftLoop" && k.leftLoop > 0.994 || piece === "rightLoop" && k.rightLoop > 0.994) return;
    if (piece.endsWith("Wrap") && k.unroll >= 0.997) return;
    const columns = Math.ceil(w / 8);
    const middle = y + h * 0.5;
    let at = station(piece, x, middle, k);
    for (let i = 0; i < columns; i++) {
      const u0 = i / columns, u1 = (i + 1) / columns;
      const sx = x + w * (u0 + u1) / 2;
      const next = station(piece, x + w * u1, middle, k);
      const top = station(piece, sx, y, k), bottom = station(piece, sx, y + h, k);
      ctx.save();
      if (piece.endsWith("Wrap")) ctx.globalAlpha *= 1 - ease(k.unroll, 0.53, 1);
      if (piece.endsWith("Band")) {
        const atRoot = piece === "leftBand" ? u1 : 1 - u0;
        ctx.globalAlpha *= 1 - k.unroll * ease(atRoot, 0.89, 1);
      }
      if (piece.endsWith("Tail")) {
        const fromRoot = Math.abs(sx - 334);
        ctx.globalAlpha *= 1 - k.unroll * (1 - ease(fromRoot, 37, 68));
      }
      ctx.transform(
        next.x - at.x,
        next.y - at.y,
        bottom.x - top.x,
        bottom.y - top.y,
        at.x - 0.5 * (bottom.x - top.x),
        at.y - 0.5 * (bottom.y - top.y)
      );
      ctx.drawImage(surface, surface.width * u0, 0, surface.width / columns, surface.height, 0, 0, 1.09, 1);
      ctx.restore();
      at = next;
    }
  }
  function unwrapWeave(photo) {
    const source = document.createElement("canvas");
    source.width = width;
    source.height = height;
    const src = source.getContext("2d");
    src.drawImage(photo, 0, 0, width, height);
    const pixels = src.getImageData(0, 0, width, height).data;
    const rows = [
      [373, 167, 360, 178],
      [395, 179, 371, 205],
      [428, 208, 388, 251],
      [462, 239, 408, 283],
      [507, 261, 443, 316],
      [552, 267, 483, 339],
      [589, 278, 528, 344],
      [621, 293, 560, 333]
    ];
    const weave = document.createElement("canvas");
    weave.width = 690;
    weave.height = 82;
    const ctx = weave.getContext("2d"), result = ctx.createImageData(weave.width, weave.height);
    for (let i = 0; i < weave.width; i++) {
      const u = i / (weave.width - 1);
      const k = Math.min(rows.length - 1.001, ease(u, 0.36, 1) * (rows.length - 1));
      const a = rows[Math.floor(k)], b = rows[Math.floor(k) + 1], amount = k - Math.floor(k);
      const edge = a.map((v, j) => v + (b[j] - v) * amount);
      for (let j = 0; j < weave.height; j++) {
        const v = j / (weave.height - 1);
        const x = Math.round(edge[0] + (edge[2] - edge[0]) * v), y = Math.round(edge[1] + (edge[3] - edge[1]) * v);
        const tip = (y * width + x) * 4;
        const band = (Math.floor(112 + 72 * v) * width + Math.floor(8 + 50 * (1 - Math.abs(i % 100 - 50) / 50))) * 4;
        const weight = 0.8 * ease(u, 0.37, 0.62) * pixels[tip + 3] / 255;
        const out = (j * weave.width + i) * 4;
        for (let c = 0; c < 3; c++) result.data[out + c] = pixels[band + c] * (1 - weight) + pixels[tip + c] * weight;
        result.data[out + 3] = 255;
      }
    }
    ctx.putImageData(result, 0, 0);
    return weave;
  }
  function drawLooseStrand(ctx, weave, rightTip, k) {
    const sign = rightTip ? 1 : -1;
    const joinX = 334 - sign * (k.apart * (rightTip ? 198 : 204) + k.sweep * 690);
    const joinY = 152 + k.apart * (rightTip ? 3 : 30) + k.sweep * (rightTip ? 81 : 122);
    const outerX = (rightTip ? -3 : 693) - sign * k.sweep * 690;
    const hemX = joinX + sign * (rightTip ? 234 : 204);
    const hemY = joinY + (rightTip ? 389 : 321);
    const flutter = Math.sin(Math.PI * k.apart);
    const point = (x, y) => ({ x, y });
    const start = point(outerX, 148 + k.sweep * 70);
    const elbow = point(joinX, joinY);
    const bend = point(joinX + sign * (rightTip ? 90 : 95), joinY + (rightTip ? 192 : 155));
    const tip = point(hemX, hemY);
    const at = (u) => {
      let a, b, c, d, t;
      if (u < 0.45) {
        t = u / 0.45;
        a = start;
        b = point(outerX + (joinX - outerX) * 0.42, start.y + 11 * k.apart);
        c = point(joinX - sign * (50 - 20 * k.apart), joinY - 23);
        d = elbow;
      } else if (u < 0.75) {
        t = (u - 0.45) / 0.3;
        a = elbow;
        b = point(joinX + sign * (49 - 20 * k.apart), joinY + 23);
        c = point(bend.x - sign * (21 + flutter * 16), bend.y - 51);
        d = bend;
      } else {
        t = (u - 0.75) / 0.25;
        a = bend;
        b = point(bend.x + sign * (20 + flutter * 16), bend.y + 49);
        c = point(hemX - sign * (49 - flutter * 10), hemY - 21);
        d = tip;
      }
      const f = 1 - t;
      return point(
        f * f * f * a.x + 3 * f * f * t * b.x + 3 * f * t * t * c.x + t * t * t * d.x,
        f * f * f * a.y + 3 * f * f * t * b.y + 3 * f * t * t * c.y + t * t * t * d.y
      );
    };
    const sections = 76;
    const centres = [], upper = [], lower = [];
    for (let i = 0; i <= sections; i++) {
      const u = i / sections, centre = at(u);
      const before = at(Math.max(0, u - 2e-3)), after = at(Math.min(1, u + 2e-3));
      const len = Math.hypot(after.x - before.x, after.y - before.y);
      const tx = (after.x - before.x) / len, ty = (after.y - before.y) / len;
      const twist = Math.sin((u - 0.33) * 10 + flutter * 0.5) * ease(u, 0.03, 0.4);
      const breadth = (72 - 28 * Math.exp(-((u - 0.45) ** 2) / 8e-3)) * (1 - 0.34 * twist * twist);
      const slant = ease(u, 0.83, 1) * 0.42;
      const vx = (-ty * sign + slant * tx) * breadth / 2, vy = (tx * sign + slant * ty) * breadth / 2;
      centres.push(centre);
      upper.push(point(centre.x - vx, centre.y - vy));
      lower.push(point(centre.x + vx, centre.y + vy));
    }
    const edge = new Path2D();
    edge.moveTo(upper[0].x, upper[0].y);
    upper.forEach((v) => edge.lineTo(v.x, v.y));
    for (let i = sections; i >= 0; i--) edge.lineTo(lower[i].x, lower[i].y);
    edge.closePath();
    ctx.save();
    ctx.clip(edge);
    for (let i = 0; i < sections; i++) {
      const a = centres[i], b = centres[i + 1], dx = b.x - a.x, dy = b.y - a.y;
      const vx = lower[i].x - upper[i].x, vy = lower[i].y - upper[i].y;
      ctx.save();
      ctx.transform(dx, dy, vx, vy, upper[i].x, upper[i].y);
      const step = (weave.width - 20) / sections;
      const sx = 8 + (i - 0.65) * step;
      ctx.drawImage(weave, sx, 0, 2.35 * step, weave.height, -0.65, -0.08, 2.35, 1.16);
      ctx.restore();
    }
    ctx.restore();
  }
  function mountSilk(host, image, progress) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cloth = makeCloth(image);
    const weave = unwrapWeave(image);
    canvas.style.left = -100 * marginX / width + "%";
    canvas.style.top = -100 * marginY / height + "%";
    canvas.style.width = 100 * canvasWidth / width + "%";
    canvas.style.height = 100 * canvasHeight / height + "%";
    host.appendChild(canvas);
    function paint() {
      if (!ctx) return;
      ctx.setTransform(canvas.width / canvasWidth, 0, 0, canvas.height / canvasHeight, 0, 0);
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      const p = progress();
      if (p >= 0.92 || p <= 0) return;
      ctx.translate(marginX, marginY);
      ctx.imageSmoothingEnabled = true;
      const k = pose(p);
      const loose = ease(p, 0.411, 0.524);
      if (loose > 0) {
        ctx.globalAlpha = loose * (1 - ease(p, 0.84, 0.92));
        drawLooseStrand(ctx, weave, false, k);
        drawLooseStrand(ctx, weave, true, k);
      }
      for (const section of cloth) {
        const wrap = section.piece.endsWith("Wrap");
        if (loose >= 1 && !wrap) continue;
        ctx.globalAlpha = wrap ? 1 : 1 - loose;
        drawCloth(ctx, section, k);
      }
      ctx.globalAlpha = 1;
      const original = 1 - ease(p, 0, 0.045);
      if (original > 0) {
        ctx.globalAlpha = original;
        ctx.drawImage(image, 0, 0, width, height);
        ctx.globalAlpha = 1;
      }
    }
    function resize() {
      const pixels = Math.min(2, devicePixelRatio || 1) * host.clientWidth / width;
      canvas.width = Math.max(1, Math.round(canvasWidth * pixels));
      canvas.height = Math.max(1, Math.round(canvasHeight * pixels));
      paint();
    }
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener("silk-paint", paint);
    resize();
    return () => {
      observer.disconnect();
      host.removeEventListener("silk-paint", paint);
      canvas.remove();
    };
  }
  return __toCommonJS(silkRelief_exports);
})();
