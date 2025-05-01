(() => {
  console.log("🚀 school-result.js loaded");

  const scriptURL = window.scriptURL;
  const userID = localStorage.getItem("UserID");

  async function fetchJSON(url) {
    console.log("🌐 Fetching:", url);
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Response:", data);
    return data;
  }

  async function loadData(schoolID) {
    console.log("📊 Loading data for school:", schoolID);
    const policyTabs = document.getElementById("policyTabs");
    const policyContent = document.getElementById("policyContent");
    policyTabs.innerHTML = "";
    policyContent.innerHTML = "";

    if (!Array.isArray(window.policies)) {
      console.error("❌ window.area_policies is undefined or not an array");
      return;
    }

    for (let i = 0; i < window.policies.length; i++) {
      const policy = window.policies[i];
      console.log(`📁 Processing policy ${policy.title}`);

      policyTabs.innerHTML += `
        <li class="nav-item">
          <a class="nav-link ${i === 0 ? "active" : ""}" data-bs-toggle="tab" href="#policy${i}">${policy.title}</a>
        </li>`;

      const tabPane = document.createElement("div");
      tabPane.className = `tab-pane fade ${i === 0 ? "show active" : ""}`;
      tabPane.id = `policy${i}`;
      tabPane.innerHTML = `<h5 class="mb-3 fw-bold">${policy.title} ${policy.head1 ? `: ${policy.head1}` : ""}</h5>`;

      for (const item of policy.items || []) {
        console.log(`🔎 Fetching for Eva_ID: ${item.evaId}`);
        const [school, cluster, area] = await Promise.all([
          fetchJSON(`${scriptURL}?action=getSchoolEvaluationData&sheetName=Evaluation${i + 1}&userID=${schoolID}`),
          fetchJSON(`${scriptURL}?action=getClusterEvaluationData&sheetName=Re_Evaluation${i + 1}&userID=${schoolID}`),
          fetchJSON(`${scriptURL}?action=getAreaEvaluationData&sheetName=Re_Evaluation${i + 1}&userID=${schoolID}`)
        ]);

        const schoolItem = school[item.evaId] || {};
        const clusterItem = cluster[item.evaId] || {};
        const areaItem = area[item.evaId] || {};

        const card = document.createElement("div");
        card.className = "card mb-4 bg-white shadow-sm border";
        card.innerHTML = `
          <div class="card-header fw-semibold">${item.text}</div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">ระดับโรงเรียน (นวัตกรรม)</label>
                <textarea class="form-control" readonly>${schoolItem.Eva_Innovation || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับสหวิทยาเขต (นวัตกรรม)</label>
                <textarea class="form-control" readonly>${clusterItem.Area_Re_Eva_Innovation || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับเขตพื้นที่ (นวัตกรรม)</label>
                <textarea class="form-control" readonly>${areaItem.Admin_Re_Eva_Innovation || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับโรงเรียน (กระบวนการ)</label>
                <textarea class="form-control" readonly>${schoolItem.Eva_Process || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับสหวิทยาเขต (กระบวนการ)</label>
                <textarea class="form-control" readonly>${clusterItem.Area_Re_Eva_Process || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับเขตพื้นที่ (กระบวนการ)</label>
                <textarea class="form-control" readonly>${areaItem.Admin_Re_Eva_Process || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับโรงเรียน (ผลลัพธ์)</label>
                <textarea class="form-control" readonly>${schoolItem.Eva_Output || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับสหวิทยาเขต (ผลลัพธ์)</label>
                <textarea class="form-control" readonly>${clusterItem.Area_Re_Eva_Output || ""}</textarea>
              </div>
              <div class="col-md-4">
                <label class="form-label">ระดับเขตพื้นที่ (ผลลัพธ์)</label>
                <textarea class="form-control" readonly>${areaItem.Admin_Re_Eva_Output || ""}</textarea>
              </div>
              <div class="col-md-12">
                <label class="form-label">ไฟล์แนบ (จากโรงเรียน)</label>
                <div class="form-control">
                  ${schoolItem.Eva_PDF ? `<a href="${schoolItem.Eva_PDF}" target="_blank">เปิดไฟล์แนบ</a>` : '<span class="text-muted">ไม่มีไฟล์แนบ</span>'}
                </div>
              </div>
            </div>
          </div>
        `;
        tabPane.appendChild(card);
      }

      policyContent.appendChild(tabPane);
    }
  }

  // โหลดโดยตรงด้วย userID ของโรงเรียน
  if (userID) {
    loadData(userID);
  }
})();