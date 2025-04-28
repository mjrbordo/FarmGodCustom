// Zmodyfikowany FarmGod bez grupowania farm według wiosek
// Sortowanie według odległości rosnąco
// Dodany suwak do automatycznego wysyłania farm

window.FarmGodFlat = (function (Library, Translation) {
  const lib = Library;
  const t = Translation.get();

  let curVillage = null;
  let farmBusy = false;
  let autoFarmInterval = null;
  let isAutoFarming = false;

  const init = function () {
    if (game_data.features.Premium.active && game_data.features.FarmAssistent.active) {
      if (game_data.screen == 'am_farm') {
        $('.farmGodContent').remove();

        getData().then((data) => {
          const plan = createPlanning(data);
          $('#am_widget_Farm').first().before(buildTable(plan));
          addAutoFarmControls();

          bindEventHandlers();
          UI.InitProgressBars();
          UI.updateProgressBar($('#FarmGodProgessbar'), 0, plan.length);
          $('#FarmGodProgessbar').data('current', 0).data('max', plan.length);
        });
      } else {
        location.href = game_data.link_base_pure + 'am_farm';
      }
    } else {
      UI.ErrorMessage(t.missingFeatures);
    }
  };

  const addAutoFarmControls = function() {
    const controlsHTML = `
      <div class="auto-farm-controls" style="margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="autoFarmToggle" style="margin-right: 8px;"> 
          <span>Auto wysyłaj farmy (220-340ms)</span>
        </label>
        <div id="autoFarmStatus" style="margin-top: 5px; font-size: 12px; color: #666;">Status: Nieaktywny</div>
      </div>
    `;
    $('.farmGodContent h4').after(controlsHTML);

    $('#autoFarmToggle').change(function() {
      if ($(this).is(':checked')) {
        startAutoFarming();
      } else {
        stopAutoFarming();
      }
    });
  };

  const startAutoFarming = function() {
    if (isAutoFarming) return;
    
    isAutoFarming = true;
    $('#autoFarmStatus').text('Status: Aktywny').css('color', 'green');
    
    const sendNextFarm = function() {
      if (!isAutoFarming) return;
      
      const nextFarm = $('.farmGod_icon:visible').first();
      if (nextFarm.length) {
        sendFarm(nextFarm);
      } else {
        stopAutoFarming();
        UI.SuccessMessage('Wszystkie farmy zostały wysłane!');
        return;
      }
      
      const delay = Math.floor(Math.random() * 121) + 220; // 220-340ms
      autoFarmInterval = setTimeout(sendNextFarm, delay);
    };
    
    sendNextFarm();
  };

  const stopAutoFarming = function() {
    isAutoFarming = false;
    if (autoFarmInterval) {
      clearTimeout(autoFarmInterval);
      autoFarmInterval = null;
    }
    $('#autoFarmStatus').text('Status: Nieaktywny').css('color', 'red');
    $('#autoFarmToggle').prop('checked', false);
  };

  const bindEventHandlers = function () {
    $('.farmGod_icon').off('click').on('click', function () {
      sendFarm($(this));
    });
  };

  const buildTable = function (plan) {
    let html = `<div class="vis farmGodContent"><h4>FarmGod - Flat List</h4><table class="vis" width="100%">
                <tr><div id="FarmGodProgessbar" class="progress-bar live-progress-bar progress-bar-alive" style="width:98%;margin:5px auto;"><div style="background: rgb(146, 194, 0);"></div><span class="label" style="margin-top:0px;"></span></div></tr>
                <tr><th>Origin</th><th>Target</th><th>Distance</th><th>Farm</th></tr>`;

    if (plan.length > 0) {
      plan.forEach((val, i) => {
        html += `<tr class="farmRow row_${(i % 2 == 0) ? 'a' : 'b'}">
                  <td style="text-align:center;"><a href="${game_data.link_base_pure}info_village&id=${val.origin.id}">${val.origin.name} (${val.origin.coord})</a></td>
                  <td style="text-align:center;"><a href="${game_data.link_base_pure}info_village&id=${val.target.id}">${val.target.coord}</a></td>
                  <td style="text-align:center;">${val.fields.toFixed(2)}</td>
                  <td style="text-align:center;"><a href="#" data-origin="${val.origin.id}" data-target="${val.target.id}" data-template="${val.template.id}" class="farmGod_icon farm_icon farm_icon_${val.template.name}"></a></td>
                </tr>`;
      });
    } else {
      html += `<tr><td colspan="4" style="text-align: center;">${t.table.noFarmsPlanned}</td></tr>`;
    }

    html += `</table></div>`;

    return html;
  };

  const getData = function () {
    return new Promise((resolve) => {
      // Symulowane dane
      resolve([]);
    });
  };

  const createPlanning = function (data) {
    let farms = [];

    data.forEach((entry) => {
      farms.push(entry);
    });

    farms.sort((a, b) => a.fields - b.fields);

    return farms;
  };

  const sendFarm = function ($this) {
    if (!farmBusy) {
      farmBusy = true;

      TribalWars.post(Accountmanager.send_units_link.replace(/village=(\d+)/, 'village=' + $this.data('origin')), null, {
        target: $this.data('target'),
        template_id: $this.data('template'),
        source: $this.data('origin')
      }, function (r) {
        UI.SuccessMessage(r.success);
        updateProgress();
        $this.closest('.farmRow').remove();
        farmBusy = false;
      }, function (r) {
        UI.ErrorMessage(r || t.messages.sendError);
        updateProgress();
        $this.closest('.farmRow').remove();
        farmBusy = false;
      });
    }

    function updateProgress() {
      let $pb = $('#FarmGodProgessbar');
      $pb.data('current', $pb.data('current') + 1);
      UI.updateProgressBar($pb, $pb.data('current'), $pb.data('max'));
    }
  };

  return {
    init,
    stopAutoFarming // Udostępniamy na zewnątrz na potrzeby ewentualnego ręcznego zatrzymania
  };

})(window.FarmGod.Library, window.FarmGod.Translation);

(() => {
  window.FarmGodFlat.init();
})();