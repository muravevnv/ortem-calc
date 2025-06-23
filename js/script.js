document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    var tab = btn.getAttribute("data-tab");
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => (c.style.display = "none"));
    document.getElementById(tab).style.display = "block";
  });
});

// Конфигурация аппаратов
const apparatusInfo = {
  clearcorrect: {
    comment: "Элайнеры (прозрачные капы)",
    type: "aligners",
  },
  damon_clear: {
    comment: "Керамические, США",
    type: "brackets",
  },
  damon_combo: {
    comment: "Комбинированные, США",
    type: "brackets",
  },
  damon_q2: {
    comment: "Металлические, США",
    type: "brackets",
  },
  protect: {
    comment: "Металлические, КНР",
    type: "brackets",
  },
};

// Максимальная рассрочка по срокам
const maxInstallmentByDuration = {
  0.5: 6,
  1: 12,
  1.5: 16,
  2: 22,
  2.5: 22,
};

// Варианты рассрочки
const installmentOptions = [
  { value: "0", label: "Оплата сразу" },
  { value: "6", label: "6 месяцев" },
  { value: "12", label: "12 месяцев" },
  { value: "16", label: "16 месяцев" },
  { value: "22", label: "22 месяца" },
];

// Обновление видимости вариантов сроков лечения
function updateDurationVisibility() {
  const apparatus = document.getElementById("system").value;
  if (!apparatus || !apparatusInfo[apparatus]) return;

  const type = apparatusInfo[apparatus].type;
  const allRadios = document.querySelectorAll("#duration-radios [data-type]");

  allRadios.forEach((radio) => {
    if (radio.dataset.type === type) {
      radio.style.display = "";
    } else {
      radio.style.display = "none";
    }
  });

  // Выбираем первый доступный вариант
  const firstVisibleRadio = document.querySelector(
    `#duration-radios [data-type="${type}"] input`
  );
  if (firstVisibleRadio) {
    firstVisibleRadio.checked = true;
  }
}

// Обновление вариантов рассрочки
function updateInstallmentOptions() {
  const duration = document.querySelector(
    'input[name="id_years"]:checked'
  )?.value;
  const installmentSelect = document.getElementById("installment");

  if (!duration) return;

  const maxInst = maxInstallmentByDuration[duration] || 0;
  const prevValue = installmentSelect.value;

  installmentSelect.innerHTML =
    '<option value="">Длительность рассрочки</option>';

  installmentOptions.forEach((option) => {
    if (option.value === "0" || parseInt(option.value) <= maxInst) {
      installmentSelect.insertAdjacentHTML(
        "beforeend",
        `<option value="${option.value}">${option.label}</option>`
      );
    }
  });

  if (
    prevValue &&
    [...installmentSelect.options].some((opt) => opt.value === prevValue)
  ) {
    installmentSelect.value = prevValue;
  }
}

// Форматирование суммы в рублях
function formatRub(n) {
  return n.toLocaleString("ru-RU") + " ₽";
}

