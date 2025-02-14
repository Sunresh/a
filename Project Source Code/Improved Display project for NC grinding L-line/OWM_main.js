var state_name = ["運転準備","運転中","異常","加工完了",
    "朝礼","寸法調整","保全","故障","段取","材料待ち","清掃",
    "刃具交換","TPM","伝達","修正","選別","運搬","切運",
    "報記","その他","量産", "電源"];
// 状態に応じた色のマッピング
var colors = {
    '稼働時間'      : '#4169e1', // 青色
    'チョコ停時間'  : '#ffd700', // 黄色
    'ドカ停時間'    : '#ff6347',  // 赤色
    '運転中'        : 'cyan', // 青色
    '異常'          : 'red', // 黄色
    '加工完了'      : 'orange',  // 赤色
    '運転準備'      : 'darkgreen', // 青色
    '朝礼'          : 'white', // 黄色
    '寸法調整'      : 'maroon',  // 赤色
    '保全'          : 'lightpink', // 青色
    '故障'          : 'purple', // 黄色
    '段取'          : 'deeppink',  // 赤色
    '材料待ち'      : 'yellow', // 青色
    '清掃'          : 'black', // 黄色
    '刃具交換'      : 'blue',  // 赤色
    'TPM'           : 'coral', // 青色
    '伝達'          : 'springgreen', // 黄色
    '修正'          : 'olive',  // 赤色
    '選別'          : 'aquamarine', // 青色
    '運搬'          : 'greenyellow', // 黄色
    '切運'          : 'teal',  // 赤色
    '報記'          : 'burlywood', // 青色
    'その他'        : 'lemonchiffon', // 黄色
    '待機'          : 'blueviolet', //
    '量産'          : 'lime', //
    '電源'          : '#f7ab5a', //

};
google.charts.load('current', {'packages':['timeline']});
//google.charts.setOnLoadCallback(drawChart);
var line_list = Array();
var parts_list = Array();
var machine_list = Array();
var response;
var DB_REQUEST_URL = 'db_request.php';
var myChart;
function PHP_POST(url, data, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');

    // フォームに入力した値をリクエストとして設定
    xhr.send(data);

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200){
            var response = xhr.response;
            callback(response);  // コールバック関数を呼び出す
        }
    }
}

function division_update(){
    PHP_POST('UDP.php', 'line_list_update', function(resp) {
        resp.split('\n');
        var x = document.getElementById("message");
        if( resp === "成功" ){
            x.style.color = "red";                    
            x.innerHTML =  "リストを更新しました。" ;
            setTimeout(function(){
                x.innerHTML = "";
                location.reload();
            }, 2000);
            return;
        }
        else{
            x.style.color = "red";                    
            x.innerHTML =  "リストの更新に失敗しました。\n" ;
            setTimeout(function(){
                x.innerHTML = "";
            }, 3000);
            return;
        }
    });
}

function data_set(){
    var date = new Date();
    date.setDate(date.getDate());
    var dateString = date.toISOString().split('T')[0];
    document.getElementById("startDate").value = dateString + "T08:00:00";
    document.getElementById("endDate").value = dateString + "T17:00:00";
    document.getElementById("startDate_machine").value = dateString + "T08:00:00";
    document.getElementById("endDate_machine").value = dateString + "T17:00:00";
    $.ajax({
        url: 'line_list.php',
        type: 'GET',
        success: function(data){
            var _list = Array();
            _list = data.split('\n');
            // 各要素をさらに','で区切ります
            let finalData = [].concat(..._list).map(item => item.split(','));
            finalData.forEach(function(element){
                if(element.length >= 2){
                    let k;
                    for( k = 0; k < line_list.length; k++){
                        if( line_list[k][0] === element[1]){
                            line_list[k].push(element[0]);
                            break;
                        }
                    }
                    if( k === line_list.length ){
                        line_list.push([element[1],element[0]]);
                    }                            
                }
            })
            // HTML要素を取得
            var select = document.getElementById("sel_div");
            for( var i = 0; i < line_list.length; i++){
                // 新しいオプション要素を作成
                var option = document.createElement("option");
                // オプションの値とテキストを設定
                option.value = line_list[i][0];
                option.text = line_list[i][0];
                // ドロップダウンリストに新しいオプションを追加
                select.appendChild(option);
            }
            division_change(line_list[0][0]);
            // HTML要素を取得
            select = document.getElementById("sel_div_machine");
            var option = document.createElement("option");
            option.value = "";
            option.text = "";
            select.appendChild(option);
        for( var i = 0; i < line_list.length; i++){
                // 新しいオプション要素を作成
                option = document.createElement("option");
                // オプションの値とテキストを設定
                option.value = line_list[i][0];
                option.text = line_list[i][0];
                // ドロップダウンリストに新しいオプションを追加
                select.appendChild(option);
            }
        }
    });
}

