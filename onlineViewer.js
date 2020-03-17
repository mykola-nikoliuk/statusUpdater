const config = {
  "apiKey": "AIzaSyB6FgBg06N-fiin24-HrY2ZeOBlbWUOkcw",
  "authDomain": "mykola-a6066.firebaseapp.com",
  "databaseURL": "https://mykola-a6066.firebaseio.com",
  "projectId": "mykola-a6066",
  "storageBucket": "mykola-a6066.appspot.com",
  "messagingSenderId": "409959320167"
};

const pieChartData = {
  offline: { y: 0, label: 'Offline', count: 0 },
  less50ms: { y: 0, label: 'Less 50ms', count: 0 },
  less100ms: { y: 0, label: '50-100ms', count: 0 },
  less500ms: { y: 0, label: '100-500ms', count: 0 },
  less1000ms: { y: 0, label: '500-1000ms', count: 0 },
  more1000ms: { y: 0, label: 'More 1000ms', count: 0 },
};
const pieChartDataArray = [
  pieChartData.offline,
  pieChartData.less50ms,
  pieChartData.less100ms,
  pieChartData.less500ms,
  pieChartData.less1000ms,
  pieChartData.more1000ms,
];

var liveDataSeries = { type: "line" };
var liveDataSeries2 = { type: "line" };

const addItem = (ss, dataPoints, dataPoints2) => {
  const name = ss.key;
  const value = ss.val();
  dataPoints.push({
    x: new Date(+name),
    y: value,
  });
  dataPoints2.push({
    x: new Date(+name),
    y: value > 0 ? 0 : 1000,
  });

  let category;
  if (value === 0) {
    category = pieChartData.offline;
  } else if (value < 50) {
    category = pieChartData.less50ms;
  } else if (value < 100) {
    category = pieChartData.less100ms;
  } else if (value < 500) {
    category = pieChartData.less500ms;
  } else if (value < 1000) {
    category = pieChartData.less1000ms;
  } else {
    category = pieChartData.more1000ms;
  }

  category.count++;

  pieChartDataArray.forEach(category => {
    category.y = category.count / dataPoints.length * 100;
  });
};

let onUpdate = function ({ databaseRef, lastDate, dataPoints, dataPoints2, lineChart, pieChart, liveLineChart }) {
  let ignoreFirst = true;
  databaseRef.child(lastDate).endAt().limitToLast(1).on('child_added', change => {
    if (!ignoreFirst) {
      console.log('change', change.key, change.val());
      addItem(change, dataPoints, dataPoints2);
      lineChart.render();
      pieChart.render();
      liveLineChart.render();
    }
    ignoreFirst = false;
    liveDataSeries.dataPoints = dataPoints.slice(-120);
    liveDataSeries2.dataPoints = dataPoints2.slice(-120);
  });
};

let createLineChart = function (data) {
  var chart = new CanvasJS.Chart("lineChartContainer", {
    animationEnabled: true,
    zoomEnabled: true,
    title: {
      text: "Online status (red - offline / blue - ping)"
    },
    axisX: {
      valueFormatString: "HH:mm:ss",
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    data,
  });
  chart.render();
  return chart;
};
let createPieChart = function () {
  const chart = new CanvasJS.Chart("pieChartContainer", {
    animationEnabled: true,
    title: {
      text: "Ping statistic"
    },
    colorSet: "customColorSet",
    data: [{
      type: "pie",
      startAngle: 240,
      yValueFormatString: "##0.00\"%\"",
      indexLabel: "{label} {y}",
      dataPoints: pieChartDataArray,
    }]
  });
  chart.render();
  return chart;
};
let createLiveLineChart = function (data) {
  var chart = new CanvasJS.Chart("liveLineChartContainer", {
    animationEnabled: true,
    title: {
      text: "Last 30m"
    },
    axisX: {
      valueFormatString: "HH:mm",
      crosshair: {
        enabled: true,
        snapToDataPoint: true
      }
    },
    data,
  });
  chart.render();
  return chart;
};


window.onload = function () {
  CanvasJS.addColorSet("customColorSet", [
    "#EC5657",
    "#4661EE",
    "#1BCDD1",
    "#8FAABB",
    "#B08BEB",
    "#3EA0DD",
    "#F5A52A",
    "#23BFAA",
    "#FAA586",
    "#EB8CC6",
  ]);

  firebase.initializeApp(config);
  firebase.auth().onAuthStateChanged(() => {

    const databaseRef = firebase.database().ref('users/mmfXJqkEwih8bYryust3k2a6K6C3/ping/raspi_home');

    databaseRef.child('dates').once('value', snapshot => {
      const dates = snapshot.val();
      const lastDate = Object.keys({ ...dates }).pop();

      console.log(lastDate);

      databaseRef.child(lastDate).once('value', snapshot => {
        var data = [];
        var dataSeries = { type: "line" };
        var dataSeries2 = { type: "line" };
        var dataPoints = [];
        var dataPoints2 = [];

        dataSeries.dataPoints = dataPoints;
        dataSeries2.dataPoints = dataPoints2;
        data.push(dataSeries);
        data.push(dataSeries2);


        var liveData = [];
        liveData.push(liveDataSeries);
        liveData.push(liveDataSeries2);

        snapshot.forEach(ss => addItem(ss, dataPoints, dataPoints2));
        liveDataSeries.dataPoints = dataPoints.slice(-120);
        liveDataSeries2.dataPoints = dataPoints2.slice(-120);

        console.log('dataPoints', dataPoints);

        const lineChart = createLineChart(data);
        const pieChart = createPieChart();
        const liveLineChart = createLiveLineChart(liveData);

        onUpdate({ databaseRef, lastDate, dataPoints, dataPoints2, lineChart, pieChart, liveLineChart });
      })
    });
  });
};