// Основная функция расчета
function calculate(forceShow = false) {
  const apparatus = document.getElementById("system").value;
  const duration = document.querySelector(
    'input[name="id_years"]:checked'
  )?.value;
  const miniscrews =
    document.querySelector('input[name="id_minivints"]:checked')?.value || 0;
  const surgery = document.getElementById("id_need_orthodontics").checked
    ? "yes"
    : "no";
  const installment = document.getElementById("installment").value;
  const noCTPG = document.getElementById("id_without_prosthetics").checked;

  const resultBlock = document.getElementById("resultBlock");
  const resultDiv = document.getElementById("result");

  const saveBtn = document.querySelector("#saveBtn");

  // Проверка заполненности
  if (!apparatus || !duration || !installment) {
    if (!forceShow) {
      resultBlock.classList.add("hidden");
      resultDiv.innerHTML = "";
      saveBtn.disabled = true;
    }
    return;
  }

  resultBlock.classList.remove("hidden");

  // Расчет стоимости
  const miniscrewsNum = parseInt(miniscrews, 10);
  const installmentNum = parseInt(installment, 10);
  const apparatusType = apparatusInfo[apparatus]?.type;

  let avans = apparatus === "protect" ? 78000 : 98000;
  let apparatusInstall = 0;

  if (apparatusType === "brackets") {
    switch (apparatus) {
      case "protect":
        apparatusInstall = 42000;
        break;
      case "damon_q2":
        apparatusInstall = 58000;
        break;
      case "damon_combo":
        apparatusInstall = 78000;
        break;
      case "damon_clear":
        apparatusInstall = 114000;
        break;
    }
  }

  let durationCost = 0,
    durationCTPG = 0;

  if (apparatusType === "brackets") {
    switch (duration) {
      case "1":
        durationCost = 140400;
        durationCTPG = 28400;
        break;
      case "1.5":
        durationCost = 187200;
        durationCTPG = 42600;
        break;
      case "2":
        durationCost = 234400;
        durationCTPG = 56800;
        break;
      case "2.5":
        durationCost = 234400;
        durationCTPG = 56800;
        break;
    }
  } else {
    switch (duration) {
      case "0.5":
        durationCost = 157000;
        break;
      case "1":
        durationCost = 252000;
        break;
      case "1.5":
        durationCost = 308000;
        break;
      case "2":
        durationCost = 358000;
        break;
      case "2.5":
        durationCost = 358000;
        break;
    }
  }

  const miniscrewsCost = miniscrewsNum * 12000;
  const ctpgCost = apparatusType === "brackets" ? durationCTPG : 0;
  const removalCost = apparatusType === "brackets" ? 38800 : 30800;

  let total = 0;
  let totalForInstallment = 0;
  let payExtraCTPG = 0;

  if (apparatusType === "brackets") {
    total =
      avans +
      apparatusInstall +
      durationCost +
      miniscrewsCost +
      ctpgCost +
      removalCost;
    totalForInstallment = noCTPG
      ? apparatusInstall + durationCost + miniscrewsCost + removalCost
      : apparatusInstall +
        durationCost +
        miniscrewsCost +
        ctpgCost +
        removalCost;
    payExtraCTPG = noCTPG ? ctpgCost : 0;
  } else {
    total = avans + durationCost + miniscrewsCost + removalCost;
    totalForInstallment = durationCost + miniscrewsCost + removalCost;
  }

  // Формирование результата
  let html = "";

  if (installmentNum === 0) {
    html += `
      <div class="ortem-calc-total__payment">
        Единовременная оплата
        <span>${formatRub(total)}</span>
      </div>
    `;

    if (!noCTPG) {
      html += `<div class="ortem-calc-total__bonus">КТ и Проф гигиены в течение всего лечения в подарок!</div>`;
    }
  } else {
    const monthly = Math.round(totalForInstallment / installmentNum);

    html += `
      <div class="ortem-calc-total__payment">
        Платёж в месяц
        <span>${formatRub(monthly)}</span>
      </div>
      <div class="ortem-calc-total__services">
        <div class="ortem-calc-total__service">
          <b>Длительность рассрочки</b>
          <span>${installmentNum} месяцев</span>
        </div>
    `;

    if (apparatusType === "brackets" && noCTPG && payExtraCTPG > 0) {
      html += `
        <div class="ortem-calc-total__service">
          <b>КТ и профгигиены за курс</b>
          <span>${formatRub(payExtraCTPG)}</span>
        </div>
      `;
    }

    html += `
        <div class="ortem-calc-total__service">
          <b>Оплата за установку</b>
          <span>${formatRub(avans)}</span>
        </div>
      </div>
    `;
  }

  html += `
    <div class="ortem-calc-total__services">
      <div class="ortem-calc-total__service">
        <b>Полная стоимость до результата</b>
        <span>${formatRub(total)}</span>
      </div>
    </div>
    <div class="ortem-calc-total__desc">
      <h3>В стоимость включены:</h3>
      <ul>
        <li>Система: ${apparatusInfo[apparatus].comment}</li>
        <li>Установка системы</li>
        <li>Все плановые и внеплановые приемы ортодонта</li>
        ${miniscrewsNum > 0 ? "<li>Минивинты, включая установку</li>" : ""}
        <li>Снятие ${
          apparatusType === "brackets" ? "брекет-системы" : "элайнеров"
        } и установка ретейнеров</li>
        <li>Ретенционная капа</li>
        ${
          !noCTPG
            ? "<li>Профессиональная гигиена в процессе и после завершения ортодонтии</li>"
            : ""
        }
      </ul>
  `;

  if (surgery === "yes") {
    html += `
      <p>
        <b>Подготовка к ортогнатии</b>
        и стабилизация прикуса после её проведения входят в стоимость.
      </p>
    `;
  }

  html += `
    </div>
    <div class="ortem-calc-total__tip">
      <span>Хотите узнать подробнее?</span>
      Онлайн-консультация с ортодонтом Orteam сэкономит вам деньги и время. Ответим на любые вопросы по видеосвязи за 30 минут — бесплатно!
    </div>
    <button type="button" class="ortem-calc-total__btn">Записаться на онлайн-консультацию</button>
  `;

  document.querySelector("#saveBtn").disabled = false;

  resultDiv.innerHTML = html;
}

// Инициализация
document.addEventListener("DOMContentLoaded", function () {
  // Обработчики событий
  document.getElementById("system").addEventListener("change", function () {
    updateDurationVisibility();
    updateInstallmentOptions();
    calculate();
  });

  document.addEventListener("change", function (e) {
    if (e.target.name === "id_years") {
      updateInstallmentOptions();
      calculate();
    }

    if (
      e.target.name === "id_minivints" ||
      e.target.id === "id_need_orthodontics" ||
      e.target.id === "id_without_prosthetics" ||
      e.target.id === "installment"
    ) {
      calculate();
    }
  });

  document.getElementById("calcBtn").addEventListener("click", function () {
    calculate(true);
  });

  document.getElementById("saveBtn").addEventListener("click", function () {
    calculate(true);
    // Здесь можно добавить логику фиксации цены
  });

  // Первоначальная инициализация
  updateDurationVisibility();
  updateInstallmentOptions();
  calculate();
});


const tooltipBlocks = document.querySelectorAll('.ortem-calc-form__tooltip');

tooltipBlocks.forEach(block => {
  const item = block.querySelector('.ortem-calc-form__tooltip-item');
  const popup = block.querySelector('.ortem-calc-form__tooltip-popup');

  item.addEventListener('click', () => {
    popup.classList.toggle('is-open');
  });
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.ortem-calc-form__tooltip')) {
    tooltipBlocks.forEach(block => {
      const popup = block.querySelector('.ortem-calc-form__tooltip-popup');
      popup.classList.remove('is-open');
    });
  }
})