function division_change(value){
    for( let i = 0; i < line_list.length; i++){
        if( value === line_list[i][0]){
            // HTML要素を取得
            var select = document.getElementById("sel_line");
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            for( var j = 1; j < line_list[i].length; j++){
                // 新しいオプション要素を作成
                var option = document.createElement("option");
                // オプションの値とテキストを設定
                option.value = line_list[i][j];
                option.text = line_list[i][j];
                // ドロップダウンリストに新しいオプションを追加
                select.appendChild(option);
            }
        }
    }
}

function division_change_machine(value){
    // HTML要素を取得
    var select = document.getElementById("sel_line_machine");
    while (select.firstChild) {
        select.removeChild(select.firstChild);
    }
    for( let i = 0; i < line_list.length; i++){
        if( value === line_list[i][0]){
            option = document.createElement("option");
            // オプションの値とテキストを設定
            option.value = "";
            option.text = "";
            // ドロップダウンリストに新しいオプションを追加
            select.appendChild(option);
            for( var j = 1; j < line_list[i].length; j++){
                    // 新しいオプション要素を作成
                    var option = document.createElement("option");
                    // オプションの値とテキストを設定
                    option.value = line_list[i][j];
                    option.text = line_list[i][j];
                    // ドロップダウンリストに新しいオプションを追加
                    select.appendChild(option);
                }
        }
    }
}

function line_change(value){
    for( let i = 0; i < line_list.length; i++){
        if( value === line_list[i][0]){
            // HTML要素を取得
            var select = document.getElementById("sel_line");
            while (select.firstChild) {
                select.removeChild(select.firstChild);
            }
            for( var j = 1; j < line_list[i].length; j++){
                // 新しいオプション要素を作成
                var option = document.createElement("option");
                // オプションの値とテキストを設定
                option.value = line_list[i][j];
                option.text = line_list[i][j];
                // ドロップダウンリストに新しいオプションを追加
                select.appendChild(option);
            }
        }
    }
}

function addProduct(productName, state, startTime, endTime) {
    // 製品がまだ存在しない場合は初期化
    if (!products[productName]) {
        products[productName] = {};
    }

    // 状態がまだ存在しない場合は初期化
    if (!products[productName][state]) {
        products[productName][state] = [];
    }

    // 開始時間と終了時間を追加
    products[productName][state].push({ startTime, endTime });
}

function send_db(query){           
    return new Promise((resolve, reject) => {
        PHP_POST(DB_REQUEST_URL, query, function(resp) {
            var resp_list = resp.split('\n');
            if( resp_list[0] === "成功" ){
                resolve(resp_list);
            }
            else{
                var x = document.getElementById("message");
                x.style.color = "red";                    
                x.innerHTML =  "データの取得に失敗しました。\n";
                setTimeout(function(){
                    x.innerHTML = "";
                }, 3000);
                reject(new Error("データの取得に失敗しました"));
            }
        });
    });
}

function operation_time_division(start) {
    // 通常・・・5分以内
    // チョコ停・・・10分以上
    // ドカ停・・・30分以上
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
                if(i === 34){
                    var test = 10;
                }
                var [break_time,break_start,break_end] = break_time_check(calc_start,calc_end);
                switch(break_time){
                    case 0:
                        break;
                    case 1:// 計算開始時刻が休憩時間内の時
                        // 稼働時間を休憩開始時間までで一旦切る
                        if( start_time < break_start){
                            operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                            
                        }
                        // 稼働開始時刻を休憩時間終了時刻に設定
                        start_time = break_end;
                        // 計算開始時刻を休憩終了時刻に設定
                        calc_start = break_end;
                        break;
                    case 2:// 計算終了時刻が休憩時間内の時
                        // 稼働開始時刻を休憩終了時刻に設定
                        start_time_change = true;
                        //start_time = break_end;
                        // 計算終了時刻は休憩開始時刻に設定
                        calc_end = break_start;
                        break;
                    case 3:// 計算開始時刻、計算終了時刻がともに休憩時間内となってしまう時
                        // 稼働時間を休憩開始時間までで一旦切る
                        if( start_time < break_start){
                            operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                        }
                        // 稼働開始時刻を休憩終了時刻に設定
                        start_time = break_end;
                        // 今回のデータを前回のデータに設定
                        last_data[2] = break_end;
                        continue;
                        break;
                    case 4:// 計算開始時刻と計算終了時刻の間に休憩時間を含む時 
                        // 今回参照したインデックスを再度参照させるフラグ
                        recalc = true;
                        // 計算終了時刻を休憩開始時刻に設定
                        calc_end = break_start;
                        // 稼働開始時刻を休憩終了時刻に設定
                        start_time_change = true;
                        break;
                    default:
                        break;
                }
                var time_delta = calc_end.getTime() - calc_start.getTime();

                if (time_delta < 300000) {
                    // 5分以内は通常稼働
                    if(start_time_change){
                        operation_time.push([start[i][0], "稼働時間", start_time, break_start]);
                        start_time = break_end;
                    }
                } else {
                    operation_time.push([start[i][0], "稼働時間", start_time, calc_start]);
                    if (time_delta < 600000) {
                        // 5分以上10分以内はチョコ停
                        operation_time.push([start[i][0], "チョコ停時間", calc_start, calc_end]);
                    } else {
                        // 10分以上はドカ停
                        operation_time.push([start[i][0], "ドカ停時間", calc_start, calc_end]);
                    }
                    if(start_time_change){
                        start_time = break_end;
                    }else{
                        start_time = calc_end;
                    }
                }
            } else {
                // 異なるIDの場合、現在の稼働時間を記録し、次のデータに移行
                operation_time.push([last_data[0], "稼働時間", start_time, last_data[2]]);
                last_data = start[i];
                start_time = start[i][1];
            }
            last_data = start[i];
        } else {
            last_data = start[i];
        }
        if(recalc){
            i--;
            last_data[2] = break_end;
        }
    }
    // 最後のデータの稼働時間を記録
    operation_time.push([start[0][0], "稼働時間", start_time, start[0][2]]);

    return operation_time;
}

