document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("addForm");
  const input = document.getElementById("taskInput");
  const list = document.getElementById("taskList");

  // Add event (AJAX) - prevent default form submit for JS users
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    // POST to API
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (res.ok) {
      const task = await res.json();
      prependTask(task);
      input.value = "";
    } else {
      alert("Could not add task");
    }
  });

  // Delegation for delete, toggle, edit
  list.addEventListener("click", async (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.classList.contains("deleteBtn")) {
      // Delete
      const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (res.ok) li.remove();
    } else if (e.target.classList.contains("editBtn")) {
      // Edit - prompt for new text
      const span = li.querySelector("span");
      const newText = prompt("Edit task:", span.textContent);
      if (newText !== null) {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: newText })
        });
        if (res.ok) span.textContent = newText;
      }
    }
  });

  // Checkbox toggle
  list.addEventListener("change", async (e) => {
    if (!e.target.classList.contains("toggle-checkbox")) return;
    const li = e.target.closest("li");
    const id = li.dataset.id;
    const completed = e.target.checked;
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed })
    });
    if (res.ok) {
      const span = li.querySelector("span");
      span.classList.toggle("task-completed", completed);
    } else {
      alert("Could not update task");
    }
  });

  // Helper to add a new li at top
  function prependTask(task) {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.dataset.id = task.id;
    li.innerHTML = `
      <div>
        <input class="form-check-input me-2 toggle-checkbox" type="checkbox">
        <span>${escapeHtml(task.text)}</span>
      </div>
      <div>
        <button class="btn btn-sm btn-outline-secondary editBtn">Edit</button>
        <button class="btn btn-sm btn-danger deleteBtn">Delete</button>
      </div>
    `;
    list.prepend(li);
  }

  // basic XSS escape
  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});
