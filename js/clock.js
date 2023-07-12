// Clock
let clockInterval;
const clock = document.getElementById("clock");
const elemHours = document.getElementById("hours");
const elemMinutes = document.getElementById("minutes");
const elemSeconds = document.getElementById("seconds");
// Counters
const timers = document.querySelectorAll('#timers .btn');
let timerLabel = document.getElementById('timer-label');
let soundButton = document.querySelector('#sound .btn');
let activeTimer; // for setInterval
var countdown; // Seconds left - global variable to set timer amount to (is updated every second when timer is active)

let tabindex = 1; // Util: assign tab indexes to every clickable element

function currentTime() {
    var date = new Date(); /* creating object of Date class */
    var hour = date.getHours();
    var min = date.getMinutes();
    var sec = date.getSeconds();
    hour = padTime(hour);
    min = padTime(min);
    sec = padTime(sec);
    elemHours.innerText = hour; /* adding time to the div */
    elemMinutes.innerText = min;
    elemSeconds.innerText = sec;
}

// Pads with zero in front of the number. Takes number, returns string|number.
function padTime(k) {
    if (k < 10) {
        return "0" + k;
    } else {
        return k;
    }
}

function startClock() {
    clearInterval(activeTimer);
    timerLabel.classList.remove('active');
    clock.classList.remove('finished');
    currentTime();
    clockInterval = setInterval(currentTime, 1000); /* setting timer */
    elemSeconds.style.display = 'block';
    elemSeconds.previousElementSibling.style.display = 'block';
}

function stopClock() {
    clearInterval(clockInterval);
}

// startClock(); /* calling currentTime() function to initiate the process */

// function checkFlagStatus() {
//     // Get flag value from flag.json file
//     let flagFile = fetch('/flag.json', {cache: "no-store"})
//         .then(response => response.json())
//         .then(data => {
//             let flag = data.flag;
//
//             if (flag === true) {
//                 clearInterval(hasToPlaySound);
//                 flag = 0;
//             }
//         });
// }
//
// hasToPlaySound = setInterval(checkFlagStatus, 1000); /* setting timer */


// Fullscreen
/* Get the documentElement (<html>) to display the page in fullscreen */
var doc = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
    if (doc.requestFullscreen) {
        doc.requestFullscreen();
    } else if (doc.webkitRequestFullscreen) { /* Safari */
        doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) { /* IE11 */
        doc.msRequestFullscreen();
    }
}

/* Close fullscreen */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
}

function toggleFullscreen() {
    if (document.fullscreenElement === null) {
        openFullscreen();
    } else {
        closeFullscreen();
    }
}

// Go Fullscreen on click
clock.addEventListener('click', toggleFullscreen);


// Play sound on timer stop
const gongSound = document.getElementById("sound-stop");

function playAudio() {
    gongSound.play();
}

// Edit timerLabel
timerLabel.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === "Escape") {
        e.preventDefault();
        window.getSelection().removeAllRanges();
        timerLabel.blur();
    }
});
timerLabel.addEventListener('focus', e => {
    selectText(timerLabel);
});

// Counters
// Assign each timer a click listener that initiates timer
for (let index = 0; index < timers.length; index++) {
    const timer = timers[index];
    const countMinutes = timer.dataset.count * 60;

    setTabindex(timer);

    timer.addEventListener('click', e => {
        timerButtonAction(index, countMinutes);
    });
    timer.addEventListener('keypress', e => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            timerButtonAction(index, countMinutes);
        }
    });
}

function timerButtonAction(index, countMinutes) {
    activateSettingsButton(index, timers);

    if (countMinutes === 0) {
        startClock();
    } else if (countMinutes > 0) {
        timerLabel.classList.add('active');
        stopClock();
        startTimer(countMinutes);
    }
}

function startTimer(countMinutes) {
    countdown = countMinutes;
    stopClock();
    clearInterval(activeTimer);
    clock.classList.remove('finished');
    updateTimer();
    activeTimer = setInterval(updateTimer, 1000);
}

// Function that counts timers backwards
function updateTimer() {
    let minutes = Math.floor(countdown / 60);
    let seconds = countdown % 60;

    elemHours.innerText = padTime(minutes); /* adding time to the div */
    elemMinutes.innerText = padTime(seconds);
    elemSeconds.style.display = 'none';
    elemSeconds.previousElementSibling.style.display = 'none';
    countdown--;

    clearInterval(clockInterval); // Try to remove the clock timer as it sometimes ugs out and flashes on its update.

    // When timer finishes countdown to 0
    if (countdown < 0) {
        console.log("Countdown complete!");
        clearInterval(activeTimer);
        clock.classList.add('finished');
        playAudio();
    }
}

// Custom Labels
let labels = document.getElementById('labels').children;

for (let index = 0; index < labels.length; index++) {
    const label = labels[index];

    setTabindex(label);

    label.addEventListener('click', e => {
        labelButtonAction(index, label);
    });
    label.addEventListener('keypress', e => {
        if (e.key === "Enter" || e.key === " ") {
            labelButtonAction(index, label);
        }
    });
}

function labelButtonAction(index, label) {
    activateSettingsButton(index, labels);
    timerLabel.innerText = label.innerText;
}

// Utilities
function activateSettingsButton(index, group) {
    for (let index = 0; index < group.length; index++) {
        const button = group[index];
        button.classList.remove('active');
    }
    group[index].classList.add('active');
}

function setTabindex(element) {
    element.setAttribute('tabindex', 0); //tabindex
    // tabindex++;
}

function selectText(elem) {
    if (document.selection) { // IE
        var range = document.body.createTextRange();
        range.moveToElementText(elem);
        range.select();
    } else if (window.getSelection) {
        var range = document.createRange();
        range.selectNode(elem);
        window.getSelection().removeAllRanges();
        // window.getSelection().addRange(range);
        window.getSelection().selectAllChildren(elem);
    }
}

setTabindex(clock); // Make clock Tab-focusable last (Shift+Tab at the beginning will focus)

let customTimeSet = document.getElementById('custom');
customTimeSet.addEventListener('click', e => {
    e.target.textContent = "";
});
customTimeSet.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            timerLabel.focus();
            timerButtonAction(5, e.target.textContent * 60);
        }
    });
customTimeSet.addEventListener('blur', e => {
    timerButtonAction(5, e.target.textContent * 60);
});

soundButton.addEventListener('click', e => {
    if (soundButton.classList.contains('active')) {
        soundButton.classList.remove('active');
        soundButton.textContent = "Sound Off";
        gongSound.muted = true;
    } else {
        soundButton.classList.add('active');
        soundButton.textContent = "Sound On";
        gongSound.muted = false;
    }
});
