document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('threshold').addEventListener('input', updateThresholdValue);
document.getElementById('detectButton').addEventListener('click', detectShapes);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        const originalCanvas = document.getElementById('originalCanvas');
        const originalCtx = originalCanvas.getContext('2d');
        originalCanvas.width = img.width;
        originalCanvas.height = img.height;
        originalCtx.drawImage(img, 0, 0);
    };
}

function updateThresholdValue() {
    const threshold = document.getElementById('threshold').value;
    document.getElementById('thresholdValue').textContent = threshold;
}

function detectShapes() {
    const originalCanvas = document.getElementById('originalCanvas');
    const originalCtx = originalCanvas.getContext('2d');
    const imgData = originalCtx.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const src = cv.matFromImageData(imgData);
    const gray = new cv.Mat();
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
    const blurred = new cv.Mat();
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
    const edges = new cv.Mat();
    cv.Canny(blurred, edges, 50, 150);

    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

    const binaryImage = new cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC1);
    const threshold = parseInt(document.getElementById('threshold').value, 10);

    for (let i = 0; i < contours.size(); ++i) {
        cv.drawContours(binaryImage, contours, i, new cv.Scalar(255), -1, cv.LINE_8, hierarchy, 100);
    }

    // 閾値を使用して二値化
    cv.threshold(binaryImage, binaryImage, threshold, 255, cv.THRESH_BINARY);

    // RGBA形式に変換
    const binaryRGBA = new cv.Mat();
    cv.cvtColor(binaryImage, binaryRGBA, cv.COLOR_GRAY2RGBA);

    const binaryCanvas = document.getElementById('binaryCanvas');
    const binaryCtx = binaryCanvas.getContext('2d');
    binaryCanvas.width = binaryRGBA.cols;
    binaryCanvas.height = binaryRGBA.rows;
    const binaryImgData = new ImageData(new Uint8ClampedArray(binaryRGBA.data), binaryRGBA.cols, binaryRGBA.rows);
    binaryCtx.putImageData(binaryImgData, 0, 0);

    src.delete();
    gray.delete();
    blurred.delete();
    edges.delete();
    contours.delete();
    hierarchy.delete();
    binaryImage.delete();
    binaryRGBA.delete();
}

function onOpenCvReady() {
    console.log('OpenCV.js is ready.');
}
