// ✅ area-report.js ปรับใช้กับโครงสร้างฟอร์มที่กำหนดไว้ พร้อมแยก sheetName สำหรับอ่าน/เขียน
(() => {
  console.log("🚀 cluster-report.js loaded");
  const scriptURL = window.scriptURL;
  const area = localStorage.getItem("Area");
  const userType = localStorage.getItem("UserType");
  const A_userID = localStorage.getItem("UserID");
  const selectedSchool = { userID: "" };

  console.log("🔍 UserType:", userType);
  console.log("🔍 Area:", area);
  console.log("🌐 scriptURL:", scriptURL);
  console.log("🧾 policies =", area_policies);

  fetch(`${scriptURL}?action=getSchoolsByCluster&area=${encodeURIComponent(area)}`)
    .then(res => res.json())
    .then(data => {
      console.log("📦 ได้ข้อมูโรงเรียน:", data);
      const dropdown = document.getElementById("schoolDropdown");
      dropdown.innerHTML = `<option value="">-- เลือกโรงเรียน --</option>`;
      data.forEach(school => {
        console.log("🏢 เพิ่มโรงเรียน:", school);
        const opt = document.createElement("option");
        opt.value = school.UserID;
        opt.textContent = school.SchoolName;
        dropdown.appendChild(opt);
      });
    })
    .catch(err => {
      console.error("❌ โหลดรายชื่อโรงเรียนล้มเหลว:", err);
      alert("ไม่สามารถโหลดรายชื่อโรงเรียนได้");
    });

  window.onSchoolChange = function(userID) {
    console.log("📍 เรียก onSchoolChange แล้ว:", userID);
    if (!userID) return;
    selectedSchool.userID = userID;
    $('#policyTabs').empty();
    $('#policyContent').empty();

    area_policies.forEach((area_policies, i) => {
      console.log(`🧹 สร้าง Tab: ${area_policies.title}`);
      $('#policyTabs').append(`<li class="nav-item"><a class="nav-link ${i === 0 ? 'active' : ''}" data-bs-toggle="tab" href="#policy${i}">${area_policies.title}</a></li>`);
      let content = `<div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="policy${i}">`;
      content += `<h5 class="mb-3">${area_policies.head1}</h5>`;

      if (area_policies.items && Array.isArray(area_policies.items)) {
        area_policies.items.forEach((item, j) => {
          console.log(`🧹 เพิ่มแบบฟอร์ม: EvaID=${item.evaId}`);
          content += `
            <div class="card mb-3">
              <div class="card-header">${item.text}</div>
              <div class="card-body">
                <form id="form${i}_${j}" enctype="multipart/form-data">
                  <input type="hidden" name="Eva_ID" value="${item.evaId}">
                  <input type="hidden" name="WriteSheet" value="${area_policies.writeSheet}">
                  <input type="hidden" name="ReadSheet" value="${area_policies.readSheet}">
                  <input type="hidden" name="SchoolSheet" value="Evaluation${i + 1}">
                  <input type="hidden" name="Area_Eva_Submit" value="${A_userID}">

                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">รายงานจากโรงเรียน : Innovation</label>
                        <textarea class="form-control" name="School_Report_Inno" readonly></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">รายงานจากโรงเรียน : Process</label>
                        <textarea class="form-control" name="School_Report_Proc" readonly></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">รายงานจากโรงเรียน : Output</label>
                        <textarea class="form-control" name="School_Report_Out" readonly></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">ไฟล์แนบ (ถ้ามี)</label>
                        <div class="form-control">
                          <a class="AttachFile" target="_blank" style="display:none">เปิดไฟล์</a>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">ข้อเสนอแนะ Innovation</label>
                        <textarea name="Eva_Innovation" class="form-control"></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">ข้อเสนอแนะ Process</label>
                        <textarea name="Eva_Process" class="form-control"></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">ข้อเสนอแนะ Output</label>
                        <textarea name="Eva_Output" class="form-control"></textarea>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>`;
        });
      }

      content += `<div class="text-frist"><button class="btn btn-success" id="saveBtn${i}" onclick="window.submitFeedbackByPolicy(${i})">บันทึกข้อเสนอแนะนโยบายนี้</button></div></div>`;
      $('#policyContent').append(content);

      // เรียกใช้แยก
      window.loadSchoolFeedbackForPolicy(area_policies.readSheet, i)
        .then(() => window.loadClusterFeedbackForPolicy(area_policies.writeSheet, i));
    });
  };

  window.loadSchoolFeedback = async function(sheetName, evaID, userID) {
    const url = `${scriptURL}?action=getSchoolEvaluationData&sheetName=${sheetName}&userID=${userID}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[evaID] || {};
  };

  window.loadClusterFeedback = async function(sheetName, evaID, userID) {
    const url = `${scriptURL}?action=getClusterEvaluationData&sheetName=${sheetName}&userID=${userID}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[evaID] || {};
  };

  window.loadSchoolFeedbackForPolicy = async function(readSheet, policyIndex) {
    const forms = document.querySelectorAll(`#policy${policyIndex} form`);
    for (const form of forms) {
      const evaID = form.querySelector("input[name='Eva_ID']").value;
      const schoolSheet = form.querySelector("input[name='SchoolSheet']").value;
      try {
        const schoolData = await window.loadSchoolFeedback(schoolSheet, evaID, selectedSchool.userID);
        form.querySelector("textarea[name='School_Report_Inno']").value = schoolData.Eva_Innovation || "";
        form.querySelector("textarea[name='School_Report_Proc']").value = schoolData.Eva_Process || "";
        form.querySelector("textarea[name='School_Report_Out']").value = schoolData.Eva_Output || "";

        const fileLink = form.querySelector(".AttachFile");
        if (schoolData.Eva_PDF) {
          fileLink.href = schoolData.Eva_PDF;
          fileLink.style.display = 'inline';
        } else {
          fileLink.style.display = 'none';
        }

        form.dataset.schoolCheck = schoolData.Area_Eva_Check == 1 ? "1" : "0";
      } catch (err) {
        console.error("❌ โหลดข้อมูลโรงเรียนล้มเหลว:", err);
      }
    }
  };

  window.loadClusterFeedbackForPolicy = async function(writeSheet, policyIndex) {
    const forms = document.querySelectorAll(`#policy${policyIndex} form`);
    let allDisabled = true;
    for (const form of forms) {
      const evaID = form.querySelector("input[name='Eva_ID']").value;
      try {
        const clusterData = await window.loadClusterFeedback(writeSheet, evaID, selectedSchool.userID);
        form.querySelector("textarea[name='Eva_Innovation']").value = clusterData.Area_Re_Eva_Innovation || "";
        form.querySelector("textarea[name='Eva_Process']").value = clusterData.Area_Re_Eva_Process || "";
        form.querySelector("textarea[name='Eva_Output']").value = clusterData.Area_Re_Eva_Output || "";

        const disabled = clusterData.Area_Eva_Check == 1 || clusterData.Area_Eva_Check === "1";
        if (disabled) {
          form.querySelectorAll("textarea").forEach(el => el.disabled = true);
        } else {
          allDisabled = false;
        }

        form.dataset.clusterCheck = disabled ? "1" : "0";
      } catch (err) {
        console.error("❌ โหลดข้อมูลสหวิทยาเขตล้มเหลว:", err);
      }
    }

    // ✅ เปลี่ยนตรงนี้: เช็คเฉพาะฝั่ง cluster เท่านั้น
    const allForms = document.querySelectorAll(`#policy${policyIndex} form`);
    const shouldDisable = [...allForms].every(f => f.dataset.clusterCheck === "1");
    const saveBtn = document.querySelector(`#saveBtn${policyIndex}`);
    if (shouldDisable) {
      saveBtn.textContent = "✅ บันทึกข้อมูลแล้ว";
      saveBtn.disabled = true;
      saveBtn.classList.remove("btn-success");
      saveBtn.classList.add("btn-secondary");
    }
  };


  window.submitFeedbackByPolicy = function(policyIndex) {
    if (!confirm("ยืนยันการส่งข้อเสนอแนะของนโยบายนี้หรือไม่?")) return;
    const forms = document.querySelectorAll(`#policy${policyIndex} form`);
    let submitted = 0;

    forms.forEach((form) => {
      const formData = new URLSearchParams();
      formData.append("action", "submitClusterFeedback");
      formData.append("UserID", selectedSchool.userID);
      formData.append("SheetName", form.querySelector("input[name='WriteSheet']").value);
      formData.append("Eva_ID", form.querySelector("input[name='Eva_ID']").value);
      formData.append("innovation", form.querySelector("textarea[name='Eva_Innovation']").value);
      formData.append("process", form.querySelector("textarea[name='Eva_Process']").value);
      formData.append("output", form.querySelector("textarea[name='Eva_Output']").value);
      formData.append("Area_Eva_Submit", form.querySelector("input[name='Area_Eva_Submit']").value);

      fetch(scriptURL, {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then((data) => {
          submitted++;
          if (submitted === forms.length) {
            alert("✅ บันทึกข้อเสนอแนะเรียบร้อยแล้ว");
            const saveBtn = document.querySelector(`#saveBtn${policyIndex}`);
            saveBtn.textContent = "✅ ส่งแล้ว";
            saveBtn.disabled = true;
            saveBtn.classList.remove("btn-success");
            saveBtn.classList.add("btn-secondary");
            window.loadSchoolFeedbackForPolicy(form.querySelector("input[name='ReadSheet']").value, policyIndex)
              .then(() => window.loadClusterFeedbackForPolicy(form.querySelector("input[name='WriteSheet']").value, policyIndex));
          }
        })
        .catch(err => {
          console.error("❌ submitClusterFeedback ล้มเหลว:", err);
          alert("⚠️ ไม่สามารถส่งข้อมูลได้: " + err);
        });
    });
  };
})();