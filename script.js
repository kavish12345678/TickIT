/* script.js - Todo App with localStorage + progress */

/* Helpers */
function uid() {
  uid._c = (uid._c || 0) + 1;
  return Date.now().toString(36) + "-" + uid._c.toString(36);
}

/* DOM refs */
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const countText = document.getElementById("countText");
const progressFill = document.querySelector(".progress-fill");

let tasks = JSON.parse(localStorage.getItem("tasks") || "[]");

/* Render tasks and update UI */
function render() {
  // clear
  taskList.innerHTML = "";

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    li.className = task.completed ? "completed" : "";

    // left side: checkbox + text
    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => {
      toggleComplete(task.id);
    });

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;

    left.appendChild(checkbox);
    left.appendChild(span);

    // right side: actions
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn edit";
    editBtn.title = "Edit";
    editBtn.innerHTML = "✎";
    editBtn.addEventListener("click", () => beginEdit(task.id));

    const delBtn = document.createElement("button");
    delBtn.className = "btn delete";
    delBtn.title = "Delete";
    delBtn.innerHTML = "🗑";
    delBtn.addEventListener("click", () => {
      deleteTask(task.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(left);
    li.appendChild(actions);
    taskList.appendChild(li);
  });

  updateProgress();

  
}

/* Add a new task */
function addTask(text) {
  const t = (text || "").trim();
  if (!t) return;
  tasks.unshift({
    id: uid(),
    text: t,
    completed: false,
    createdAt: Date.now()
  });
  saveAndRender();
}

/* Toggle complete */
function toggleComplete(id) {
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return;
  tasks[idx].completed = !tasks[idx].completed;
  saveAndRender();

}

/* Delete */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveAndRender();
}

/* Inline edit */
function beginEdit(id) {
  const li = taskList.querySelector(`li[data-id="${id}"]`);
  if (!li) return;
  const textSpan = li.querySelector(".task-text");
  const oldText = textSpan.textContent;

  const input = document.createElement("input");
  input.type = "text";
  input.value = oldText;
  input.className = "edit-input";
  input.style.padding = "8px";
  input.style.width = "320px";
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));

  function finish(save) {
    if (!li) return;
    const newVal = input.value.trim();
    if (save && newVal && newVal !== oldText) {
      const idx = tasks.findIndex(t => t.id === id);
      if (idx !== -1) tasks[idx].text = newVal;
      saveAndRender();
    } else {
      render(); // restore original
    }
  }

  textSpan.replaceWith(input);
  input.focus();
  input.select();
}

/* Save to localStorage and render */
function saveAndRender() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  render();
}

/* Update count and progress bar */
function updateProgress() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  countText.textContent = `${done} / ${total}`;
  const ratio = total === 0 ? 0 : Math.round((done / total) * 100);
  if (progressFill) progressFill.style.width = `${ratio}%`;
}

function updateStreak() {
  const today = new Date().toISOString().split("T")[0];
  const doneToday = tasks.some(t => t.completed && new Date(t.createdAt).toISOString().split("T")[0] === today);

  if (!streakData.lastDate) {
    streakData = { count: 0, lastDate: "" };
  }

  if (doneToday && streakData.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (streakData.lastDate === yesterday) {
      streakData.count += 1;
    } else {
      streakData.count = 1;
    }
    streakData.lastDate = today;
    localStorage.setItem("streakData", JSON.stringify(streakData));
  }

  if (streakText) streakText.textContent = `🔥 Daily Streak: ${streakData.count} days`;
}


/* Load initial */
window.addEventListener("load", () => {
  render();
});

/* UI bindings */
addBtn.addEventListener("click", () => {
  addTask(taskInput.value);
  taskInput.value = "";
  taskInput.focus();
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask(taskInput.value);
    taskInput.value = "";
  }
});



