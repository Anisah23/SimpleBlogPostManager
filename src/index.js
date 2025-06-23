const BASE_URL = "http://localhost:3000/posts";
let currentEditingPostId = null;

function main() {
  displayPosts();
  addNewPostListener();
}

document.addEventListener("DOMContentLoaded", main);

function displayPosts() {
  fetch(BASE_URL)
    .then((res) => res.json())
    .then((posts) => {
      const postList = document.getElementById("post-list");
      postList.innerHTML = "";

      posts.forEach((post) => {
        const postItem = document.createElement("div");
        postItem.className = "post-item";
        postItem.textContent = post.title;
        postItem.dataset.id = post.id;

        postItem.addEventListener("click", () => handlePostClick(post.id));
        postList.appendChild(postItem);
      });

      if (posts.length > 0) {
        handlePostClick(posts[0].id);
      }
    });
}

function handlePostClick(postId) {
  fetch(`${BASE_URL}/${postId}`)
    .then(res => res.json())
    .then(post => {
      currentEditingPostId = post.id;

      const postDetail = document.getElementById("post-detail");
      postDetail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <img src="${post.image}" alt="${post.title}" />
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
        <div id="edit-form-container" class="hidden"></div>
      `;

      document.getElementById("delete-btn").addEventListener("click", () => {
        fetch(`${BASE_URL}/${postId}`, { method: "DELETE" })
          .then(() => {
            postDetail.innerHTML = `<p>Post deleted.</p>`;
            displayPosts();
          });
      });

      document.getElementById("edit-btn").addEventListener("click", () => {
        const container = document.getElementById("edit-form-container");
        container.innerHTML = `
          <form id="edit-post-form">
            <h3>Edit Post</h3>
            <input type="text" id="edit-title" value="${post.title}" required />
            <textarea id="edit-content" required>${post.content}</textarea>
            <button type="submit">Update</button>
            <button type="button" id="cancel-edit">Cancel</button>
          </form>
        `;
        container.classList.remove("hidden");

        document.getElementById("cancel-edit").addEventListener("click", () => {
          container.classList.add("hidden");
        });

        document.getElementById("edit-post-form").addEventListener("submit", function (e) {
          e.preventDefault();
          const updatedTitle = document.getElementById("edit-title").value;
          const updatedContent = document.getElementById("edit-content").value;

          fetch(`${BASE_URL}/${currentEditingPostId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: updatedTitle,
              content: updatedContent
            })
          })
            .then(res => res.json())
            .then(() => {
              displayPosts();
            });
        });
      });
    });
}

function addNewPostListener() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = form.title.value;
    const author = form.author.value;
    const content = form.content.value;
    const image = form.image.value || "https://via.placeholder.com/400x200";

    const newPost = {
      title,
      author,
      content,
      image,
      date: new Date().toISOString().split("T")[0]
    };

    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
      .then((res) => res.json())
      .then(() => {
        form.reset();
        displayPosts();
      });
  });
}
