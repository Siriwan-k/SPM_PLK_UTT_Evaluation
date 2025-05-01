(function() {
  "use strict";

  var treeviewMenu = $('.app-menu');

  // Toggle Sidebar
  $('[data-toggle="sidebar"]').click(function(event) {
    event.preventDefault();
    $('.app').toggleClass('sidenav-toggled');
  });

  // Activate sidebar treeview toggle
  $("[data-toggle='treeview']").click(function(event) {
    event.preventDefault();
    if (!$(this).parent().hasClass('is-expanded')) {
      treeviewMenu.find("[data-toggle='treeview']").parent().removeClass('is-expanded');
    }
    $(this).parent().toggleClass('is-expanded');
  });

})();










//shool(home) progress
(async () => {
  const userID = localStorage.getItem("UserID");
  if (!userID) {
    console.warn("⚠️ ไม่พบ userID ใน localStorage");
    return;
  }

  const url = `https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec?action=getSchoolProgress&userID=${userID}`;

  try {
    const res = await fetch(url);
    const result = await res.json();

    if (!result.success || !result.progress) {
      console.error("❌ ดึงข้อมูลล้มเหลว:", result.message);
      return;
    }

    const progress = result.progress;

    updateProgress("school", progress.school.percent);
    updateProgress("area", progress.area.percent);
    updateProgress("admin", progress.admin.percent);

    // console.log("✅ ความก้าวหน้า:", progress);
  } catch (err) {
    console.error("❌ ข้อผิดพลาดในการโหลด API:", err);
  }

  function updateProgress(type, percent) {
    const bar = document.getElementById(`level1-${type}`);
    const label = document.getElementById(`label1-${type}`);
    if (bar && label) {
      bar.style.width = `${percent}%`;
      label.textContent = `${percent}%`;
    } else {
      console.warn(`⚠️ ไม่พบ element สำหรับ ${type}`);
    }
  }
})();








//area-home // table : school // sum : school
(async () => {
  const userType = localStorage.getItem("UserType");
  const userID = localStorage.getItem("UserID");
  const schoolName = localStorage.getItem("SchoolName");


  if (userType !== "area") return;

  const baseURL = "https://script.google.com/macros/s/AKfycbz1vIsgVzmrItnOny0sp-4e4mO0ZL4iP-PYOtQ6-xMgLmtAY5XIRpefJ3wz2nHLTgE4yw/exec";

  const schoolListURL = `${baseURL}?action=getSchoolListProgress&userID=${encodeURIComponent(schoolName)}`;
  const levelURL = `${baseURL}?action=getLevelProgress&userID=${encodeURIComponent(userID)}`;

  try {
    // 🔄 โหลดข้อมูลโรงเรียน
    const resSchool = await fetch(schoolListURL);
    const schoolData = await resSchool.json();

    const table = document.getElementById("schoolEvalTable-home");
    let html = "";

    schoolData.forEach((item, index) => {
      const percent = Math.round((item.done / 41) * 100);
      const barColor = percent === 100 ? "bg-success" : percent >= 50 ? "bg-warning" : "bg-danger";

      const status = item.done === 41
        ? `<span class="text-success fw-bold">✅ ${item.done}/41</span>`
        : `<span class="text-warning">⏳ ${item.done}/41</span>`;

      html += `
        <tr>
          <td class="text-center">${index + 1}</td>
          <td>${item.schoolName}</td>
          <td>${item.name}</td>
          <td class="text-center">${status}</td>
          <td class="text-center">
            <div class="progress" style="height: 22px;">
              <div class="progress-bar ${barColor}" role="progressbar" style="width: ${percent}%; font-size: 8pt;">
                ${percent}%
              </div>
            </div>
          </td>
        </tr>
      `;
    });

    table.innerHTML = html;

    // ✅ คำนวณ % ความก้าวหน้าระดับโรงเรียน
    const totalSchools = schoolData.length;
    const totalPercent = schoolData.reduce((sum, item) => sum + Math.round((item.done / 41) * 100), 0);
    const avgPercent = totalSchools ? Math.round(totalPercent / totalSchools) : 0;
    updateProgress("school", avgPercent);

    console.log(avgPercent);
    // 🔄 โหลดข้อมูล area / admin
    const resLevel = await fetch(levelURL);
    const levelData = await resLevel.json();

    const areaPercent = Math.round(((levelData.area?.done || 0) / 234) * 100);
    const adminPercent = Math.round(((levelData.admin?.done || 0) / 234) * 100);
    console.log(areaPercent);
    console.log(adminPercent);

    updateProgress("area", areaPercent);
    updateProgress("admin", adminPercent);

  } catch (err) {
    console.error("❌ เกิดข้อผิดพลาดในการโหลด:", err);
    document.getElementById("schoolEvalTable-home").innerHTML = `
      <tr><td colspan="5" class="text-danger text-center">⚠️ ไม่สามารถโหลดข้อมูลโรงเรียนได้</td></tr>
    `;
  }

  // ✅ ฟังก์ชันอัปเดต progress bar
  function updateProgress(level, percent) {
    const bar = document.getElementById(`level-${level}`);
    const label = document.getElementById(`label-${level}`);
    if (bar && label) {
      bar.style.width = `${percent}%`;
      label.textContent = `${percent}%`;
    } else {
      console.warn(`⚠️ ไม่พบ element: #level-${level} หรือ #label-${level}`);
    }
  }
})();