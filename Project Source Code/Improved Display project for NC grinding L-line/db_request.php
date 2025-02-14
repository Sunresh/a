<?php
$host = '127.0.0.1'; // ホスト名
$db   = 'machine_db'; // データベース名
$user = 'root'; // ユーザー名
//$pass = 'og-ogsas'; // パスワード
$pass = '';
$charset = 'utf8mb4'; // 文字セット
$data = $_POST['arg1'];
try{
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $opt = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $opt);
    
    // $sql = "SELECT * FROM machine";
    $stmt = $pdo->query($data);
    echo "成功\n";
    while ($row = $stmt->fetch(PDO::FETCH_NUM))
    {
        for($i = 0; $i < count($row); $i++){
            echo $row[$i] . ",";
        }
        echo "\n";
    }
    // while ($row = $stmt->fetch())
    // {
    //     echo $row['machine_no'] . "," . $row['task'] . "," 
    //     . $row['state'] . "," . $row['date'] . "," . $row['parts_no'] 
    //     . "," . $row['worker_name'] . "," . $row['type'] . "," 
    //     . $row['process_no'] . "," . $row['count_type']. $row['count']
    //     . "\n";
    // }    
}catch(PDOException $e){
    echo "データベースの接続に失敗しました".$e->getMessage();
    //print("データベースの接続に失敗しました".$e->getMessage());
    die();
}

?>
