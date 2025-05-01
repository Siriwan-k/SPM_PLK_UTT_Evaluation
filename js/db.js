window.addEventListener("DOMContentLoaded", () => {
  const SchoolName = localStorage.getItem("SchoolName");
  const Area = localStorage.getItem("Area");
  const Pic_Area = localStorage.getItem("Pic_Area");

  // แสดงข้อมูลใน HTML
  document.getElementById("School1").innerText = SchoolName;
  document.getElementById("Pic_Area1").src = Pic_Area;
  document.getElementById("Area1").innerText = Area;
});