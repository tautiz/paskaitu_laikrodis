document.addEventListener('DOMContentLoaded', () => {

    const socket = new WebSocket('ws://localhost:8081');

// WebSocket įvykis - gavimas žinutės iš serverio
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
console.log(data);
        document.getElementById('hours').innerText = data.hours || '';
        document.getElementById('minutes').innerText = data.minutes || '';
        document.getElementById('seconds').innerText = data.seconds || '';

        if (data.timerLabel) {
            timerLabel.innerText = data.timerLabel;
            timerLabel.classList.add('active');
        } else {
            timerLabel.innerText = '';
            timerLabel.classList.remove('active');
        }

        // Patikriname, ar žinutėje yra 'audioFile' parametras su garso failo nuoroda
        if (data.audioFile) {
            // Sukuriame audio elementą
            const audio = new Audio(data.audioFile);

            // Grojame garso failą
            audio.volume = 0.1;
            audio.play();
        }
    };
});