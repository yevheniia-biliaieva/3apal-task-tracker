// ================== Utility ==================
function b64encode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}
function b64decode(str) {
  return decodeURIComponent(escape(atob(str)));
}

function showSaveBanner(msg, type = "info") {
  let banner = document.getElementById("saveBanner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "saveBanner";
    banner.style.position = "fixed";
    banner.style.bottom = "20px";
    banner.style.right = "20px";
    banner.style.padding = "10px 16px";
    banner.style.borderRadius = "8px";
    banner.style.fontSize = "14px";
    banner.style.zIndex = "1000";
    banner.style.boxShadow = "0 2px 6px rgba(0,0,0,0.4)";
    document.body.appendChild(banner);
  }

  if (type === "info") {
    banner.style.background = "#1a2030";
    banner.style.color = "#cfe1ff";
  } else if (type === "success") {
    banner.style.background = "#0f1a12";
    banner.style.color = "#9cc7a7";
  } else if (type === "error") {
    banner.style.background = "#2a0f0f";
    banner.style.color = "#ff9f9f";
  }

  banner.textContent = msg;
  banner.style.display = "block";

  // зникає через 4 секунди
  setTimeout(() => {
    if (banner) banner.style.display = "none";
  }, 4000);
}


// ================== Global state ==================
let TASKS = { lanes: [], tasks: [] };
let DONE = [];
let revMap = {};

// ================== UI Build ==================
function buildUI() {
  const wrapper = document.getElementById("roadmap");
  wrapper.innerHTML = "";

  // малюємо звичайні lane
  TASKS.lanes
    .sort((a, b) => a.order - b.order)
    .forEach((lane) => {
      const col = document.createElement("div");
      col.className = "lane";
      col.dataset.id = lane.id;

      const h2 = document.createElement("h2");
      h2.textContent = lane.title;

      const btn = document.createElement("button");
      btn.className = "add-task";
      btn.textContent = "➕";
      btn.onclick = () => openTaskModal({ laneId: lane.id });
      h2.appendChild(btn);

      col.appendChild(h2);
      wrapper.appendChild(col);
    });

  // додаємо колонку "Без lane"
  const noLaneTasks = TASKS.tasks.filter((t) => !t.lane);
  if (noLaneTasks.length > 0) {
    const col = document.createElement("div");
    col.className = "lane";
    col.dataset.id = "no_lane";

    const h2 = document.createElement("h2");
    h2.textContent = "Без категорії";
    col.appendChild(h2);

    noLaneTasks.forEach((task) => {
      col.appendChild(makeTaskCard(task));
    });

    wrapper.appendChild(col);
  }

  renderTasks();
}

function makeTaskCard(task) {
  const card = document.createElement("div");
  card.className = "task";
  card.id = task.id;
  card.dataset.title = task.title;
  card.dataset.deps = (task.deps || []).join(",");

  const title = document.createElement("div");
  title.className = "title";
  title.textContent = task.title;
  card.appendChild(title);

  const raci = document.createElement("div");
  raci.className = "raci";
  raci.textContent = `R: ${task.raci.R} | A: ${task.raci.A} | C: ${task.raci.C} | I: ${task.raci.I}`;
  card.appendChild(raci);

  const deps = document.createElement("div");
  deps.className = "deps";
  deps.innerHTML =
    '<span class="badge">Залежить від:</span> <span class="deps-list"></span>';
  card.appendChild(deps);

  const controls = document.createElement("div");
  controls.style.fontSize = "11px";
  controls.innerHTML =
    '<a href="#" class="edit">✏️</a> <a href="#" class="del">🗑️</a>';
  controls.querySelector(".edit").onclick = (e) => {
    e.preventDefault();
    openTaskModal({ mode: "edit", task });
  };
  controls.querySelector(".del").onclick = (e) => {
    e.preventDefault();
    deleteTask(task.id);
  };
  card.appendChild(controls);

  return card;
}

function renderTasks() {
  revMap = {};
  TASKS.tasks.forEach((t) => {
    (t.deps || []).forEach((d) => {
      if (!revMap[d]) revMap[d] = [];
      revMap[d].push(t.id);
    });
  });

  TASKS.lanes.forEach((lane) => {
    const col = document.querySelector(`.lane[data-id="${lane.id}"]`);
    if (!col) return;
    col.querySelectorAll(".task").forEach((el) => el.remove());

    TASKS.tasks
      .filter((t) => t.lane === lane.id)
      .sort((a, b) => a.order - b.order)
      .forEach((task) => {
        col.appendChild(makeTaskCard(task));
      });
  });

  makeLinks();
  applyDoneUI(new Set(DONE));
}

function makeLinks() {
  document.querySelectorAll(".task").forEach((card) => {
    const id = card.id;
    const depsWrap = card.querySelector(".deps-list");
    depsWrap.innerHTML = "";
    const deps = (card.dataset.deps || "").split(",").filter(Boolean);
    deps.forEach((d, idx) => {
      const span = document.createElement("span");
      span.className = "linklike";
      span.textContent = TASKS.tasks.find((t) => t.id === d)?.title || d;
      span.onclick = () => scrollToTask(d);
      span.setAttribute("data-dep-src", d);
      depsWrap.appendChild(span);
      if (idx < deps.length - 1) {
        depsWrap.appendChild(document.createTextNode(", "));
      }
    });
  });
}

