
// Wersja zmodyfikowana: Fejkomat z planowaniem rozkazów w tabeli, bez wypełniania wojska do limitu punktowego
(function() {
    if (!window.game_data || game_data.screen !== 'place') {
        alert('Skrypt działa tylko na ekranie placu.');
        return;
    }

    async function getVillageTemplates() {
        // Pobierz szablony z DOM (HTML placu)
        const templates = {};
        document.querySelectorAll('#unit_template_select option').forEach(opt => {
            if (opt.value) templates[opt.textContent] = opt.value;
        });
        return templates;
    }

    function calculateDistance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1).toFixed(2);
    }

    async function buildUI() {
        const templates = await getVillageTemplates();

        const popup = document.createElement('div');
        popup.innerHTML = `
            <div id="fejkomat-ui" style="background:#f4e4bc;padding:15px;border:2px solid #a1732d;width:400px;">
                <h3>Fejkomat - Generator Rozkazów</h3>
                <label>Grupa wiosek:
                    <select id="village-group-select"></select>
                </label><br/><br/>
                <label>Szablon 1:
                    <select id="template1">${Object.keys(templates).map(t => `<option value="${templates[t]}">${t}</option>`)}</select>
                </label><br/>
                <label>Szablon 2:
                    <select id="template2">${Object.keys(templates).map(t => `<option value="${templates[t]}">${t}</option>`)}</select>
                </label><br/>
                <label>Szablon 3:
                    <select id="template3">${Object.keys(templates).map(t => `<option value="${templates[t]}">${t}</option>`)}</select>
                </label><br/>
                <label>Interwał czasowy (minuty): <input id="interval-minutes" type="number" value="10" min="1" /></label><br/>
                <label>Zakres godzin dojścia:<br/>
                    od <input id="from-hour" type="time" value="00:00"/> do <input id="to-hour" type="time" value="23:59"/></label><br/><br/>
                <button id="generate-orders">Generuj tabelę rozkazów</button>
            </div>
        `;
        document.body.appendChild(popup);

        // Załaduj grupy
        const select = document.getElementById('village-group-select');
        const response = await fetch('/groups', { headers: { 'x-requested-with': 'XMLHttpRequest' } });
        const data = await response.json();
        data.result.forEach(g => {
            if (g.group_id) {
                const o = document.createElement('option');
                o.value = g.group_id;
                o.textContent = g.name;
                select.appendChild(o);
            }
        });

        document.getElementById('generate-orders').addEventListener('click', () => generateOrderTable({
            templates,
            interval: parseInt(document.getElementById('interval-minutes').value, 10) || 10,
            hours: [document.getElementById('from-hour').value, document.getElementById('to-hour').value],
            selectedGroup: select.value
        }));
    }

    function generateOrderTable({ templates, interval, hours, selectedGroup }) {
        // Tu logika generowania tabeli na podstawie danych
        // Na potrzeby przykładu:
        const coordsFrom = game_data.village.coord;
        const x1 = parseInt(coordsFrom.split('|')[0]);
        const y1 = parseInt(coordsFrom.split('|')[1]);
        const barbarianTargets = ["500|500", "501|501", "502|502"];
        let lastArrival = {};

        let html = `<table class="vis" style="width:100%;margin-top:15px;"><thead>
                    <tr><th>Wioska</th><th>Cel</th><th>Dystans</th><th>Akcja</th></tr>
                    </thead><tbody>`;
        for (let target of barbarianTargets) {
            const [x2, y2] = target.split('|').map(n => parseInt(n));
            const distance = calculateDistance(x1, y1, x2, y2);
            const now = new Date();
            const arrival = new Date(now.getTime() + distance * 60 * 1000);
            const [fromH, toH] = hours.map(h => parseInt(h.split(':')[0]));
            if (arrival.getHours() >= fromH && arrival.getHours() <= toH) {
                const tKey = target;
                if (!lastArrival[tKey] || (arrival.getTime() - lastArrival[tKey] > interval * 60000)) {
                    lastArrival[tKey] = arrival.getTime();
                    html += `<tr><td>${coordsFrom}</td><td>${target}</td><td>${distance}</td>
                             <td><button onclick="alert('Wyślij rozkaz do ${target}')">Wyślij</button></td></tr>`;
                }
            }
        }
        html += '</tbody></table>';
        const container = document.createElement('div');
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    buildUI();
})();
