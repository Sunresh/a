<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="OWM_main_new2.js"></script>
    <title>ライン情報表示</title>
</head>
<body onload="data_set()">
<div class="tab-wrap">
    <input id="TAB-01" type="radio" name="TAB" class="tab-switch" checked="checked" />
    <label class="tab-label" for="TAB-01">ライン情報表示</label>
    <div class="tab-content">
        <div1>
            <button class="nomal_btn" type="button" onclick="division_update()">ﾘｽﾄ更新</button>
            <p><!-- <p class="label1">部署</p> -->
            部署 <select class="select1" id="sel_div" onchange="division_change(this.value)">>
                <?php echo $division_list; ?>
            </select>
            <!-- <p class="label1">ライン名</p> -->
            ライン名 <select class="select1" id="sel_line" >
            </select>
        </div1>
        <div2>
            <p><!-- <p class="label1">集計開始日</p> -->
            集計開始日 <input type="datetime-local" id="startDate">
            <!-- <p class="label1">集計終了日</p> -->
            集計終了日 <input type="datetime-local" id="endDate">
            <button class="nomal_btn" type="button" onclick="data_disp()">表示</button>
        </div2>
        <div3 id="graph_area"> 
            <table id="myTable" border="1">
                <tr>
                    <th>品番</th>
                    <th>開始日</th> 
                    <th>終了日</th>
                    <th>生産個数</th>
                </tr>
            </table>
        </div3>
        <div3>
            <div id="timeline" style="height: 180px;"></div>
            <div id="detailtimeline" style="height: 180px;"></div>
        </div3>
        <p id="message"></p>
    </div>
    <input id="TAB-02" type="radio" name="TAB" class="tab-switch" />
    <label class="tab-label" for="TAB-02">設備情報表示</label>
    <div class="tab-content">
        <div1>
            部署 <select class="select1" id="sel_div_machine" onchange="division_change_machine(this.value)">>
                <?php echo $division_list; ?>
            </select>
            ライン名 <select class="select1" id="sel_line_machine" >
            </select>
        </div1>
        <div2>
            <p><!-- <p class="label1">集計開始日</p> -->
            集計開始日 <input type="datetime-local" id="startDate_machine">
            <!-- <p class="label1">集計終了日</p> -->
            集計終了日 <input type="datetime-local" id="endDate_machine">
            <button class="nomal_btn" type="button" onclick="machine_data_disp()">表示</button>
        </div2>
        <div id="machinetimeline" style="height: 180px;"></div>
        <canvas id="myChart"></canvas>
        <p id="message"></p>
    </div>
    <!-- <input id="TAB-03" type="radio" name="TAB" class="tab-switch" />
    <label class="tab-label" for="TAB-03">作業者情報表示</label>
    <div class="tab-content">
        コンテンツ 3
    </div> -->
</div>

</body>
</html>
<style>
.tab-wrap {
  display: flex;
  flex-wrap: wrap;
  margin:20px 0;
}
.tab-wrap:after {
  content: '';
  width: 100%;
  height: 3px;
  background: DeepSkyBlue;
  display: block;
  order: -1;
}
.tab-label {
  color: White;
  background: LightGray;
  font-weight: bold;
  text-shadow: 0 -1px 0 rgba(0,0,0,.2);
  white-space: nowrap;
  text-align: center;
  padding: 10px .5em;
  order: -1;
  position: relative;
  z-index: 1;
  cursor: pointer;
  border-radius: 5px 5px 0 0;
  flex: 1;
}
.tab-label:not(:last-of-type) {
  margin-right: 5px;
}
.tab-content {
  width: 100%;
  height: 0;
  overflow: hidden;
  opacity: 0;
}
/* アクティブなタブ */
.tab-switch:checked+.tab-label {
  background: DeepSkyBlue;
}
.tab-switch:checked+.tab-label+.tab-content {
  height: auto;
  overflow: auto;
  padding: 15px;
  opacity: 1;
  transition: .5s opacity;
  box-shadow: 0 0 3px rgba(0,0,0,.2);
}
/* ラジオボタン非表示 */
.tab-switch {
  display: none;
}
/* .select1 {
    display: inline-block;
    padding: 0.5% 2%;
    margin-left: 1%;
    align-items: center;
    text-align: center;
    font-size: 1.5vw;
    background-color: rgb(255, 255, 255);
}
.select2 {
    display: inline-block;
    margin-left: 1%;
    align-items: center;
    text-align: center;
    font-size: 1.5vw;
    background-color: rgb(255, 255, 255);
    width: 5%;
}
.label1 {
    display: inline-block;
    margin-left: 2%;
    align-items: center;
    text-align: center;
    font-size: 1.5vw;
    background-color: rgb(255, 255, 255);
    width: 7%;
}
.nomal_btn {
    display: inline-block;
    padding: 2% 2%;
    margin-left: 2%;
    align-items: center;
    text-align: center;
    font-size: 1.5vw;
    background-color: rgb(184, 184, 184);
}
.timeline {
    width:100%;
}
.myTable {
    width:100%;
}
div1 {
    display: flex;
    width: 100%;
    height: 10%;
    background-color: rgb(255, 255, 255);
    color: #0c0361;
    align-items: stretch;
    margin-top: 2%;
}
div2 {
    display: flex;
    width: 100%;
    height: 10%;
    background-color: rgb(255, 255, 255);
    color: #0c0361;
    align-items: stretch;
    margin-top: 2%;
}
.google-visualization-chart-label {
    transform: rotate(-45deg); /* ラベルのテキストを斜めに表示 */
} */
</style>