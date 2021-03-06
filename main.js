gapi.analytics.ready(function () {

  /**
   * Authorize the user immediately if the user has already granted access.
   * If no access has been created, render an authorize button inside the
   * element with the ID "embed-api-auth-container".
   */
  gapi.analytics.auth.authorize({
    container: 'embed-api-auth-container',
    clientid: '476592068856-ki5v355o2t1pthp0h73s6bgddm3v0i80.apps.googleusercontent.com'
  })

  /**
   * Create a new ActiveUsers instance to be rendered inside of an
   * element with the id "active-users-container" and poll for changes every
   * five seconds.
   */
  var activeUsers = new gapi.analytics.ext.ActiveUsers({
    container: 'active-users-container',
    pollingInterval: 19
  })

  /**
   * Add CSS animation to visually show the when users come and go.
   */
  activeUsers.once('success', function () {
    var element = this.container.firstChild
    var timeout

    this.on('change', function (data) {
      var element = this.container.firstChild
      var animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing'
      element.className += (' ' + animationClass)

      clearTimeout(timeout)
      timeout = setTimeout(function () {
        element.className =
          element.className.replace(/ is-(increasing|decreasing)/g, '')
      }, 3000)
    })
  })

  /**
   * Create a new ViewSelector2 instance to be rendered inside of an
   * element with the id "view-selector-container".
   */
  var viewSelector = new gapi.analytics.ext.ViewSelector2({
    container: 'view-selector-container'
  })
    .execute()

  /**
  *  GET ACTIVE PAGES
  */

  function getTopActivePages (data) {
    gapi.client.analytics.data.realtime
      .get({
        ids: data.ids,
        metrics: 'rt:activeUsers',
        dimensions: 'rt:pageTitle,rt:pagePath,rt:latitude,rt:longitude,rt:region,rt:country',
      // 'max-results': 8,      
      })
      .then(function (response) {
        var results = response.result.rows

        ACTIVE_USERS_MAP.init(results)

        // update top active pages 
        $('.active-pages').html('')
        var pages = []
        $.each(results, function (index, val) {
          pages.push(val[0])
        })
        var compressed_pages = compressArray(pages)
        console.log(compressed_pages)

        for (var i = compressed_pages.length - 1; i >= 0; i--) {
          $('.active-pages').append(
            '<a class="list-group-item" target="_blank" href="#">' + compressed_pages[i].value + ' <span>' + compressed_pages[i].count + '</span></a>'
          )
        }
      })
  }
  /*
  Compress array function

  */
  function compressArray (original) {
    var compressed = []
    // make a copy of the input array
    var copy = original.slice(0)

    // first loop goes over every element
    for (var i = 0; i < original.length; i++) {
      var myCount = 0
      // loop over every element in the copy and see if it's the same
      for (var w = 0; w < copy.length; w++) {
        if (original[i] == copy[w]) {
          // increase amount of times duplicate is found
          myCount++
          // sets item to undefined
          delete copy[w]
        }
      }

      if (myCount > 0) {
        var a = { }
        a.value = original[i]
        a.count = myCount
        compressed.push(a)
      }
    }

    return compressed
  }

  /**
   * Update the activeUsers component, the Chartjs charts, and the dashboard
   * title whenever the user changes the view.
   */
  viewSelector.on('viewChange', function (data) {
    var title = document.getElementById('view-name')
    title.innerHTML = data.property.name + ' (' + data.view.name + ')'
    $('#embed-api-auth-container').hide()

    // Start tracking active users for this view.
    activeUsers.set(data).execute()

    // Render all the of charts for this view.
    renderTopChannelsTable(data.ids)
    getTopActivePages(data)

    setInterval(function () {
      getTopActivePages(data)
      renderTopChannelsTable(data.ids)
    }, 18000)
  })

  function renderTopChannelsTable (ids) {
    console.log('RENDERING TABLE')

    Promise.all([getThisWeek(ids), getLastWeek(ids), getLastMonth(ids), getToday(ids)]).then(function (results) {
      var thisWeekResults = results[0].rows.map(function (row) {return row})
      var lastWeekResults = results[1].rows.map(function (row) {return row})
      var lastMonthResults = results[2].rows.map(function (row) {return row})
      var todayResults = results[3].rows.map(function (row) {return row})

      // update Date Header 
      $('.this-week-date-header').html(
        moment(results[0].query['start-date']).format('MM/DD/YY') +
        ' - ' +
        moment(results[0].query['end-date']).format('MM/DD/YY')
      )
      $('.last-week-date-header').html(
        moment(results[1].query['start-date']).format('MM/DD/YY') +
        ' - ' +
        moment(results[1].query['end-date']).format('MM/DD/YY')
      )

      // build multi-array to fill table http://voltron-work.local:5757/thank-you-california/?o=30&ckcachecontrol=1476818731
      var tableResults = new Array(4)
      tableResults[0] = thisWeekResults
      tableResults[1] = lastWeekResults
      tableResults[2] = lastMonthResults
      tableResults[3] = todayResults
      console.log(tableResults)

      // initialize total variables
      var thisWeekTotal = 0
      var thisWeekTotalCompletions = 0

      var lastWeekTotal = 0
      var lastWeekTotalCompletions = 0

      var lastMonthTotal = 0
      var lastMonthTotalCompletions = 0

      var todayTotal = 0
      var todayTotalCompletions = 0

      $('#channels tbody').html('')
      for (var i = 0; i < tableResults[0].length; i++) {
        var channelName = tableResults[1][i][0]
        var thisWeek = parseInt(tableResults[0][i][1])
        var thisWeekRate = parseFloat(tableResults[0][i][2]).toFixed(2)
        var thisWeekCompletions = parseInt(tableResults[0][i][3])

        var lastWeek = parseInt(tableResults[1][i][1])
        var lastWeekRate = parseFloat(tableResults[1][i][2]).toFixed(2)
        var lastWeekCompletions = parseInt(tableResults[1][i][3])

        var lastMonth = parseInt(tableResults[2][i][1])
        var lastMonthRate = parseFloat(tableResults[2][i][2]).toFixed(2)
        var lastMonthCompletions = parseInt(tableResults[2][i][3])

        var today = parseInt(tableResults[3][i][1])
        var todayRate = parseFloat(tableResults[3][i][2]).toFixed(2)
        var todayCompletions = parseInt(tableResults[3][i][3])

        // add to total       
        thisWeekTotal = thisWeekTotal + thisWeek
        thisWeekTotalCompletions = thisWeekTotalCompletions + thisWeekCompletions

        lastWeekTotal = lastWeekTotal + lastWeek
        lastWeekTotalCompletions = lastWeekTotalCompletions + lastWeekCompletions

        lastMonthTotal = lastMonthTotal + lastMonth
        lastMonthTotalCompletions = lastMonthTotalCompletions + lastMonthCompletions

        todayTotal = todayTotal + today
        todayTotalCompletions = todayTotalCompletions + todayCompletions

        // build table
        $('#channels').append('<tr class="channel-row">' +
          '<td>' + channelName + '</td>' +
          '<td>' + today.toLocaleString() + '<span> (' + todayCompletions + ') (' + todayRate + '%)</span></td>' +
          '<td>' + thisWeek.toLocaleString() + '<span> (' + thisWeekCompletions + ') (' + thisWeekRate + '%)</span></td>' +
          '<td>' + lastWeek.toLocaleString() + '<span> (' + lastWeekCompletions + ') (' + lastWeekRate + '%)</span></td>' +
          '<td>' + lastMonth.toLocaleString() + '<span> (' + lastMonthCompletions + ') (' + lastMonthRate + '%)</span></td>' +
          '</tr>')
      }

      // build total row
      $('#channels').append(
        '<tr class="channel-row">' +
        '<td><strong>TOTAL:</strong></td>' +
        '<td><strong>' + todayTotal.toLocaleString() + '<strong><span> (' + todayTotalCompletions + ')</span></td>' +
        '<td><strong>' + thisWeekTotal.toLocaleString() + '<strong><span> (' + thisWeekTotalCompletions + ')</span></td>' +
        '<td><strong>' + lastWeekTotal.toLocaleString() + '<strong><span> (' + lastWeekTotalCompletions + ')</span></td>' +
        '<td><strong>' + lastMonthTotal.toLocaleString() + '<strong><span> (' + lastMonthTotalCompletions + ')</span></td>' +
        '</tr>')
    })
  }

  /*
    Query Functions 
  */
  function getToday (ids) {
    var now = moment()
    var today = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      // 'sort': '-ga:sessions',
      'sort': 'ga:channelGrouping',
      'start-date': moment(now).format('YYYY-MM-DD'),
      'end-date': moment(now).format('YYYY-MM-DD')
    })

    return today
  }
  function getThisWeek (ids) {
    var now = moment()
    var thisWeek = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      // 'sort': '-ga:sessions',
      'sort': 'ga:channelGrouping',
      'start-date': moment(now).subtract(1, 'day').day(0).format('YYYY-MM-DD'),
      'end-date': moment(now).format('YYYY-MM-DD')
    })

    return thisWeek
  }
  function getLastWeek (ids) {
    var now = moment()
    var lastWeek = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      // 'sort': '-ga:sessions',
      'sort': 'ga:channelGrouping',
      'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week')
        .format('YYYY-MM-DD'),
      'end-date': moment(now).subtract(1, 'day').day(6).subtract(1, 'week')
        .format('YYYY-MM-DD')
    })
    return lastWeek
  }
  function getLastMonth (ids) {
    var now = moment()
    var lastMonth = query({
      'ids': ids,
      'dimensions': 'ga:channelGrouping',
      'metrics': 'ga:sessions,ga:goal1ConversionRate,ga:goal1Completions',
      // 'sort': '-ga:sessions',
      'sort': 'ga:channelGrouping',
      'start-date': moment(now).subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
      'end-date': moment(now).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
    })

    return lastMonth
  }

  /**
   * Extend the Embed APIs `gapi.analytics.report.Data` component to
   * return a promise the is fulfilled with the value returned by the API.
   * @param {Object} params The request parameters.
   * @return {Promise} A promise.
   */
  function query (params) {
    return new Promise(function (resolve, reject) {
      var data = new gapi.analytics.report.Data({query: params})
      data.once('success', function (response) { resolve(response); })
        .once('error', function (response) { reject(response); })
        .execute()
    })
  }

  /**
   * Create a new canvas inside the specified element. Set it to be the width
   * and height of its container.
   * @param {string} id The id attribute of the element to host the canvas.
   * @return {RenderingContext} The 2D canvas context.
   */
  function makeCanvas (id) {
    var container = document.getElementById(id)
    var canvas = document.createElement('canvas')
    var ctx = canvas.getContext('2d')

    container.innerHTML = ''
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    container.appendChild(canvas)

    return ctx
  }

  /**
   * Create a visual legend inside the specified element based off of a
   * Chart.js dataset.
   * @param {string} id The id attribute of the element to host the legend.
   * @param {Array.<Object>} items A list of labels and colors for the legend.
   */
  function generateLegend (id, items) {
    var legend = document.getElementById(id)
    legend.innerHTML = items.map(function (item) {
      var color = item.color || item.fillColor
      var label = item.label
      return '<li><i style="background:' + color + '"></i>' + label + '</li>'
    }).join('')
  }

  // Set some global Chart.js defaults.
  Chart.defaults.global.animationSteps = 60
  Chart.defaults.global.animationEasing = 'easeInOutQuart'
  Chart.defaults.global.responsive = true
  Chart.defaults.global.maintainAspectRatio = false
})
