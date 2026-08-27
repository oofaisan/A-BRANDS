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
    label: "Monkey Cookies",
    sub: "عربة الكوكيز",
    unit: "علبة",
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
    label: "Monkey Cookies",
    sub: "ستاند القهوة",
    unit: "ضيف",
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
    label: "Açaí",
    sub: "عربة آساي",
    unit: "ضيف",
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
    label: "Burger Castle",
    sub: "عربة برجر كاسل",
    unit: "وجبة",
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
  "bianca-garden": {
    label: "Bianca Garden",
    sub: "عربة تيراريوم",
    unit: "نبتة",
    link: "vendor-bianca-garden.html",
    tiers: [
      { qty: 10, price: 2000 },
      { qty: 20, price: 4000 },
      { qty: 35, price: 7000 },
      { qty: 50, price: 10000 },
    ],
  },
};

function formatSAR(n) {
  return Math.round(n).toLocaleString("en-US");
}

/* أقرب باقة تغطي عدد الأشخاص (أو أكبر باقة متاحة لو العدد أكبر من الكل) */
function calcNearestTier(tiers, guests) {
  var maxTier = tiers[tiers.length - 1];
  if (guests > maxTier.qty) return maxTier;
  return tiers.find(function (t) { return t.qty >= guests; }) || maxTier;
}

/* حاسبة تكلفة المناسبة (صفحة المناسبات) — اختيار عدة خدمات، وباقة حرة لكل وحدة */
function initOccasionsCalculator() {
  var guestsInput = document.getElementById("calcGuests");
  var servicesBox = document.getElementById("calcServices");
  var resultBox = document.getElementById("calcResult");
  if (!guestsInput || !servicesBox || !resultBox) return;

  /* state: { serviceKey: { checked:bool, tierQty:number, manual:bool } } */
  var state = {};
  Object.keys(CALC_SERVICES).forEach(function (key) {
    state[key] = { checked: false, tierQty: null, manual: false };
  });

  function buildServiceCards() {
    var html = "";
    Object.keys(CALC_SERVICES).forEach(function (key) {
      var s = CALC_SERVICES[key];
      html +=
        '<div class="calc-service-card" data-service="' + key + '">' +
          '<label class="calc-service-toggle">' +
            '<input type="checkbox" data-role="check" data-service="' + key + '">' +
            '<span class="calc-service-name">' + s.label + '<small>' + s.sub + '</small></span>' +
          '</label>' +
          '<div class="calc-tier-row" data-tiers="' + key + '" hidden>' +
            s.tiers.map(function (t) {
              return '<button type="button" class="calc-tier-pill" data-service="' + key + '" data-qty="' + t.qty + '">' + t.qty + ' <small>' + s.unit + '</small></button>';
            }).join("") +
          '</div>' +
        '</div>';
    });
    servicesBox.innerHTML = html;

    servicesBox.querySelectorAll('[data-role="check"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        var key = cb.dataset.service;
        state[key].checked = cb.checked;
        if (cb.checked && !state[key].tierQty) {
          var guests = parseInt(guestsInput.value, 10) || 1;
          state[key].tierQty = calcNearestTier(CALC_SERVICES[key].tiers, guests).qty;
        }
        syncCardUI(key);
        render();
      });
    });

    servicesBox.querySelectorAll(".calc-tier-pill").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.dataset.service;
        state[key].tierQty = parseInt(btn.dataset.qty, 10);
        state[key].manual = true;
        syncCardUI(key);
        render();
      });
    });
  }

  function syncCardUI(key) {
    var card = servicesBox.querySelector('.calc-service-card[data-service="' + key + '"]');
    if (!card) return;
    var tierRow = card.querySelector(".calc-tier-row");
    tierRow.hidden = !state[key].checked;
    card.classList.toggle("active", state[key].checked);
    tierRow.querySelectorAll(".calc-tier-pill").forEach(function (btn) {
      btn.classList.toggle("active", parseInt(btn.dataset.qty, 10) === state[key].tierQty);
    });
  }

  function render() {
    var guests = parseInt(guestsInput.value, 10);
    var selectedKeys = Object.keys(state).filter(function (k) { return state[k].checked; });

    if (!guests || guests < 1) {
      resultBox.innerHTML = '<p class="calc-note">أدخل عدد الأشخاص لعرض التكلفة التقريبية.</p>';
      return;
    }
    if (!selectedKeys.length) {
      resultBox.innerHTML = '<p class="calc-note">اختر خدمة واحدة على الأقل من الأعلى لعرض التكلفة التقريبية.</p>';
      return;
    }

    /* تحديث الباقات التلقائية (غير المعدّلة يدويًا) لو تغيّر عدد الأشخاص */
    selectedKeys.forEach(function (key) {
      if (!state[key].manual) {
        state[key].tierQty = calcNearestTier(CALC_SERVICES[key].tiers, guests).qty;
        syncCardUI(key);
      }
    });

    var total = 0;
    var lines = "";
    var interestParts = [];
    var anyExceeds = false;

    selectedKeys.forEach(function (key) {
      var s = CALC_SERVICES[key];
      var tier = s.tiers.find(function (t) { return t.qty === state[key].tierQty; }) || s.tiers[s.tiers.length - 1];
      total += tier.price;
      interestParts.push(s.label + " " + s.sub + " (باقة " + tier.qty + ")");
      var exceeds = guests > s.tiers[s.tiers.length - 1].qty;
      if (exceeds) anyExceeds = true;

      lines +=
        '<div class="calc-line-item">' +
          '<span>' + s.label + ' <small>— باقة ' + tier.qty + ' ' + s.unit + '</small></span>' +
          '<span class="calc-line-price">' + formatSAR(tier.price) + ' ﷼</span>' +
        "</div>";
    });

    var perPerson = total / guests;

    var html =
      '<div class="calc-lines">' + lines + "</div>" +
      '<div class="calc-summary">' +
        '<div class="calc-total">إجمالي الاختيارات — ' + formatSAR(total) + " ﷼</div>" +
        '<div class="calc-per-person">' + formatSAR(perPerson) + ' ﷼ <span>/ الشخص تقريبًا</span></div>' +
      "</div>";

    if (anyExceeds) {
      html += '<div class="calc-note">عدد الأشخاص أكبر من أكبر باقة متاحة لإحدى الخدمات المختارة — الأسعار هنا تقديرية، تواصل معنا لعرض مخصص.</div>';
    }

    html +=
      '<div class="calc-cta btn-block-wrap" style="margin-top:14px;">' +
      '<a class="btn btn-outline" href="start.html?guests=' + guests + '&interest=' + encodeURIComponent(interestParts.join("، ")) + '&perperson=' + Math.round(perPerson) + '&total=' + Math.round(total) + '">اطلب عرض سعر لهذا الاختيار</a>' +
      "</div>";

    resultBox.innerHTML = html;
  }

  buildServiceCards();
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
  var total = params.get("total");

  var guestsField = document.getElementById("guests");
  if (guests && guestsField) guestsField.value = guests;

  var detailsField = document.getElementById("details");
  if (interest && detailsField) {
    var note = "مهتم بـ: " + interest;
    if (guests) note += " — لعدد " + guests + " شخص تقريبًا";
    if (total) note += " (حسب حاسبة الموقع: إجمالي ~" + total + " ﷼";
    if (total && perPerson) note += " أي ~" + perPerson + " ﷼ للشخص)";
    else if (total) note += ")";
    detailsField.value = note;
  }
}
