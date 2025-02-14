// 状態名の配列
var state_name = ["運転準備", "運転中", "異常", "加工完了", "朝礼", "寸法調整", "保全", "故障", "段取", "材料待ち", "清掃", "刃具交換", "TPM", "伝達", "修正", "選別", "運搬", "切運", "報記", "その他", "量産"];

// 状態に応じた色のマッピング
var colors = {
    '稼働時間': '#4169e1',
    'チョコ停時間': '#ffd700',
    'ドカ停時間': '#ff6347',
    '運転中': 'cyan',
    '異常': 'red',
    '加工完了': 'orange',
    '運転準備': 'darkgreen',
    '朝礼': 'white',
    '寸法調整': 'maroon',
    '保全': 'lightpink',
    '故障': 'purple',
    '段取': 'deeppink',
    '材料待ち': 'yellow',
    '清掃': 'black',
    '刃具交換': 'blue',
    'TPM': 'coral',
    '伝達': 'springgreen',
    '修正': 'olive',
    '選別': 'aquamarine',
    '運搬': 'greenyellow',
    '切運': 'teal',
    '報記': 'burlywood',
    'その他': 'lemonchiffon',
    '待機': 'blueviolet',
    '量産': 'lime'
};

google.charts.load('current', {'packages': ['timeline']});

var line_list = {};
var parts_list = [];
var machine_list = [];
var response;
var DB_REQUEST_URL = 'db_request.php';
var myChart;

// PHPへのPOSTリクエスト関数
function PHP_POST(url, data, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
    xhr.send(data);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.response);
        }
    };
}

// 部門リストの更新関数
function division_update() {
    PHP_POST('UDP.php', 'line_list_update', function (resp) {
        var x = document.getElementById("message");
        x.style.color = "red";
        if (resp === "成功") {
            x.innerHTML = "リストを更新しました。";
            setTimeout(() => location.reload(), 2000);
        } else {
            x.innerHTML = "リストの更新に失敗しました。\n";
            setTimeout(() => { x.innerHTML = ""; }, 3000);
        }
    });
}

// データの設定関数
function data_set() {
    var date = new Date().toISOString().split('T')[0];
    ["startDate", "startDate_machine"].forEach(id => {
        document.getElementById(id).value = `${date}T08:00:00`;
    });
    ["endDate", "endDate_machine"].forEach(id => {
        document.getElementById(id).value = `${date}T17:00:00`;
    });
    $.ajax({
        url: 'line_list.php',
        type: 'GET',
        success: function (data) {
            var _list = data.split('\n').map(item => item.split(','));
            _list.forEach(element => {
                if(element.length >= 2){
                    if(!line_list[element[1]]){
                        line_list[element[1]] = [element[0]];
                    }else{
                        line_list[element[1]].push(element[0]);
                    }
    
                }
            });
            updateDivisionSelect("sel_div", line_list,true);
            updateDivisionSelect("sel_div_machine", line_list, true);
        }
    });
}

// 部門変更時の処理
function division_change(value) {
    updateLineSelect("sel_line", line_list,value);
}

// 機械部門変更時の処理
function division_change_machine(value) {
    updateLineSelect("sel_line_machine", line_list,value,true);
}

// 選択オプションの更新関数
function updateDivisionSelect(selectId, options, addEmpty = false) {
    var select = document.getElementById(selectId);
    while (select.firstChild) select.removeChild(select.firstChild);
    if (addEmpty) select.appendChild(new Option("", ""));
    for(let key of Object.keys(options)){
        select.appendChild(new Option(key, key));
    }
}

// 選択オプションの更新関数
function updateLineSelect(selectId, options, line_name,addEmpty = false) {
    var select = document.getElementById(selectId);
    while (select.firstChild) select.removeChild(select.firstChild);
    if (addEmpty) select.appendChild(new Option("", ""));
    for(let value of options[line_name]){
        select.appendChild(new Option(value, value));
    }
}

// 製品追加関数
function addProduct(productName, state, startTime, endTime) {
    if (!products[productName]) products[productName] = {};
    if (!products[productName][state]) products[productName][state] = [];
    products[productName][state].push({ startTime, endTime });
}

