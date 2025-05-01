// ✅ admin-home // table : school // sum : school

(() => {
  const userType = localStorage.getItem("UserType") || "";
  const userID = localStorage.getItem("UserID") || "";

  const BASE_URL = "https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec";
  const SCHOOL_LIST_URL = `${BASE_URL}?action=getSchoolListProgressAll`;
  const LEVEL_PROGRESS_URL = `${BASE_URL}?action=getAdminLevelProgress`; // ✅ ต้องเป็นแบบนี้
  const LEVEL_TOTAL = 2237;

  console.log("🔍 เริ่มโหลดหน้า admin-home");
  console.log("🧾 UserType:", userType);
  console.log("🧾 UserID:", userID);

  if (userType !== "admin") {
    console.warn("⛔ ไม่ใช่ผู้ใช้ระดับ admin — ยกเลิกการโหลดข้อมูล");
    return;
  }

  loadSchoolProgress();
  loadLevelProgress();

  // 🚀 โหลดข้อมูลความก้าวหน้าของโรงเรียนทั้งหมด
  async function loadSchoolProgress() {
    console.log("🌐 Fetch: รายชื่อโรงเรียนทั้งหมด →", SCHOOL_LIST_URL);

    try {
      const res = await fetch(SCHOOL_LIST_URL);
      const json = await res.json();
      console.log("✅ โหลดข้อมูลโรงเรียนแล้ว:", json);

      // ตรวจสอบความถูกต้องของข้อมูล
      if (!json.success || !Array.isArray(json.data)) {
        console.warn("⚠️ ข้อมูลไม่ถูกต้อง:", json.message || json);
        updateProgress("school", 0);
        return;
      }

      const schoolData = json.data;
      console.log("📦 ตรวจสอบข้อมูลจาก getSchoolListProgressAll →", schoolData);

      const totalSchools = schoolData.length;
      const totalPercent = schoolData.reduce((sum, item, index) => {
        const percent = item.total ? Math.round((item.done / item.total) * 100) : 0;
        console.log(`🏫 [${index + 1}] ${item.schoolName}: ${item.done}/${item.total} = ${percent}%`);
        return sum + percent;
      }, 0);

      const avg = totalSchools ? Math.round(totalPercent / totalSchools) : 0;
      console.log("📊 ค่าเฉลี่ยระดับโรงเรียน:", avg, "%");

      updateProgress("school", avg);
    } catch (error) {
      console.error("❌ โหลดข้อมูลโรงเรียนล้มเหลว:", error);
      updateProgress("school", 0);
    }
  }

  // 🚀 โหลดข้อมูลความก้าวหน้าระดับ area และ admin
  async function loadLevelProgress() {
    console.log("🌐 Fetch: ความก้าวหน้า area/admin →", LEVEL_PROGRESS_URL);

    try {
      const res = await fetch(LEVEL_PROGRESS_URL);
      const json = await res.json();
      console.log("✅ โหลดข้อมูลระดับ area/admin แล้ว:", json);

      const areaDone = json.area?.done || 0;
      const adminDone = json.admin?.done || 0;

      const areaPercent = Math.round((areaDone / LEVEL_TOTAL) * 100);
      const adminPercent = Math.round((adminDone / LEVEL_TOTAL) * 100);

      console.log(`🏙 สหวิทยาเขต: ${areaDone}/${LEVEL_TOTAL} = ${areaPercent}%`);
      console.log(`🏛 เขตพื้นที่: ${adminDone}/${LEVEL_TOTAL} = ${adminPercent}%`);

      updateProgress("area", areaPercent);
      updateProgress("admin", adminPercent);
    } catch (error) {
      console.error("❌ โหลดข้อมูลระดับ area/admin ล้มเหลว:", error);
      updateProgress("area", 0);
      updateProgress("admin", 0);
    }
  }

  // ✅ อัปเดต Progress bar บนหน้าเว็บ
  function updateProgress(level, percent) {
    const bar = document.getElementById(`level2-${level}`);
    const label = document.getElementById(`label2-${level}`);
    if (bar && label) {
      bar.style.width = `${percent}%`;
      label.textContent = `${percent}%`;
      console.log(`🔧 อัปเดต progress bar [${level}] → ${percent}%`);
    } else {
      console.warn(`⚠️ ไม่พบ element: #level2-${level} หรือ #label2-${level}`);
    }
  }
})();