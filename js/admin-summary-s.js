(() => {
  console.log("🚀 admin-summary.js loaded");

  const scriptURL = window.scriptURL;
  const clusterDropdown = document.getElementById("clusterDropdown");
  const schoolDropdown = document.getElementById("schoolDropdown");
  const tableBody = document.getElementById("summaryTableBody");

  const wait = ms => new Promise(res => setTimeout(res, ms));

  async function fetchJSON(url) {
    console.log("🌐 Fetching:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Response:", data);
    return data;
  }

  async function loadClusters() {
    console.log("📥 Loading clusters...");
    const url = `${scriptURL}?action=getAllClusters`;
    const data = await fetchJSON(url);
    clusterDropdown.innerHTML = `<option value="">-- เลือกสหวิทยาเขต --</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.AreaName;
      opt.textContent = item.AreaName || item.UserID;
      clusterDropdown.appendChild(opt);
    });
    console.log("✅ Clusters loaded");
  }

  async function loadSchools(AreaName) {
    console.log("📥 Loading schools for cluster:", AreaName);
    const url = `${scriptURL}?action=getSchoolsByCluster&area=${encodeURIComponent(AreaName)}`;
    const data = await fetchJSON(url);
    schoolDropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;
    data.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.UserID;
      opt.textContent = item.SchoolName;
      schoolDropdown.appendChild(opt);
    });
    schoolDropdown.disabled = false;
    console.log("✅ Schools loaded");
  }

  async function loadSummary(userID) {
    const [schoolData, clusterData, areaData] = await Promise.all([
      fetchJSON(`${scriptURL}?action=getEvaStatus&UserID=${userID}`),
      fetchJSON(`${scriptURL}?action=getClusterEvaStatus&UserID=${userID}`),
      fetchJSON(`${scriptURL}?action=getAreaEvaStatus&UserID=${userID}`)
    ]);

    tableBody.innerHTML = "";

    for (let i = 1; i <= 13; i++) {
      const key = `นโยบายที่ ${i}`;
      const policy = window.area_policies.find(p => p.title === key);
      const total = policy?.items?.length || 0;

      const schoolDone = schoolData.filter(r => r.policy === key && r.status === "✅").length;
      const clusterDone = clusterData.filter(r => r.policy === key && r.status === "✅").length;
      const areaDone = areaData.filter(r => r.policy === key && r.status === "✅").length;

      const percent = (n) => total ? Math.round((n / total) * 100) : 0;
      const badge = (n) => `<span class="badge bg-${n === 100 ? 'success' : 'secondary'}">${n}%</span>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-start">${policy?.head1 || ""}</td>
        <td>${total}</td>
        <td>${schoolDone}</td>
        <td>${badge(percent(schoolDone))}</td>
        <td>${clusterDone}</td>
        <td>${badge(percent(clusterDone))}</td>
        <td>${areaDone}</td>
        <td>${badge(percent(areaDone))}</td>
      `;
      tableBody.appendChild(tr);
    }
  }

  clusterDropdown.addEventListener("change", async () => {
    const clusterID = clusterDropdown.value;
    console.log("📌 Cluster selected:", clusterID);
    schoolDropdown.disabled = true;
    schoolDropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;
    tableBody.innerHTML = "";
    if (clusterID) {
      await loadSchools(clusterID);
    }
  });

  schoolDropdown.addEventListener("change", async () => {
    const schoolID = schoolDropdown.value;
    if (schoolID) {
      await loadSummary(schoolID);
    } else {
      tableBody.innerHTML = "";
    }
  });

  loadClusters();
})();