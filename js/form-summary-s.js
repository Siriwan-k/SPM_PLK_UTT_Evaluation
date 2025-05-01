(() => {
  console.log("✅ form-summary-s.js loaded");


  const scriptURL = window.scriptURL;

  const loadEvaSummary = async () => {
    const userID = localStorage.getItem("UserID");

    const url = `${window.scriptURL}?action=getEvaStatus&UserID=${userID}`;
    const res = await fetch(url);
    const data = await res.json();
    //console.log("📦 ข้อมูลที่ได้:", data);

    const grouped = {};
    data.forEach(row => {
      if (!grouped[row.policy]) grouped[row.policy] = [];
      grouped[row.policy].push(row);
    });

    let html = "";
    for (let i = 1; i <= 13; i++) {
      const keyText = `นโยบายที่ ${i}`;
      const head1 = window.policies.find(p => p.title === keyText).head1 || ""; // ✅ ดึงหัวเรื่อง
      const items = grouped[keyText] || [];
      const done = items.filter(item => item.status === "✅").length;
      const total = window.policies.find(p => p.title === keyText)?.items.length || 0;
      const percent = total ? Math.round((done / total) * 100) : 0;
      const barColor = percent === 100 ? "bg-success" : percent >= 50 ? "bg-warning" : "bg-danger";
      console.log("📦 ข้อมูลที่ได้:", items);

      html += `
        <tr>
          <td>${head1}</td>
          <td class="text-center">${total}</td>
          <td class="text-center">${done}</td>
          <td>
            <div class="progress" style="height: 22px;">
              <div class="progress-bar ${barColor}" role="progressbar" style="width: ${percent}%;">
                ${percent}%
              </div>
            </div>
          </td>
        </tr>
      `;
    }

    const table = document.getElementById("evaStatusTable");
    if (table) {
      table.innerHTML = html;
      console.log("✅ โหลดข้อมูลใส่ตารางแล้ว");
    } else {
      console.warn("❌ ไม่พบ #evaStatusTable");
    }
  };

  function waitForElement(id, callback) {
    const el = document.getElementById(id);
    if (el) {
      console.log(`🔍 พบ element #${id}`);
      callback(el);
    } else {
      console.log(`⏳ รอ element #${id}...`);
      setTimeout(() => waitForElement(id, callback), 50);
    }
  }

  waitForElement("evaStatusTable", loadEvaSummary);
})();
