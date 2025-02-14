const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let imgData, refPoint;
let selectedRect = null;
let isDragging = false;
let dragStart = null;

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    refPoint = { x, y };
    extractShape();
});

document.getElementById('extractButton').addEventListener('click', function() {
    if (selectedRect) {
        const extractedShape = applyMask(imgData, createMaskFromRect(selectedRect));
        displayExtractedShape(extractedShape);
    }
});

canvas.addEventListener('mousedown', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (selectedRect && isPointInRect(x, y, selectedRect)) {
        isDragging = true;
        dragStart = { x, y };
    }
});

canvas.addEventListener('mousemove', function(event) {
    if (isDragging && selectedRect) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        selectedRect.x += dx;
        selectedRect.y += dy;
        dragStart = { x, y };
        redrawCanvas();
    }
});

canvas.addEventListener('mouseup', function() {
    isDragging = false;
});

function extractShape() {
    const grayScaleData = toGrayScale(imgData);
    const thresholdData = applyThreshold(grayScaleData, 50);
    const contours = findContours(thresholdData, imgData.width, imgData.height);

    for (const contour of contours) {
        if (isPointInPolygon(refPoint, contour)) {
            const boundingRect = getBoundingRect(contour);
            selectedRect = boundingRect;
            redrawCanvas();
            break;
        }
    }
}

function toGrayScale(imgData) {
    const grayData = new Uint8ClampedArray(imgData.data.length / 4);
    for (let i = 0; i < imgData.data.length; i += 4) {
        const gray = 0.299 * imgData.data[i] + 0.587 * imgData.data[i + 1] + 0.114 * imgData.data[i + 2];
        grayData[i / 4] = gray;
    }
    return grayData;
}

function applyThreshold(grayData, threshold) {
    return grayData.map(value => (value > threshold ? 255 : 0));
}

function findContours(thresholdData, width, height) {
    const contours = [];
    const visited = new Array(thresholdData.length).fill(false);

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [1, -1], [-1, 1], [1, 1]
    ];

    function bfs(start) {
        const queue = [start];
        const contour = [];
        visited[start[1] * width + start[0]] = true;

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            contour.push([x, y]);

            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const index = ny * width + nx;
                    if (!visited[index] && thresholdData[index] === 255) {
                        visited[index] = true;
                        queue.push([nx, ny]);
                    }
                }
            }
        }

        return contour;
    }

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (thresholdData[y * width + x] === 255 && !visited[y * width + x]) {
                const contour = bfs([x, y]);
                contours.push(contour);
            }
        }
    }

    return contours;
}

function isPointInPolygon(point, polygon) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        let xi = polygon[i][0], yi = polygon[i][1];
        let xj = polygon[j][0], yj = polygon[j][1];

        let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

function getBoundingRect(contour) {
    const xs = contour.map(p => p[0]);
    const ys = contour.map(p => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const width = Math.max(...xs) - x;
    const height = Math.max(...ys) - y;
    return { x, y, width, height };
}

function createMaskFromRect(rect) {
    const mask = new Uint8ClampedArray(rect.width * rect.height).fill(1);
    return mask;
}

function applyMask(imgData, mask) {
    const resultData = new ImageData(imgData.width, imgData.height);
    for (let i = 0; i < mask.length; i++) {
        const value = mask[i];
        resultData.data[i * 4] = imgData.data[i * 4] * value;
        resultData.data[i * 4 + 1] = imgData.data[i * 4 + 1] * value;
        resultData.data[i * 4 + 2] = imgData.data[i * 4 + 2] * value;
        resultData.data[i * 4 + 3] = imgData.data[i * 4 + 3];
    }
    return resultData;
}

function displayExtractedShape(extractedShape) {
    const extractedCanvas = document.createElement('canvas');
    extractedCanvas.width = extractedShape.width;
    extractedCanvas.height = extractedShape.height;
    const extractedCtx = extractedCanvas.getContext('2d');
    extractedCtx.putImageData(extractedShape, 0, 0);
    document.body.appendChild(extractedCanvas);
}

function isPointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function redrawCanvas() {
    ctx.drawImage(img, 0, 0);
    if (selectedRect) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.strokeRect(selectedRect.x, selectedRect.y, selectedRect.width, selectedRect.height);
    }
}
