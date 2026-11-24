const station = document.querySelector('#station');
const body = document.querySelector('#trains');
const status = document.querySelector('#status');
let sequence = 0;
const format = new Intl.DateTimeFormat('fi-FI', {timeZone:'Europe/Helsinki', day:'numeric', month:'numeric', hour:'2-digit', minute:'2-digit'});
async function getJSON(url) {
    const response = await fetch(url, {cache:'no-store'});
    if (!response.ok) throw new Error('Tietojen hakeminen epäonnistui.');
    return response.json();
}
async function loadTrains() {
    if (station.disabled) return;
    const id = ++sequence;
    body.replaceChildren();
    status.textContent = 'Haetaan junatietoja...';
    try {
        const trains = await getJSON('/api/trains/' + encodeURIComponent(station.value));
        if (id !== sequence) return;
        for (const train of trains) {
            const tr = body.insertRow();
            const delay = train.delay === null ? '–' : `${train.delay > 0 ? '+' : ''}${train.delay} min`;
            for (const value of [train.train, train.destination, format.format(new Date(train.scheduled)), train.time ? format.format(new Date(train.time)) : '–', delay]) {
                tr.insertCell().textContent = value;
            }
            const note = document.createElement('small');
            note.textContent = train.status;
            tr.cells[3].append(note);
            tr.cells[4].className = train.delay > 0 ? 'late' : train.delay === 0 ? 'ok' : '';
            if (train.status === 'Peruttu') tr.cells[3].className = 'cancelled';
        }
        status.textContent = trains.length ? `${trains.length} lähtöä · Päivitetty ${format.format(new Date())}` : 'Ei näytettäviä lähtöjä.';
    } catch (error) { if (id === sequence) status.textContent = error.message; }
}
async function init() {
    try {
        const stations = await getJSON('/api/stations');
        station.replaceChildren(...stations.map(s => new Option(s.name,s.code)));
        if (!stations.length) throw new Error('Asemia ei löytynyt.');
        station.value = stations.some(s => s.code === 'OL') ? 'OL' : stations[0].code;
        station.disabled = false;
        await loadTrains();
    } catch (error) { status.textContent = error.message; }
}
station.addEventListener('change', loadTrains);
document.querySelector('#refresh').addEventListener('click', () => station.disabled ? init() : loadTrains());
setInterval(loadTrains, 30000);
init();