async function data_disp(){
    var department = document.getElementById('sel_div').value;
    var line_name = document.getElementById('sel_line').value;
    var start_date = document.getElementById('startDate').value;
    var end_date = document.getElementById('endDate').value;
    var query = 'arg1=' + 
                `SELECT * FROM log_machine `+
                `INNER JOIN parts ON parts.parts_no LIKE CONCAT( log_machine.parts_no, '%') ` +
                `AND log_machine.line_name = parts.line_name WHERE ` +
                `log_machine.line_name = '${line_name}' AND log_machine.division = '${department}' ` +
                `AND log_machine.date BETWEEN '${start_date}' AND '${end_date}' ` +
                `ORDER BY log_machine.process_no DESC, log_machine.date DESC, log_machine.parts_no DESC;`;
    
    try {
        var data = await send_db(query);
        var show_data = data_calc(data);
        data_show(show_data);
    } catch (error) {
        console.error(error);
    }
}

async function detail_disp(parts,start,end){
    var department = document.getElementById('sel_div').value;
    var line_name = document.getElementById('sel_line').value;
    var start_date = start.toLocaleString();
    var end_date = end.toLocaleString();
    var query = 'arg1=' + 
                `SELECT * FROM log_machine `+
                `WHERE line_name = '${line_name}' AND division = '${department}' ` +
                `AND parts_no = '${parts}' AND date BETWEEN '${start_date}' AND '${end_date}' ` +
                `ORDER BY process_no DESC, date DESC;`;
    
    try {
        var data = await send_db(query);
        var show_data = detail_calc(data);
        drawdetailChart(show_data,start_date,end_date);
    } catch (error) {
        console.error(error);
    }
}

async function machine_data_disp(){
    var department = document.getElementById('sel_div_machine').value;
    var line_name = document.getElementById('sel_line_machine').value;
    var start_date = document.getElementById('startDate_machine').value.replace('T',' ') + ':00';
    var end_date = document.getElementById('endDate_machine').value.replace('T',' ') + ':00';

    var now = new Date();
    if(new Date(end_date) > now){
        var nowstring = now.toLocaleString();
        end_date = now.toLocaleString().split('/').join('-');
    }

    if(department === ""){
        department = '%%';
    }
    if(line_name === ""){
        line_name = '%%';
    }

    // var query = 'arg1=' + 
    //             `SELECT * FROM log_machine `+
    //             `WHERE  line_name LIKE '${line_name}' AND division LIKE '${department}' ` + 
    //             `AND date BETWEEN '${start_date}' AND '${end_date}' ` +
    //             `ORDER BY task ASC, line_name ASC, division ASC, machine_no ASC, date DESC;`;

    var query = 'arg1=' + 
                `SELECT * FROM log_machine `+
                `WHERE  line_name LIKE '${line_name}' AND division LIKE '${department}' ` + 
                `AND date BETWEEN '${start_date}' AND '${end_date}' ` +
                `ORDER BY  division ASC, line_name ASC, machine_no ASC, task ASC, date DESC ;`;

    var data = await send_db(query);
    var show_data = machine_data_calc(data,start_date,end_date);
    machine_data_show(show_data,start_date,end_date);
}

