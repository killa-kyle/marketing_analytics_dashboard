var ACTIVE_USERS_MAP = (function () {
  var active_users_map = {}
  var geo_data

  active_users_map.init = function (data) {
    $('#regions_div').html('test')
    geo_data = data
    google.charts.load('upcoming', {'packages': ['geochart']})
    google.charts.setOnLoadCallback(active_users_map.drawRegionsMap)
  },

  active_users_map.drawRegionsMap = function () {
    var data = new google.visualization.DataTable()
    data.addColumn('number', 'LATITUDE')
    data.addColumn('number', 'LONGITUDE')
    data.addColumn('string', 'DESCRIPTION')
    data.addColumn('number', 'Value:', 'value')
    data.addColumn({type: 'string', role: 'tooltip'})

    // data.addRows([[40.712784, -74.005936, 'First marker', 0,'tooltip']])
    // data.addRows([[ 31.459017,-85.640289, 'Second Marker', 1,'tooltip']])

    for (var i = geo_data.length - 1; i >= 0; i--) {
      var LATITUDE = parseFloat(geo_data[i][2])
      var LONGITUDE = parseFloat(geo_data[i][3])
      data.addRows([[LATITUDE, LONGITUDE, geo_data[i][4], i, geo_data[i][5]]])
    }

    var options = {
      colorAxis: {colors: ['#e7711b', '#2a5781']}, // orange to blue
      legend: 'none',
      backgroundColor: {fill: 'transparent',stroke: '#bada55', strokeWidth: 0 },
      datalessRegionColor: '#eee',
      displayMode: 'markers',
      enableRegionInteractivity: 'true',
      resolution: 'countries',
      sizeAxis: {minValue: 1, maxValue: 40,minSize: 10,  maxSize: 20},
      region: 'auto',
      keepAspectRatio: true,
      tooltip: {textStyle: {color: '#444444'}}
    }

    var chart = new google.visualization.GeoChart(document.getElementById('regions_div'))

    chart.draw(data, options)
  }

  return active_users_map
}())
