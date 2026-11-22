const ANIMALS = {
  dog: ["🐶", "Dog"], cat: ["🐱", "Cat"], panda: ["🐼", "Panda"], fox: ["🦊", "Fox"],
  penguin: ["🐧", "Penguin"], owl: ["🦉", "Owl"], dolphin: ["🐬", "Dolphin"], lion: ["🦁", "Lion"],
  frog: ["🐸", "Frog"], octopus: ["🐙", "Octopus"], rabbit: ["🐰", "Rabbit"], elephant: ["🐘", "Elephant"]
};
const KEY = "animal-showdown-v2", DAILY_GOAL = 10;
const $ = id => document.getElementById(id);
const ids = Object.keys(ANIMALS);

let store;
try { store = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { store = {}; }
store.stats = store.stats || {};
store.pairs = store.pairs || {};
store.total = store.total || 0;
store.streak = store.streak || 0;
store.lastDay = store.lastDay || "";
store.today = store.today || { day: "", n: 0 };
store.sound = store.sound !== false;
function save() { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {} }

const dayStr = d => d.toLocaleDateString("en-CA");
function touchDay() {
  const now = new Date(), t = dayStr(now);
  if (store.today.day !== t) store.today = { day: t, n: 0 };
  if (store.lastDay !== t) {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    store.streak = store.lastDay === dayStr(y) ? store.streak + 1 : 1;
    store.lastDay = t;
    return true;
  }
  return false;
}

/* ---------- sound ---------- */
let ac;
function tone(freq, start, dur, type = "sine", vol = 0.15) {
  if (!store.sound) return;
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(vol, ac.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
    o.connect(g); g.connect(ac.destination);
    o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur);
  } catch (e) {}
}
const sfxVote = () => { tone(520, 0, .12, "triangle"); tone(780, .08, .18, "triangle"); };
const sfxWin = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .1, .25, "square", .09));
$("sound").onclick = () => {
  store.sound = !store.sound; save(); renderSound();
  if (store.sound) sfxVote();
};
function renderSound() {
  $("sound").textContent = store.sound ? "🔊 Sound on" : "🔇 Sound off";
  $("sound").setAttribute("aria-pressed", store.sound);
}

/* ---------- confetti ---------- */
const cv = $("fx"), cx = cv.getContext("2d");
let parts = [], raf = null;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
function sizeCv() { cv.width = innerWidth; cv.height = innerHeight; }
addEventListener("resize", sizeCv); sizeCv();
function confetti(n, x = innerWidth / 2, y = innerHeight * .45) {
  if (reduce) return;
  const colors = ["#ff7a45", "#6c5ce7", "#ffc233", "#2ec4b6", "#ff4d8d"];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9;
    parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 5, r: 4 + Math.random() * 5,
      c: colors[i % colors.length], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 90 + Math.random() * 40 });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .25; p.vx *= .99; p.rot += p.vr; p.life--;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
    cx.globalAlpha = Math.min(1, p.life / 30);
    cx.fillStyle = p.c; cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
    cx.restore();
  });
  raf = parts.length ? requestAnimationFrame(tick) : null;
  if (!raf) cx.clearRect(0, 0, cv.width, cv.height);
}

/* ---------- game ---------- */
let cur = null, locked = false;
/* ---------- tournament ---------- */
let bk;
const ROUND_NAMES = { 4: "Quarterfinal", 2: "Semifinal", 1: "Final" };
function startTournament() {
  const pool = ids.slice().sort(() => Math.random() - .5).slice(0, 8);
  bk = { cur: pool, next: [], i: 0, beaten: {} };
  $("champion").hidden = true;
  $("arena").hidden = false;
  document.querySelector(".controls").hidden = false;
  newRound();
}
function crown(id) {
  store.champs = store.champs || {};
  store.champs[id] = (store.champs[id] || 0) + 1;
  save();
  const [em, nm] = ANIMALS[id];
  const beat = (bk.beaten[id] || []).map(x => ANIMALS[x][0] + " " + ANIMALS[x][1]).join(", ");
  const times = store.champs[id];
  $("arena").hidden = true;
  document.querySelector(".controls").hidden = true;
  $("roundbar").innerHTML = "";
  $("champion").hidden = false;
  $("champion").innerHTML = `
    <span class="crown" aria-hidden="true">👑</span>
    <span class="big" aria-hidden="true">${em}</span>
    <h2>${nm} is the strongest!</h2>
    <p>Beat ${beat} on the way to the title.</p>
    <p>You have crowned ${nm} ${times} ${times === 1 ? "time" : "times"}.</p>
    <button class="next" id="again">Start a new tournament</button>`;
  $("again").onclick = startTournament;
  confetti(250); sfxWin();
  setTimeout(() => confetti(200), 500);
  $("again").focus();
}
function fill(btn, id) {
  const [em, nm] = ANIMALS[id];
  btn.dataset.id = id; btn.disabled = false;
  btn.classList.remove("win", "lose");
  btn.style.animation = "none"; void btn.offsetWidth; btn.style.animation = "";
  btn.setAttribute("aria-label", "Vote for " + nm);
  btn.innerHTML = `<span class="emoji" aria-hidden="true">${em}</span><span class="name">${nm}</span>
    <span class="reveal"><span class="pct"></span><div class="meter"><i></i></div><small class="votes"></small></span>`;
}
function newRound() {
  if (bk.i * 2 >= bk.cur.length) {
    if (bk.next.length === 1) return crown(bk.next[0]);
    bk.cur = bk.next; bk.next = []; bk.i = 0;
  }
  locked = false;
  $("arena").classList.remove("revealed");
  const m = bk.cur.length / 2;
  cur = [bk.cur[bk.i * 2], bk.cur[bk.i * 2 + 1]];
  fill($("a"), cur[0]); fill($("b"), cur[1]);
  const alive = bk.cur.slice(bk.i * 2).concat(bk.next).map(id => ANIMALS[id][0]).join(" ");
  $("roundbar").innerHTML = (m === 1 ? "Final" : `${ROUND_NAMES[m]} ${bk.i + 1} of ${m}`) +
    `<span class="alive" aria-hidden="true">${alive}</span>`;
  $("next").textContent = m === 1 ? "Crown the champion" : "Next matchup";
}
function bump(id) { const el = $(id); el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); }

