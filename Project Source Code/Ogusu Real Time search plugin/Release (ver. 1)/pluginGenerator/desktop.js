(function() {
    'use strict';

    // Load FontAwesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

    
    // Add CSS to prevent table flash
    const style = document.createElement('style');
    style.innerHTML = `
        .recordlist-gaia {
            display: none !important;
        }
        .gaia-argoui-trackrecord {
            display: none !important;
        }

        .gaia-argoui-app-index-pager{
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    // Additional early intervention
    document.addEventListener('DOMContentLoaded', function() {
        const removeTable = () => {
            //const tables = document.querySelectorAll('.recordlist-gaia, .gaia-argoui-trackrecord, .gaia-argoui-app-index-pager');
            const tables = document.querySelectorAll('.gaia-argoui-trackrecord, .gaia-argoui-app-index-pager');
            tables.forEach(table => {
                if (table) {
                    table.remove();
                }
            });
        };

        // Initial removal
        removeTable();

        // Watch for any dynamic additions
        const observer = new MutationObserver(function(mutations) {
            removeTable();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
    //End table data load functionality

    // Define the global variable
    let globalRecords = [];
    let filterdFiledList;
    let tableHeaderdata;
    let appID;

    const userTypeField = ['USER_SELECT', 'CREATOR', 'MODIFIER', 'STATUS_ASSIGNEE'];
    const groupSelectionTypeField = [ 'ORGANIZATION_SELECT', 'GROUP_SELECT', 'CATEGORY', 'MULTI_SELECT', 'CHECK_BOX'];
    const fileTypeField = ['FILE'];
    const dateTimeTypeField = ['CREATED_TIME', 'UPDATED_TIME', 'DATE', 'DATETIME', 'CREATED_AT', 'TIME'];
    const textTypeField = ['RECORD_NUMBER', '__ID__', 'RECORD_ID',  '__REVISION__', 'SINGLE_LINE_TEXT', 'MULTI_LINE_TEXT', 'MULTIPLE_LINE_TEXT', 'RICH_TEXT', 'NUMBER', 'CALC', 'RADIO_BUTTON', 'DROP_DOWN', 'LINK', 'SINGLE_LINE_TEXTNUMBER', 'STATUS', 'DECIMAL', 'SINGLE_SELECT'];


    // Function to fetch all records from the app
    async function fetchAllRecords() {
        var allRecords = [];
        const dataRetriveType = cybozu.data.page;
        const operatorStatus = dataRetriveType['VIEW_DATA'].builtinType;
        let kintoneQuery = '';

        if (operatorStatus === 'ASSIGN') {
            let queryForSearch = cybozu.data.LOGIN_USER.code;
            kintoneQuery = `作業者 in ("${queryForSearch}")`;
        }

        const appId = kintone.app.getId();
        function fetchRecords(offset) {
                var params = {
                    app: appId,
                    query: kintoneQuery + ' limit 100 offset ' + offset,
                };

                return kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params)
                    .then(function(response) {
                        allRecords = allRecords.concat(response.records);
                        if (response.records.length === 100) { 
                            return fetchRecords(offset + 100);
                        } else {
                            return allRecords;
                        }
                    });
            }
            return fetchRecords(0);
    }
    


    async function getAllData() {
        try {
            globalRecords = await fetchAllRecords();
            globalRecords.forEach(record => {
                var recordId;
                var attachedFieldName = [];
                Object.entries(record).forEach(([key, value]) => {
                    
                    if(value.type == '__ID__'){
                        recordId = value.value;
                    }

                    if(value.type == 'FILE' && value.value.length > 0){
                        attachedFieldName.push(key);
                    } 
                });

                 // Update the attachments in each field
                 attachedFieldName.forEach((fieldName) => {
                    //console.log(fieldName);
                    const attachments = record[fieldName].value;

                    // Process each attachment and update its properties
                    attachments.forEach((file) => {
                        
                        const updatedAttachment = attachedDocumentHandaler(fieldName, recordId).find(
                            (attachment) => attachment.name === file.name
                        );
                        
                        //console.log(updatedAttachment);
                        if (updatedAttachment) {
                            // Update the existing object with `id` and `url`
                            file.id = updatedAttachment.id;
                            file.url = updatedAttachment.url;
                            file.thumnailImage = imageUrlConverter(updatedAttachment.url);
                            file.thumnail_no = updatedAttachment.sliderNo;
                        }
                    });
                });
            });

            // console.log("-------------------------")
             //console.log(globalRecords);
            
        } catch (error) {
            console.log(error);
        }
    }

    kintone.events.on('app.record.index.show', async function (event) {
        // Prevent duplicate table creation
        if (document.getElementById('krewsheet')) {
            return;
        }
    
        await getAllData();
        var headerElement = await getAllFieldName();
        appID = kintone.app.getId();
    
        // Select the existing container
        const el = document.querySelector('#view-list-top-gaia');
    
        // Create a wrapper div for the entire component
        const wrapperDiv = document.createElement('div');
        wrapperDiv.id = 'dataTableWrapper';
        wrapperDiv.style.cssText = 'width: 100%;';
        el.appendChild(wrapperDiv);
    
        // Create custom search box
        // if (!document.getElementById('customSearchContainer')) {
        //     const searchContainer = document.createElement('div');
        //     searchContainer.id = 'customSearchContainer';
        //     searchContainer.innerHTML = `
        //         <input type="text" id="customSearchBox" placeholder="🔍 Search anything here...">
        //     `;
        //     wrapperDiv.appendChild(searchContainer);
    
        //     // Add minimal CSS for search box
        //     const searchStyles = document.createElement('style');
        //     searchStyles.textContent = `
        //         #dataTableWrapper #customSearchContainer {
        //             text-align: center;
        //             margin-bottom: 20px;
        //         }
        //         #dataTableWrapper #customSearchBox {
        //             width: 575px;
        //             padding: 10px 0px;
        //             font-size: 16px;
        //             border: 2px solid rgb(207 207 207);
        //             border-radius: 5px;
        //             outline: none;
        //             text-align: center;
        //             margin-top: 10px;
        //         }
        //     `;
        //     document.head.appendChild(searchStyles);
        // }

        if (!document.getElementById('customSearchContainer')) {
            const searchContainer = document.createElement('div');
            searchContainer.id = 'customSearchContainer';
            searchContainer.innerHTML = `
                <div class="search-box">
                    <input type="text" id="customSearchBox" placeholder="検索キーワードを入力...">
                    <i class="fas fa-search"></i>
                </div>
            `;
            wrapperDiv.appendChild(searchContainer);
        
            // Add modern CSS
            const searchStyles = document.createElement('style');
            searchStyles.textContent = `
                #dataTableWrapper #customSearchContainer {
                    text-align: center;
                    margin-bottom: 20px;
                }
        
                .search-box {
                    position: relative;
                    display: inline-block;
                    width: 100%;
                    max-width: 600px;
                }
        
                .search-box input {
                    width: 100%;
                    padding: 12px 15px;
                    font-size: 16px;
                    border: 2px solid #ddd;
                    border-radius: 30px;
                    outline: none;
                    text-align: left;
                    padding-left: 45px;  /* Space for the search icon */
                    transition: all 0.3s ease-in-out;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    margin-top: 10px;
                }
        
                .search-box input:focus {
                    border-color: #007bff;
                    box-shadow: 0 4px 10px rgba(0, 123, 255, 0.2);
                }
        
                .search-box i {
                    position: absolute;
                    left: 15px;
                    top: 58%;
                    transform: translateY(-50%);
                    color: #888;
                    font-size: 20px;
                }
            `;
            document.head.appendChild(searchStyles);
        }
        
    
        // Add loading animation
        const loader = document.createElement('div');
        loader.id = 'loadingSpinner';
        loader.innerHTML = `<div class="spinner"></div>`;
        wrapperDiv.appendChild(loader);
    
        // Add loader styles
        const spinnerStyle = document.createElement('style');
        spinnerStyle.innerHTML = `
            #dataTableWrapper #loadingSpinner {
                text-align: center;
                padding: 20px;
            }
            #dataTableWrapper .spinner {
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-left-color: #007bff;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                display: inline-block;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinnerStyle);
    
        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.id = 'tableContainer';
        tableContainer.innerHTML = `
            <table id="ogusuSearch" class="display" style="width:100%; display: none;">
                <thead>
                    <tr>${headerElement}</tr>
                </thead>
                <tbody></tbody>
            </table>
        `;
        wrapperDiv.appendChild(tableContainer);
    
        // Load DataTable dependencies
        await loadDataTable();
    
        // Populate table rows
        await tableRowGenerator(globalRecords);
    
        // Hide loader and show table
        document.getElementById('loadingSpinner').style.display = 'none';
        $('#ogusuSearch').show(); // Use jQuery to show the table
    
        // Initialize DataTable with search and pagination
        initializeDataTable();
    
        return event;
    });
    
    async function loadDataTable() {
        // Load jQuery if not present
        await new Promise((resolve, reject) => {
            if (typeof jQuery === 'undefined') {
                const jqueryScript = document.createElement('script');
                jqueryScript.src = "https://code.jquery.com/jquery-3.7.0.min.js";
                jqueryScript.onload = resolve;
                jqueryScript.onerror = reject;
                document.head.appendChild(jqueryScript);
            } else {
                resolve();
            }
        });
    
        // Load DataTables CSS
        const dataTableCSS = document.createElement('link');
        dataTableCSS.rel = "stylesheet";
        dataTableCSS.href = "https://cdn.datatables.net/1.13.7/css/jquery.dataTables.min.css";
        document.head.appendChild(dataTableCSS);
    
        // Load DataTables JS
        await new Promise((resolve, reject) => {
            const datatableScript = document.createElement('script');
            datatableScript.src = "https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js";
            datatableScript.onload = resolve;
            datatableScript.onerror = reject;
            document.head.appendChild(datatableScript);
        });
    }
    
    function initializeDataTable() {
        const tableId = '#ogusuSearch';
    
        // Destroy previous instance if exists
        if ($.fn.DataTable.isDataTable(tableId)) {
            $(tableId).DataTable().destroy();
        }
    
        // Initialize DataTable
        const table = $(tableId).DataTable({
            ordering: true,
            searching: true,
            paging: true,
            info: true,
            pagingType: 'simple_numbers',
            pageLength: 10,
            responsive: true,
            dom: '<"top"l>rt<"bottom"ip><"clear">',  // Custom DOM structure without default search box
            lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
            language: {
                info: "Showing _START_ to _END_ of _TOTAL_ entries",
                infoEmpty: "No entries available",
                infoFiltered: "(filtered from _MAX_ total entries)"
            }
        });
    
        // Custom search box functionality
        $('#customSearchBox').on('keyup', function () {
            table.search(this.value).draw();
        });
    }
    

    function dynamicTableColumnGenerator(record, index){
        var tableGeneration = '';
        
        filterdFiledList.forEach((field) => {
            if(field != undefined){
                var fieldName = field.var;
                
                
            
            if(textTypeField.includes(field.type)){
                if(field.type == 'SINGLE_SELECT'){
                    var limitedValue = record[fieldName].value;
                }else{
                    var limitedValue = record[fieldName].value.substring(0, 45);
                }
                
                
                tableGeneration += `<td class="recordlist-cell-gaia" style="width:10% !important;">
                                <div><span>${limitedValue}</span></div>
                                </td>`;

            }else if(userTypeField.includes(field.type)){
                if(record['作業者'].value[0]){
                    tableGeneration += `<td class="recordlist-cell-gaia recordlist-status_assignee-gaia">
                        <div>
                            <a class="recordlist-username-gaia" aria-expanded="false" target="_blank" onClick="window.location.href='${urlGenerator(record['作業者'].value[0].code,'user')}'" >
                            <img src="${cybozu.data.LOGIN_USER.photo['small']}" width="16" height="16">
                            <span>${record['作業者'].value[0].name}</span>
                            </a>
                        </div>
                    </td>`;
                }else{
                    tableGeneration += `<td class="recordlist-cell-gaia recordlist-status_assignee-gaia">
                        <div></div>
                    </td>`;

                }
            }else if(groupSelectionTypeField.includes(field.type)){
                if(record[field.var] != undefined){
                    tableGeneration += `<td class = "recordlist-cell-gaia recordlist-organization_select-gaia">
                            <ul style="list-style-type: none; margin-left: -35px;">
                            ${record[field.var].value.map(file => `
                                <a style="cursor: pointer;">
                                <li><img src="${cybozu.data.uri.STATIC_IMAGE_PREFIX}/argo/form/userselect/org16.png" width="16" height="16"><span class="mr-3"></span> ${file.name}</li>
                                </a>
                            `).join('')}
                            </ul>
                    </td>`;
                }else{
                    tableGeneration += `<td class="recordlist-cell-gaia recordlist-status_assignee-gaia">
                        <div></div>
                    </td>`;

                }
                

            }else if(dateTimeTypeField.includes(field.type)){
                var convertedDate = dateTimeConverter(record[fieldName].value);
                tableGeneration += `<td class="recordlist-cell-gaia">
                                <div><span>${convertedDate}</span></div>
                                </td>`;
            }else if(fileTypeField.includes(field.type)){
                tableGeneration += `
                                <td class="recordlist-cell-gaia recordlist-file-gaia value-7469725">
                                    <ul>
                                `;

                                if (record[fieldName].value.length > 0) {
                                record[fieldName].value.forEach(file => {
                                    if (file.contentType.startsWith("image/")) {
                                        // Handle image files
                                        tableGeneration += `
                                            <li class="recordlist-file-image-gaia">
                                            <a class="recordlist-file-image-container-gaia spotlight" href="${file.thumnailImage}" style="cursor: pointer;">
                                                <img class="gaia-ui-slideshow-thumbnail" src="${file.url}" 
                                                    title="${file.name}" data-thumbnail-key="${file.thumnail_no}">
                                            </a>
                                            </li>
                                        `;
                                        } else {
                                        // Handle non-image files
                                        tableGeneration += `
                                            <li class="recordlist-file-others-gaia">
                                            <a href="${file.url}">
                                                <font style="vertical-align: inherit;">
                                                <font style="vertical-align: inherit;">${file.name}</font>
                                                </font>
                                            </a>
                                            </li>
                                        `;
                                        }
                                    });
                                }

                                tableGeneration += `
                                    </ul>
                                </td>
                                `;

            }

        }
        });

        tableGeneration += `<td class="recordlist-cell-gaia recordlist-action-gaia">
            <div class="recordlist-cell-edit-and-remove-action">
                <button type="button" class="recordlist-edit-gaia" title="Edit" aria-label="Edit" onClick="window.location.href='${urlGenerator(record['$id'].value,'edit')}'">
                <img class="recordlist-edit-icon-gaia" src="${cybozu.data.uri.STATIC_IMAGE_PREFIX}/argo/component/recordlist/record-edit.png" alt="">
                </button>
                <button type="button" id="deleteButton-${index}" value="test" class="recordlist-remove-gaia" title="Delete" aria-label="Delete">
                    <img class="recordlist-remove-icon-gaia" src="${cybozu.data.uri.STATIC_IMAGE_PREFIX}/argo/component/recordlist/record-delete.png" alt="">
                </button>
            </div>
        </td>`;

        return tableGeneration; 
        
    }


    async function tableRowGenerator(filterRecord){
        // Clear all previous rows 
        const tbody = document.querySelector('tbody'); 
        // while (tbody.firstChild) { 
        //       tbody.removeChild(tbody.firstChild); 
        //   }
        // console.log(filterRecord);
        
          filterRecord.forEach((record, index) =>{
            var tableGeneration = dynamicTableColumnGenerator(record, index);
            const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="recordlist-cell-gaia detail-action-${record['$id'].value} recordlist-action-gaia">
                          <a class="recordlist-show-gaia" href="${urlGenerator(record['$id'].value,'show')}" target="_self" title="View record details">
                            <span class="recordlist-detail-gaia"></span>
                          </a>
                        </td>` + tableGeneration;
                    tbody.appendChild(row);

                    // Attach event listener for each delete button
                document.getElementById(`deleteButton-${index}`).addEventListener('click', () => {
                    deleteRecord(record['$id'].value);
                });
          });

    }

    async function deleteRecord(recordId) {
        swal({
            title: 'Delete Record!',
            text: 'Are you sure you want to delete this record?',
            icon: 'warning',
            buttons: {
                cancel: {
                    text: 'Cancel',
                    value: false,
                    visible: true,
                    className: 'btn btn-secondary' // Default cancel button style
                },
                confirm: {
                    text: 'Delete',
                    value: true,
                    visible: true,
                    className: 'btn-red', // Custom class for red button
                    closeModal: false
                }
            }
        }).then((confirmed) => {
            if (!confirmed) {
                return; // Stop if canceled
            }
    
            // Proceed with deletion if confirmed
            var body = {
                'app': appID,
                'ids': [recordId]
            };
    
            kintone.api(kintone.api.url('/k/v1/records.json', true), 'DELETE', body, function(resp) {
                swal({
                    title: 'Record Deleted Successfully!',
                    text: 'お疲れ様でした。',
                    icon: 'success'
                }).then(() => {
                    location.reload();
                });
            }, function(error) {
                console.error('エラーが発生しました:', error);
                swal({
                    title: 'エラーが発生しました',
                    text: error.message,
                    icon: 'error'
                });
            });
        });
    
        // Add custom CSS for red delete button
        const buttonStyles = document.createElement('style');
        buttonStyles.textContent = `
            .swal-button.btn-red {
                background-color: #dc3545 !important;
                color: white !important;
                border: none;
                padding: 8px 15px;
                font-size: 16px;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s ease-in-out;
            }
            
            .swal-button.btn-red:hover {
                background-color: #c82333 !important;
            }
        `;
        document.head.appendChild(buttonStyles);
    }
    
    


    async function getAllFieldName(){
        const dataRetriveType = cybozu.data.page;
        const allFieldCode = dataRetriveType.SCHEMA_DATA.table.fieldList;
        const getAllFieldName = dataRetriveType.VIEW_DATA.fields[0].row;
        const FieldCode = [];
        getAllFieldName.forEach(fields =>{
            FieldCode.push(fields.id);
        });

        filterdFiledList = FieldCode.map(id => allFieldCode[id]);
        tableHeaderdata = tableHeaderGenerator(filterdFiledList);
        return tableHeaderdata;
    }

    function tableHeaderGenerator(allHeader){
        //console.log(allHeader);
        var widthPerCollumn = 90/allHeader.length;
        let dynamicHeaders = '';
        dynamicHeaders += `<th></th>`;
        allHeader.forEach(title => { 
            if(title != undefined){
                dynamicHeaders += `<th>${title.label}</th>`;
            }
             
        }); 

        dynamicHeaders += `<th></th>`;
        return dynamicHeaders;
    }

    function urlGenerator(recordId, mode){
        var Url = kintone.api.url('/k/'+appID+'/show#record='+recordId+'&mode=edit');
        if(mode == 'show'){
            Url = kintone.api.url('/k/'+appID+'/show#record='+recordId);
        }

        if(mode == 'user'){
            Url = kintone.api.url('/users/'+recordId);
        }
        Url = Url.replace('.json', '');
        return Url;
    }

    

    function attachedDocumentHandaler(fieldName, recordId) {
        // Get attachment elements for the specified field
       // const dataRetriveType = cybozu.data.page;
        const attachmentElements = kintone.app.getFieldElements(fieldName);
        

        if (!attachmentElements || attachmentElements.length === 0) {
            //console.log(`No attachment elements found for field: ${fieldName}`);
            return [];
        }
    
        const tableData = []; // Array to store all file data
    
        // Iterate over attachment elements
        attachmentElements.forEach((attachmentElement) => {
            // Find all <li> elements inside this attachment element
            const listItems = attachmentElement.querySelectorAll('li');
    
            listItems.forEach((item, fileIndex) => {
                // Check for image (using <img> tag)
                const imgElement = item.querySelector('img');
                if (imgElement) {
                    const imgUrl = imgElement.getAttribute('src');
                    const imgTitle = imgElement.getAttribute('title') || `Image ${fileIndex + 1}`;
                    const sliderNo = imgElement.getAttribute('data-thumbnail-key');
    
                    // Filter based on recordId in URL
                    if (imgUrl && imgUrl.includes(`record=${recordId}`)) {
                        tableData.push({
                            id: recordId,
                            type: 'image/jpeg',
                            url: imgUrl,
                            name: imgTitle,
                            sliderNo: sliderNo,
                        });
                    }
                }
    
                // Check for other file types (using <a> tag)
                const linkElement = item.querySelector('a');
                if (linkElement) {
                    const fileUrl = linkElement.getAttribute('href');
                    const fileName = linkElement.innerText || `File ${fileIndex + 1}`;
    
                    // Filter based on recordId in URL
                    if (fileUrl && fileUrl.includes(`record=${recordId}`)) {
                        tableData.push({
                            id: recordId,
                            type: 'application/pdf',
                            url: fileUrl,
                            name: fileName
                        });
                    }
                }
            });
        });
    
       //console.log(tableData); // Log the results
        return tableData; // Return all file data
    }

    function imageUrlConverter(url) {
        const newUrl = url.replace(/&w=50&h=50&flag=SHRINK/, '&w=1300&h=1500&flag=SHRINK');
        return newUrl;
    }

    function filterRecords(query) {
        let filteredData = [];
  
        globalRecords.forEach(record => {
            // Iterate through each property of the record
            Object.keys(record).forEach(key => {
                const property = record[key];
                let currentValue;
        
                if (property.value) {
                    if (Array.isArray(property.value)) {
                        property.value.forEach(item => {
                            currentValue = item.name; // Assuming you want to match against item.name in arrays
                            if (typeof currentValue === 'string' && currentValue.includes(query)) {
                                if (!filteredData.some(existingRecord => existingRecord === record)) {
                                    filteredData.push(record);
                                }
                            }
                        });
                    } else {
                        currentValue = property.value;
                        if (typeof currentValue === 'string' && currentValue.includes(query)) {
                            //console.log(`Match found: ${currentValue}`);
                            if (!filteredData.some(existingRecord => existingRecord === record)) {
                                filteredData.push(record);
                            }
                        }
                    }
                } else {
                    console.log(`No value property for key: ${key}`);
                }
            });
        });
  
        return filteredData;
        
      }

      function dateTimeConverter(inputDate){
        // Create a Date object
        const date = new Date(inputDate);
        // Adjust for the timezone (JST is UTC+9)
        date.setHours(date.getHours() + 9);
        // Extract the date and time components
        const year = date.getUTCFullYear();
        const month = ('0' + (date.getUTCMonth() + 1)).slice(-2); 
        const day = ('0' + date.getUTCDate()).slice(-2);
        const hours = ('0' + date.getUTCHours()).slice(-2); 
        const minutes = ('0' + date.getUTCMinutes()).slice(-2); 
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}`;
        return formattedDate;
    }

    
})();