function data_calc(data) {
    // 品番毎の連想配列を作成
    var productData = {};
    var in_operation_start = [];
    var comp_flg = false;
    var productNumber;

    // データの集計処理
    for (var i = 1; i < data.length - 1; i++) {
        var row = data[i].split(',');
        productNumber = row[6]; // 品番
        var date = row[3].split(" ")[0]; // 日付
        var logTime = row[3].split(" ")[1]; // 開始時刻
        var type = parseInt(row[37]); // 製品の生産タイプ 1:一個流し
        var count_type = parseInt(row[10]); // ｶｳﾝﾄﾀｲﾌﾟ
        var productionCount = parseInt(row[11]); // 生産個数
        var task = row[1]; // タスク
        var state = parseInt(row[2]); // 状態

        // 品番が連想配列に存在しない場合、新しいエントリを作成
        if (!productData[date]) {
            productData[date] = {};
        }
        if (!productData[date][productNumber]) {
            var final_process = "";
            // タイプが1は一個流しラインのため、最終工程のデータのみを計算に使用する。
            if (type) {
                for (let j = 15; j < 35; j++) {
                    if (row[j] != "") {
                        final_process = row[j];
                    } else {
                        break;
                    }
                }
            } else {
                final_process = row[0];
            }
            // 日付の配列を作成し、開始時刻、終了時刻、生産個数を記録
            productData[date][productNumber] = {
                "startTime": logTime,
                "endTime": logTime,
                "productionCount": productionCount,
                "final_process": final_process
            };
            comp_flg = false;
        }

        var final_flg = (row[0] === productData[date][productNumber]["final_process"]);
        let start_time = new Date(`1990-1-1 ${productData[date][productNumber]["startTime"]}`);
        let log_time = new Date(`1990-1-1 ${logTime}`);
        let count = productData[date][productNumber]["productionCount"];

        // 開始時刻の更新
        if (start_time > log_time) {
            productData[date][productNumber]["startTime"] = logTime;
        }

        // 生産個数の更新
        if (count_type) {
            if (count < productionCount) {
                productData[date][productNumber]["productionCount"] = productionCount;
            }
        } else {
            if (task === "加工完了" && state && final_flg) {
                productData[date][productNumber]["productionCount"]++;
            }
        }

        // 運転時間、停止時間の切り分け
        if (final_flg && task === "運転中") {
            log_time = new Date(row[3]);
            if (!state) {
                in_operation_start.push([productNumber, row[3], row[3]]);
                comp_flg = true;
            } else {
                if (comp_flg) {
                    in_operation_start[in_operation_start.length - 1][1] = row[3];
                } else {
                    in_operation_start.push([productNumber, row[3], row[3]]);
                }
                comp_flg = false;
            }
        }
    }

    var graph = document.getElementById('timeline');
    if(in_operation_start.length){
        // 運転時間、チョコ停、ドカ停の切り分け
        var operation_division = operation_time_division(in_operation_start);
        // グラフの描画
        drawChart(operation_division, graph);
        graph.children[0].style.height = '100px';
    }else{
        message_disp('自動運転の実績がありません。','red',3000,document.getElementById('graph_area'));
        var chart = document.getElementById('timeline');
        var detailchart = document.getElementById('detailtimeline');
        chart.innerHTML = '';
        detailchart.innerHTML = '';
    }

    return productData;
}

function detail_calc(data) {
    // タスク毎の連想配列を作成
    var detailData = {};
    var comp_flg = false;

    for (var i = 1; i < data.length - 1; i++) {
        var row = data[i].split(',');
        var task = row[1];  // タスク
        var state = parseInt(row[2]); // 状態
        var logTime = row[3]; // 時刻

        // '加工完了', '運転準備', '量産'のタスクは無視
        if (task === '加工完了' ) {
            continue;
        }

        // タスクが連想配列に存在しない場合、新しいエントリを作成
        if (!detailData[task]) {
            detailData[task] = {};
        }
        if (!detailData[task][row[0]]) {
            detailData[task][row[0]] = [];
            comp_flg = false;
        }

        var length = detailData[task][row[0]].length - 1;

        if (!state) {
            // 状態がfalseの場合、新しい時間範囲を開始
            detailData[task][row[0]].push([logTime, logTime]);
            comp_flg = true;
        } else {
            // 状態がtrueの場合、既存の時間範囲を更新
            if (comp_flg) {
                detailData[task][row[0]][length][0] = logTime;
            } else {
                detailData[task][row[0]].push([logTime, logTime]);
            }
            comp_flg = false;
        }
    }

    return detailData;
}



