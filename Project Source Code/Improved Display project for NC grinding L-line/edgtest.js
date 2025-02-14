const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let img = new Image();
let imgData, refPoint;

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
    ctx.drawImage(img, 0, 0);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'green';
    ctx.fill();
});

document.getElementById('extractButton').addEventListener('click', function() {
    if (refPoint) {
        extractShape();
    }
});

function extractShape() {
    const grayScaleData = toGrayScale(imgData);
    const thresholdData = applyThreshold(grayScaleData, 127);
    const contours = findContours(thresholdData, imgData.width, imgData.height);

    for (const contour of contours) {
        if (isPointInPolygon(refPoint, contour)) {
            const mask = createMaskFromContour(contour, imgData.width, imgData.height);
            const extractedShape = applyMask(imgData, mask);
            displayExtractedShape(extractedShape);
            countShapeOccurrences(extractedShape, mask);
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

function createMaskFromContour(contour, width, height) {
    const mask = new Uint8ClampedArray(width * height).fill(0);
    const ctxMask = new OffscreenCanvas(width, height).getContext('2d');
    ctxMask.fillStyle = 'white';
    ctxMask.beginPath();
    ctxMask.moveTo(contour[0][0], contour[0][1]);
    for (const [x, y] of contour) {
        ctxMask.lineTo(x, y);
    }
    ctxMask.closePath();
    ctxMask.fill();

    const maskData = ctxMask.getImageData(0, 0, width, height).data;
    for (let i = 0; i < mask.length; i++) {
        mask[i] = maskData[i * 4] > 0 ? 1 : 0;
    }
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

function countShapeOccurrences(shape, mask) {
    const threshold = 0.8;
    const result = matchTemplate(imgData, shape, mask);
    const loc = result.map((v, i) => (v >= threshold ? i : -1)).filter(v => v !== -1);
    const count = loc.length;
    console.log(`Shape occurrences: ${count}`);
}

function matchTemplate(imgData, templateData, mask) {
    const result = new Float32Array((imgData.width - templateData.width + 1) * (imgData.height - templateData.height + 1));

    for (let y = 0; y < imgData.height - templateData.height + 1; y++) {
        for (let x = 0; x < imgData.width - templateData.width + 1; x++) {
            let sum = 0, sumTemplate = 0, sumImg = 0, sumTemplateSq = 0, sumImgSq = 0;
            for (let j = 0; j < templateData.height; j++) {
                for (let i = 0; i < templateData.width; i++) {
                    const maskValue = mask[j * templateData.width + i];
                    const imgValue = imgData.data[((y + j) * imgData.width + (x + i)) * 4];
                    const templateValue = templateData.data[(j * templateData.width + i) * 4];
                    if (maskValue) {
                        sum += imgValue * templateValue;
                        sumImg += imgValue;
                        sumTemplate += templateValue;
                        sumImgSq += imgValue * imgValue;
                        sumTemplateSq += templateValue * templateValue;
                    }
                }
            }
            const count = templateData.width * templateData.height;
            const numerator = sum - (sumImg * sumTemplate / count);
            const denominator = Math.sqrt((sumImgSq - (sumImg * sumImg / count)) * (sumTemplateSq - (sumTemplate * sumTemplate / count)));
            result[y * (imgData.width - templateData.width + 1) + x] = numerator / denominator;
        }
    }

    return result;
}
