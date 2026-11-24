# junaprojekti
Asenna Python 3.10 tai uudempi. Avaa terminaali projektikansiossa.

    python -m venv .venv

Windows: `.venv\Scripts\activate` (PowerShell: `.venv\Scripts\Activate.ps1`)
Linux/macOS: `source .venv/bin/activate`

    python -m pip install -r requirements.txt
    python app.py

Avaa http://127.0.0.1:5000 selaimessa. Internet-yhteys tarvitaan.
Flask tarjoaa HTML-sivun ja kaksi JSON-rajapintaa. Python requests hakee tiedot HTTP GET -pyynnoilla. JavaScript paivittaa taulukon. Viive lasketaan toteutuneesta tai arvioidusta ajasta; puuttuva tieto naytetaan viivana. Negatiivinen luku tarkoittaa etuajassa olevaa lahtoa. Oulu on oletusasema. Mukana viimeksi lahteneita ja tulevia matkustajajunia.
Dokumentaatio: https://rata.digitraffic.fi/swagger/
Data: Fintraffic / Digitraffic, CC BY 4.0.
