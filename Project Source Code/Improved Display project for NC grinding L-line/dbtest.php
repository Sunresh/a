<?php
$host = '127.0.0.1'; // ホスト名
$db   = 'machine_db'; // データベース名
$user = 'root'; // ユーザー名
$pass = 'og-ogsas'; // パスワード
$charset = 'utf8mb4'; // 文字セット
try{
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $opt = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $opt);
    
    $sql = "SELECT * FROM machine";
    $stmt = $pdo->query($sql);
    
    while ($row = $stmt->fetch())
    {
        echo $row['id'] . "," . $row['machine_no'] . "," 
        . $row['ready_on'] . "," . $row['operation'] . "," . $row['error'] 
        . "," . $row['complete'] . "," . $row['prg_no'] . "," 
        . $row['count'] . "," . $row['division'] . "," . $row['line_name'] 
        . "," . $row['worker_name'] . "," . $row['parts_no'] . "," 
        . $row['A'] . "," . $row['B'] . "," . $row['C'] . "," . $row['D'] 
        . "," . $row['E'] . "," . $row['F'] . "," . $row['G'] . "," 
        . $row['I'] . "," . $row['K'] . "," . $row['L'] . "," . $row['N'] 
        . "," . $row['P'] . "," . $row['R'] . "," . $row['T'] . "," 
        . $row['V'] . "," . $row['X'] . "," . $row['date'] . "<br>";
    }    
}catch(PDOException $e){
    echo "データベースの接続に失敗しました".$e->getMessage();
    //print("データベースの接続に失敗しました".$e->getMessage());
    die();
}

?>
