(function(PLUGIN_ID) {
    'use strict';

    // get plugin configuration settings
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);
    
    // if there is no settings, exit the function
    if (!config || Object.keys(config).length === 0) {
        return;
    }
    //config.appApiKey

    // Load FontAwesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

    let indexEvent = null;
    let imageSize;

    const el = kintone.app.getHeaderSpaceElement();
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-contents d-flex align-items-center text-center';

    const imageResizeButton = document.createElement('button');
    imageResizeButton.className = 'btn btn-primary mr-1 mb-3 ml-3';
    imageResizeButton.innerHTML = '<i class="fas fa-compress mr-2"></i> 画像リサイザー';

    headerDiv.appendChild(imageResizeButton);
    el.appendChild(headerDiv);

    imageResizeButton.addEventListener('click', async function(event) {
        if (indexEvent.records.length < 1) {
            Swal.fire({
                icon: 'info',
                title: 'Opps!',
                text: '処理するデータがありません',
                confirmButtonText: 'OK'
            });
            return; // Exit the function if there are no records
        }

        Swal.fire({
            title: "ご希望の画像サイズをご入力ください",
            html: `
                <input type="number" id="imgSize" class="swal2-input" placeholder="画像サイズ" required> Kb
            `,
            showCancelButton: true,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                imageSize = document.getElementById('imgSize').value;

                if (!imageSize) {
                    Swal.showValidationMessage('すべての項目を入力してください。');
                    return false; // Prevent the form from being submitted
                }

                return { imgSize };
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { imgSize } = result.value;

                Swal.fire({
                    title: "送信を確認する",
                    text: "リサイズを実行してもよろしいですか？ これにより、一覧に表示されているすべての画像のサイズが小さくなります。",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "はい",
                    cancelButtonText: "いいえ",
                    customClass: {
                        confirmButton: 'btn btn-danger mr-3',
                        cancelButton: 'btn btn-secondary'
                    },
                    buttonsStyling: false
                }).then(async (confirmationResult) => {

                    if (confirmationResult.isConfirmed) {
                        let taskCount = 0;
                        let completedTasks = 0;

                        if (indexEvent) {
                            const records = indexEvent.records;
                            taskCount = records.length;

                            if (taskCount < 1) {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Opps!',
                                    text: 'There is no records to process.',
                                    confirmButtonText: 'OK'
                                });
                                return;
                            }

                            Swal.fire({
                                title: "少々お待ちください....",
                                html: `残りのレコード数: <b>${taskCount}</b>`,
                                timerProgressBar: true,
                                didOpen: () => {
                                    Swal.showLoading();
                                }
                            });

                            for (const record of records) {
                                await processFiles(record, imgSize);
                                completedTasks++;
                                Swal.getHtmlContainer().querySelector('b').textContent = taskCount - completedTasks;
                            }

                            Swal.close(); // Close the SweetAlert when all tasks are complete
                            Swal.fire({
                                title: "成功",
                                text: "画像のリサイズ処理が完了しました",
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


    async function resizeImage(file) {
        const img = document.createElement('img');
        const reader = new FileReader();
        const resizedCanvas = document.createElement('canvas');
        const ctx = resizedCanvas.getContext('2d');
        
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                img.src = event.target.result;
                img.onload = async () => {
                    try {
                        // Get natural width and height
                        const naturalWidth = img.naturalWidth;
                        const naturalHeight = img.naturalHeight;
        
                        // Set target width and height based on natural dimensions
                        let targetWidth = naturalWidth;
                        let targetHeight = naturalHeight;
        
                        // Resize logic based on maximum width or height
                        const maxDimension = 1024; // Set a max dimension (either width or height)
        
                        if (naturalWidth > naturalHeight) {
                            // Landscape orientation, use width as the limit
                            if (naturalWidth > maxDimension) {
                                targetWidth = maxDimension;
                                targetHeight = Math.round((naturalHeight * maxDimension) / naturalWidth);
                            }
                        } else {
                            // Portrait orientation, use height as the limit
                            if (naturalHeight > maxDimension) {
                                targetHeight = maxDimension;
                                targetWidth = Math.round((naturalWidth * maxDimension) / naturalHeight);
                            }
                        }
        
                        // Set canvas dimensions to the calculated target size
                        resizedCanvas.width = targetWidth;
                        resizedCanvas.height = targetHeight;
        
                        // Draw the image on the canvas with the new dimensions
                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
                        // Use Pica.js to resize the image (optional, depending on the quality)
                        const picaInstance = pica();
                        const resizedImageBlob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', 0.9);
        
                        // Check if the resized image is within the target file size
                        let quality = 0.9;
                        let blob = resizedImageBlob;
        
                        // Reduce quality until the image fits the target file size
                        while (blob.size > imageSize * 1024 && quality > 0.1) {
                            quality -= 0.1;
                            blob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', quality);
                        }
        
                        if (blob.size <= imageSize * 1024) {
                            resolve(blob);
                        } else {
                            reject(new Error('Unable to compress the image to the desired file size.'));
                        }
                    } catch (error) {
                        reject(error);
                    }
                };
            };
            reader.readAsDataURL(file);
        });
    }
        

    async function resizeAndUploadImage(blob, fileObj, originalFilename) {
        const resizedImageBlob = await resizeImage(blob);

        const formData = new FormData();
        formData.append('file', resizedImageBlob, originalFilename);

        try {
            const response = await fetch(kintone.api.url('/k/v1/file.json', true), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Cybozu-API-Token': config.appApiKey
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const uploadResponse = await response.json();
            fileObj.newFileKey = uploadResponse.fileKey;

            return uploadResponse.fileKey;
        } catch (error) {
            console.error('Error uploading resized image:', error);
        }
    }

    async function processFiles(record) {
        for (const key in record) {
            if (record.hasOwnProperty(key)) {
                const field = record[key];

                if (field.type === 'FILE') {
                    const files = field.value;
                        

                    if (files.length !== '') {
                        let newKeys = [];
                        for (const file of files) {
                            if (file.contentType.startsWith('image/') && file.size > imageSize*1024) {
                                const fileKey = file.fileKey;
                                const originalFilename = file.name;

                                try {

                                    const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
                                        method: 'GET',
                                        headers: {
                                            'X-Cybozu-API-Token': config.appApiKey
                                        }
                                    });

                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }

                                    const blob = await response.blob();
                                    const newFileKey = await resizeAndUploadImage(blob, { fileKey }, originalFilename);
                                    newKeys.push(newFileKey);

                                } catch (error) {
                                    Swal.fire({
                                        icon: 'info',
                                        title: 'Opps!',
                                        text: error,
                                        confirmButtonText: 'OK'
                                    });
                                    return;
                                }
                            } else {
                                newKeys.push(file.fileKey);
                            }
                        }

                        await updateRecordWithNewFileKey(record.$id.value, newKeys, key);
                    }
                }
            }
        }
    }

    async function updateRecordWithNewFileKey(recordId, newFileKey, key) {
        try {
            const filesValue = newFileKey.map(fileKey => ({ fileKey }));

            const updateResponse = await kintone.api(
                kintone.api.url('/k/v1/record.json', true),
                'PUT',
                {
                    app: kintone.app.getId(),
                    id: recordId,
                    record: {
                        [key]: { 
                            value: filesValue
                        }
                    }
                }
            );
        } catch (error) {
            console.error('Error updating record:', error);
        }
    }

        // Kintone event for record index show
    kintone.events.on('app.record.index.show', async function(event) {
        indexEvent = event;
    });

})(kintone.$PLUGIN_ID);