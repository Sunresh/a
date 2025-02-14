google.charts.load('current', {'packages':['timeline']});
//google.charts.setOnLoadCallback(drawChart);
var line_list = Array();
var response;
var DB_REQUEST_URL = 'db_request.php';
var operation_time = [];

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

function data_disp(){
    var department = document.getElementById('sel_div').value;
    var line_name = document.getElementById('sel_line').value;
    var start_date = document.getElementById('startDate').value;
    var end_date = document.getElementById('endDate').value;
    operation_time = [];
    // var query = 'arg1=' + `SELECT DISTINCT parts_no FROM log_machine WHERE 
    //              line_name = '${line_name}' AND division = '${department}' AND  
    //              date BETWEEN '${start_date}' AND '${end_date}';`;
    var query = 'arg1=' + `SELECT * FROM log_machine WHERE 
                 line_name = '${line_name}' AND division = '${department}' AND  
                 date BETWEEN '${start_date}' AND '${end_date}'
                 ORDER BY date DESC, process_no DESC, parts_no DESC;`;
    PHP_POST(DB_REQUEST_URL, query, function(resp) {
        var x = document.getElementById("message");
        var resp_list = resp.split('\n');
        if( resp_list[0] === "成功" ){
            var parts_data = data_calc(resp_list);
            console.log(parts_data);
            data_show(parts_data);
        }
        else{
            x.style.color = "red";                    
            x.innerHTML =  "データの取得に失敗しました。\n" ;
            setTimeout(function(){
                x.innerHTML = "";
            }, 3000);
            return;
        }
    });

}

function operation_time_division(parts_name,start,end){
    // 通常・・・5分以内
    // チョコ停・・・10分以上
    // ドカ停・・・30分以上
    var start_time = start[start.length-1];
    var end_time = 0;
    for(let i = start.length -1; i >= 1; i--){
        start_date = new Date(start[i-1].split(' ')[0] + 'T' + start[i-1].split(' ')[1] + 'Z');
        end_date = new Date(end[i].split(' ')[0] + 'T' + end[i].split(' ')[1] + 'Z');
        var time_delta = start_date.getTime() - end_date.getTime();
        if( time_delta < 300000 ){
            end_time = end[i-1];
        }else if( time_delta < 600000 ){
            operation_time.push([parts_name,"稼働時間",start_time,end[i]]);
            operation_time.push([parts_name,"チョコ停時間",end[i],start[i-1]]);
            operation_time.push([parts_name,"チョコ停時間",end[i],start[i-1]]);
            start_time = start[i-1];
        }else{
            operation_time.push([parts_name,"稼働時間",start_time,end[i]]);
            operation_time.push([parts_name,"ドカ停時間",end[i],start[i-1]]);
            start_time = start[i-1];
        }
    }
    operation_time.push([parts_name,"稼働時間",start_time,end[0]]);
    return operation_time;
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

// データベースから引き出したデータの集計
function data_calc(data){
    let products = {};
    var parts = [];
    var count = 0;
    var data_list = data[1].split(",");
    var count_type = parseInt(data_list[9],10);
    var final_process_machine = data_list[0];
    var in_operation_start = {};
    var in_operation_end = {};
    parts.push([data_list[6],data_list[3],data_list[3],0]);
    in_operation_start[data_list[6]] = [];
    in_operation_end[data_list[6]] = [];
    
    // データを1行ずつ処理していく
    for(let i = 2; i < data.length-1; i++){
        data_list = data[i].split(",");
        count_type = parseInt(data_list[10],10);
        now_count = parseInt(parts[count][3],10);
        data_counter = parseInt(data_list[11],10);
        // 品番が変わったら配列を追加する。
        if(parts[count][0] != data_list[6]){
            parts.push([data_list[6],data_list[3],data_list[3],0]);
            in_operation_start[data_list[6]] = [];
            in_operation_end[data_list[6]] = [];
            final_process_machine = data_list[0];
            count++;
        }
        // 開始時間の更新
        parts[count][1] = data_list[3];
        
        // 生産個数の更新
        // カウントタイプが１(カウンタデータを設備から読み取るタイプ)の処理
        if( count_type === 1){
            if( now_count < data_counter ){
                parts[count][3] = data_counter;;
            }
        }

        // カウントタイプが０(最終工程の加工完了信号数をカウントするタイプ)の処理
        else{
            if(data_list[1] === "加工完了" && data_list[2] === "1"
               && final_process_machine === data_list[0]){
                parts[count][3]++;
            }
        }
        
        // 運転時間、停止時間の切り分け
        if( data_list[0] === final_process_machine && data_list[1] === "運転中" ){
            if( data_list[2] === "0"){
                in_operation_end[data_list[6]].push(data_list[3]);
            }else{
                in_operation_start[data_list[6]].push(data_list[3]);
            }
        }
    }

    // 運転状況グラフの作成
    for(let i = 0; i < parts.length; i++){
        var parts_name = parts[i][0];
        // 配列の長さ合わせ
        if( in_operation_start[parts_name].length < in_operation_end[parts_name].length){
            in_operation_start[parts_name].push(in_operation_start[parts_name][0]);
        }else if( in_operation_start[parts_name].length > in_operation_end[parts_name].length){
            in_operation_end[parts_name].unshift(in_operation_start[parts_name][0]);
        }
        // 運転時間、チョコ停、ドカ停の切り分け
        var operation_division = operation_time_division(parts_name,in_operation_start[parts_name]
                                                        ,in_operation_end[parts_name]);
        //chart_data.push(operation_division);
    }

    // グラフ描画
    drawChart(operation_division);

    return parts;
}

// 生産情報の表示
function data_show(data_list){
    // テーブルの参照を取得
    var table = document.getElementById("myTable");
    // テーブルの行数を取得
    var rowCount = table.rows.length;

    // 先頭行以外を削除
    for (var i = rowCount - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    for(let i = 0; i < data_list.length; i++){
        // 新しい行を作成
        var row = table.insertRow(-1);
        for( let j = 0; j < 4; j++){
            // 新しいセルを作成
            var cell = row.insertCell(j);
            // セルにテキストを追加
            cell.innerHTML = data_list[i][j];
        }
    }
}

// グラフ描画
function drawChart(data) {
    var container = document.createElement('div');
    container.id = 'graph';
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();
    
    // divのスタイルを設定
    container.style.width = '700px';  // Viewportの幅に合わせる
    container.style.height = '100px'; // Viewportの高さに合わせる
    
    dataTable.addColumn({ type: 'string', id: '設備ID' });
    dataTable.addColumn({ type: 'string', id: '状態' });
    dataTable.addColumn({ type: 'date', id: '開始' });
    dataTable.addColumn({ type: 'date', id: '終了' });

    for(let i = 0; i < data.length; i++){
        dataTable.addRows([
        [ data[i][0], data[i][1], new Date(data[i][2]), new Date(data[i][3]) ]
        ]);
    }
    //chart.style.width = '100%';
    chart.draw(dataTable);

    document.body.appendChild(container);
}