(function() {
    'use strict';

    // Load FontAwesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

    let indexEvent = null;
    let imageSize;
    let maxWidth;
    let maxHeight;

 
    const el = kintone.app.getHeaderSpaceElement();
        // 既存のheader-contentsをクリア
    // const existingHeader = el.querySelector('.header-contents');
    // alert(existingHeader);
    // if (existingHeader) {
    //     existingHeader.remove();
    // }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-contents d-flex align-items-center text-center';

    const imageResizeButton = document.createElement('button');
    imageResizeButton.className = 'btn btn-primary mr-1 mb-3 ml-3';
    imageResizeButton.innerHTML = '<i class="fas fa-compress mr-2"></i> 画像リサイザー';

    headerDiv.appendChild(imageResizeButton);
    el.appendChild(headerDiv);
    

    imageResizeButton.addEventListener('click', async function(event) {

        // Check if there are no records
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
            title: "画像詳細入力フォーム",
            html: `
                <input type="number" id="imgSize" class="swal2-input" placeholder="画像サイズ" required> Kb
                <input type="number" id="imgWidth" class="swal2-input" placeholder="幅" required> px
                <input type="number" id="imgHeight" class="swal2-input" placeholder="高さ" required> px
            `,
            showCancelButton: true,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                imageSize = document.getElementById('imgSize').value;
                maxWidth = document.getElementById('imgWidth').value;
                maxHeight = document.getElementById('imgHeight').value;
    
                if (!imageSize || !maxWidth || !maxHeight) {
                    Swal.showValidationMessage('すべての項目を入力してください。');
                    return false; // Prevent the form from being submitted
                }
    
                return { imgSize, imgWidth, imgHeight };
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then(async (result) => {
            if (result.isConfirmed) {
                const { imgSize, imgWidth, imgHeight } = result.value;
    
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
                    buttonsStyling: false // Required to use custom classes
                }).then(async (confirmationResult) => {

                    if (confirmationResult.isConfirmed) {
                        let taskCount = 0;
                        let completedTasks = 0;
                        
                        if (indexEvent) {
                            const records = indexEvent.records;
                            taskCount = records.length;
                    
                            // Check if there are no records
                            if (taskCount < 1) {
                                Swal.fire({
                                    icon: 'info',
                                    title: 'Opps!',
                                    text: 'There is no records to process.',
                                    confirmButtonText: 'OK'
                                });
                                return; // Exit the function if there are no records
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
                                await processFiles(record, imgSize, imgWidth, imgHeight);
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
        const targetSizeKB = 200;
        //await loadPicaScript();
    
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
    
                    let quality = 0.9;
                    let blob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', quality);
    
                    // Iterate to reduce quality until the desired file size is achieved
                    while (blob.size > imageSize * 1024 && quality > 0.1) {
                        quality -= 0.1;
                        blob = await picaInstance.toBlob(resizedCanvas, 'image/jpeg', quality);
                    }
    
                    if (blob.size <= imageSize * 1024) {
                        resolve(blob);
                    } else {
                        reject(new Error('Unable to compress the image to the desired file size.'));
                    }
                };
            };
            reader.readAsDataURL(file);
        });
    }
    



    async function resizeAndUploadImage(blob, fileObj, originalFilename) {
        const resizedImageBlob = await resizeImage(blob);
    
        // Create a FormData object and append the resized image
        const formData = new FormData();
        formData.append('file', resizedImageBlob, originalFilename);
    
        try {
            // Use fetch API to upload the file
            const response = await fetch(kintone.api.url('/k/v1/file.json', true), {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Cybozu-API-Token': 'wvCNspZVNWhlPSSubsxSVVi2MFEAuVYUhgV3Jy56' // Add your API token here if needed
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const uploadResponse = await response.json();
            
            // Update the file key in the fileObj
            fileObj.newFileKey = uploadResponse.fileKey;
    
            return uploadResponse.fileKey;
        } catch (error) {
            console.error('Error uploading resized image:', error);
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
    
            //console.log('Record updated successfully:', updateResponse);
        } catch (error) {
            console.error('Error updating record:', error);
        }
    }


    async function processFiles(record) {
        // Iterate through the record object
        for (const key in record) {
            
            if (record.hasOwnProperty(key)) {
                const field = record[key];


                // Check if the field type is 'FILE'
                if (field.type === 'FILE') {
                    const files = field.value; 

                    if(files.length != ''){
                        let newskeys = [];
                        for (const file of files) {

                            if (file.contentType.startsWith('image/')) {
                                const fileKey = file.fileKey;
                                const originalFilename = file.name;
                    
                                try {
                                    // Fetch the file data using Fetch API for binary data
                                    const response = await fetch(`/k/v1/file.json?fileKey=${fileKey}`, {
                                        method: 'GET',
                                        headers: {
                                            'X-Cybozu-API-Token': 'wvCNspZVNWhlPSSubsxSVVi2MFEAuVYUhgV3Jy56', // Add your API token here if needed
                                            //'Content-Type': 'application/json'
                                        }
                                    });
                    
                                    if (!response.ok) {
                                        throw new Error('Network response was not ok');
                                    }

                                    const blob = await response.blob();
                                    const imageUrl = URL.createObjectURL(blob);
                                    const fileObj = { fileKey: fileKey };

                                    const newFileKey = await resizeAndUploadImage(blob, fileObj, originalFilename);
                                    newskeys.push(newFileKey);

                                } catch (error) {
                                    console.error('Error fetching or processing file data:', error);
                                } 
                            }else{
                                const fileKey = file.fileKey;
                                newskeys.push(fileKey);
                            }
                        }

                        await updateRecordWithNewFileKey(record.$id.value, newskeys, key);
                    }
                    
                }
            }
        }

    }

    // Kintone event for record index show
    kintone.events.on('app.record.index.show', async function(event) {
        indexEvent = event;
       // console.log(indexEvent);

    });


})();