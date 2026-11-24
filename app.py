from flask import Flask, render_template, jsonify
import requests
from functools import lru_cache
from datetime import datetime
import re

app = Flask(__name__)
BASE = 'https://rata.digitraffic.fi/api/v1'

def get_data(path, params=None):
    response = requests.get(BASE + path, params=params, timeout=15,
                            headers={'Digitraffic-User': 'Junaseuranta-opiskeluprojekti'})
    response.raise_for_status()
    return response.json()

@lru_cache(maxsize=1)
def stations():
    return get_data('/metadata/stations')

@app.get('/')
def index():
    return render_template('index.html')

@app.get('/api/stations')
def station_list():
    return jsonify(sorted([{'code': s['stationShortCode'], 'name': s['stationName']}
                           for s in stations() if s.get('passengerTraffic')], key=lambda s: s['name']))

def departures(trains, code, names):
    result = []
    for train in trains:
        rows = train.get('timeTableRows', [])
        for i, row in enumerate(rows):
            if row['stationShortCode'] != code or row['type'] != 'DEPARTURE' or not row.get('commercialStop'):
                continue
            destinations = [r for r in rows[i+1:] if r['type'] == 'ARRIVAL' and r.get('commercialStop')]
            if not destinations:
                continue
            destination = destinations[-1]['stationShortCode']
            scheduled = row['scheduledTime']
            actual = row.get('actualTime')
            estimate = row.get('liveEstimateTime')
            cancelled = train.get('cancelled', False) or row.get('cancelled', False)
            time = actual or estimate
            delay = round((datetime.fromisoformat(time.replace('Z', '+00:00')) - datetime.fromisoformat(scheduled.replace('Z', '+00:00'))).total_seconds()/60) if time and not cancelled else None
            result.append({'train': f"{train['trainType']} {train['trainNumber']}", 'destination': names.get(destination, destination), 'scheduled': scheduled, 'time': None if cancelled else time, 'delay': delay, 'status': 'Peruttu' if cancelled else 'Toteutunut' if actual else 'Arvio' if estimate else 'Ei arviota'})
    return sorted(result, key=lambda r: r['scheduled'])

@app.get('/api/trains/<code>')
def trains(code):
    if not re.fullmatch(r'[A-Z0-9]{1,10}', code):
        return jsonify(error='Virheellinen asematunnus'), 400
    names = {s['stationShortCode']: s['stationName'] for s in stations()}
    if code not in names:
        return jsonify(error='Tuntematon asema!'), 404
    data = get_data('/live-trains/station/' + code, {
        'arrived_trains': 0, 'arriving_trains': 0, 'departed_trains': 5,
        'departing_trains': 30, 'include_nonstopping': 'false',
        'train_categories': 'Commuter,Long-distance'})
    return jsonify(departures(data, code, names))

@app.errorhandler(requests.exceptions.RequestException)
def api_error(error):
    return jsonify(error='Digitraffic-yhteys epäonnistui. Yritä uudelleen!'), 502

if __name__ == '__main__':
    app.run(port=5000)
