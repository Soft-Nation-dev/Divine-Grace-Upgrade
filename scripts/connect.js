import { renderHeader, wireLogout, PreventBackButton } from "./utils.js";


renderHeader();
wireLogout();
PreventBackButton();

  document.getElementById("email-btn").addEventListener("click", function () {
    window.location.href = "mailto:ifeanyieee8105@gmail.com";
  });

  document.getElementById("telegram-btn").addEventListener("click", function () {
    window.open("https://t.me/+2348141787294");
  });

  document.getElementById("facebook-btn").addEventListener("click", function () {
    window.open("https://www.facebook.com/share/168KsrMQab/");
  });

  document.getElementById("whatsapp-btn").addEventListener("click", function () {
    window.open("https://wa.me/2348141787294");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const joinBtn = document.getElementById("join-btn");
  
    joinBtn.addEventListener("click", () => {
      const mainContent = document.querySelector(".main-content");
      mainContent.innerHTML = "";

      const departments = [
        { name: "Choir", phone: "08141787294" },
        { name: "Technical", phone: "08141787294" },
        { name: "Follow-up", phone: "08141787294" },
        { name: "Sanctuary and Decoration", phone: "08141787294" },
        { name: "Prayer Department", phone: "08141787294" },
        { name: "Evangelism Department", phone: "08141787294" }
      ];
  
      const container = document.createElement("div");
      container.className = "connect-a";

      Object.assign(container.style, {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "40px",
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        marginTop: "100px",
      });
  
      // Create a button for each department
      departments.forEach(dept => {
        const btn = document.createElement("button");
        btn.className = "whatsapp";
        btn.style.cursor = "pointer";
  
        btn.innerHTML = `
          <img class="img" src="/Divine-Grace-Upgrade/images/trans_whatsapp-removebg-preview.png" alt="">
          <h1 class="three-d-text">${dept.name}</h1>
        `;
  
        btn.addEventListener("click", () => {
          const phone = dept.phone.replace(/\D/g, ""); // clean number
          window.open(`https://wa.me/234${phone.substring(1)}`, "_blank");
        });
  
        container.appendChild(btn);
      });
  
     
const backButton = document.createElement("button");
backButton.textContent = "← Back to Connect";
Object.assign(backButton.style, {
  position: "fixed",
  top: "100px",              
  right: "30px",            
  padding: "10px 20px",
  borderRadius: "8px",
  border: "none",
  background: "#333",
  color: "#fff",
  fontSize: "16px",
  cursor: "pointer",
  zIndex: "1"             
});

backButton.addEventListener("click", () => location.reload());
mainContent.appendChild(container);
document.body.appendChild(backButton); 


    });
  });
  