const WebSocket = require('ws');
const express = require('express');

const app = express();

// Sukuriamas HTTP serveris
const port = 8081

const server = app.listen(port, () => {
    console.log(`Serveris paleistas. Portas ${port}`);
});

// Inicializuojamas WebSocket serveris su HTTP serveriu
const wss = new WebSocket.Server({server});

// Saugomi prisijungę klientai
const clients = new Set();

let timerLabel = 'Current time';
let timerState = 'INACTIVE';
let timerCount = 0;
let timerAudio = null;

function timeWithLeadingZeros(time) {
    return (time < 10 ? '0' : '') + time;
}

function getCounterData() {
    let hours = timeWithLeadingZeros(Math.floor(timerCount / 60 / 60));
    let minutes = timeWithLeadingZeros(Math.floor(timerCount / 60 % 60))
    let seconds = timeWithLeadingZeros(Math.floor(timerCount % 60 % 60));
    return {hours, minutes, seconds};
}

// WebSocket kliento prisijungimo įvykis
wss.on('connection', (ws) => {
    console.log('Naujas klientas prisijungė');

    // Siunčiame dabartinį laiką kas sekundę klientui
    const interval = setInterval(() => {
        let counter = '';

        if (timerCount <= 0) {
            timerState = 'INACTIVE';
        }

        if (timerState === 'ACTIVE') {
            timerCount--;
            let {hours, minutes, seconds} = getCounterData();
            counter = `0001-01-01 ${hours}:${minutes}:${seconds}`
            if (timerCount === 1) {
                const audioFile = timerAudio || '/gong-sound.mp3';
                const message = JSON.stringify({audioFile});
                ws.send(message);
            }
        } else if (timerState === 'PAUSED') {
            let {hours, minutes, seconds} = getCounterData();
            counter = `0001-01-01 ${hours}:${minutes}:${seconds}`
        } else {
            counter = Date.now();
        }

        let objectDate = new Date(counter);
        hours = timeWithLeadingZeros(objectDate.getHours());
        minutes = timeWithLeadingZeros(objectDate.getMinutes());
        seconds = timeWithLeadingZeros(objectDate.getSeconds());

        let currentTime = `${hours}:${minutes}:${seconds}`;
        const message = JSON.stringify({hours, minutes, seconds, currentTime, timerLabel});
        ws.send(message);
    }, 1000);

    // Pridedamas klientas į sąrašą
    clients.add(ws);

    // WebSocket kliento atsijungimo įvykis
    ws.on('close', () => {
        console.log('Klientas atsijungė');

        // Pašalinamas klientas iš sąrašo
        clients.delete(ws);
        clearInterval(interval); // NEZINOMA AR SALINS VISIEMS AR TIK SPECIFINIAM

    });
});

// API endpointas priimti duomenims išsiųsti visiems klientams
app.post('/broadcast/sound', express.json(), (req, res) => {
    const data = req.body;
    console.log(`Gauta žinutė: ${JSON.stringify(data)}`);

    // Siunčiama informacija visiems prisijungusiems klientams
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            const audioFile = data.url || '/gong-sound.mp3';
            timerLabel = data.timerLabel;

            const message = JSON.stringify({audioFile});
            client.send(message);
        }
    });

    res.sendStatus(200);
});

// API endpointas priimti duomenims išsiųsti visiems klientams
app.post('/broadcast/time-label', express.json(), (req, res) => {
    const data = req.body;
    console.log(`Gauta žinutė: ${JSON.stringify(data)}`);

    // Siunčiama informacija visiems prisijungusiems klientams
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            timerLabel = data.timerLabel;
            const message = JSON.stringify({timerLabel});
            client.send(message);
        }
    });

    res.sendStatus(200);
});

// API endpointas priimti duomenims išsiųsti visiems klientams
app.post('/broadcast/set-timer', express.json(), (req, res) => {
    const data = req.body;
    console.log(`Gauta žinutė: ${JSON.stringify(data)}`);

    // Siunčiama informacija visiems prisijungusiems klientams
    clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            timerCount = data.seconds;
            timerState = 'ACTIVE';
            timerLabel = data.timerLabel;
            timerAudio = data.timerAudio;
            const message = JSON.stringify({timerCount, timerState, timerLabel, timerAudio});
            client.send(message);
        }
    });

    res.sendStatus(200);
});
