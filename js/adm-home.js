
(() => {
  const scriptURL = "https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec"; // 🔁 ใส่ URL ของคุณ
  const form = document.getElementById("sendMega");
  const detailInput = document.getElementById("Mega_Detail");
  const dateInput = document.getElementById("Mega_Date");
  const updateSpan = document.getElementById("Mega_Update");

  const fetchLatestAnnouncement = async () => {
    try {
      const res = await fetch(`${scriptURL}?action=getLatestMegaphone`);
      const data = await res.json();

      if (data.success) {
        detailInput.value = data.Mega_Detail || "";
        dateInput.value = data.Mega_Date;


        updateSpan.textContent = formatThaiDate(data.Mega_Update);
        startCountdown(data.Mega_Date);
      }
    } catch (err) {
      console.error("❌ ดึงข้อมูลล้มเหลว:", err);
    }
  };

  // ใช้ new Date() รับ ISO string แล้วแปลงเป็นเวลาไทย
  const formatThaiDate = (isoDateStr) => {
    const date = new Date(isoDateStr);
    date.setHours(date.getHours() + 7); // ⏰ ปรับเป็นเวลาไทย GMT+7

    const day = date.getDate();
    const monthNames = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear() + 543;
    const hour = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year} เวลา ${hour}:${min} น.`;
  };



  const startCountdown = (isoTargetTime) => {
    const countdownEl = document.getElementById("Mega_Realtime");
    if (!countdownEl) return;

    const isoStr = isoTargetTime.replace(" ", "T");
    const target = new Date(isoStr);
    target.setHours(target.getHours() + 7); // GMT+7

    const tick = () => {
      const now = new Date();
      const diff = target - now;

      if (diff <= 0) {
        countdownEl.textContent = "⏰ ถึงเวลาประกาศแล้ว";
        return;
      }

      const mins = Math.floor((diff / 1000 / 60) % 60);
      const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
      const days = Math.floor(diff / 1000 / 60 / 60 / 24);

      countdownEl.textContent = `🕒 เหลือเวลาอีก ${days} วัน ${hours} ชั่วโมง ${mins} นาที`;
      setTimeout(tick, 1000);
    };

    tick();
  };


  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const detail = detailInput.value;
    const date = dateInput.value;
    const UserID = localStorage.getItem("UserID");

    const formData = new URLSearchParams();
    formData.append("action", "sendMegaphone");
    formData.append("UserID", UserID);
    formData.append("Mega_Detail", detail);
    formData.append("Mega_Date", date);

    try {
      const res = await fetch(scriptURL, {
        method: "POST",
        body: formData
      });
      const result = await res.json();

      if (result.success) {
        alert("✅ บันทึกเรียบร้อยแล้ว");
        location.reload();
        fetchLatestAnnouncement();
      } else {
        alert("❌ บันทึกล้มเหลว");
      }
    } catch (err) {
      alert("⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    }
  });

  fetchLatestAnnouncement();
})();
