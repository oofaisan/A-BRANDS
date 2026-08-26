/* ============================================================
   A+ BRANDS — سلوك الموقع (تفاعلات بسيطة فقط)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  initRevealOnScroll();
  initInquiryForm();
});

/* ظهور تدريجي للبطاقات عند التمرير */
function initRevealOnScroll() {
  var items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.01, rootMargin: "0px 0px 15% 0px" }
  );
  items.forEach(function (el) { io.observe(el); });
}

/* نموذج "ابدأ الآن": يجهّز رسالة واتساب جاهزة من بيانات النموذج
   ملاحظة للتعديل: غيّر رقم WHATSAPP_NUMBER بالأسفل لرقم شركتكم الحقيقي */
function initInquiryForm() {
  var form = document.getElementById("inquiryForm");
  if (!form) return;

  var WHATSAPP_NUMBER = "9665XXXXXXXX"; // TODO: استبدل هذا برقم واتساب الشركة (بدون + أو صفر البداية)

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);

    var lines = [
      "طلب تواصل جديد من موقع A+ BRANDS",
      "الاسم: " + (data.get("name") || "-"),
      "الشركة: " + (data.get("company") || "-"),
      "رقم الجوال: " + (data.get("phone") || "-"),
      "نوع المناسبة: " + (data.get("occasion") || "-"),
      "عدد الضيوف: " + (data.get("guests") || "-"),
      "التاريخ المطلوب: " + (data.get("date") || "-"),
      "تفاصيل إضافية: " + (data.get("details") || "-"),
    ];

    var msg = encodeURIComponent(lines.join("\n"));
    window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + msg, "_blank");
  });
}