// データベース送信関数
function send_db(query) {
    return new Promise((resolve, reject) => {
        PHP_POST(DB_REQUEST_URL, query, function (resp) {
            var resp_list = resp.split('\n');
            if (resp_list[0] === "成功") {
                resolve(resp_list);
            } else {
                var x = document.getElementById("message");
                x.style.color = "red";
                x.innerHTML = "データの取得に失敗しました。\n";
                setTimeout(() => { x.innerHTML = ""; }, 3000);
                reject(new Error("データの取得に失敗しました"));
            }
        });
    });
}

// 稼働時間の分類関数
function operation_time_division(start) {
    var operation_time = [];
    var last_data = null;
    var start_time = start[start.length - 1][1];

    for (let i = start.length - 1; i >= 1; i--) {
        var recalc = false;
        var start_time_change = false;
        if (last_data) {
            if (start[i][0] === last_data[0]) {
                var calc_start = new Date(last_data[2]);
                var calc_end = new Date(start[i][1]);
                var [break_time, break_start, break_end] = break_time_check(calc_start, calc_end);
                switch (break_time) {
                    case 0:
                        break;
                    case 1:
                        if (start_time < break_start) operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                        start_time = break_end;
                        calc_start = break_end;
                        break;
                    case 2:
                        calc_end = break_start;
                        start_time_change = true;
                        break;
                    case 3:
                        if (start_time < break_start) operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                        start_time = break_end;
                        last_data[2] = break_end;
                        continue;
                    case 4:
                        recalc = true;
                        calc_end = break_start;
                        start_time_change = true;
                        break;
                }
                var time_delta = calc_end.getTime() - calc_start.getTime();
                if (time_delta < 300000) {
                    if (start_time_change) {
                        operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                        start_time = break_end;
                    }
                } else {
                    operation_time.push([start[i][0], "稼働時間", start_time, calc_start]);
                    if (time_delta < 600000) {
                        operation_time.push([start[i][0], "チョコ停時間", calc_start, calc_end]);
                    } else {
                        operation_time.push([start[i][0], "ドカ停時間", calc_start, calc_end]);
                    }
                    start_time = start_time_change ? break_end : calc_end;
                }
            } else {
                operation_time.push([last_data[0], "稼働時間", start_time, last_data[2]]);
                last_data = start[i];
                start_time = start[i][1];
            }
            last_data = start[i];
        } else {
            last_data = start[i];
        }
        if (recalc) {
            i--;
            last_data[2] = break_end;
        }
    }
    operation_time.push([start[0][0], "稼働時間", start_time, start[0][2]]);
    return operation_time;
}

