
// ==UserScript==
// @name         FarmGod Modified Full
// @version      1.1
// @description  FarmGod - sortowanie po odległości + AutoFarm ON/OFF
// ==/UserScript==

(function() {
    'use strict';

    window.FarmGod = {};
    window.FarmGod.Library = (function () {
        const getDistance = function (origin, target) {
            let a = origin.toCoord(true).x - target.toCoord(true).x;
            let b = origin.toCoord(true).y - target.toCoord(true).y;
            return Math.hypot(a, b);
        };

        String.prototype.toCoord = function (objectified) {
            let c = (this.match(/\d{1,3}\|\d{1,3}/g) || [false]).pop();
            return (c && objectified) ? { x: c.split('|')[0], y: c.split('|')[1] } : c
        };

        return { getDistance };
    })();

    window.FarmGod.Main = (function (Library) {
        const lib = Library;
        let plan = [];

        const createPlanning = function (villages, targets) {
            plan = [];

            villages.forEach(origin => {
                targets.forEach(target => {
                    const fields = lib.getDistance(origin.coord, target.coord);
                    plan.push({
                        origin: origin,
                        target: target,
                        fields: fields
                    });
                });
            });

            plan.sort((a, b) => a.fields - b.fields);
            buildTable(plan);
        };

        const buildTable = function (plan) {
            let html = `<div class="farmGodContent"><table class="vis" width="100%">
                        <tr><th>Origin</th><th>Target</th><th>Distance</th><th>Action</th></tr>`;

            plan.forEach((row, i) => {
                html += `<tr class="row_${(i % 2 == 0) ? 'a' : 'b'}">
                        <td>${row.origin.coord}</td>
                        <td>${row.target.coord}</td>
                        <td>${row.fields.toFixed(2)}</td>
                        <td><a href="#" class="farmGod_icon" data-origin="${row.origin.coord}" data-target="${row.target.coord}">Attack</a></td>
                        </tr>`;
            });

            html += `</table></div>`;
            $('body').append(html);
            insertAutoFarmButton();
        };

        return { createPlanning };
    })(window.FarmGod.Library);

    // === AUTO FARM BUTTON ===
    window.FarmGodAutoFarmEnabled = false;

    const autoFarm = () => {
        if (!window.FarmGodAutoFarmEnabled) return;

        let buttons = $('.farmGod_icon').toArray();
        let delay = 0;

        buttons.forEach((button, index) => {
            delay += Math.floor(Math.random() * (360 - 220 + 1)) + 220;
            setTimeout(() => {
                if ($(button).is(':visible')) {
                    $(button).trigger('click');
                }
            }, delay);
        });
    };

    const toggleAutoFarm = () => {
        window.FarmGodAutoFarmEnabled = !window.FarmGodAutoFarmEnabled;
        $('#FarmGodAutoFarmButton').text(window.FarmGodAutoFarmEnabled ? 'AutoFarm: ON' : 'AutoFarm: OFF');

        if (window.FarmGodAutoFarmEnabled) {
            autoFarm();
        }
    };

    const insertAutoFarmButton = () => {
        if ($('#FarmGodAutoFarmButton').length === 0) {
            $('<button id="FarmGodAutoFarmButton" class="btn" style="margin: 10px;">AutoFarm: OFF</button>')
                .insertBefore('.farmGodContent')
                .on('click', toggleAutoFarm);
        }
    };

    // --- TEST: uruchamiam planowanie na przykładowych danych ---
    const mockVillages = [
        { coord: "500|500" },
        { coord: "510|510" }
    ];
    const mockTargets = [
        { coord: "505|505" },
        { coord: "520|520" }
    ];
    window.FarmGod.Main.createPlanning(mockVillages, mockTargets);
})();
