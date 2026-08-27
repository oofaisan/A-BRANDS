/* ============================================================
   A+ BRANDS — سلوك الموقع (تفاعلات بسيطة فقط)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  initRevealOnScroll();
  initInquiryForm();
  initMenuFilter();
  initOccasionsCalculator();
  initFormPrefill();
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

/* بيانات باقات الأسعار الحقيقية — نفس الأرقام الموجودة بصفحات البراندات */
var CALC_SERVICES = {
  "monkey-cookies-cart": {
    label: "Monkey Cookies — عربة الكوكيز",
    link: "vendor-monkey-cookies.html#cookies-cart",
    tiers: [
      { qty: 30, price: 1950 },
      { qty: 50, price: 2250 },
      { qty: 70, price: 2550 },
      { qty: 100, price: 3000 },
      { qty: 200, price: 4500 },
    ],
  },
  "coffee-stand": {
    label: "Monkey Cookies — ستاند القهوة",
    link: "vendor-monkey-cookies.html#coffee-stand",
    tiers: [
      { qty: 30, price: 1770 },
      { qty: 50, price: 1950 },
      { qty: 75, price: 2175 },
      { qty: 100, price: 2400 },
      { qty: 200, price: 3300 },
    ],
  },
  "acai": {
    label: "Açaí — عربة آساي",
    link: "vendor-acai.html",
    tiers: [
      { qty: 30, price: 2400 },
      { qty: 50, price: 2700 },
      { qty: 100, price: 3800 },
      { qty: 150, price: 4300 },
      { qty: 200, price: 5500 },
    ],
  },
  "burger-castle": {
    label: "Burger Castle — عربة برجر كاسل",
    link: "vendor-burger-castle.html",
    tiers: [
      { qty: 30, price: 2875 },
      { qty: 50, price: 4025 },
      { qty: 70, price: 5175 },
      { qty: 100, price: 6900 },
      { qty: 150, price: 8050 },
      { qty: 200, price: 9775 },
    ],
  },
};

function formatSAR(n) {
  return Math.round(n).toLocaleString("en-US");
}

/* حاسبة تكلفة المناسبة (صفحة المناسبات) */
function initOccasionsCalculator() {
  var serviceSelect = document.getElementById("calcService");
  var guestsInput = document.getElementById("calcGuests");
  var resultBox = document.getElementById("calcResult");
  if (!serviceSelect || !guestsInput || !resultBox) return;

  function render() {
    var service = CALC_SERVICES[serviceSelect.value];
    var guests = parseInt(guestsInput.value, 10);

    if (!service || !guests || guests < 1) {
      resultBox.innerHTML = '<p class="calc-note">أدخل عدد الأشخاص لعرض التكلفة التقريبية.</p>';
      return;
    }

    var tiers = service.tiers;
    var maxTier = tiers[tiers.length - 1];
    var exceedsMax = guests > maxTier.qty;
    var tier = exceedsMax ? maxTier : tiers.find(function (t) { return t.qty >= guests; });

    var perPerson = tier.price / guests;

    var html =
      '<div class="calc-service">' + service.label + "</div>" +
      '<div class="calc-per-person">' + formatSAR(perPerson) + ' ﷼ <span>/ الشخص تقريبًا</span></div>' +
      '<div class="calc-total">بناءً على باقة ' + tier.qty + " — إجمالي " + formatSAR(tier.price) + " ﷼</div>";

    if (exceedsMax) {
      html += '<div class="calc-note">عدد الأشخاص أكبر من أكبر باقة متاحة (' + maxTier.qty + ') — السعر هنا تقديري فقط، تواصل معنا لعرض مخصص لعددكم.</div>';
    } else if (tier.qty !== guests) {
      html += '<div class="calc-note">أقرب باقة تغطي عدد ضيوفكم هي باقة ' + tier.qty + ".</div>";
    }

    html +=
      '<div class="calc-cta btn-block-wrap" style="margin-top:14px;">' +
      '<a class="btn btn-primary" href="' + service.link + '">تفاصيل الباقات</a>' +
      '<a class="btn btn-outline" href="start.html?guests=' + guests + '&interest=' + encodeURIComponent(service.label) + '&perperson=' + Math.round(perPerson) + '">اطلب عرض سعر لهذا الاختيار</a>' +
      "</div>";

    resultBox.innerHTML = html;
  }

  serviceSelect.addEventListener("change", render);
  guestsInput.addEventListener("input", render);
  render();
}

/* تعبئة نموذج "ابدأ الآن" تلقائيًا لو جاي من رابط فيه تفاصيل جاهزة */
function initFormPrefill() {
  var form = document.getElementById("inquiryForm");
  if (!form) return;

  var params = new URLSearchParams(location.search);
  var guests = params.get("guests");
  var interest = params.get("interest");
  var perPerson = params.get("perperson");

  var guestsField = document.getElementById("guests");
  if (guests && guestsField) guestsField.value = guests;

  var detailsField = document.getElementById("details");
  if (interest && detailsField) {
    var note = "مهتم بـ: " + interest;
    if (guests) note += " — لعدد " + guests + " شخص تقريبًا";
    if (perPerson) note += " (حسب حاسبة الموقع: ~" + perPerson + " ﷼ للشخص)";
    detailsField.value = note;
  }
}
