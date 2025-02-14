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
    
    $sql = "SELECT * FROM line_info";
    $stmt = $pdo->query($sql);
    
    while ($row = $stmt->fetch())
    {
        echo $row['line_name'] . "," . $row['division']. "\n";
    }    
}catch(PDOException $e){
    echo "データベースの接続に失敗しました".$e->getMessage();
    //print("データベースの接続に失敗しました".$e->getMessage());
    die();
}
?>