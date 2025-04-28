
// ==UserScript==
// @name         FarmGod Modified
// @version      1.1
// @description  FarmGod - sortowanie po odległości + automatyczne farmienie z kontrolą przyciskiem
// ==/UserScript==

(function() {
    'use strict';

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

    // Upewnij się, że załadujesz przycisk i funkcję autoFarm po wygenerowaniu tabeli
    const originalBuildTable = window.FarmGod.Main.buildTable;
    window.FarmGod.Main.buildTable = function(plan) {
        const html = originalBuildTable(plan);
        setTimeout(insertAutoFarmButton, 100);
        return html;
    };
})();
