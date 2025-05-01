const scriptURL = "https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec";

fetch(`${scriptURL}?action=getLatestMegaphone`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // ✅ แสดงรายละเอียด
      document.getElementById("Mega_Detail").innerText = data.Mega_Detail;

      // ✅ แสดงวันที่ Mega_Date เป็นแบบไทย
      const thaiDate = formatThaiDate(data.Mega_Date);
      document.getElementById("Mega_Date").innerText = thaiDate;

      // ✅ เริ่มนับเวลาถอยหลัง
      startCountdown(data.Mega_Date);
    }
  })
  .catch(error => {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล Megaphone:", error);
    document.getElementById("Mega_Detail").innerText = "เกิดข้อผิดพลาดในการโหลดข้อมูล";
  });

// 📆 แปลงวันที่ ISO เป็นวันที่แบบไทย
const formatThaiDate = (isoDateStr) => {
  const date = new Date(isoDateStr.replace(" ", "T"));
  date.setHours(date.getHours() + 7); // ปรับเป็นเวลาไทย

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

// ⏳ นับเวลาถอยหลังแบบเรียลไทม์
const startCountdown = (isoTargetTime) => {
  const countdownEl = document.getElementById("Mega_Realtime");
  if (!countdownEl) return;
  /* if (!countdownEl) {
     countdownEl = document.createElement("h1");
     countdownEl.id = "Mega_Realtime";
     countdownEl.className = "text-danger fw-bold mt-1";
     document.body.appendChild(countdownEl); // หรือ append ไปที่ตำแหน่งที่ต้องการ
   }*/
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

    countdownEl.innerHTML = `เหลือเวลาอีก <br>${days} วัน ${hours} ชั่วโมง ${mins} นาที`;
    setTimeout(tick, 1000);
  };

  tick();
};
