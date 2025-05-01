fetch(`${scriptURL}?action=getProgressByArea`)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      renderAreaTabs(data.data);
    } else {
      document.getElementById("area-container").innerText = "❌ ไม่สามารถโหลดข้อมูลได้";
    }
  })
  .catch(err => {
    console.error("โหลดข้อมูลล้มเหลว:", err);
    document.getElementById("area-container").innerText = "⚠️ เกิดข้อผิดพลาด";
  });

function renderAreaTabs(areaData) {
  const container = document.getElementById("area-container");
  container.innerHTML = "";

  for (const area in areaData) {
    const schools = areaData[area];

    // 🔹 Header แบบกดเปิด/ปิด
    const header = document.createElement("div");
    header.className = "area-header";
    header.innerHTML = `<span>📁 ${area}</span><i class="bi bi-chevron-down rotate-icon"></i>`;

    // 🔹 Content ของโรงเรียนในพื้นที่
    const content = document.createElement("div");
    content.className = "area-content";

    const table = document.createElement("table");
    table.className = "table table-bordered table-sm mt-2";
    table.innerHTML = `
      <thead class="table-light">
        <tr>
          <th>ลำดับ</th>
          <th>โรงเรียน</th>
          <th class="text-center">% โรงเรียน</th>
          <th class="text-center">% สหวิทยาเขต</th>
          <th class="text-center">% เขตพื้นที่</th>
        </tr>
      </thead>
      <tbody>
        ${schools.map((s, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${s.SchoolName}</td>
            <td class="text-center">${s.Eva_Percent}%</td>
            <td class="text-center">${s.Area_Percent}%</td>
            <td class="text-center">${s.Admin_Percent}%</td>
          </tr>
        `).join("")}
      </tbody>
    `;
    content.appendChild(table);

    // 🔹 Toggle Event
    header.addEventListener("click", () => {
      const icon = header.querySelector(".rotate-icon");
      const isOpen = content.style.display === "block";
      content.style.display = isOpen ? "none" : "block";
      icon.classList.toggle("open", !isOpen);
    });

    container.appendChild(header);
    container.appendChild(content);
  }
}
