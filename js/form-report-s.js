(() => {
  const scriptURL = window.scriptURL;

  $(function() {
    policies.forEach((policy, i) => {
      $('#policyTabs').append(`<li class="nav-item"><a class="nav-link ${i === 0 ? 'active' : ''}" data-bs-toggle="tab" href="#policy${i}">${policy.title}</a></li>`);
      let content = `<div class="tab-pane fade ${i === 0 ? 'show active' : ''}" id="policy${i}">`;
      content += `<h5 class="mb-3">${policy.head1}</h5>`

      if (policy.items && Array.isArray(policy.items)) {
        policy.items.forEach((item, j) => {
          content += `
            <div class="card mb-3">
              <div class="card-header">${item.text}</div>
              <div class="card-body">
                <form id="form${i}_${j}" enctype="multipart/form-data">
                  <input type="hidden" name="Eva_ID" value="${item.evaId}">
                  <input type="hidden" name="SheetName" value="${policy.sheetName}">
                  <div class="mb-3">
                    <label class="form-label">วิธีการ/กระบวนการ</label>
                    <textarea name="Eva_Process" class="form-control"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">นวัตกรรม</label>
                    <textarea name="Eva_Innovation" class="form-control"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">ผลลัพธ์</label>
                    <textarea name="Eva_Output" class="form-control"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">ปัญหาและอุปสรรค</label>
                    <textarea name="Eva_Pro" class="form-control"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">แนบไฟล์</label>
                    <input type="file" class="form-control" name="Eva_PDF">
                  </div>
                  <div class="mb-3 pdf-preview"></div>
                </form>
              </div>
            </div>`;
        });
      }

      content += `<div class="text-frist"><button class="btn btn-success" onclick="submitFormsByPolicy(${i})">บันทึกข้อมูลนโยบายนี้</button></div></div>`;
      $('#policyContent').append(content);
      loadSubmittedData(policy.sheetName, i); // ต้องเรียกหลัง append()
    });
  });

  window.submitFormsByPolicy = function(policyIndex) {
    if (!confirm("ยืนยันการส่งข้อมูลของนโยบายนี้หรือไม่?")) return;
    const forms = document.querySelectorAll(`#policy${policyIndex} form`);
    let submitted = 0;

    forms.forEach((form, idx) => {
      const formData = new FormData(form);
      formData.append("action", "submitEvaluation");
      formData.append("UserID", localStorage.getItem("UserID"));

      const fileInput = form.querySelector('input[name="Eva_PDF"]');
      const file = fileInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const base64 = e.target.result.split(',')[1];
          formData.set("Eva_PDF", base64);
          sendFormData(formData);
        };
        reader.readAsDataURL(file);
      } else {
        formData.append("Eva_PDF", "");
        sendFormData(formData);
      }

      function sendFormData(formData) {
        fetch(scriptURL, {
          method: "POST",
          body: formData
        })
          .then(res => res.json())
          .then(data => {
            submitted++;
            if (submitted === forms.length) {
              alert("✅ บันทึกข้อมูลนโยบายนี้เรียบร้อยแล้ว");
              // 🔁 เปลี่ยนปุ่มเป็น “ส่งแล้ว” + ปิดการคลิก
              const saveBtn = document.querySelector(`#policy${policyIndex} button`);
              saveBtn.textContent = "✅ ส่งแล้ว";
              saveBtn.disabled = true;
              saveBtn.classList.remove("btn-success");
              saveBtn.classList.add("btn-secondary");
            }
          })
          .catch(err => alert("⚠️ ไม่สามารถส่งข้อมูลได้: " + err));
      }
    });
  }

  async function loadSubmittedData(sheetName, policyIndex) {
    const userID = localStorage.getItem("UserID");
    const url = `${window.scriptURL}?action=getEvaluationData&sheetName=${sheetName}&userID=${userID}`;

    try {
      const response = await fetch(url);
      const submittedData = await response.json();

      const forms = document.querySelectorAll(`#policy${policyIndex} form`);

      let allDisabled = true;

      forms.forEach((form) => {
        const evaID = form.querySelector('input[name="Eva_ID"]').value;

        console.log(`🔁 โหลดข้อมูลสำหรับ sheet=${sheetName}, policyIndex=${policyIndex}`);
        console.log("🧪 กำลังโหลดข้อมูลจาก:", url);
        console.log("📦 ข้อมูลที่โหลดได้:", submittedData);
        console.log("🎯 ฟอร์มพบ Eva_ID:", evaID);

        if (submittedData[evaID]) {
          const data = submittedData[evaID];

          // ✅ ใส่ข้อมูลลงใน textarea
          form.querySelector('textarea[name="Eva_Process"]').value = data.Eva_Process || "";
          form.querySelector('textarea[name="Eva_Innovation"]').value = data.Eva_Innovation || "";
          form.querySelector('textarea[name="Eva_Output"]').value = data.Eva_Output || "";
          form.querySelector('textarea[name="Eva_Pro"]').value = data.Eva_Pro || "";

          if (data.Eva_PDF) {
            const previewDiv = form.querySelector(".pdf-preview");
            previewDiv.innerHTML = `<a href="${data.Eva_PDF}" target="_blank" class="btn btn-outline-primary">
            📄 ดูเอกสารแนบ (PDF)
            </a>`;
          }

          // 🔒 ปิดไม่ให้แก้ไข
          form.querySelectorAll("textarea").forEach(el => el.disabled = true);
          form.querySelector('input[name="Eva_PDF"]').disabled = true;
        } else {
          allDisabled = false;
        }
      });

      // ✅ ซ่อนปุ่มถ้าทุกฟอร์มถูกปิดการแก้ไข
      const saveBtn = document.querySelector(`#policy${policyIndex} button`);
      if (allDisabled && saveBtn) {
        saveBtn.textContent = "✅ ส่งแล้ว";
        saveBtn.disabled = true;
        saveBtn.classList.remove("btn-success");
        saveBtn.classList.add("btn-secondary");
      }

    } catch (err) {
      console.error("❌ โหลดข้อมูลล้มเหลว:", err);
      alert("ไม่สามารถโหลดข้อมูลที่เคยส่งได้");
    }
  }

})();