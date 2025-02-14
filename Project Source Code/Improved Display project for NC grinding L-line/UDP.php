<?php
// 送信する機器のIPアドレスとポートを定義
define("_IP_ADDRESS",  "192.168.101.143");

if(isset($_POST['line_list_update'])){
    $port = "60100";

    // 通信するソケットを生成
    $socket = socket_create(AF_INET,  SOCK_DGRAM,  SOL_UDP);

    // UDPに送るコマンド
    $command = $_POST['key1'];

    // コマンドを送信
    socket_sendto($socket,  $command,  strlen($command),  0,  _IP_ADDRESS,  $port);

    // ソケットを閉じる
    socket_close($socket);
    echo "成功";
}
?>