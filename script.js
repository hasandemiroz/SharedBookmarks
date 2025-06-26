import { getUserIds, getData, setData } from "./storage.js";

const userSelect = document.getElementById("user-select");
const bookmarkForm = document.getElementById("bookmark-form");
const bookmarkList = document.getElementById("bookmark-list");

let currentUser = null;

function populateUserDropdown() {
  const userIds = getUserIds();
  
  // Add default placeholder option
const placeholder = document.createElement("option");
placeholder.value = "";
placeholder.textContent = "-- Select a user --";
placeholder.disabled = true;
placeholder.selected = true;
userSelect.appendChild(placeholder);

// Add users
userIds.forEach((id) => {
  const option = document.createElement("option");
  option.value = id;
  option.textContent = `User ${id}`;
  userSelect.appendChild(option);
});
}

function renderBookmarks(userId) {
  bookmarkList.innerHTML = "";
  const bookmarks = getData(userId) || [];

  if (bookmarks.length === 0) {
    bookmarkList.textContent = "No bookmarks found for this user.";
    return;
  }

  bookmarks
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((bookmark, index) => {
      const container = document.createElement("div");

      const title = document.createElement("a");
      title.href = bookmark.url;
      title.target = "_blank";
      title.rel = "noopener noreferrer";
      title.textContent = bookmark.title;

      const desc = document.createElement("p");
      desc.textContent = bookmark.description;

      const time = document.createElement("small");
      time.textContent = `Added on: ${new Date(bookmark.createdAt).toLocaleString()}`;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.style.marginLeft = "10px";
      deleteBtn.addEventListener("click", () => deleteBookmark(index));

      container.appendChild(title);
      container.appendChild(desc);
      container.appendChild(time);
      container.appendChild(deleteBtn);
      container.appendChild(document.createElement("hr"));

      bookmarkList.appendChild(container);
    });
}

function deleteBookmark(indexToDelete) {
  if (!currentUser) return;

  const bookmarks = getData(currentUser) || [];
  if (indexToDelete >= 0 && indexToDelete < bookmarks.length) {
    bookmarks.splice(indexToDelete, 1); // Remove the bookmark at that index
    setData(currentUser, bookmarks);
    renderBookmarks(currentUser);
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Please select a user first.");
    return;
  }

  const url = document.getElementById("bookmark-url").value.trim();
  const title = document.getElementById("bookmark-title").value.trim();
  const description = document.getElementById("bookmark-description").value.trim();

  if (!url || !title || !description) {
    alert("Please fill out all fields.");
    return;
  }

  const newBookmark = {
    url,
    title,
    description,
    createdAt: new Date().toISOString()
  };

  const existing = getData(currentUser) || [];
  existing.push(newBookmark);
  setData(currentUser, existing);

  bookmarkForm.reset();
  renderBookmarks(currentUser);
}

userSelect.addEventListener("change", () => {
  const userId = userSelect.value;
  if (userId) {
    currentUser = userId; 
    renderBookmarks(userId);
    // Enable form inputs now that a user is selected
    bookmarkForm.querySelectorAll("input, textarea, button").forEach((el) => {
      el.disabled = false;
    });

  }
});

bookmarkForm.addEventListener("submit", handleFormSubmit);

window.addEventListener("load", () => {
   populateUserDropdown();

  // Disable form inputs initially
  bookmarkForm.querySelectorAll("input, textarea, button").forEach((el) => {
    el.disabled = true;
  });
});
