function login(event) {
  event.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorBox = document.getElementById("error");

  if (!username || !password) {
    errorBox.innerText = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
    return;
  }

  const scriptURL =
    "https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec";

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "action=login" +
      "&username=" + encodeURIComponent(username) +
      "&password=" + encodeURIComponent(password)
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // ✅ เก็บข้อมูลลง localStorage
        localStorage.setItem("UserID", data.UserID);
        localStorage.setItem("UserType", data.UserType);
        localStorage.setItem("SchoolName", data.SchoolName);
        localStorage.setItem("Area", data.Area);
        localStorage.setItem("Pic_Area", data.Pic_Area);

        // ✅ ย้ายไปหน้า dashboard
        if (data.UserType === "school") {
          window.location.href = "dashboard.html";
        } else if (data.UserType === "area") {
          window.location.href = "area-dashboard.html";
        } else if (data.UserType === "admin") {
          window.location.href = "admin-dashboard.html";
        }
      } else {
        errorBox.innerText = data.message;
      }
    })
    .catch(err => {
      console.error("Error:", err);
      errorBox.innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
    });
}

function loadFormSummaryPage() {
  // 1. โหลด Chart.js ก่อน (หากยังไม่โหลด)
  if (typeof Chart === 'undefined') {
    const chartScript = document.createElement('script');
    chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    chartScript.onload = () => {
      loadFormSummary(); // โหลดหลังจาก Chart.js โหลดเสร็จ
    };
    document.head.appendChild(chartScript);
  } else {
    loadFormSummary(); // Chart.js ถูกโหลดแล้ว
  }
}

function loadFormSummary() {
  // 2. โหลด HTML content ของหน้า form-summary (เช่นจาก .html, หรือ Template)
  fetch('form-summary.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('main-content').innerHTML = html;

      // 3. โหลดสคริปต์ form-summary.js หลังจากโหลด HTML แล้ว
      const script = document.createElement('script');
      script.src = 'js/form-summary.js'; // ที่มีฟังก์ชัน loadEvaStatusGroupedWithSummary()
      document.body.appendChild(script);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBT");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // 🔒 เคลียร์ข้อมูลใน localStorage
      localStorage.removeItem("UserID");
      localStorage.removeItem("UserType");
      localStorage.clear(); // ล้างทั้งหมดถ้าต้องการ

      // ✅ Redirect ไปหน้า login.html
      window.location.href = "index.html";
    });
  }
});