function scrollToTask(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add("highlight");
  setTimeout(() => el.classList.remove("highlight"), 1000);
}

// ================== Done state ==================
function applyReady(set) {
  document.querySelectorAll(".task").forEach((card) => {
    if (card.classList.contains("done")) {
      card.classList.remove("ready");
      return;
    }
    const deps = (card.dataset.deps || "").split(",").filter(Boolean);
    if (deps.length === 0 || deps.every((d) => set.has(d))) {
      card.classList.add("ready");
    } else card.classList.remove("ready");
  });
}

function applyDoneUI(set) {
  document.querySelectorAll(".task").forEach((el) => {
    if (set.has(el.id)) el.classList.add("done");
    else el.classList.remove("done");
  });
  document.querySelectorAll(".deps-list .linklike").forEach((el) => {
    const src = el.getAttribute("data-dep-src");
    if (src && set.has(src)) {
      el.classList.add("dep-done");
      el.style.textDecoration = "line-through"; // закреслення виконаних залежностей
    } else {
      el.classList.remove("dep-done");
      el.style.textDecoration = "none";
    }
  });
  applyReady(set);
}

function toggleDone(id) {
  const current = new Set(DONE);
  if (current.has(id)) current.delete(id);
  else current.add(id);
  DONE = Array.from(current);
  applyDoneUI(current);
  autoSaveState();
}
document.addEventListener(
  "contextmenu",
  (e) => {
    const card = e.target.closest(".task");
    if (card) {
      e.preventDefault();
      toggleDone(card.id);
    }
  },
  true
);

// ================== Видалення таски ==================
function deleteTask(id) {
  TASKS.tasks = TASKS.tasks.filter((t) => t.id !== id);

  TASKS.tasks.forEach((t) => {
    if (t.deps && t.deps.includes(id)) {
      t.deps = t.deps.filter((d) => d !== id);
    }
  });

  buildUI();
  autoSaveState();
}

// ================== Task add/edit ==================
function openTaskModal({ mode = "add", task = null, laneId = null }) {
  const modal = document.getElementById("taskModal");
  modal.classList.remove("hidden");

  document.getElementById("taskModalTitle").textContent =
    mode === "edit" ? "Редагувати таску" : "Нова таска";

  // lane select
  const laneSelect = document.getElementById("task_lane");
  laneSelect.innerHTML = "";
  TASKS.lanes.forEach((l) => {
    const opt = document.createElement("option");
    opt.value = l.id;
    opt.textContent = l.title;
    if ((task && task.lane === l.id) || (!task && laneId === l.id)) {
      opt.selected = true;
    }
    laneSelect.appendChild(opt);
  });
  const optNone = document.createElement("option");
  optNone.value = "";
  optNone.textContent = "— без категорії —";
  if (task && !task.lane) optNone.selected = true;
  laneSelect.appendChild(optNone);

  // fields
  document.getElementById("task_title").value = task?.title || "";
  document.getElementById("task_id").value = task?.id || "task_" + Date.now();
  document.getElementById("task_raci_R").value = task?.raci.R || "";
  document.getElementById("task_raci_A").value = task?.raci.A || "";
  document.getElementById("task_raci_C").value = task?.raci.C || "";
  document.getElementById("task_raci_I").value = task?.raci.I || "";

  // deps select
  // ===== Заповнення залежностей =====
const depsSelect = document.getElementById('task_deps');
depsSelect.innerHTML = '';
TASKS.tasks.forEach(t => {
  if (task && t.id === task.id) return; // не можна залежати від себе
  const opt = document.createElement('option');
  opt.value = t.id;
  opt.textContent = t.title;
  if (task?.deps?.includes(t.id)) opt.selected = true;
  depsSelect.appendChild(opt);
});

// Підключаємо choices.js для красивого мультіселекту з пошуком
if (window.depsChoices) {
  window.depsChoices.destroy(); // щоб не дублювався
}
window.depsChoices = new Choices(depsSelect, {
  removeItemButton: true,
  searchPlaceholderValue: 'Пошук таски...',
  noResultsText: 'Нічого не знайдено',
});


  document.getElementById("taskSaveBtn").onclick = () => {
    const newTask = {
      id: document.getElementById("task_id").value,
      title: document.getElementById("task_title").value,
      lane: document.getElementById("task_lane").value,
      deps: Array.from(depsSelect.selectedOptions).map((o) => o.value),
      raci: {
        R: document.getElementById("task_raci_R").value,
        A: document.getElementById("task_raci_A").value,
        C: document.getElementById("task_raci_C").value,
        I: document.getElementById("task_raci_I").value,
      },
      order: task?.order || TASKS.tasks.length + 1,
    };

    if (mode === "edit") {
      const idx = TASKS.tasks.findIndex((t) => t.id === task.id);
      TASKS.tasks[idx] = newTask;
    } else {
      TASKS.tasks.push(newTask);
    }

    modal.classList.add("hidden");
    buildUI();
    autoSaveState();
  };

  document.getElementById("taskCancelBtn").onclick = () => {
    modal.classList.add("hidden");
  };
}

