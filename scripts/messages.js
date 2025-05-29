import { renderHeader, wireLogout, PreventBackButton, checkSession, loadProfilePicture } from "./utils.js";

renderHeader(); 
checkSession();
wireLogout();
PreventBackButton();
loadProfilePicture();

document.addEventListener("DOMContentLoaded", () => {
  const categoryButtons = document.querySelectorAll(".category-btn");
  const categories = {
    "sunday-messages": "Sunday",
    "midweek-messages": "Midweek",
    "lsts-messages": "Friday"
  };

  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const targetId = btn.getAttribute("data-target");
      const categoryDiv = document.getElementById(targetId);

      document.querySelectorAll("audio").forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Toggle visibility
      const allMessageDivs = document.querySelectorAll(".message-category");
      let show = true;

      allMessageDivs.forEach(div => {
        if (div.id === targetId) {
          show = div.style.display !== "block";
          div.style.display = show ? "block" : "none";
        } else {
          div.style.display = "none";
        }
      });

      const alreadyLoaded = categoryDiv.getAttribute("data-loaded") === "true";

      if (alreadyLoaded) {
        if (show) {
          setTimeout(() => {
            categoryDiv.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
        return;
      }

      const categoryName = categories[targetId];
      const endpoint = `https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/AudioMessage?category=${categoryName}`;

      try {
        const res = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch messages: ${res.status}`);
        }

        const text = await res.text();
        const messages = text ? JSON.parse(text) : [];

        if (messages.length === 0) {
          categoryDiv.innerHTML = "<p>No messages available.</p>";
        } else {
          messages.forEach(msg => {
            if (!msg.filePath) {
              console.warn("Missing filePath for message:", msg);
              return;
            }

            const audioUrl = `https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/${msg.filePath}`;

            const card = document.createElement("div");
            card.className = "message-card";
            card.innerHTML = `
              <p><strong>Title:</strong> ${msg.title}</p>
              <p><strong>Date:</strong> ${new Date(msg.date).toLocaleDateString()}</p>
              <p><strong>Category:</strong> ${msg.category || "Unknown"}</p>
              <audio controls src="${audioUrl}"></audio>
              <button class="download-btn">Download</button>
            `;

            categoryDiv.appendChild(card);

            // Download button
            const downloadBtn = card.querySelector(".download-btn");
            downloadBtn.addEventListener("click", () => {
              const link = document.createElement("a");
              link.href = audioUrl;
              link.download = msg.title;
              link.click();
            });

            // Add to latest messages
            const latestMessagesContainer = document.getElementById("latest-messages");
            const latestCard = card.cloneNode(true);
            latestMessagesContainer.appendChild(latestCard);

            // Ensure only one audio plays at a time
            const newAudio = card.querySelector("audio");
            newAudio.addEventListener("play", () => {
              document.querySelectorAll("audio").forEach(audio => {
                if (audio !== newAudio) {
                  audio.pause();
                }
              });
            });
          });
        }

        categoryDiv.setAttribute("data-loaded", "true");

        // ✅ Now scroll into view after everything is loaded
        if (show) {
          setTimeout(() => {
            categoryDiv.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }

      } catch (err) {
        categoryDiv.innerHTML = "<p class='error'>Failed to load messages.</p>";
        console.error("Error fetching messages:", err);
      }
    });
  });

  // ✅ Load latest messages on page load
  loadLatestMessages();

  // ✅ Filter messages by title
  const searchInput = document.getElementById("search-input");
 
});

// ✅ Load and display latest 20 messages across all categories
async function loadLatestMessages() {
  const categories = ["Sunday", "Midweek", "Friday"];
  let allMessages = [];

  try {
    for (const category of categories) {
      const endpoint = `https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/api/AudioMessage?category=${category}`;
      const res = await fetch(endpoint, { method: "GET", credentials: "include" });
      if (!res.ok) continue;

      const text = await res.text();
      const messages = text ? JSON.parse(text) : [];
      allMessages.push(...messages);
    }

    allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestMessages = allMessages.slice(0, 20);
    const container = document.getElementById("latest-messages");
    container.innerHTML = "";

    latestMessages.forEach(msg => {
      if (!msg.filePath) return;

      const audioUrl = `https://divinegrace-debxaddqfaehdggg.southafricanorth-01.azurewebsites.net/${msg.filePath}`;
      const card = document.createElement("div");
      card.className = "message-card";
      card.innerHTML = `
        <p><strong>Title:</strong> ${msg.title}</p>
        <p><strong>Date:</strong> ${new Date(msg.date).toLocaleDateString()}</p>
        <p><strong>Category:</strong> ${msg.category || "Unknown"}</p>
        <audio controls src="${audioUrl}"></audio>
        <button class="download-btn">Download</button>
      `;

      container.appendChild(card);

      const downloadBtn = card.querySelector(".download-btn");
      downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = msg.title;
        link.click();
      });

      const audioElement = card.querySelector("audio");
      audioElement.addEventListener("play", () => {
        document.querySelectorAll("audio").forEach(audio => {
          if (audio !== audioElement) {
            audio.pause();
          }
        });
      });
    });

  } catch (err) {
    console.error("Error loading latest messages:", err);
  }
}
