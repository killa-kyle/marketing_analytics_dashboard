gapi.analytics.ready(function() {

  /**
   * Authorize the user immediately if the user has already granted access.
   * If no access has been created, render an authorize button inside the
   * element with the ID "embed-api-auth-container".
   */
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: '476592068856-ki5v355o2t1pthp0h73s6bgddm3v0i80.apps.googleusercontent.com'
  });


  /**
   * Create a new ActiveUsers instance to be rendered inside of an
   * element with the id "active-users-container" and poll for changes every
   * five seconds.
   */
  var activeUsers = new gapi.analytics.ext.ActiveUsers({
    container: 'active-users-container',
    pollingInterval: 5
  });


  /**
   * Add CSS animation to visually show the when users come and go.
   */
  activeUsers.once('success', function() {
    var element = this.container.firstChild;
    var timeout;

    this.on('change', function(data) {
      var element = this.container.firstChild;
      var animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing';
      element.className += (' ' + animationClass);

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        element.className =
            element.className.replace(/ is-(increasing|decreasing)/g, '');
      }, 3000);
    });
  });


  /**
   * Create a new ViewSelector2 instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container',
  })
  .execute();



/**
*  GET ACTIVE PAGES
*/

function getTopActivePages(data){
  gapi.client.analytics.data.realtime
      .get({
        ids: data.ids,
        metrics: 'rt:activeUsers',
        dimensions: 'rt:pageTitle,rt:pagePath,rt:latitude,rt:longitude,rt:region,rt:country',
        // 'max-results': 8,      
      })
      .then(function(response) {         
         var results = response.result.rows;         
         ACTIVE_USERS_MAP.init(results);

         $('.active-pages').html('');

         for (var i = results.length - 1; i >= 0; i--) {
           $('.active-pages').append(
              '<a class="list-group-item" target="_blank" href="https://www.theexpertinstitute.com'+results[i][1]+'">'+results[i][0]+' - ' + results[i][6] + '</a>'
              )
         }
      });
}
/*
Draw the map

*/

  /**
   * Update the activeUsers component, the Chartjs charts, and the dashboard
   * title whenever the user changes the view.
   */
  viewSelector.on('viewChange', function(data) {
    var title = document.getElementById('view-name');
    title.innerHTML = data.property.name + ' (' + data.view.name + ')';

    // Start tracking active users for this view.
    activeUsers.set(data).execute();

    // Render all the of charts for this view.
    // renderWeekOverWeekChart(data.ids);
    // renderYearOverYearChart(data.ids);
    // renderTopBrowsersChart(data.ids);
    renderTopChannelsTable(data.ids);
    getTopActivePages(data);
    setInterval(function(){
      getTopActivePages(data);
    },15000);


  });






  /**
   * Draw the a chart.js doughnut chart with data from the specified view that
   * compares sessions from mobile, desktop, and tablet over the past seven
   * days.
   */
  function renderTopChannelsTable(ids) {
    //cache moment object for query times
    var now = moment(); // .subtract(3, 'day');
    
    //table row queries 
    var thisWeek = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      'sort': '-ga:sessions',
      'start-date': moment(now).subtract(1, 'day').day(0).format('YYYY-MM-DD'),
      'end-date': moment(now).format('YYYY-MM-DD'),      
    });

    var lastWeek = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      'sort': '-ga:sessions',
      'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week')
          .format('YYYY-MM-DD'),
      'end-date': moment(now).subtract(1, 'day').day(6).subtract(1, 'week')
          .format('YYYY-MM-DD'),
    });

    var lastMonth = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      'sort': '-ga:sessions',
      'start-date': moment(now).subtract(1,'months').startOf('month').format('YYYY-MM-DD'),
      'end-date': moment(now).subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
    });

    // console.log(thisWeek,lastWeek,lastMonth);
    
    Promise.all([thisWeek, lastWeek,lastMonth]).then(function(results) {
      console.log("query dates:",results[0].query["start-date"]);
      console.log("query dates:",results[0].query["end-date"]);
      var thisWeekResults = results[0].rows.map(function(row){return row});
      var lastWeekResults = results[1].rows.map(function(row){return row});
      var lastMonthResults = results[2].rows.map(function(row){return row});

      //update Date Header 
      $('.this-week-date-header').html(
        moment(results[0].query["start-date"]).format('MM/DD/YY')+
        ' - '+
        moment(results[0].query["end-date"]).format('MM/DD/YY')
      );

      // console.log(thisWeekResults);
      // console.log(lastWeekResults);

      // build multi-array to fill table 
      var tableResults = new Array(3);
      tableResults[0] = thisWeekResults;
      tableResults[1] = lastWeekResults;
      tableResults[2] = lastMonthResults;

      var thisWeekTotal = 0;
      var lastWeekTotal = 0;
      var lastMonthTotal = 0;

      

      for(var i = 0; i < tableResults[0].length; i++){
        
        var channelName = tableResults[0][i][0];
        
        var thisWeek = parseInt(tableResults[0][i][1]);
        var thisWeekRate = parseFloat(tableResults[0][i][2]).toFixed(2);        
        var thisWeekCompletions = parseInt(tableResults[0][i][3]);

        var lastWeek = parseInt(tableResults[1][i][1]);
        var lastWeekRate = parseFloat(tableResults[1][i][2]).toFixed(2);        
        var lastWeekCompletions = parseInt(tableResults[1][i][3]);

        var lastMonth = parseInt(tableResults[2][i][1]);
        var lastMonthRate = parseFloat(tableResults[2][i][2]).toFixed(2);        
        var lastMonthCompletions = parseInt(tableResults[2][i][3]);

        // add to total       
        thisWeekTotal = thisWeekTotal + thisWeek;
        lastWeekTotal = lastWeekTotal + lastWeek;
        lastMonthTotal = lastMonthTotal + lastMonth;
        console.log(thisWeekTotal);

        // build table;
        $('#channels').append('<tr class="channel-row">'+ 
          '<td>'+channelName+'</td>'+
              '<td>'+thisWeek.toLocaleString()+'<span> ('+thisWeekCompletions+') ('+thisWeekRate+'%)</span></td>'+
              '<td>'+lastWeek.toLocaleString()+'<span> ('+lastWeekCompletions+') ('+lastWeekRate+'%)</span></td>'+
              '<td>'+lastMonth.toLocaleString()+'<span> ('+lastMonthCompletions+') ('+lastMonthRate+'%)</span></td>'+
          '</tr>');
      }

     
     // build total row
      $('#channels').append(
        '<tr>'+
                '<td><strong>TOTAL:</strong></td>'+
                '<td><strong>'+thisWeekTotal.toLocaleString()+'<strong></td>'+
                '<td><strong>'+lastWeekTotal.toLocaleString()+'<strong></td>'+
                '<td><strong>'+lastMonthTotal.toLocaleString()+'<strong></td>'+
        '</tr>');
    });
  }





  function ChannelBreakdownChart(ids) {

    // Adjust `now` to experiment with different days, for testing only...
    var now = moment(); // .subtract(3, 'day');

    var thisWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': moment(now).subtract(1, 'day').day(0).format('YYYY-MM-DD'),
      'end-date': moment(now).format('YYYY-MM-DD')
    });

    var lastWeek = query({
      'ids': ids,
      'dimensions': 'ga:date,ga:nthDay',
      'metrics': 'ga:sessions',
      'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week')
          .format('YYYY-MM-DD'),
      'end-date': moment(now).subtract(1, 'day').day(6).subtract(1, 'week')
          .format('YYYY-MM-DD')
    });

    Promise.all([thisWeek, lastWeek]).then(function(results) {

      var data1 = results[0].rows.map(function(row) { return +row[2]; });
      var data2 = results[1].rows.map(function(row) { return +row[2]; });
      var labels = results[1].rows.map(function(row) { return +row[0]; });

      labels = labels.map(function(label) {
        return moment(label, 'YYYYMMDD').format('ddd');
      });

      var data = {
        labels : labels,
        datasets : [
          {
            label: 'Last Week',
            fillColor : 'rgba(220,220,220,0.5)',
            strokeColor : 'rgba(220,220,220,1)',
            pointColor : 'rgba(220,220,220,1)',
            pointStrokeColor : '#fff',
            data : data2
          },
          {
            label: 'This Week',
            fillColor : 'rgba(151,187,205,0.5)',
            strokeColor : 'rgba(151,187,205,1)',
            pointColor : 'rgba(151,187,205,1)',
            pointStrokeColor : '#fff',
            data : data1
          }
        ]
      };

      new Chart(makeCanvas('chart-1-container')).Line(data);
      generateLegend('legend-1-container', data.datasets);
    });
  }


  /**
   * Extend the Embed APIs `gapi.analytics.report.Data` component to
   * return a promise the is fulfilled with the value returned by the API.
   * @param {Object} params The request parameters.
   * @return {Promise} A promise.
   */
  function query(params) {
    return new Promise(function(resolve, reject) {
      var data = new gapi.analytics.report.Data({query: params});
      data.once('success', function(response) { resolve(response); })
          .once('error', function(response) { reject(response); })
          .execute();
    });
  }


  /**
   * Create a new canvas inside the specified element. Set it to be the width
   * and height of its container.
   * @param {string} id The id attribute of the element to host the canvas.
   * @return {RenderingContext} The 2D canvas context.
   */
  function makeCanvas(id) {
    var container = document.getElementById(id);
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    container.innerHTML = '';
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    container.appendChild(canvas);

    return ctx;
  }


  /**
   * Create a visual legend inside the specified element based off of a
   * Chart.js dataset.
   * @param {string} id The id attribute of the element to host the legend.
   * @param {Array.<Object>} items A list of labels and colors for the legend.
   */
  function generateLegend(id, items) {
    var legend = document.getElementById(id);
    legend.innerHTML = items.map(function(item) {
      var color = item.color || item.fillColor;
      var label = item.label;
      return '<li><i style="background:' + color + '"></i>' + label + '</li>';
    }).join('');
  }


  // Set some global Chart.js defaults.
  Chart.defaults.global.animationSteps = 60;
  Chart.defaults.global.animationEasing = 'easeInOutQuart';
  Chart.defaults.global.responsive = true;
  Chart.defaults.global.maintainAspectRatio = false;

});