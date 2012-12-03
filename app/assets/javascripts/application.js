//= require jquery
//= require jquery_ujs
//= require jquery.tipTip
//= require jquery.tablesorter
//= require jquery.flot

//= require_self

Kochiku = {};

Kochiku.delayedRefresh = function() {
  setTimeout(function() {
    if ($('input#refresh').is(':checked'))
      window.location.reload();
    else
      Kochiku.delayedRefresh();
  }, 10000);
};

Kochiku.graphBuildTimes = function(projectName) {
  var url = '/projects/' + projectName + '/build-time-history.json';

  $.getJSON(url, function(data) {
    var min = data.min;
    var max = data.max + 10; // bump up the max so the graph doesn't get
                             // *really* wide at the right edge.

    $.plot($('#plot'), [
      {color: '#00802D', data: data.cucumber},
      {color: '#2D80C5', data: data.spec},
      {color: '#F8DE7E', data: data.jasmine},
      {color: '#00802D', data: data.maven}
    ], {
      lines: {
        show: true,
        fill: true
      },
      xaxis: {
        // logarithmically scale the x axis to increase resolution for more
        // recent builds
        transform: function (value) {
          return Math.log(max - min) - Math.log(max - value);
        }
      },
      yaxis: {
        min: 0,
        max: 50
      }
    });
  });
};

(function() {
  var statuses = [
    'Errored', 'Aborted', 'Failed', 'Running', 'Runnable', 'Passed'
  ];

  $.tablesorter.addParser({
    id:     'state',
    type:   'numeric',
    is:     function(s) { return statuses.indexOf(s) !== -1 },
    format: function(s) { return statuses.indexOf(s.replace(/^\s+|\s+$/g, '')); }
  });
})();