function vote(wBtn, lBtn) {
  if (locked) return;
  locked = true;
  const newDay = touchDay();
  const w = wBtn.dataset.id, l = lBtn.dataset.id;
  bk.next.push(w); bk.i++;
  (bk.beaten[w] = bk.beaten[w] || []).push(l);
  [w, l].forEach(id => store.stats[id] = store.stats[id] || { w: 0, p: 0 });
  store.stats[w].w++; store.stats[w].p++; store.stats[l].p++;
  const key = [w, l].sort().join("|");
  store.pairs[key] = store.pairs[key] || {};
  store.pairs[key][w] = (store.pairs[key][w] || 0) + 1;
  store.total++; store.today.n++;
  save();

  const rec = store.pairs[key], total = (rec[w] || 0) + (rec[l] || 0);
  [[wBtn, w], [lBtn, l]].forEach(([btn, id]) => {
    const v = rec[id] || 0, p = Math.round(v / total * 100);
    btn.querySelector(".pct").textContent = p + "%";
    btn.querySelector(".votes").textContent = v + (v === 1 ? " vote" : " votes");
    btn.disabled = true;
    requestAnimationFrame(() => requestAnimationFrame(() => btn.querySelector(".meter i").style.width = p + "%"));
  });
  wBtn.classList.add("win"); lBtn.classList.add("lose");
  $("arena").classList.add("revealed");

  const r = wBtn.getBoundingClientRect();
  confetti(40, r.left + r.width / 2, r.top + r.height / 3);
  sfxVote();
  if (store.today.n === DAILY_GOAL || store.total % 25 === 0 || newDay) {
    setTimeout(() => { confetti(160); sfxWin(); }, 250);
  }
  renderAll(); bump("stTotal");
  if (newDay) bump("stStreak");
  $("next").focus();
}

function topPick() {
  const best = ids.filter(id => store.stats[id]).sort((a, b) => store.stats[b].w - store.stats[a].w)[0];
  return best && store.stats[best].w > 0 ? ANIMALS[best][0] + " " + ANIMALS[best][1] : "-";
}
function renderStats() {
  $("stStreak").querySelector("b").textContent = (store.streak || 0) + (store.streak ? " 🔥" : "");
  $("stTotal").querySelector("b").textContent = store.total;
  $("stFav").querySelector("b").textContent = topPick();
  const n = store.today.day === dayStr(new Date()) ? store.today.n : 0;
  $("goalBar").style.width = Math.min(100, n / DAILY_GOAL * 100) + "%";
  $("goalText").textContent = n >= DAILY_GOAL ? "Daily goal reached. Great job!" : `${n} of ${DAILY_GOAL} votes today`;
}
function renderBoard() {
  const rows = ids.filter(id => store.stats[id] && store.stats[id].p > 0)
    .map(id => ({ id, ...store.stats[id], rate: store.stats[id].w / store.stats[id].p }))
    .sort((a, b) => b.rate - a.rate || b.p - a.p);
  $("list").innerHTML = rows.length ? rows.map((r, i) => `
    <div class="row">
      <span class="rk">${i + 1}</span><span class="em" aria-hidden="true">${ANIMALS[r.id][0]}</span>
      <div><strong>${ANIMALS[r.id][1]}</strong> <small>${r.w} of ${r.p} won</small>
        <div class="track"><i style="width:${Math.round(r.rate * 100)}%"></i></div></div>
      <span class="score">${Math.round(r.rate * 100)}%</span>
    </div>`).join("") : "<p>No votes yet. Pick your first favorite above.</p>";
}
function renderAll() { renderStats(); renderBoard(); }

$("a").onclick = () => vote($("a"), $("b"));
$("b").onclick = () => vote($("b"), $("a"));
$("next").onclick = newRound;
$("reset").onclick = () => {
  if (confirm("Clear all saved votes, streaks and stats on this device?")) {
    const s = store.sound; store = { stats: {}, pairs: {}, total: 0, streak: 0, lastDay: "", today: { day: "", n: 0 }, sound: s };
    save(); renderAll(); startTournament();
  }
};
document.addEventListener("keydown", e => {
  if (!$("champion").hidden) return;
  if (e.key === "ArrowLeft" && !locked) vote($("a"), $("b"));
  else if (e.key === "ArrowRight") { locked ? newRound() : vote($("b"), $("a")); }
});

renderSound(); startTournament(); renderAll();