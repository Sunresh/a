imageResizeButton.addEventListener('click', async function(event) {
    Swal.fire({
        title: "Image detail entry form",
        html: `
            <input type="number" id="imgSize" class="swal2-input" placeholder="Image Size" required> Kb
            <input type="number" id="imgWidth" class="swal2-input" placeholder="Width" required> px
            <input type="number" id="imgHeight" class="swal2-input" placeholder="Height" required> px
        `,
        showCancelButton: true,
        confirmButtonText: "Submit",
        showLoaderOnConfirm: true,
        preConfirm: async () => {
            console.log('preConfirm executed');
            imageSize = document.getElementById('imgSize').value;
            maxWidth = document.getElementById('imgWidth').value;
            maxHeight = document.getElementById('imgHeight').value;

            if (!imageSize || !maxWidth || !maxHeight) {
                Swal.showValidationMessage('Please fill out all fields.');
                return false; // Prevent the form from being submitted
            }

            return { imgSize, imgWidth, imgHeight };
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then(async (result) => {
        if (result.isConfirmed) {
            console.log('result:', result);
            const { imgSize, imgWidth, imgHeight } = result.value;

            Swal.fire({
                title: "Confirm Submission",
                text: `Are you sure you want to proceed with the following details?\nImage Size: ${imgSize} KB\nWidth: ${imgWidth} px\nHeight: ${imgHeight} px`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Yes, proceed",
                cancelButtonText: "No, cancel"
            }).then(async (confirmationResult) => {
                if (confirmationResult.isConfirmed) {
                    let taskCount = 0;
                    let completedTasks = 0;
                    if (indexEvent) {
                        const records = indexEvent.records;
                        taskCount = records.length;

                        Swal.fire({
                            title: "Processing images...",
                            html: `Tasks remaining: <b>${taskCount}</b>`,
                            timerProgressBar: true,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        for (const record of records) {
                            await processFiles(record, imgSize, imgWidth, imgHeight);
                            completedTasks++;
                            Swal.getHtmlContainer().querySelector('b').textContent = taskCount - completedTasks;
                        }

                        Swal.close(); // Close the SweetAlert when all tasks are complete
                        Swal.fire({
                            title: "Success",
                            text: "Image resize process is completed",
                            icon: "success"
                        }).then(() => {
                            location.reload();
                        });
                    }
                }
            });
        }
    });
});

// Assuming you have the processFiles function defined elsewhere
async function processFiles(record, imgSize, imgWidth, imgHeight) {
    const files = record.添付ファイル.value;
    for (const file of files) {
        if (file.contentType.startsWith('image/')) {
            const fileKey = file.fileKey;
            console.log(`File Key: ${fileKey}, Original Filename: ${file.name}`);

            try {
                // Fetch the file data using Fetch API for binary data
                const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
                    method: 'GET',
                    headers: {
                        'X-Cybozu-API-Token': 'YOUR_API_TOKEN', // Add your API token here if needed
                        'Content-Type': 'application/json'
                    }
                });

                console.log('Response Status:', response.status);

                if (!response.ok) {
                    const errorResponse = await response.json();
                    console.error('Error Response:', errorResponse);
                    throw new Error('Network response was not ok');
                }

                // Convert the response to Blob
                const blob = await response.blob();
                console.log('Blob:', blob);

                // Resize and upload the new image with the original filename
                const newFileKey = await resizeAndUploadImage(blob, file.name, imgSize, imgWidth, imgHeight);

                // Delete the old file
                await deleteOldFile(fileKey);

                // Update the record with the new file key
                await updateRecordWithNewFileKey(record.$id.value, newFileKey);

            } catch (error) {
                console.error('Error fetching or processing file data:', error);
            }
        }
    }
}

// Adjusted resize and upload functions to handle size and dimensions
async function resizeImage(file, targetSizeKB, maxWidth, maxHeight) {
    await loadPicaScript();

    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = maxWidth; // target width
    resizedCanvas.height = maxHeight; // target height

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            img.src = event.target.result;
            img.onload = async () => {
                const picaInstance = pica();
                await picaInstance.resize(img, resizedCanvas);

                let quality = 0.9; // Start with high quality
                let blob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', quality);

                // Iterate to reduce quality until the desired file size is achieved
                while (blob.size > targetSizeKB * 1024 && quality > 0.1) {
                    quality -= 0.1;
                    blob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', quality);
                }

                if (blob.size <= targetSizeKB * 1024) {
                    resolve(blob);
                } else {
                    reject(new Error('Unable to compress the image to the desired file size.'));
                }
            };
        };
        reader.readAsDataURL(file);
    });
}

async function resizeAndUploadImage(blob, originalFilename, targetSizeKB, maxWidth, maxHeight) {
    const resizedImageBlob = await resizeImage(blob, targetSizeKB, maxWidth, maxHeight);
    console.log('Resized image blob:', resizedImageBlob);

    // Create a FormData object and append the resized image with the original filename
    const formData = new FormData();
    formData.append('file', resizedImageBlob, originalFilename);

    try {
        // Use fetch API to upload the file
        const response = await fetch(kintone.api.url('/k/v1/file.json', true), {
            method: 'POST',
            body: formData,
            headers: {
                'X-Cybozu-API-Token': 'YOUR_API_TOKEN' // Add your API token here if needed
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const uploadResponse = await response.json();
        console.log('Upload response:', uploadResponse);

        // Return the new file key
        return uploadResponse.fileKey;
    } catch (error) {
        console.error('Error uploading resized image:', error);
    }
}

async function deleteOldFile(fileKey) {
    try {
        const deleteResponse = await kintone.api(
            kintone.api.url('/k/v1/file.json', true), // Ensure correct endpoint for deletion
            'DELETE',
            { fileKey: fileKey }
        );

        console.log('Delete response:', deleteResponse);
    } catch (error) {
        console.error('Error deleting old file:', error);
    }
}

async function updateRecordWithNewFileKey(recordId, newFileKey) {
    try {
        const updateResponse = await kintone.api(
            kintone.api.url('/k/v1/record.json', true),
            'PUT',
            {
                app: 'YOUR_APP_ID',
                id: recordId,
                record: {
                    添付ファイル: {
                        value: [
                            {
                                fileKey: newFileKey
                            }
                        ]
                    }
                }
            }
        );

        console.log('Record update response:', updateResponse);
    } catch (error) {
        console.error('Error updating record:', error);
    }
}

// Function to reload the data grid
function reloadDataGrid() {
    // Logic to reload your data grid
    // Example: window.location.reload();
}