// データ表示関数
async function data_disp() {
    var department = document.getElementById('sel_div').value;
    var line_name = document.getElementById('sel_line').value;
    var start_date = document.getElementById('startDate').value;
    var end_date = document.getElementById('endDate').value;
    var query = `arg1=SELECT * FROM log_machine INNER JOIN parts ON parts.parts_no LIKE CONCAT(log_machine.parts_no, '%') AND log_machine.line_name = parts.line_name WHERE log_machine.line_name = '${line_name}' AND log_machine.division = '${department}' AND log_machine.date BETWEEN '${start_date}' AND '${end_date}' ORDER BY log_machine.date DESC;`;
    
    try {
        response = await send_db(query);
        var show_data = data_calc(response);
        data_show(show_data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function data_calc(data) {
    var productData = {}; // 製品データを格納するオブジェクト
    var in_operation_start = []; // 運転開始時刻を格納する配列
    var comp_flg = false; // 完了フラグ
    var productNumber; // 品番

    // データの集計処理
    for (var i = 1; i < data.length - 1; i++) {
        var row = data[i].split(',');
        productNumber = row[6];
        var date = row[3].split(" ")[0];
        var logTime = row[3].split(" ")[1];
        var type = parseInt(row[37]);
        var count_type = parseInt(row[10]);
        var productionCount = parseInt(row[11]);
        var task = row[1];
        var state = parseInt(row[2]);

        // 新しい日付または品番のエントリを作成
        if (!productData[date]) productData[date] = {};
        if (!productData[date][productNumber]) {
            var final_process = type ? row.slice(15, 35).find(val => val) : row[0];
            productData[date][productNumber] = {
                "startTime": logTime,
                "endTime": logTime,
                "productionCount": productionCount,
                "final_process": final_process
            };
        }

        // 開始時刻と生産個数の更新
        var currentEntry = productData[date][productNumber];
        var final_flg = (row[0] === currentEntry["final_process"]);
        let start_time = new Date(`1990-1-1 ${currentEntry["startTime"]}`);
        let log_time = new Date(`1990-1-1 ${logTime}`);
        if (start_time > log_time) currentEntry["startTime"] = logTime;
        if (count_type && currentEntry["productionCount"] < productionCount) {
            currentEntry["productionCount"] = productionCount;
        } else if (task === "加工完了" && state && final_flg) {
            currentEntry["productionCount"]++;
        }

        // 運転時間の更新
        if (final_flg && task === "運転中") {
            updateOperationTime(state, comp_flg, productNumber, row[3], in_operation_start);
            comp_flg = !state;
        }
    }

    // グラフの描画またはメッセージ表示
    drawGraph(in_operation_start, 'timeline', 'graph_area');

    return productData;
}

// 運転時間の更新を行う関数
function updateOperationTime(state, comp_flg, productNumber, time, in_operation_start) {
    if (!state) {
        in_operation_start.push([productNumber, time, time]);
    } else if (comp_flg) {
        in_operation_start[in_operation_start.length - 1][1] = time;
    } else {
        in_operation_start.push([productNumber, time, time]);
    }
}

// グラフの描画またはメッセージ表示を行う関数
function drawGraph(in_operation_start, timelineId, graphAreaId) {
    var graph = document.getElementById(timelineId);
    if (in_operation_start.length) {
        var operation_division = operation_time_division(in_operation_start);
        drawChart(operation_division, graph);
        graph.children[0].style.height = '100px';
    } else {
        message_disp('自動運転の実績がありません。', 'red', 3000, document.getElementById(graphAreaId));
        var chart = document.getElementById(timelineId);
        var detailchart = document.getElementById('detail' + timelineId);
        chart.innerHTML = '';
        detailchart.innerHTML = '';
    }
}

// チャート描画関数
function drawChart(dataList) {
    var container = document.getElementById('timeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Line' });
    dataTable.addColumn({ type: 'string', id: 'Status' });
    dataTable.addColumn({ type: 'date', id: 'Start' });
    dataTable.addColumn({ type: 'date', id: 'End' });

    dataList.forEach(row => {
        dataTable.addRow([row[0], row[1], new Date(row[2]), new Date(row[3])]);
    });

    var options = {
        timeline: { showRowLabels: true, groupByRowLabel: true, colorByRowLabel: true },
        colors: dataList.map(row => colors[row[1]])
    };

    chart.draw(dataTable, options);
}

// 休憩時間チェック関数
function break_time_check(start, end) {
    var result = 0;
    var [break_start, break_end] = [null, null];

    // 例：特定の時間範囲に応じて休憩時間を設定
    var breakPeriods = [
        [new Date(start).setHours(12, 0, 0, 0), new Date(start).setHours(13, 0, 0, 0)],
        [new Date(start).setHours(15, 0, 0, 0), new Date(start).setHours(15, 10, 0, 0)]
    ];

    breakPeriods.forEach(([bStart, bEnd]) => {
        if (start < bStart && end > bEnd) {
            result = 1;
            [break_start, break_end] = [new Date(bStart), new Date(bEnd)];
        } else if (start < bStart && end > bStart && end < bEnd) {
            result = 2;
            [break_start, break_end] = [new Date(bStart), new Date(end)];
        } else if (start >= bStart && start < bEnd && end > bEnd) {
            result = 3;
            [break_start, break_end] = [new Date(start), new Date(bEnd)];
        } else if (start >= bStart && end <= bEnd) {
            result = 4;
            [break_start, break_end] = [new Date(start), new Date(end)];
        }
    });

    return [result, break_start, break_end];
}

// データを秒数に変換する関数
function toSeconds(dateAndTime) {
    let [date, time] = dateAndTime.split(' ');
    let [year, month, day] = date.split('-');
    let [hours, minutes, seconds] = time.split(':');
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime() / 1000;
}

function drawBarGraph(data, workSeconds) {
    let datasets = [];
    let machineList = [];
    let stateData = {};
    let stateTotals = {};

    for (let machine in data) {
        machineList.push(machine);
        for (let state in data[machine]) {
            if (state !== '量産') {
                if (!stateData[state]) {
                    stateData[state] = Array(machineList.length).fill(0);
                    stateTotals[state] = 0;
                }
                data[machine][state].forEach(time => {
                    let start = toSeconds(time[0]);
                    let end = toSeconds(time[1]);
                    let duration = (end - start) / workSeconds * 100;
                    stateData[state][machineList.length - 1] += duration;
                    stateTotals[state] += duration;
                });
            }
        }
    }

    let idleIndex = machineList.map(() => 100);
    for (let state in stateData) {
        if (state !== '運転準備') {
            stateData[state].forEach((value, index) => {
                idleIndex[index] -= value;
            });
        }
    }

    stateData['待機'] = idleIndex.map(value => [parseFloat(value.toFixed(2))]);

    for (let state in stateData) {
        if (state !== '運転準備') {
            datasets.push({
                label: state,
                data: stateData[state].map(value => [parseFloat(value.toFixed(2))]),
                backgroundColor: colors[state] || '#dddddd',
                borderColor: state === '異常' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            });
        }
    }

    let ctx = document.getElementById('myChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: machineList,
            datasets: datasets
        },
        options: {
            plugins: {
                stacked100: { enable: true }
            },
            title: {
                display: true,
                text: '割合'
            },
            scales: {
                x: {
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%',
                        fontSize: 18
                    }
                },
                y: {
                    stacked: true,
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '%',
                        fontSize: 18
                    },
                    ticks: {
                        min: 0,
                        max: 100,
                        fontSize: 18,
                        stepSize: 20
                    }
                }
            },
            legend: { display: true }
        }
    });
}

