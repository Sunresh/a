window.onload = function () {
    const myCanvas = document.getElementById("myChart");
    new Chart(myCanvas, {
      type: "horizontalBar", // 縦なら "bar" を指定
      data: {
        labels: ["Store 1", "Store 2", "Store 3"],
        datasets: [
          {
            label: "Orange",
            data: [3, 6, 9],
            backgroundColor: "#F6AD3C",
          },
          {
            label: "Grape",
            data: [12, 8, 4],
            backgroundColor: "#A64A97",
          },
          {
            label: "Melon",
            data: [2, 6, 4],
            backgroundColor: "#AACF52",
          },
        ]
      },
      options: {
        // 凡例
        legend: {
          position: 'right'
        },
        // レスポンシブ（true だとサイズ自動調整）
        responsive: false,
        scales: {
          // X軸
          xAxes: [{
            scaleLabel: {
              display: true,
              fontColor: "#999",
              labelString: "Sales Quantity"
            },
            stacked: true,
            ticks: {
              // 下記のように固定値ではなく、
              // データに応じて算出するのがいいと思います
              max: 24,
              stepSize: 4,
            }
          }],
          // Y軸
          yAxes: [{
            stacked: true
          }]
        }
      }
    });
  }      