// ================== GitHub Sync ==================
function els() {
  return {
    repo: document.getElementById("gh_repo"),
    branch: document.getElementById("gh_branch"),
    tasks: document.getElementById("gh_tasks"),
    path: document.getElementById("gh_path"),
    token: document.getElementById("gh_token"),
    load: document.getElementById("btn_load"),
    save: document.getElementById("btn_save"),
    status: document.getElementById("gh_status"),
  };
}
function showStatus(msg, ok = true) {
  const $ = els();
  $.status.textContent = msg;
  $.status.style.color = ok ? "#9cc7a7" : "#ff9f9f";
}

async function ghGet(repo, path, ref, token) {
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(
    path
  )}?ref=${encodeURIComponent(ref)}`;
  const headers = { Accept: "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const r = await fetch(url, { headers });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}
async function ghPut(repo, path, branch, token, content, sha) {
  const url = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(
    path
  )}`;
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
  };
  const body = {
    message: "Update " + path,
    branch,
    content: b64encode(content),
    ...(sha ? { sha } : {}),
  };
  const r = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error("HTTP " + r.status + ": " + t);
  }
  return r.json();
}

async function loadAll() {
  try {
    const { repo, branch, tasks, path, token } = readCfg();

    const tasksData = await ghGet(repo, tasks, branch, token);
    const tasksJson = JSON.parse(b64decode(tasksData.content || ""));
    TASKS = tasksJson;
    buildUI();

    const stateData = await ghGet(repo, path, branch, token);
    const stateJson = JSON.parse(b64decode(stateData.content || ""));
    DONE = stateJson.done || [];
    applyDoneUI(new Set(DONE));

    showStatus("Дані завантажено!");
  } catch (e) {
    showStatus("Помилка завантаження: " + e.message, false);
  }
}

async function saveAll() {
  const { repo, branch, tasks, path, token } = readCfg();
  if (!repo || !branch || !tasks || !path || !token) {
    showSaveBanner("Заповни всі поля", "error");
    return;
  }
  try {
    showSaveBanner("Зберігаю файли у GitHub…", "info");

    let tsha = null, ssha = null;
    try { const i = await ghGet(repo, tasks, branch, token); tsha = i.sha; } catch (e) {}
    try { const i = await ghGet(repo, path, branch, token); ssha = i.sha; } catch (e) {}

    await ghPut(repo, tasks, branch, token, JSON.stringify(TASKS, null, 2), tsha);
    await ghPut(repo, path, branch, token, JSON.stringify({ 
      done: DONE, 
      updatedAt: new Date().toISOString() 
    }, null, 2), ssha);

    // показуємо банер і запускаємо перевірку деплою
    showSaveBanner("Файли збережено. Чекаємо деплой GitHub Pages… ⏳", "info");
    waitForDeploy(repo, token);

  } catch (e) {
    showSaveBanner("Помилка збереження: " + e.message, "error");
  }
}

async function checkPagesBuild(repo, token) {
  const url = `https://api.github.com/repos/${repo}/pages/builds/latest`;
  const headers = { "Accept": "application/vnd.github+json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error("GitHub Pages API error: " + res.status);
  return res.json();
}

async function waitForDeploy(repo, token) {
  let tries = 0;
  while (tries < 20) { // максимум ~100 секунд
    try {
      const build = await checkPagesBuild(repo, token);
      if (build.status === "built") {
        showSaveBanner("✅ Зміни задеплоєні на GitHub Pages!", "success");
        return;
      } else if (build.status === "errored") {
        showSaveBanner("❌ Помилка деплою GitHub Pages", "error");
        return;
      }
    } catch (e) {
      console.error(e);
    }

    tries++;
    await new Promise(r => setTimeout(r, 60000)); // чекати 60 сек
  }

  showSaveBanner("⚠️ Деплой займає занадто довго", "error");
}



function autoSaveState() {
  saveAll();
}

function readCfg() {
  const $ = els();
  if (!$.repo || !$.branch || !$.tasks || !$.path || !$.token) {
    throw new Error("Не знайдено один із інпутів у toolbar");
  }
  const repo = $.repo.value.trim();
  const branch = $.branch.value.trim() || "main";
  const tasks = $.tasks.value.trim() || "tasks.json";
  const path = $.path.value.trim() || "state.json";
  const token = $.token.value.trim();
  return { repo, branch, tasks, path, token };
}

setInterval(() => loadAll(), 60000);

document.addEventListener("DOMContentLoaded", () => {
  els().load.onclick = () => loadAll();
  els().save.onclick = () => saveAll();
});
