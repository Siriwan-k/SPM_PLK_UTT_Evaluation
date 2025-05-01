(() => {
  console.log("✅ area-summary-s.js loaded");

  const scriptURL = window.scriptURL;
  const area = localStorage.getItem("Area");

  const waitForElement = (id, callback) => {
    const el = document.getElementById(id);
    if (el) {
      console.log(`📌 พบ element: #${id}`);
      callback(el);
    } else {
      console.log(`⏳ รอโหลด element: #${id}...`);
      setTimeout(() => waitForElement(id, callback), 100);
    }
  };

  const loadSchoolDropdown = async () => {
    const url = `${scriptURL}?action=getSchoolsByCluster&area=${encodeURIComponent(area)}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("📥 ข้อมูลโรงเรียนจาก API:", data);

      const dropdown = document.getElementById("schoolDropdown");
      dropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;

      data.forEach((school, index) => {
        const opt = document.createElement("option");
        opt.value = school.UserID;
        opt.textContent = school.SchoolName;
        dropdown.appendChild(opt);
      });

      console.log("✅ โหลดรายชื่อโรงเรียนสำเร็จ");
    } catch (err) {
      console.error("❌ โหลดรายชื่อโรงเรียนล้มเหลว:", err);
      alert("ไม่สามารถโหลดรายชื่อโรงเรียนได้");
    }
  };

  const renderSchoolEvaTable = async (userID) => {
    const url = `${scriptURL}?action=getEvaStatus&UserID=${userID}`;
    console.log(`🌐 [โรงเรียน] ดึงข้อมูลจาก: ${url}`);
    await renderEvaTable(url, "schoolTableBody");
  };

  // ✅ ปรับให้รับ userID ของโรงเรียนที่เลือก
  const renderClusterEvaTable = async (schoolUserID) => {
    const url = `${scriptURL}?action=getClusterEvaStatus&UserID=${encodeURIComponent(schoolUserID)}`;
    console.log(`🌐 [สหวิทยาเขต] ดึงข้อมูลจาก: ${url}`);
    await renderEvaTable(url, "areaTableBody");
  };

  const renderEvaTable = async (url, tableID) => {
    if (!window.area_policies || !Array.isArray(window.area_policies)) {
      console.error("❌ ไม่พบ window.area_policies หรือยังไม่ได้โหลด policy data");
      return;
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log(`📦 ข้อมูล (${tableID}):`, data);

      const grouped = {};
      data.forEach(row => {
        if (!grouped[row.policy]) grouped[row.policy] = [];
        grouped[row.policy].push(row);
      });

      let html = "";
      for (let i = 1; i <= 13; i++) {
        const keyText = `นโยบายที่ ${i}`;
        const policy = window.area_policies.find(p => p.title === keyText);

        if (!policy) {
          console.warn(`⚠️ ไม่พบข้อมูล policy: ${keyText}`);
          continue;
        }

        const head1 = policy.head1 || "(ไม่มีหัวข้อ)";
        const total = policy.items?.length || 0;
        const items = grouped[keyText] || [];
        const done = items.filter(item => item.status === "✅").length;
        const percent = total ? Math.round((done / total) * 100) : 0;
        const barColor = percent === 100 ? "bg-success" : percent >= 50 ? "bg-warning" : "bg-danger";

        html += `
          <tr>
            <td>${head1}</td>
            <td class="text-center">${total}</td>
            <td class="text-center">${done}</td>
            <td>
              <div class="progress" style="height: 22px;">
                <div class="progress-bar ${barColor}" style="width: ${percent}%">
                  ${percent}%
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      const table = document.getElementById(tableID);
      if (table) {
        table.innerHTML = html;
        console.log(`✅ แสดงผลใน ${tableID} แล้ว`);
      } else {
        console.warn(`❌ ไม่พบ element: #${tableID}`);
      }

    } catch (err) {
      console.error(`❌ ดึงข้อมูลจาก ${url} ล้มเหลว:`, err);
    }
  };

  waitForElement("schoolDropdown", async (dropdown) => {
    console.log("📌 เริ่มโหลด dropdown...");
    await loadSchoolDropdown();

    dropdown.addEventListener("change", async () => {
      const userID = dropdown.value;

      if (!userID) {
        console.warn("⚠️ ยังไม่ได้เลือกโรงเรียน");
        document.getElementById("schoolTableBody").innerHTML = "";
        document.getElementById("areaTableBody").innerHTML = "";
        return;
      }

      console.log("📍 เลือกโรงเรียน:", userID);
      await Promise.all([
        renderSchoolEvaTable(userID),      // ✅ ฝั่งโรงเรียน
        renderClusterEvaTable(userID)      // ✅ ฝั่ง cluster ใช้ userID ของโรงเรียน
      ]);
    });
  });
})();




