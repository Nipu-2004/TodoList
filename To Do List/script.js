let tasks = [];
let currentFilter = "all";
const STORAGE_KEY = "todoTasks";
const THEME_STORAGE_KEY = "todoTheme";

const taskInput   = document.getElementById("taskInput");
const addBtn      = document.getElementById("addBtn");
const errorMsg    = document.getElementById("errorMsg");
const taskList    = document.getElementById("taskList");
const emptyMsg    = document.getElementById("emptyMsg");
const taskCounter = document.getElementById("taskCounter");
const clearBtn    = document.getElementById("clearBtn");
const themeToggle = document.getElementById("themeToggle");
const filterBtns  = document.querySelectorAll("[data-filter]");

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {}
}

function setTheme(isDark) {
  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  themeToggle.setAttribute("aria-label", `Switch to ${isDark ? "light" : "dark"} mode`);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  } catch (e) {}
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved)) tasks = saved;
  } catch (e) { tasks = []; }
}

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.classList.remove("d-none");
  taskInput.classList.add("is-invalid");
}

function hideError() {
  errorMsg.classList.add("d-none");
  taskInput.classList.remove("is-invalid");
}

function addTask() {
  const text = taskInput.value.trim();

  if (text === "") {
    showError("Please enter a task. Empty tasks or spaces only are not allowed.");
    taskInput.focus();
    return;
  }

  tasks.push({ id: Date.now(), text: text, completed: false });
  taskInput.value = "";
  hideError();
  saveTasks();
  render();
  taskInput.focus();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveTasks();
  render();
}

function getVisibleTasks() {
  if (currentFilter === "active")    return tasks.filter(t => !t.completed);
  if (currentFilter === "completed") return tasks.filter(t => t.completed);
  return tasks;
}

function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn =>
    btn.classList.toggle("active", btn.dataset.filter === filter)
  );
  render();
}

function render() {
  taskList.innerHTML = "";
  const visible = getVisibleTasks();

  visible.forEach((task, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item" + (task.completed ? " completed" : "");

    const number = document.createElement("span");
    number.className = "task-number";
    number.textContent = `${index + 1}.`;
    number.setAttribute("aria-hidden", "true");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const span = document.createElement("span");
    span.className = "task-text";
    span.textContent = task.text;
    span.addEventListener("click", () => toggleTask(task.id));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "btn btn-sm btn-outline-danger delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(number, checkbox, span, del);
    taskList.appendChild(li);
  });

  emptyMsg.classList.toggle("d-none", visible.length > 0);

  const remaining = tasks.filter(t => !t.completed).length;
  taskCounter.textContent = remaining + (remaining === 1 ? " task left" : " tasks left");

  clearBtn.disabled = !tasks.some(t => t.completed);
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });
taskInput.addEventListener("input", hideError);
clearBtn.addEventListener("click", clearCompleted);
filterBtns.forEach(btn =>
  btn.addEventListener("click", () => setFilter(btn.dataset.filter))
);
themeToggle.addEventListener("click", () =>
  setTheme(!document.body.classList.contains("dark-theme"))
);

loadTasks();
try {
  setTheme(localStorage.getItem(THEME_STORAGE_KEY) === "dark");
} catch (e) {
  setTheme(false);
}
render();