function calculateWorkSeconds(startDate, endDate) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    let breakTimes = [
        { start: '10:00', end: '10:10' },
        { start: '12:10', end: '12:50' },
        { start: '14:50', end: '15:00' },
        { start: '17:00', end: '17:05' },
        { start: '19:05', end: '19:15' },
        { start: '21:15', end: '21:55' },
        { start: '23:55', end: '00:05' }
    ];

    let diffInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    let totalBreakTimeInSeconds = breakTimes.reduce((acc, { start: breakStart, end: breakEnd }) => {
        let breakStartTime = new Date(`${startDate.split('T')[0]}T${breakStart}:00`);
        let breakEndTime = new Date(`${startDate.split('T')[0]}T${breakEnd}:00`);
        if (breakEndTime < breakStartTime) breakEndTime.setDate(breakEndTime.getDate() + 1);

        let breakDuration = (breakEndTime - breakStartTime) / 1000 * diffInDays;
        if (start >= breakStartTime && start < breakEndTime && end > breakEndTime) {
            breakDuration += (breakEndTime - start) / 1000;
        }
        if (start < breakStartTime && end >= breakStartTime && end < breakEndTime) {
            breakDuration += (end - breakStartTime) / 1000;
        }
        if (start < breakStartTime && end > breakEndTime) {
            breakDuration += (breakEndTime - breakStartTime) / 1000;
        }
        return acc + breakDuration;
    }, 0);

    let diffInSeconds = (end - start) / 1000;
    return diffInSeconds;
}

function messageDisp(text, color, timer, parentObject) {
    let msgElement = document.createElement("p");
    msgElement.style.color = color;
    msgElement.innerHTML = text;
    parentObject.appendChild(msgElement);
    setTimeout(() => {
        msgElement.innerHTML = "";
        parentObject.removeChild(msgElement);
    }, timer);
}
