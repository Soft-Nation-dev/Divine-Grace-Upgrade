import { renderHeader } from "./utils.js";
import { wireLogout }    from "./utils.js";


renderHeader();
wireLogout();


  document.getElementById("email-btn").addEventListener("click", function () {
    window.location.href = "mailto:ifeanyieee8105@gmail.com";
  });

  document.getElementById("telegram-btn").addEventListener("click", function () {
    window.open("https://t.me/+2348141787294", "_blank");
  });

  document.getElementById("facebook-btn").addEventListener("click", function () {
    window.open("https://www.facebook.com/share/168KsrMQab/", "_blank");
  });

  document.getElementById("whatsapp-btn").addEventListener("click", function () {
    window.open("https://wa.me/2348141787294", "_blank");
  });