function machine_data_calc(data,start_date,end_date){
    // タスク毎の連想配列を作成
    var detailData = {};
    var comp_flg = false;
    var before_machine = "";
    var last_end_date = null;
    for (var i = 1; i < data.length - 1; i++) {
        var row = data[i].split(',');
        var machine = row[0];
        var task = row[1];  // タスク
        var state = parseInt(row[2]); // 状態
        var logTime = row[3]; // 時刻
        if(before_machine != machine){
            comp_flg = false;
        }

        // '加工完了', '運転準備', '量産'のタスクは無視
        if (task === '加工完了') {
            continue;
        }
        
        // タスクが連想配列に存在しない場合、新しいエントリを作成
        if (!detailData[machine]) {
            detailData[machine] = {};
        }

        
        if (!detailData[machine][task]) {
            detailData[machine][task] = [];
            comp_flg = false;
            last_end_date = null;
        }

       

        var length = detailData[machine][task].length - 1;
        if( length < 0){
            length = 0;
        }

        

        if(machine === 'NCAG-027' && task === '運転中' && length === 135){
            let b = 1;
        }

        if (!state) {
            // 状態がfalseの場合、新しい時間範囲を開始
            detailData[machine][task].push([logTime, logTime]);
            comp_flg = true;

           
        } else {
            // 状態がtrueの場合、既存の時間範囲を更新
            if (comp_flg) {
                detailData[machine][task][length][0] = logTime;
            } else {
                var _date;
                if(last_end_date){
                    _date = last_end_date;              
                }else{
                    _date = end_date;
                }
                detailData[machine][task].push([logTime, _date]);
            }
            last_end_date = logTime;
            comp_flg = false;
        }
        before_machine = machine;
        if(detailData[machine][task][length][0] > detailData[machine][task][length][1]){
            let a = 1;
        }
    }

    return detailData;

}

function data_show(data_list){
    // テーブルの参照を取得
    var table = document.getElementById("myTable");
    // テーブルの行数を取得
    var rowCount = table.rows.length;

    // 先頭行以外を削除
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    for(let key of Object.keys(data_list)){
        for(let sub_key of Object.keys(data_list[key])){
            if(data_list[key][sub_key]['productionCount']){
                // 新しい行を作成
                var row = table.insertRow(-1);

                // 新しいセルを作成
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);

                // セルにテキストを追加
                cell1.innerHTML = sub_key;
                cell2.innerHTML = data_list[key][sub_key]['startTime'];
                cell3.innerHTML = data_list[key][sub_key]['endTime'];
                cell4.innerHTML = data_list[key][sub_key]['productionCount'];
            }
        }
    }
}

// グラフ描画関数
function drawChart(data, graph) {
    // グラフ描画用のコンテナを取得
    var container = graph;
    // Google Visualization Timelineのインスタンスを作成
    var chart = new google.visualization.Timeline(container);
    // DataTableのインスタンスを作成
    var dataTable = new google.visualization.DataTable();

    // DataTableのカラムを定義
    dataTable.addColumn({ type: 'string', id: '設備ID' });
    dataTable.addColumn({ type: 'string', id: '状態' });
    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
    dataTable.addColumn({ type: 'date', id: '開始' });
    dataTable.addColumn({ type: 'date', id: '終了' });

    // データをDataTableに追加
    for (let i = 0; i < data.length; i++) {
        var color = colors[data[i][1]] || '#dddddd'; // 状態に応じた色を設定
        dataTable.addRows([
            [data[i][0], data[i][1], color, new Date(data[i][2]), new Date(data[i][3])]
        ]);
    }

    // グラフ選択時のイベントリスナーを追加
    google.visualization.events.addListener(chart, 'select', function() {
        var selection = chart.getSelection();
        if (selection.length > 0) {
            var row = selection[0].row;
            var parts = dataTable.getValue(row, 0);
            var _str = dataTable.getValue(row, 3);
            var _end = dataTable.getValue(row, 4);
            // 選択したデータの詳細を表示
            detail_disp(parts, _str, _end);
        }
    });
    var options = {
        hAxis: {
            format: 'MM/dd\nHH:mm' // 任意のフォーマットを指定
        }
    };
    // グラフを描画
    chart.draw(dataTable,options);
}

