// ===== Configuração =====
// Seu WhatsApp com DDI + DDD, só números.
const WHATSAPP = "5512997328465";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

// Links de WhatsApp com mensagem pronta (atributo data-whats)
if (WHATSAPP) {
  document.querySelectorAll("[data-whats]").forEach((a) => {
    a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(a.dataset.whats)}`;
    a.target = "_blank";
    a.rel = "noopener";
  });
}

// Ano no rodapé
const ano = document.getElementById("ano");
if (ano) ano.textContent = new Date().getFullYear();

// ===== Menu do celular =====
const menuBtn = document.getElementById("menu-btn");
const menu = document.getElementById("menu");
if (menuBtn && menu) {
  const setOpen = (open) => {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  };
  menuBtn.addEventListener("click", () => setOpen(!menu.classList.contains("open")));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
}

// ===== Rolagem: sombra do menu, barra de progresso, botão flutuante =====
const nav = document.querySelector(".nav");
const progress = document.getElementById("progress");
const whatsFloat = document.getElementById("whats-float");
const hero = document.getElementById("inicio");
const contato = document.getElementById("contato");

function onScroll() {
  const y = scrollY;
  nav?.classList.toggle("scrolled", y > 10);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress?.style.setProperty("--p", max > 0 ? (y / max).toFixed(4) : 0);
  if (whatsFloat && hero) {
    const pastHero = y > hero.offsetHeight * 0.6;
    const atContact = contato ? contato.getBoundingClientRect().top < innerHeight * 0.7 : false;
    whatsFloat.classList.toggle("show", pastHero && !atContact);
  }
}
let scrollTicking = false;
addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
}, { passive: true });
onScroll();

// Link do menu da seção atual
if ("IntersectionObserver" in window) {
  const links = new Map([...document.querySelectorAll('.nav ul a[href^="#"]')].map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.classList.remove("active"));
      links.get(e.target.id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
}

// ===== Palavra que troca no título =====
const rotator = document.getElementById("rotator");
if (rotator && !reduce) {
  const words = rotator.dataset.words.split("|");
  const span = rotator.querySelector("span");
  let i = 0;

  // Reserva a altura da frase mais longa para o texto abaixo não pular
  const fit = () => {
    const current = span.textContent;
    rotator.style.minHeight = "";
    let max = 0;
    for (const w of words) { span.textContent = w; max = Math.max(max, span.offsetHeight); }
    span.textContent = current;
    rotator.style.minHeight = max + "px";
  };
  fit();
  document.fonts?.ready.then(fit);
  addEventListener("resize", fit);

  setInterval(() => {
    span.classList.add("out");
    setTimeout(() => {
      i = (i + 1) % words.length;
      span.textContent = words[i];
      span.classList.remove("out");
      span.classList.add("pre");
      void span.offsetWidth; // força o navegador a aplicar o estado inicial
      span.classList.remove("pre");
    }, 450);
  }, 2800);
}

// ===== Revelar ao rolar =====
if (!reduce && "IntersectionObserver" in window) {
  const groups = [
    ".sec-head", ".intro > div:first-child", ".intro .big", ".who > div",
    ".anat > div:first-child > :not(ul)", ".feat li", ".steps li",
    ".works > *", ".plan", ".faq details", ".cta > div",
  ];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  groups.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, idx) => {
      // O que já aparece na tela ao abrir continua visível
      if (el.getBoundingClientRect().top < innerHeight) return;
      el.classList.add("reveal");
      el.style.setProperty("--d", `${(idx % 6) * 0.09}s`);
      io.observe(el);
      // Depois de aparecer, devolve o elemento ao normal (hover sem atraso)
      el.addEventListener("transitionend", function done(ev) {
        if (ev.target !== el || ev.propertyName !== "opacity") return;
        el.classList.remove("reveal", "in");
        el.style.removeProperty("--d");
        el.removeEventListener("transitionend", done);
      });
    });
  });
}

// ===== Página de exemplo que "se monta" =====
const blocks = [...document.querySelectorAll(".blk")];
if (blocks.length && !reduce) {
  let k = 0;
  setInterval(() => {
    blocks.forEach((b) => b.classList.remove("lit"));
    blocks[k % blocks.length].classList.add("lit");
    k++;
  }, 1100);
}

// ===== Interações com o mouse (só em computador) =====
const mouse = { x: -9999, y: -9999 };

if (finePointer && !reduce) {
  // Botões magnéticos
  document.querySelectorAll(".btn-glow").forEach((b) => {
    b.classList.add("magnet");
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.25;
      const y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = `translate(${x}px, ${y}px)`;
    });
    b.addEventListener("pointerleave", () => { b.style.transform = ""; });
  });

  // Parallax do retrato e luzes que reagem ao mouse
  const portrait = document.querySelector(".portrait");
  hero?.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    if (portrait) {
      portrait.style.setProperty("--px", `${nx * 16}px`);
      portrait.style.setProperty("--py", `${ny * 10}px`);
      portrait.style.setProperty("--ax", `${nx * -10}px`);
      portrait.style.setProperty("--ay", `${ny * -6}px`);
    }
  });
  hero?.addEventListener("pointerleave", () => {
    mouse.x = mouse.y = -9999;
    ["--px", "--py", "--ax", "--ay"].forEach((p) => portrait?.style.removeProperty(p));
  });

  // Inclinação 3D do print do projeto
  document.querySelectorAll(".browser").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${ny * -7}deg) rotateY(${nx * 9}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
}

// ===== Luzes de fundo do hero, inspiradas na cortina iluminada da foto =====
(function () {
  const c = document.getElementById("lights");
  if (!c) return;
  const ctx = c.getContext("2d");
  let pts = [], w = 0, h = 0;

  function size() {
    const r = c.parentElement.getBoundingClientRect();
    const d = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    c.width = w * d; c.height = h * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    pts = [];
    const cols = Math.max(6, Math.round(w / 70));
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.5) * (w / cols) + (Math.random() - 0.5) * 18;
      for (let y = 20 + Math.random() * 40; y < h; y += 46 + Math.random() * 20) {
        pts.push({ x, y, p: Math.random() * 6.28, s: 0.6 + Math.random() * 1.2 });
      }
    }
    if (reduce) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const q of pts) {
      let a = reduce ? 0.6 : 0.35 + 0.45 * (0.5 + 0.5 * Math.sin((t / 900) * q.s + q.p));
      let rad = 9;
      const dist = Math.hypot(q.x - mouse.x, q.y - mouse.y);
      if (dist < 160) { const k = 1 - dist / 160; a = Math.min(1, a + k * 0.7); rad = 9 + k * 9; }
      const g = ctx.createRadialGradient(q.x, q.y, 0, q.x, q.y, rad);
      g.addColorStop(0, `rgba(255,214,150,${a})`);
      g.addColorStop(1, "rgba(255,190,110,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.28); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  size();
  addEventListener("resize", size);
  if (!reduce) requestAnimationFrame(draw);
})();
