/* ============================================================
   A+ BRANDS — سلوك الموقع (تفاعلات بسيطة فقط)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  initRevealOnScroll();
  initInquiryForm();
  initMenuFilter();
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

/* نموذج "ابدأ الآن": يجهّز رسالة واتساب جاهزة من بيانات النموذج */
function initInquiryForm() {
  var form = document.getElementById("inquiryForm");
  if (!form) return;

  var WHATSAPP_NUMBER = "966551150099"; // رقم واتساب A+ BRANDS

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

/* فلترة صفحة القائمة الموحّدة حسب التصنيف */
function initMenuFilter() {
  var bar = document.querySelector(".filter-bar");
  if (!bar) return;

  var chips = bar.querySelectorAll(".filter-chip");
  var cards = document.querySelectorAll(".listing-card[data-cat]");
  var emptyState = document.getElementById("listingEmpty");

  function applyFilter(cat) {
    var anyVisible = false;
    cards.forEach(function (card) {
      var match = cat === "all" || card.dataset.cat === cat;
      card.style.display = match ? "" : "none";
      if (match) anyVisible = true;
    });
    if (emptyState) emptyState.style.display = anyVisible ? "none" : "block";
  }

  function activate(cat) {
    chips.forEach(function (c) {
      c.classList.toggle("active", c.dataset.filter === cat);
    });
    applyFilter(cat);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var cat = chip.dataset.filter;
      activate(cat);
      var url = cat === "all" ? "menu.html" : "menu.html?cat=" + cat;
      history.replaceState(null, "", url);
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  var requested = new URLSearchParams(location.search).get("cat");
  var target = bar.querySelector('.filter-chip[data-filter="' + requested + '"]') ? requested : "all";
  activate(target);
}