(() => {
  console.log("✅ combined-summary.js loaded");

  const scriptURL = window.scriptURL;
  const area = localStorage.getItem("Area");

  const waitForElement = (id, callback) => {
    const el = document.getElementById(id);
    if (el) {
      callback(el);
    } else {
      setTimeout(() => waitForElement(id, callback), 100);
    }
  };

  const loadSchoolDropdown = async () => {
    const url = `${scriptURL}?action=getSchoolsByCluster&area=${encodeURIComponent(area)}`;
    const res = await fetch(url);
    const data = await res.json();

    const dropdown = document.getElementById("schoolDropdown");
    dropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;

    data.forEach(school => {
      const opt = document.createElement("option");
      opt.value = school.UserID;
      opt.textContent = school.SchoolName;
      dropdown.appendChild(opt);
    });
  };




  const renderCombinedTable = async (userID) => {
    const [schoolRes, clusterRes] = await Promise.all([
      fetch(`${scriptURL}?action=getEvaStatus&UserID=${userID}`),
      fetch(`${scriptURL}?action=getClusterEvaStatus&UserID=${userID}`)
    ]);

    const schoolData = await schoolRes.json();
    const clusterData = await clusterRes.json();

    const groupedSchool = {};
    const groupedCluster = {};

    schoolData.forEach(row => {
      if (!groupedSchool[row.policy]) groupedSchool[row.policy] = [];
      groupedSchool[row.policy].push(row);
    });

    clusterData.forEach(row => {
      if (!groupedCluster[row.policy]) groupedCluster[row.policy] = [];
      groupedCluster[row.policy].push(row);
    });

    let html = "";
    for (let i = 1; i <= 13; i++) {
      const key = `นโยบายที่ ${i}`;
      const policy = window.area_policies?.find(p => p.title === key);
      const head1 = policy?.head1 || key;

      const totalSchool = policy?.items?.length || 0;
      const doneSchool = (groupedSchool[key] || []).filter(item => item.status === "✅").length;
      const percentSchool = totalSchool ? Math.round((doneSchool / totalSchool) * 100) : 0;
      const barColorSchool = percentSchool === 100 ? "bg-success" : percentSchool >= 50 ? "bg-warning" : "bg-danger";

      const totalCluster = policy?.items?.length || 0;
      const doneCluster = (groupedCluster[key] || []).filter(item => item.status === "✅").length;
      const percentCluster = totalCluster ? Math.round((doneCluster / totalCluster) * 100) : 0;
      const barColorCluster = percentCluster === 100 ? "bg-success" : percentCluster >= 50 ? "bg-warning" : "bg-danger";

      html += `
        <tr>
          <td class="text-start">${head1}</td>
          <td>${totalSchool}</td>
          <td>${doneSchool}</td>
          <td>
            <div class="progress" style="height: 22px;">
              <div class="progress-bar ${barColorSchool}" style="width: ${percentSchool}%;">
                ${percentSchool}%
              </div>
            </div>
          </td>
          <td>${doneCluster}</td>
          <td>
            <div class="progress" style="height: 22px;">
              <div class="progress-bar ${barColorCluster}" style="width: ${percentCluster}%;">
                ${percentCluster}%
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    const table = document.getElementById("combinedEvaTable");
    if (table) {
      table.innerHTML = html;
    }
  };

  waitForElement("schoolDropdown", async (dropdown) => {
    await loadSchoolDropdown();

    dropdown.addEventListener("change", async () => {
      const userID = dropdown.value;
      if (!userID) {
        document.getElementById("combinedEvaTable").innerHTML = "";
        return;
      }
      await renderCombinedTable(userID);
    });
  });
})();
