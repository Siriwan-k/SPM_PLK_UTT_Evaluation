(() => {

  const scriptURL = window.scriptURL;
  const UserID = localStorage.getItem("UserID");
  const UserType = localStorage.getItem("UserType");
  const SchoolName = localStorage.getItem("SchoolName");
  const Area = localStorage.getItem("Area");


  function loadUserData() {

    fetch(`${scriptURL}?action=getReporterInfo&UserID=${UserID}&UserType=${UserType}`)
      .then(res => res.json())
      .then(data => {

        //if (data.success) {
        console.log("📦 data จาก server:", data);

        document.getElementById("nameOutput").textContent = data.name;
        document.getElementById("emailOutput").textContent = data.email;
        document.getElementById("phoneOutput").textContent = data.phone;


        // ✅ รอให้ img element โหลดก่อน แล้วค่อยใส่ src
        waitForElement("picOutput", (img) => {
          const picUrl = (data.pic && data.pic.trim() !== "" && data.pic.includes("http"))
            ? data.pic
            : "https://via.placeholder.com/150?text=No+Image";

          img.src = picUrl;
          //console.log("✅ แสดงรูปที่:", picUrl);
        });
      })
      .catch(err => {
        console.error("❌ โหลดข้อมูลผิดพลาด:", err);
      });
  }

  function waitForElement(id, callback) {
    const el = document.getElementById(id);
    if (el) {
      callback(el);
    } else {
      setTimeout(() => waitForElement(id, callback), 100); // รอ 100ms แล้วลองใหม่
    }
  }






  document.getElementById("updateForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const file = document.getElementById("picInput").files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const base64Image = event.target.result.split(",")[1]; // ตัด prefix ออก

        sendData(base64Image);
      };
      reader.readAsDataURL(file);
    } else {
      sendData(""); // ไม่มีรูป
    }
  });







  function sendData(base64Image) {
    const loading = document.getElementById("loadingPopup");
    loading.style.display = "flex"; // ✅ แสดง popup loading

    const formData = new URLSearchParams();
    formData.append("action", "updateReporterInfo");
    formData.append("UserID", UserID);
    formData.append("UserType", UserType);
    formData.append("Name", document.getElementById("nameInput").value);
    formData.append("Email", document.getElementById("emailInput").value);
    formData.append("Phone", document.getElementById("phoneInput").value);
    formData.append("Pic", base64Image);

    fetch(scriptURL, {
      method: "POST",
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        loading.style.display = "none"; // ✅ ซ่อน popup
        if (data.success) {
          //alert("อัปโหลดเสร็จเรียบร้อยแล้ว");
          loadUserData();
          document.getElementById("updateForm").reset();
        } else {
          alert("❌ " + data.message);
        }
      });
  }

  loadUserData();
})();


