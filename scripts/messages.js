import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";

renderHeader(); 
wireLogout();
PreventBackButton();


async function fetchMessages() {
    try {
      const res = await fetch("/api/messages"); // adjust if needed
      const data = await res.json();

      const latestContainer = document.getElementById("latest-messages");
      const containers = {
        Sunday: document.getElementById("sunday-messages"),
        Midweek: document.getElementById("midweek-messages"),
        LSTS: document.getElementById("lsts-messages")
      };

      data.forEach((msg, index) => {
        const audioBlock = `
          <div class="audio-card">
            <h4>${msg.title}</h4>
            <audio controls src="${msg.audioUrl}"></audio>
            <p>${new Date(msg.uploadDate).toLocaleDateString()}</p>
          </div>
        `;

        if (msg.category in containers) {
          containers[msg.category].innerHTML += audioBlock;
        }

        if (index < 3) {
          latestContainer.innerHTML += audioBlock;
        }
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  fetchMessages();

  // Toggle section visibility
  document.querySelectorAll(".category-btn").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);

      const isVisible = targetEl.style.display === "block";

      document.querySelectorAll(".message-category").forEach(div => {
        div.style.display = "none";
      });

      if (!isVisible) {
        targetEl.style.display = "block";
      }
    });
  });
  