// グラフ描画
function drawdetailChart(data) {
    var container = document.getElementById('detailtimeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'id' });
    dataTable.addColumn({ type: 'string', id: '状態' });
    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
    dataTable.addColumn({ type: 'date', id: '開始' });
    dataTable.addColumn({ type: 'date', id: '終了' });

    for(let key of Object.keys(data)){
        for(let sub_key of Object.keys(data[key])){
            var color = colors[key] || '#dddddd'; // デフォルト色
            for(let task_date of data[key][sub_key]){
                var start_date = new Date(task_date[0]);
                var end_date = new Date(task_date[1]);
                dataTable.addRows([
                    [ sub_key,key, color, start_date, end_date ]
                    ]);            
            }
        }
    }
    var options = {
        hAxis: {
            format: 'HH:mm:ss', // 任意のフォーマットを指定
            gridlines: {
                count: 5 // ラベルを 2 つ飛ばしで表示        
            }
        }
    };
    chart.draw(dataTable,options);
}


function machine_data_show(data, calc_start, calc_end) {
    var workSeconds = calculateWorkSeconds(calc_start, calc_end);
    var container = document.getElementById('machinetimeline');
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();

    dataTable.addColumn({ type: 'string', id: 'id' });
    dataTable.addColumn({ type: 'string', id: '状態' });
    dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
    dataTable.addColumn({ type: 'date', id: '開始' });
    dataTable.addColumn({ type: 'date', id: '終了' });

    // 状態の固定順序を指定
    var orderedStates = ["運転準備","運転中","異常","加工完了",
    "朝礼","寸法調整","保全","故障","段取","材料待ち","清掃",
    "刃具交換","TPM","伝達","修正","選別","運搬","切運",
    "報記","その他","量産", "電源", "待機"];

    //Playground
    for (let key of Object.keys(data)) {
        let lowestStartDate = '9999-12-31T23:59:59'; 
        for (let sub_key of orderedStates) {
            if (data[key][sub_key]) {
                for (let task_date of data[key][sub_key]) {
                    if (task_date[0] < lowestStartDate) {
                        lowestStartDate = task_date[0]; // Update lowest start date
                    }
                }
            }
        }
        // Ensure 'collect_standby_data' is an array and push the lowest start date
        if (!data[key]['待機']) {
            data[key]['待機'] = [];
        }
        data[key]['待機'].push([calc_start, lowestStartDate]);
    }

    //End Playground

    var lowestStartDate = new Date(8640000000000000);
    for (let key of Object.keys(data)) {
        for (let sub_key of orderedStates) {
            if (data[key][sub_key]) {
                var color = colors[sub_key] || '#dddddd'; // デフォルト色
                for (let task_date of data[key][sub_key]) {
                    var start_date = new Date(task_date[0]);
                    var end_date = new Date(task_date[1]);
                    dataTable.addRows([
                        [key, sub_key, color, start_date, end_date]
                    ]);
                }
            }
        }
    }



    var options = {
        hAxis: {
            format: 'HH:mm:ss', // 任意のフォーマットを指定
            gridlines: {
                count: 5 // ラベルの数を指定
            }
        }
    };

    chart.draw(dataTable, options);

    // draw_bargraph 関数を呼び出して、棒グラフを描画
    draw_bargraph(data, workSeconds);
}



function calculateTimeDifference(startDate, endDate) {
    let diffInMillis = Math.abs(endDate - new Date(startDate));
    let hours = Math.floor(diffInMillis / (1000 * 60 * 60));
    let minutes = Math.floor((diffInMillis % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((diffInMillis % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`; // 時間差をフォーマット
}







// function machine_data_show(data, calc_start, calc_end) {
//     var workSeconds = calculateWorkSeconds(calc_start, calc_end);
//     var container = document.getElementById('machinetimeline');
//     var chart = new google.visualization.Timeline(container);
//     var dataTable = new google.visualization.DataTable();

//     dataTable.addColumn({ type: 'string', id: 'id' });
//     dataTable.addColumn({ type: 'string', id: '状態' });
//     dataTable.addColumn({ type: 'string', id: 'style', role: 'style' });
//     dataTable.addColumn({ type: 'date', id: '開始' });
//     dataTable.addColumn({ type: 'date', id: '終了' });

//     // 状態の固定順序を指定
//     var orderedStates = ["運転準備","運転中","異常","加工完了",
//     "朝礼","寸法調整","保全","故障","段取","材料待ち","清掃",
//     "刃具交換","TPM","伝達","修正","選別","運搬","切運",
//     "報記","その他","量産"];

//     for (let key of Object.keys(data)) {
//         for (let sub_key of orderedStates) {
//             if (data[key][sub_key]) {
//                 var color = colors[sub_key] || '#dddddd'; // デフォルト色
//                 for (let task_date of data[key][sub_key]) {
//                     var start_date = new Date(task_date[0]);
//                     var end_date = new Date(task_date[1]);
//                     dataTable.addRows([
//                         [key, sub_key, color, start_date, end_date]
//                     ]);
//                 }
//             }
//         }
//     }

//     var options = {
//         hAxis: {
//             format: 'HH:mm:ss', // 任意のフォーマットを指定
//             gridlines: {
//                 count: 5 // ラベルの数を指定
//             }
//         }
//     };

//     chart.draw(dataTable, options);

//     // draw_bargraph 関数を呼び出して、棒グラフを描画
//     draw_bargraph(data, workSeconds);
// }

function break_time_check(start_time,end_time) {

    // 休憩時間を定義
    const breaks = [
        ['10:00','10:10'],
        [ '12:10', '12:50' ],
        [ '14:50', '15:00' ],
        [ '17:00', '17:05' ],
        [ '19:05', '19:15' ],
        [ '21:15', '21:55' ],
        [ '23:55', '23:59' ],
        [ '00:00', '00:05' ]
    ];

    const start = new Date(start_time);
    const end = new Date(end_time);
    var breakStart = new Date(start);
    var breakEnd = new Date(start);
    for( let i = 0; i < breaks.length; i++){
        breakStart.setHours(parseInt(breaks[i][0].split(':')[0]),parseInt(breaks[i][0].split(':')[1]),0);
        breakEnd.setHours(parseInt(breaks[i][1].split(':')[0]),parseInt(breaks[i][1].split(':')[1]),0);

        if( start >= breakStart && start < breakEnd && end > breakEnd){
            return [1,breakStart,breakEnd];//開始時刻が休憩時間中の時は稼働時間を休憩時間の開始で切り、休憩時間の終了を開始時刻にする
        }else if(start < breakStart && end >= breakStart && end < breakEnd){
            return [2,breakStart,breakEnd];//終了時刻が休憩時間の時は休憩時間の開始を終了時刻にする
        }else if(start >= breakStart && end < breakEnd ){
            return [3,breakStart,breakEnd];//開始時刻と終了時刻が休憩時間の中に納まってしまう時は稼働時間を休憩時間の開始で切り、次の稼働開始時刻を休憩時間の終了時刻とする
        }else if(start <= breakStart && end > breakEnd ){
            return [4,breakStart,breakEnd];//開始時刻から終了時刻の中に休憩時間を挟む時は開始時刻から休憩開始時刻を計算し、休憩終了時刻から終了時刻までを計算する。
        }
    }

    return [0,start,end];
}

// データを秒数に変換する関数
function toSeconds(dateAndTime) {
    var parts = dateAndTime.split(' ');
    var dateParts = parts[0].split('-');
    var timeParts = parts[1].split(':');
    var date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0], timeParts[1], timeParts[2]);
    return date.getTime() / 1000;
}



function draw_bargraph(data,workSeconds){
    // データセットを作成
    var datasets = [];
    var machine_list = [];
    var state_date = {};
    var machine_ready = {};
    // state_date['電源OFF'] = [];
    // state_date['待機'] = [];
    for (var key of Object.keys(data)) {
        machine_list.push(key);
        for (var subkey of Object.keys(data[key])) {
            if(subkey === '量産'){
                continue;
            }
            if(!state_date[subkey]){
                state_date[subkey]= [];
            }
        }
    }
    
    

    //Playground

    var sec_max = 0;
    for (var key of Object.keys(state_date)) {
        for (var machine_key of Object.keys(data)) {
            var durations = 0;
            if (data[machine_key].hasOwnProperty(key)) {
                var times = data[machine_key][key];
                for (let time of times) {
                    var start = toSeconds(time[0]);
                    var end = toSeconds(time[1]);
                    durations += (Math.abs(end - start) / workSeconds) * 100;
                }
            }
            state_date[key].push(parseFloat(durations.toFixed(2)));
        }
    }


    


    
    //Normalize the durations to ensure the sum of percentages for each machine is 100%
    // var machine_totals = {};
    // for (var machine_key of Object.keys(data)) {
    //     machine_totals[machine_key] = 0;
    //     for (var key of Object.keys(state_date)) {
    //         machine_totals[machine_key] += state_date[key][machine_list.indexOf(machine_key)];
    //     }
    // }
    
    // for (var key of Object.keys(state_date)) {
    //     for (var i = 0; i < machine_list.length; i++) {
    //         if (machine_totals[machine_list[i]] > 0) {
    //             state_date[key][i] = (state_date[key][i] / machine_totals[machine_list[i]]) * 100;
    //             state_date[key][i] = parseFloat(state_date[key][i].toFixed(2)); // Round to 2 decimal places
    //         }
    //     }
    // }

       // 21-10-2024  Start
        // Define arrays to store the differences
        var powerData = [];
        var ReadyData = [];
        var operationData = [];
        var errorData = [];
        var differences = [];
        var calculatedReadyTime = [];
        
        // Iterate over the keys in the state_date object
        for (var key in state_date) {
            if (state_date.hasOwnProperty(key)) {
                // Access the values of each key
                var values = state_date[key];
        
                // Check if the key is 待機 and store the values
                if (key === "電源") {
                    powerData = values;
                }

                // Check if the key is 運転中 and store the values
                if (key === "運転準備") {
                    ReadyData = values;
                }

                //Operation Data
                if (key === "運転中") {
                    operationData = values;
                }

                if (key === "異常") {
                    errorData = values;
                }
            }
        }

        // // Calculate the differences for all possible positions
        for (var i = 0; i < Math.min(powerData.length); i++) {
            var difference = powerData[i] - ReadyData[i];
            if (difference < 0) {
                difference = 0; // Replace negative difference with 0
            }
            differences.push(parseFloat(difference.toFixed(2)));

            var readyCalculation = ReadyData[i] - (operationData[i] + errorData[i])
            if (readyCalculation < 0) {
                readyCalculation = 0; // Replace negative difference with 0
            }
            calculatedReadyTime.push(parseFloat(readyCalculation.toFixed(2)));
        }
    

         for (var key in state_date) {
                if (state_date.hasOwnProperty(key)) {
                    if (key === "電源") {
                        state_date["電源"] = [];
                        differences.forEach((diff, index) => {
                            
                            // Assuming you want to update the same positions as in differences
                            state_date["電源"][index] = parseFloat(diff < 0 ? 0 : diff);
                        });
                    }


                    if (key === "運転準備") {
                        state_date["運転準備"] = [];
                        calculatedReadyTime.forEach(diff => {
                            state_date["運転準備"].push(parseFloat(diff < 0 ? 0 : diff));
                        });
                    }
                }
         }
        


    //End

    
    var cnt = 0; // Reset counter for '待機'
    state_date['待機'] = [];
    for (var machine_key of Object.keys(data)) {
        state_date['待機'].push(100);
        for (var state_key of Object.keys(state_date)) {
            if (state_key != '運転準備' && state_key != '待機') {
                var newValue = state_date['待機'][cnt];
                newValue -= state_date[state_key][cnt];
                if (newValue < 0) {
                    newValue = 0;
                }
                state_date['待機'][cnt] = parseFloat(newValue.toFixed(2));
            }
        }
        cnt++;
    }
    

    for(var key of Object.keys(state_date)){
        if(key != '運転準備' ){
            
            var color = colors[key] || '#dddddd'; // デフォルト色

            datasets.push({
                label: key,
                data: state_date[key],
                backgroundColor: color,// === '異常' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)',
                borderColor: key === '異常' ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            });
        }
    }
    // グラフを作成
    var ctx = document.getElementById('myChart').getContext('2d');
    if(myChart){
        myChart.destroy();
    }
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: machine_list,
            datasets: datasets
        },
        options: {
            plugins: {
                stacked100: { enable: true }
            },
            title: {                           //タイトル設定
                display: true,                 //表示設定
                text: '順位上昇達成率'                //ラベル
            },
            scales: {
                x: {
                        stacked: true
                    },
                y: {
                    stacked: true,
                    display: true,             //表示設定
                    scaleLabel: {              //軸ラベル設定
                       display: true,          //表示設定
                       labelString:'%',
                       fontSize: 18               //フォントサイズ
                    },
                    ticks: {                      //最大値最小値設定
                        min: 0,                   //最小値
                        max: 100,                  //最大値
                        fontSize: 18,             //フォントサイズ
                        stepSize: 20              //軸間隔
                    }
                }
            },
            legend: {
                display: true,
              }

        }
    });
}




function calculateWorkSeconds(startDate, endDate) {
    // 開始日と終了日をDateオブジェクトに変換

    //previous code
    let start = new Date(startDate);
    let end = new Date(endDate);

    
    // 休憩時間を設定
    let breakTimes = [
        { start: '10:00', end: '10:10' },
        { start: '12:10', end: '12:50' },
        { start: '14:50', end: '15:00' },
        { start: '17:00', end: '17:05' },
        { start: '19:05', end: '19:15' },
        { start: '21:15', end: '21:55' },
        { start: '23:55', end: '00:05' }
    ];

    // 開始日と終了日の差を日数で計算
    let diffInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

    // 各休憩時間を秒に変換（日数を考慮）
    let totalBreakTimeInSeconds = 0;
    for (let i = 0; i < breakTimes.length; i++) {
        let breakStartTime = new Date(startDate.split(' ')[0] + 'T' + breakTimes[i].start + ':00');
        let breakEndTime = new Date(startDate.split(' ')[0] + 'T' + breakTimes[i].end + ':00');
        
        if (breakEndTime < breakStartTime) {
            breakEndTime.setDate(breakEndTime.getDate() + 1);  // 翌日にまたがる場合
        }
        totalBreakTimeInSeconds += (breakEndTime - breakStartTime) / 1000 * diffInDays;
        
        if(start >= breakStartTime && start < breakEndTime && end > breakEndTime){
            totalBreakTimeInSeconds += (breakEndTime - start) /1000;
        }
        if(start < breakStartTime && end >= breakStartTime && end < breakEndTime){
            totalBreakTimeInSeconds += (end - breakStartTime) /1000;
        }
        if(start < breakStartTime && end > breakEndTime){
            totalBreakTimeInSeconds += (breakEndTime - breakStartTime) / 1000;
        }
    }

    // 開始日と終了日の差を秒で計算
    let diffInSeconds = (end - start) / 1000;
    
    // 休憩時間を引く
    let workSeconds = diffInSeconds - totalBreakTimeInSeconds;
    
   return workSeconds;
}

function message_disp(text,color,timer,parentObject){
    var x = document.createElement("p");
    //var x = document.getElementById("message");
    x.style.color = color;
    x.innerHTML = text;
    parentObject.appendChild(x);
    setTimeout(function(){
        x.innerHTML = "";
        parentObject.removeChild(x);
    }, timer);    
}



