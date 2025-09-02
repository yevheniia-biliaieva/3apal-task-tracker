# 3apal Task Tracker

A lightweight task-tracking system built for the **3apal** startup team.  
This project was designed to help me as a COO structure dependencies, track progress, and keep the team aligned — without relying on heavy tools like Jira or ClickUp.

---

## 🌟 Features
- **Kanban-style board** with lanes (categories).
- Create, edit, and delete tasks through a modal form.
- **RACI matrix** for each task (Responsible, Accountable, Consulted, Informed).
- **Dependencies between tasks**:
  - See what each task depends on.
  - Highlight tasks that are ready to start.
  - Strike-through completed dependencies.
- **Right-click** on a task → mark as *done/undone*.
- Visual states:
  - ✅ Done (green),
  - 🟣 Ready-to-start (purple),
  - ⚪ Pending.
- **GitHub sync**:
  - Tasks (tasks.json) and progress state (state.json) stored directly in the repository.
  - Load current state from GitHub.
  - Save changes through GitHub API.
  - Auto-refresh every minute.
- **Local token persistence** — your GitHub token is stored in localStorage, so you don’t have to re-enter it every time.

---

## 🛠️ Tech stack
- **Vanilla JavaScript** (no frameworks).
- HTML5 + CSS3 (custom design system).
- GitHub REST API (for syncing tasks and state).
- Browser localStorage (for token caching).

---


## 📂 Repository structure

├── index.html        # Main entry point

├── style.css         # Custom styles (dark UI system)

├── main.js           # Core logic: UI, tasks, GitHub sync

├── tasks.json        # Source of truth for tasks

└── state.json        # Current progress state (done tasks)

---

## 👩‍💻 About

This project was built as part of COO role at **3apal**,
to manage product launch tasks, dependencies, and team workflow.

It serves both as:

1. A **real working tool** for internal management.
2. An **example of building a lightweight custom tracker** using only vanilla JS + GitHub API.

---

## 📌 Roadmap

* [ ] Drag & drop for tasks
* [ ] Tags and priorities
* [ ] Team assignments
* [ ] Enhanced UI/UX (microinteractions, animations)

---

## 🤝 Contributing

This project is tailored for internal use, but feel free to fork or adapt it for your own workflow.

### 🔗 Live demo
👉 [Open 3apal Task Tracker](https://yevheniia-biliaieva.github.io/3apal-task-tracker/)
---

#UA 🇺🇦

Це легка система для відстеження задач, створена для команди стартапу **3apal**.  
Цей проєкт я зробила як COO, щоб структурувати залежності, відслідковувати прогрес і тримати команду синхронізованою — без використання громіздких інструментів на кшталт Jira чи ClickUp.

---

## 🌟 Можливості
- **Дошка у стилі Kanban** із lane (категоріями).
- Створення, редагування та видалення задач через модальне вікно.
- **Матриця RACI** для кожної задачі (Responsible, Accountable, Consulted, Informed).
- **Залежності між задачами**:
  - видно, від чого залежить кожна задача;
  - підсвічуються задачі, до яких можна приступати;
  - виконані залежності перекреслюються.
- **Правий клік** по задачі → позначити як *виконану/невиконану*.
- Візуальні стани:
  - ✅ Виконано (зелений),
  - 🟣 Готова до старту (фіолетовий),
  - ⚪ Очікує.
- **Синхронізація з GitHub**:
  - Задачі (tasks.json) та прогрес (state.json) зберігаються безпосередньо у репозиторії.
  - Завантаження актуального стану з GitHub.
  - Збереження змін через GitHub API.
  - Автооновлення кожну хвилину.
- **Збереження токена локально** — GitHub-токен зберігається у localStorage, тому не треба вводити його кожного разу.

---

## 🛠️ Технології
- **Vanilla JavaScript** (без фреймворків).
- HTML5 + CSS3 (кастомна дизайн-система).
- GitHub REST API (для синхронізації задач і стану).
- Browser localStorage (для кешування токена).

---

## 📂 Структура репозиторію

├── index.html # Точка входу

├── style.css # Кастомні стилі (dark UI system)

├── main.js # Основна логіка: UI, задачі, GitHub-синхронізація

├── tasks.json # Джерело правди для задач

└── state.json # Поточний стан прогресу (виконані задачі)

---

## 👩‍💻 Про проєкт
Цей трекер був зроблений мною як COO у **3apal**,  
щоб управляти завданнями запуску продукту, залежностями та робочим процесом команди.

Він служить як:

1. **Реальний робочий інструмент** для внутрішнього менеджменту.
2. **Приклад створення власного трекера** на чистому JS + GitHub API.

---

## 📌 Roadmap
- [ ] Drag & drop задач
- [ ] Теги та пріоритети
- [ ] Призначення відповідальних
- [ ] Покращення UI/UX (мікровзаємодії, анімації)

---

## 🤝 Контрибʼютинг
Цей проєкт створений під внутрішні потреби, але ви можете форкнути чи адаптувати його під свій процес.

### 🔗 Live demo
👉 [Відкрити 3apal Task Tracker](https://yevheniia-biliaieva.github.io/3apal-task-tracker/)

