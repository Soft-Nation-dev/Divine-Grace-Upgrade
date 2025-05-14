import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";

renderHeader(); 
wireLogout();
PreventBackButton();

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
        audio.currentTime = 0; // Reset to beginning
      });

      // Toggle visibility
      const allMessageDivs = document.querySelectorAll(".message-category");
      allMessageDivs.forEach(div => {
        div.style.display = div.id === targetId
          ? (div.style.display === "block" ? "none" : "block")
          : "none";
      });

      // If already loaded, don't fetch again
      if (categoryDiv.getAttribute("data-loaded") === "true") return;

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

            // Add download button functionality
            const downloadBtn = card.querySelector(".download-btn");
            downloadBtn.addEventListener("click", () => {
              const link = document.createElement("a");
              link.href = audioUrl;
              link.download = msg.title;  // Download with the message title
              link.click();
            });

            const latestMessagesContainer = document.getElementById("latest-messages");
            const latestCard = card.cloneNode(true); // Clone the message card
            latestMessagesContainer.appendChild(latestCard);

            // Pause other audios when one starts playing
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

      } catch (err) {
        categoryDiv.innerHTML = "<p class='error'>Failed to load messages.</p>";
        console.error("Error fetching messages:", err);
      }
    });
  });

  // ✅ Load latest messages on initial page load
  loadLatestMessages();

  // ✅ Add Search/Filter functionality by message title
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", function() {
    const query = searchInput.value.toLowerCase();
    const allMessages = document.querySelectorAll(".message-card");
    allMessages.forEach(card => {
      const title = card.querySelector("p strong").nextElementSibling.textContent.toLowerCase();
      if (title.includes(query)) {
        card.style.display = "block";
      } else {
        card.style.display = "none";
      }
    });
  });
});

// ✅ New: Load and display latest 20 messages from all categories
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

    // Sort newest first
    allMessages.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Take top 20
    const latestMessages = allMessages.slice(0, 20);
    const container = document.getElementById("latest-messages");
    container.innerHTML = ""; // Clear first

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

      // Add download button functionality
      const downloadBtn = card.querySelector(".download-btn");
      downloadBtn.addEventListener("click", () => {
        const link = document.createElement("a");
        link.href = audioUrl;
        link.download = msg.title;  // Download with the message title
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
