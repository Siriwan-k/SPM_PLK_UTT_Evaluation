// ✅ admin-report-area.js - ใช้สำหรับประเมินระดับเขตพื้นที่
(() => {
  console.log("🚀 admin-report-area.js loaded");

  const scriptURL = window.scriptURL;
  const area = localStorage.getItem("Area");
  const userType = localStorage.getItem("UserType");
  const areaUserID = localStorage.getItem("UserID");
  const selected = { clusterID: "", schoolID: "" };

  async function fetchData(action, sheetName, userID) {
    const url = `${scriptURL}?action=${action}&sheetName=${sheetName}&userID=${userID}`;
    console.log(`🌐 fetchData from: ${url}`);
    const res = await fetch(url);
    const data = await res.json();
    return data;
  }

  async function loadSchoolFeedback(sheetName, evaID, userID) {
    console.log(`📥 loadSchoolFeedback: ${sheetName}, EvaID: ${evaID}, UserID: ${userID}`);
    const data = await fetchData("getSchoolEvaluationData", sheetName, userID);
    console.log("📦 schoolData:", data);
    return data[String(evaID)] || {};
  }

  async function loadClusterFeedback(sheetName, evaID, userID) {
    console.log(`📥 loadClusterFeedback: ${sheetName}, EvaID: ${evaID}, UserID: ${userID}`);
    const data = await fetchData("getClusterEvaluationData", sheetName, userID);
    console.log("📦 clusterData:", data);
    return data[String(evaID)] || {};
  }

  async function loadAreaFeedback(sheetName, evaID, form, btn) {
    if (form.classList.contains("submitted")) {
      console.log(`⏭️ ข้าม form ${evaID} ที่เพิ่ง submit แล้ว`);
      return;
    }

    const url = `${scriptURL}?action=getAreaEvaluationData&sheetName=${sheetName}&userID=${selected.schoolID}`;
    console.log("📥 loadAreaFeedback URL:", url);
    try {
      const res = await fetch(url);
      const data = await res.json();
      console.log("📦 areaFeedback data:", data);
      const fb = data[evaID] || {};

      form.querySelector("textarea[name='Area_Feedback_Inno']").value = fb.Admin_Re_Eva_Innovation || "";
      form.querySelector("textarea[name='Area_Feedback_Proc']").value = fb.Admin_Re_Eva_Process || "";
      form.querySelector("textarea[name='Area_Feedback_Out']").value = fb.Admin_Re_Eva_Output || "";

      const isLocked = fb.Admin_Eva_Check == 1;
      console.log("🔒 isLocked:", isLocked);
      if (isLocked) {
        form.querySelectorAll("textarea").forEach(t => t.disabled = true);
        if (btn) {
          btn.textContent = "✅ ส่งแล้ว";
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-secondary");
          btn.disabled = true;
        }
      }
    } catch (err) {
      console.error("❌ โหลดข้อมูลเขตพื้นที่ล้มเหลว:", err);
    }
  }

  if (userType === "admin") {
    fetch(`${scriptURL}?action=getAllClusters`)
      .then(res => res.json())
      .then(data => {
        const clusterSelect = document.getElementById("clusterSelect");
        clusterSelect.innerHTML = `<option value="">-- เลือกสหวิทยาเขต --</option>`;
        data.forEach(area => {
          const opt = document.createElement("option");
          opt.value = area.AreaName || area.UserID;
          opt.textContent = area.AreaName || area.UserID;
          clusterSelect.appendChild(opt);
        });
      })
      .catch(err => {
        console.error("❌ โหลดเขตพื้นที่ล้มเหลว:", err);
        alert("ไม่สามารถโหลดเขตพื้นที่ได้");
      });
  }

  document.getElementById("clusterSelect").addEventListener("change", async function() {
    selected.clusterID = this.value;
    const schoolDropdown = document.getElementById("schoolSelect");
    schoolDropdown.disabled = true;
    schoolDropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;

    if (!selected.clusterID) return;

    const url = `${scriptURL}?action=getSchoolsByCluster&area=${encodeURIComponent(selected.clusterID)}`;
    try {
      const res = await fetch(url);
      const schools = await res.json();
      schools.forEach(school => {
        const opt = document.createElement("option");
        opt.value = school.UserID;
        opt.textContent = school.SchoolName;
        schoolDropdown.appendChild(opt);
      });
      schoolDropdown.disabled = false;
    } catch (err) {
      console.error("❌ โหลดรายชื่อโรงเรียนล้มเหลว:", err);
      alert("เกิดข้อผิดพลาดขณะโหลดโรงเรียน");
    }
  });

  document.getElementById("schoolSelect").addEventListener("change", async function() {
    selected.schoolID = this.value;
    if (!selected.schoolID) return;
    document.getElementById("policyTabs").innerHTML = "";
    document.getElementById("policyContent").innerHTML = "";

    for (const [i, policy] of area_policies.entries()) {
      document.getElementById("policyTabs").innerHTML += `
        <li class="nav-item">
          <a class="nav-link ${i === 0 ? "active" : ""}" data-bs-toggle="tab" href="#policy${i}">${policy.title}</a>
        </li>`;

      let tabPane = document.createElement("div");
      tabPane.className = `tab-pane fade ${i === 0 ? "show active" : ""}`;
      tabPane.id = `policy${i}`;
      tabPane.innerHTML = `<h5 class="mb-3">${policy.head1}</h5>`;
      document.getElementById("policyContent").appendChild(tabPane);

      for (const [j, item] of policy.items.entries()) {
        const [schoolData, clusterData] = await Promise.all([
          loadSchoolFeedback(`Evaluation${i + 1}`, item.evaId, selected.schoolID),
          loadClusterFeedback(`Re_Evaluation${i + 1}`, item.evaId, selected.schoolID)
        ]);

        const card = document.createElement("div");
        card.className = "card mb-3";
        card.innerHTML = `
          <div class="card-header">${item.text}</div>
          <div class="card-body">
            <form id="form${i}_${j}">
              <input type="hidden" name="Eva_ID" value="${item.evaId}">
              <input type="hidden" name="SheetName" value="Re_Evaluation${i + 1}">

              <div class="row">
                <div class="col-md-4">
                  <label class="form-label">รายงานจากโรงเรียน : Innovation</label>
                  <textarea class="form-control" name="School_Report_Inno" readonly>${schoolData.Eva_Innovation || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากสหวิทยาเขต : Innovation</label>
                  <textarea class="form-control" name="Cluster_Feedback_Inno" readonly>${clusterData.Area_Re_Eva_Innovation || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากเขตพื้นที่ : Innovation</label>
                  <textarea class="form-control" name="Area_Feedback_Inno"></textarea>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-4">
                  <label class="form-label">รายงานจากโรงเรียน : Process</label>
                  <textarea class="form-control" name="School_Report_Proc" readonly>${schoolData.Eva_Process || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากสหวิทยาเขต : Process</label>
                  <textarea class="form-control" name="Cluster_Feedback_Proc" readonly>${clusterData.Area_Re_Eva_Process || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากเขตพื้นที่ : Process</label>
                  <textarea class="form-control" name="Area_Feedback_Proc"></textarea>
                </div>
              </div>
              <div class="row mt-3">
                <div class="col-md-4">
                  <label class="form-label">รายงานจากโรงเรียน : Output</label>
                  <textarea class="form-control" name="School_Report_Out" readonly>${schoolData.Eva_Output || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากสหวิทยาเขต : Output</label>
                  <textarea class="form-control" name="Cluster_Feedback_Out" readonly>${clusterData.Area_Re_Eva_Output || ""}</textarea>
                </div>
                <div class="col-md-4">
                  <label class="form-label">ข้อเสนอแนะจากเขตพื้นที่ : Output</label>
                  <textarea class="form-control" name="Area_Feedback_Out"></textarea>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-12">
                  <label class="form-label">ไฟล์แนบ (ถ้ามี)</label>
                  <div class="form-control">
                    ${schoolData.Eva_PDF ? `<a class="AttachFile" href="${schoolData.Eva_PDF}" target="_blank">เปิดไฟล์</a>` : `<span class="text-muted">ไม่มีไฟล์แนบ</span>`}
                  </div>
                </div>
              </div>
            </form>
          </div>`;

        tabPane.appendChild(card);
        loadAreaFeedback(`Re_Evaluation${i + 1}`, item.evaId, card.querySelector("form"));
      }

      const saveBtn = document.createElement("div");
      saveBtn.className = "text-end";

      const submitBtn = document.createElement("button");
      submitBtn.className = "btn btn-primary";
      submitBtn.textContent = "บันทึกข้อเสนอแนะนโยบายนี้";
      submitBtn.addEventListener("click", (event) => window.submitAreaFeedback(event, i));

      saveBtn.appendChild(submitBtn);
      tabPane.appendChild(saveBtn);
    }
  });

  window.submitAreaFeedback = function(event, policyIndex) {
    if (!confirm("คุณต้องการส่งข้อเสนอแนะของนโยบายนี้หรือไม่?")) return;

    const button = event.currentTarget;
    const forms = document.querySelectorAll(`#policy${policyIndex} form`);
    let submitted = 0;

    forms.forEach(form => {
      const formData = new URLSearchParams();
      const evaID = form.querySelector("input[name='Eva_ID']").value;
      const sheetName = form.querySelector("input[name='SheetName']").value;

      formData.append("action", "submitAreaFeedback");
      formData.append("UserID", selected.schoolID);
      formData.append("Eva_ID", evaID);
      formData.append("SheetName", sheetName);
      formData.append("Feedback_Inno", form.querySelector("textarea[name='Area_Feedback_Inno']").value);
      formData.append("Feedback_Proc", form.querySelector("textarea[name='Area_Feedback_Proc']").value);
      formData.append("Feedback_Out", form.querySelector("textarea[name='Area_Feedback_Out']").value);
      formData.append("SubmitBy", areaUserID);

      fetch(scriptURL, { method: "POST", body: formData })
        .then(res => res.json())
        .then((data) => {
          submitted++;
          if (submitted === forms.length) {
            alert("✅ บันทึกข้อเสนอแนะเรียบร้อยแล้ว");

            forms.forEach(f => {
              f.querySelectorAll("textarea").forEach(t => t.disabled = true);
              f.classList.add("submitted");
            });

            button.textContent = "✅ ส่งแล้ว";
            button.classList.remove("btn-primary");
            button.classList.add("btn-secondary");
            button.disabled = true;
          }
        })
        .catch(err => {
          console.error("❌ submitAreaFeedback error:", err);
          alert("เกิดข้อผิดพลาดขณะส่งข้อมูล");
        });
    });
  };

})();