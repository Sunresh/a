google.charts.load("current", {packages:["timeline"]});
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
  var container = document.getElementById('example5.6');
  var chart = new google.visualization.Timeline(container);
  var dataTable = new google.visualization.DataTable();
  dataTable.addColumn({ type: 'string', id: '設備ID' });
  dataTable.addColumn({ type: 'string', id: '状態' });
  dataTable.addColumn({ type: 'date', id: '開始' });
  dataTable.addColumn({ type: 'date', id: '終了' });
  dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });

dataTable.addRows([
    [ 'President', 'George Washington', new Date(1789, 3, 30), new Date(1797, 2, 4), '#ff0000'],
    [ 'President', 'John Adams', new Date(1797, 2, 4), new Date(1801, 2, 4), '#603913' ],
    [ 'President', 'Thomas Jefferson', new Date(1801, 2, 4), new Date(1809, 2, 4), '#c69c6e' ]]);

//   dataTable.addColumn({ type: 'string', id: '設備ID' });
//   dataTable.addColumn({ type: 'string', id: '状態' });
//   dataTable.addColumn({ type: 'date', id: '開始' });
//   dataTable.addColumn({ type: 'date', id: '終了' });
//   dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
  
//   data = [
//     ["a","運転","2024-05-29 13:50:00","2024-05-29 14:00:00"],
//     ["b","保守","2024-05-29 14:50:00","2024-05-29 15:00:00"],
//     ["c","停止","2024-05-29 15:50:00","2024-05-29 16:00:00"],
//   ];

//   for(let i = 0; i < data.length; i++){
//     //var color = colors[data[i][0]] || '#dddddd'; // デフォルト色
//     dataTable.addRows([
//     [ data[i][0], data[i][1], new Date(data[i][2]), new Date(data[i][3]), '#ff0000' ]
//     ]);
//   }

  chart.draw(dataTable);
}

