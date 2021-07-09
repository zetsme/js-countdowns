const timerForm = document.getElementById('timer-form');
const titleInput = document.getElementById('title-input');
const dateTimeInput = document.getElementById('datetime-input');
const countdownsContainer = document.getElementById('countdowns-container');

const minDateTimeValue = (el) => {
  const date = new Date();
  const isoDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000 + 60000)
    .toISOString()
    .slice(0, -8);
  setAttr(el, { min: isoDateTime, value: isoDateTime });
};
const setAttr = (el, attrs) =>
  Object.keys(attrs).forEach((key) => el.setAttribute(key, attrs[key]));
minDateTimeValue(dateTimeInput);
dateTimeInput.addEventListener('click', () => minDateTimeValue(dateTimeInput));

const timerFormSubmit = (e) => {
  e.preventDefault();
  const timeDifference = new Date(dateTimeInput.value).getTime() > new Date().getTime();
  if (titleInput.value && timeDifference) {
    const countdownId = generateId();
    createCountdown(titleInput.value, dateTimeInput.value, countdownId);
    const countdownObj = {
      id: countdownId,
      title: titleInput.value,
      datetime: dateTimeInput.value,
    };
    const countdownsFromLocalStorage = checkLS('countdowns');
    countdownsFromLocalStorage.push(countdownObj);
    localStorage.setItem('countdowns', JSON.stringify(countdownsFromLocalStorage));
    titleInput.value = '';
  } else {
    alert('Write title for countdown and select time from future');
  }
};

timerForm.addEventListener('submit', timerFormSubmit);

const datetimeValues = (datetime) => {
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;
  const now = new Date().getTime();
  const countdownValue = new Date(datetime).getTime();
  const distance = countdownValue - now;

  const days = Math.floor(distance / day);
  const hours = Math.floor((distance % day) / hour);
  const minutes = Math.floor((distance % hour) / minute);
  const seconds = Math.floor((distance % minute) / second);
  return { days, hours, minutes, seconds, distance };
};

const createCountdown = (title, datetime, countdownId) => {
  const { distance, days, hours, minutes, seconds } = datetimeValues(datetime);
  const countdown = document.createElement('div');
  countdown.classList.add('countdown');
  countdown.id = `timer-${countdownId}`;
  if (distance < 0) {
    countdown.innerHTML = `<h2>${finishedCountdown(
      title,
      datetime
    )}</h2><button class='clear-btn'>❌</button>
  `;
  } else {
    countdown.innerHTML = `
      <h2>${title}</h2>
      <ul>
        <li><span>${days}</span>Days</li>
        <li><span>${hours}</span>Hours</li>
        <li><span>${minutes}</span>Minutes</li>
        <li><span>${seconds}</span>Seconds</li>
      </ul>
      <button class='clear-btn'>❌</button>
    `;
  }
  countdownsContainer.appendChild(countdown);

  const elems = countdown.querySelectorAll('span');
  const myInterval = setInterval(() => {
    const { days, hours, minutes, seconds, distance } = datetimeValues(datetime);
    if (distance < 0) {
      countdown.querySelector('ul')?.remove();
      countdown.querySelector('h2').innerHTML = finishedCountdown(title, datetime);
      clearInterval(myInterval);
    } else {
      elems[0].textContent = days;
      elems[1].textContent = hours;
      elems[2].textContent = minutes;
      elems[3].textContent = seconds;
    }
  }, 1000);
  const resetBtn = countdown.querySelector('.clear-btn');
  resetBtn.addEventListener('click', () => {
    let countdownsFromLocalStorage = checkLS('countdowns');
    const countId = Number(countdown.id.split('-')[1]);
    countdownsFromLocalStorage = countdownsFromLocalStorage.filter((item) => item.id !== countId);
    localStorage.setItem('countdowns', JSON.stringify(countdownsFromLocalStorage));
    clearInterval(myInterval);
    countdown.remove();
  });
};

const finishedCountdown = (title, datetime) => {
  return `
  Countdown - ${title} finished on <span class="complete-date">${datetime.replace(
    'T',
    ' at '
  )}</span>
`;
};

const generateId = () => {
  let nextItemId = 1;
  const list = document.querySelectorAll('.countdown');
  if (list.length > 0) {
    nextItemId = Number(list[list.length - 1].id.split('-')[1]) + 1;
  }
  return nextItemId;
};

function checkLS(itemName = []) {
  return JSON.parse(localStorage.getItem(itemName)) === null
    ? []
    : JSON.parse(localStorage.getItem(itemName));
}

const checkPreviousCountdowns = () => {
  const countdownsFromLocalStorage = checkLS('countdowns');
  countdownsFromLocalStorage.forEach((item) => {
    const { id, title, datetime } = item;
    createCountdown(title, datetime, id);
  });
};
checkPreviousCountdowns();
