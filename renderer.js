const { ipcRenderer } = require('electron');

let timer;
let seconds = 0;
let isRunning = false;

const timeDisplay = document.getElementById('timeDisplay');
const startStopBtn = document.getElementById('startStopBtn');
const resetBtn = document.getElementById('resetBtn');
const saveBtn = document.getElementById('saveBtn');
const nameInput = document.getElementById('nameInput');
const timesList = document.getElementById('timesList');

function formatTime(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  timer = setInterval(() => {
    seconds++;
    timeDisplay.textContent = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

startStopBtn.addEventListener('click', () => {
  if (isRunning) {
    stopTimer();
    startStopBtn.textContent = 'Iniciar';
    startStopBtn.classList.remove('stop'); // Remove red color
  } else {
    startTimer();
    startStopBtn.textContent = 'Parar';
    startStopBtn.classList.add('stop'); // Make it red
  }
  isRunning = !isRunning;
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  seconds = 0;
  timeDisplay.textContent = formatTime(seconds);
  startStopBtn.textContent = 'Iniciar';
  isRunning = false;
});

saveBtn.addEventListener('click', () => {
  const timeName = nameInput.value.trim();
  if (timeName) {
    const timeData = { name: timeName, time: formatTime(seconds) };
    ipcRenderer.send('save-time', timeData);
  }
});

// Listen for updated times from main process
ipcRenderer.on('load-times', (event, times) => {
  timesList.innerHTML = ''; // Clear list before updating
  
  if (times.length === 0) {
    timesList.innerHTML = "<p>Nenhum tempo salvo</p>"; // Show a placeholder instead of removing the list
  }

  times.forEach((timeData) => {
    const li = document.createElement('li');
    li.textContent = `${timeData.name}: ${timeData.time}`;
    timesList.appendChild(li);
  });

  // Ensure name input is enabled
  nameInput.disabled = false;
});


const clearTimesBtn = document.getElementById('clearTimesBtn');

clearTimesBtn.addEventListener('click', () => {
  if (confirm("Are you sure you want to clear all saved times?")) {
    ipcRenderer.send('clear-times');
    setTimeout(() => {
      nameInput.focus(); // Ensure input remains active
    }, 100); // Small delay to allow UI update
  }
});


