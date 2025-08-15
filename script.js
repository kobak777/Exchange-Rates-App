const firstSelect = document.querySelector("[data-first-select]");
const secondSelect = document.querySelector("[data-second-select]");
const swapBtn = document.querySelector("[data-swap-btn]");
const comparisonInfo = document.querySelector("[data-comparison-info]");
const firstInput = document.querySelector("[data-first-input]");
const secondInput = document.querySelector("[data-second-input]");

const BASE_URL = "https://open.er-api.com/v6/latest";
const FIRST_DEFAULT_CURRENCY = "USD";
const SECOND_DEFAULT_CURRENCY = "RUB";
const REFRESH_INTERVAL = 5 * 60 * 1000;

let rates = {};

const sanitizeInput = (input) => {
  let val = input.value.replace(/[^0-9.]/g, "");
  const parts = val.split(".");
  if (parts.length > 2) {
    val = parts[0] + "." + parts.slice(1).join("");
  }
  input.value = val;
};

const roundFiveDigits = (num) => Number(num.toFixed(5));

const convert = (amount, fromCurrency, toCurrency) => {
  if (!amount) return "";
  return roundFiveDigits((amount * rates[toCurrency]) / rates[fromCurrency]);
};

const updateSecondInput = () => {
  secondInput.value = convert(
    Number(firstInput.value),
    firstSelect.value,
    secondSelect.value
  );
};
const updateFirstInput = () => {
  firstInput.value = convert(
    Number(secondInput.value),
    secondSelect.value,
    firstSelect.value
  );
};

const renderInfo = () => {
  if (!rates[firstSelect.value] || !rates[secondSelect.value]) return;
  comparisonInfo.textContent = `1 ${firstSelect.value} = ${convert(
    1,
    firstSelect.value,
    secondSelect.value
  )} ${secondSelect.value}`;
  if (!firstInput.value) firstInput.value = 1;
  updateSecondInput();
};

firstSelect.addEventListener("change", renderInfo);
secondSelect.addEventListener("change", renderInfo);

firstInput.addEventListener("input", () => {
  sanitizeInput(firstInput);
  updateSecondInput();
});

secondInput.addEventListener("input", () => {
  sanitizeInput(secondInput);
  updateFirstInput();
});

swapBtn.addEventListener("click", () => {
  [firstSelect.value, secondSelect.value] = [
    secondSelect.value,
    firstSelect.value,
  ];
  renderInfo();
  firstInput.focus();
});

const getRates = async (base = FIRST_DEFAULT_CURRENCY) => {
  try {
    const response = await fetch(`${BASE_URL}/${base}`);
    const data = await response.json();
    rates = data.rates;
    renderInfo();
  } catch (error) {
    console.error("Ошибка при получении курсов:", error);
    comparisonInfo.textContent = "Ошибка загрузки курсов";
  }
};

const populateSelects = () => {
  const currencies = Object.keys(rates);
  firstSelect.innerHTML = currencies
    .map(
      (c) =>
        `<option value="${c}" ${
          c === FIRST_DEFAULT_CURRENCY ? "selected" : ""
        }>${c}</option>`
    )
    .join("");
  secondSelect.innerHTML = currencies
    .map(
      (c) =>
        `<option value="${c}" ${
          c === SECOND_DEFAULT_CURRENCY ? "selected" : ""
        }>${c}</option>`
    )
    .join("");
};

const init = async () => {
  await getRates();
  populateSelects();
  renderInfo();
  setInterval(getRates, REFRESH_INTERVAL);
};

init();
