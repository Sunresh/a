(function(PLUGIN_ID) {
    'use strict';

    // Load FontAwesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

    // get plugin configuration settings
    const config = kintone.plugin.app.getConfig(PLUGIN_ID);

    //Spinner Design
    // Define your colors
    const colors = ['#0099cc', '#6600ff', '#cc0099', '#ff3300', '#ff9900', '#ff9900', '#669900', '#00cc99', '#333300', '#cc3300', '#666633', '#0000cc', '#9900ff', '#00ffcc', '#ff33cc'];

    // Function to get a random color
    function getRandomColor(colors) {
        const randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    }

    // When generating the spinner element
    const spinnerColor = getRandomColor(colors);

    const spinnerHtml = `
    <div class="spinner-border" role="status" style="color: ${spinnerColor};">
        <span class="sr-only">Loading...</span>
    </div>
    `;

    //

    var actions;
    var states;
    var users = {};
    var currentUser = kintone.getLoginUser();
    var ogusuSearchPluginCheck = config.searchPluginStatus;

    // Function to fetch process management status
    async function fetchProcessManagementStatus() {
        const body = {
            app: kintone.app.getId()
        };

        try {
            const response = await kintone.api(kintone.api.url('/k/v1/app/status.json', true), 'GET', body);
            return response;
        } catch (error) {
            console.error('Error fetching process management status:', error);
            throw error;
        }
    }

    // MQTT Function
    const sendmqtt = {
        connectHQTT: (topic,obj) => {
            return new Promise((resolve, reject) => {
                var script = document.createElement('script');
                script.src = 'https://unpkg.com/mqtt/dist/mqtt.min.js';
                script.onload = function() {
                    var client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
                    client.on('connect', function () {
                        //console.log('Connected to MQTT broker');
                        //console.log(JSON.stringify(obj));
                        client.publish(topic, JSON.stringify(obj));
                    });
                    client.on('message', (topic, message) => {
                        //console.log(`Received message on topic ${topic}: ${message}`);
                        if (topic === 'kintone/balkapploval/mailer') {
                            client.end();
                            resolve('success');
                        }
                    });
                    client.subscribe('kintone/balkapploval/mailer');
                    client.on('error', function (error) {
                        console.error('Connection error: ', error);
                        reject(error);
                    });
                };
                document.head.appendChild(script);
            });
        }
    };

    function findRecordById(dataId, records) {
        return records.find(record => record.$id.value === dataId);
    }
    
    //Bulk Approval Function
    function bulkApprovalFunction(buttonId, event){
        buttonId.className = 'btn btn-danger mr-1 mb-3 ml-3';
        buttonId.innerHTML = '<i class="fas fa-check-circle mr-1"></i> 一括承認！';
        buttonId.addEventListener('click', () => {
            //console.log(actions);
            var currentUser = kintone.getLoginUser();
            let selectedRecords = [];
            var enableActions;
            var approval_action = {};
            var approval_assignee = {};
            var  asigneeType;
            var allSelectedAction = [];

            var checkboxes = document.querySelectorAll('.record-checkbox');
            
            for (const [index, checkbox] of checkboxes.entries()) {
                if (checkbox.checked) {
                    const dataId = checkbox.getAttribute('data-id');
                    var record = findRecordById(dataId, event.records);

                    if (record) {
                        const selectedAction = document.getElementById(`dropdown-${record.$id.value}`).value;
                        if (!record.作業者.value.some(item => item.name === currentUser.name)) {
                            swal({
                                title: 'このアイテムを選択することは許可されていません。',
                                icon: 'warning',
                                buttons: true,
                                dangerMode: true,
                            }).then((willProceed) => {
                                if (!willProceed) {
                                    return;
                                }
                            });
                            return;
                        } else {
                            
                            selectedRecords.push(record);
                            allSelectedAction.push(selectedAction);
                            enableActions = actions.filter(item => item.name === selectedAction);
                            
                            enableActions.some(action => {

                                if (!approval_action[action.from]) {
                                    approval_action[action.from] = [];
                                }
                                if (!approval_assignee[action.from]) {
                                    approval_assignee[action.from] = [];
                                }
                            

                                if (action.filterCond) {
                                    let result = parseFiltercond(action.filterCond.replace(/"/g, ''), record);
                                    

                                    if (result) {
                                        approval_action[action.from].push(action.name);
                                        const state = states[action.to]; // Get the state of the target status

                                        const assignees = getCurrentAssignee(state, record); // Get current assignees based on the state
                                        asigneeType = state.assignee.type;
                                        
                                        // if(state.assignee.type == 'ONE'){
                                        //     asigneeType = state.assignee.type;
                                        // }
                                        //console.log(state);
                                        


                                        if (assignees.length > 0) {
                                            approval_assignee[action.from].push(assignees[0].code);
                                        } else {
                                            approval_assignee[action.from].push(currentUser.code);
                                        }
                                    }
                                } else {
                                    
                                    approval_action[action.from].push(action.name);
                                    approval_assignee[action.from].push(currentUser.code);
                                }
                            });
                        }
                    } else {
                        console.log("Record not found");
                    }

                    
                }
            }

            
            // Ensure approval_action and approval_assignee are not empty
            Object.keys(approval_action).forEach(key => {
                if (approval_action[key].length === 0) {
                    delete approval_action[key];
                    delete approval_assignee[key];
                }
            });

            if (selectedRecords.length > 0) {
                if (approval_action) {
                    swal({
                        title: 'すべてを承認してもよろしいですか？',
                        text: '表示されているすべてのレコードを承認します',
                        icon: 'warning',
                        buttons: {
                            cancel: 'キャンセル',
                            confirm: {
                                text: '承認',
                                value: true,
                                visible: true,
                                className: 'btn btn-danger',
                                closeModal: false
                            }
                        }
                    }).then((willApprove) => {
                        if (willApprove) {
                            swal({
                                title: '処理中...',
                                text: 'レコードを更新中ですので、しばらくお待ちください。',
                                buttons: false, 
                                closeOnClickOutside: false,
                                content: {
                                    element: "div",
                                    attributes: {
                                        innerHTML: spinnerHtml
                                    }
                                }
                            });

                            const recordsToApprove = recordSerilizerWithAsignee(selectedRecords, allSelectedAction, asigneeType);

                            const requestObj = {
                                app: kintone.app.getId(),
                                records: recordsToApprove
                            };

                            kintone.api(kintone.api.url('/k/v1/records/status.json', true), 'PUT', requestObj, async(resp) => {
                                // MQTT data 
                                const MQTTObj = {
                                    app: kintone.app.getId(),
                                    records: recordsToApprove
                                };                                    
                                
                                // MQTT Publish
                                await sendmqtt.connectHQTT('kintone/balkapploval/mailer',MQTTObj);

                                swal({
                                    title: '承認に成功しました！',
                                    text: 'お疲れ様でした。',
                                    icon: 'success'
                                }).then(() => {
                                    location.reload();
                                });
                            }, (error) => {
                                console.error('エラーが発生しました:', error);
                                swal({
                                    title: 'エラーが発生しました',
                                    text: error.message,
                                    icon: 'error'
                                });
                            });
                        }
                    });
                } else {
                    swal({
                        title: '実行可能なアクションがありません。',
                        icon: 'warning'
                    });
                }
            } else {
                swal({
                    title: 'レコードを選択してください。',
                    icon: 'warning'
                });
            }
        });
    }


    function recordSerilizerWithAsignee(selectedRecords, allSelectedAction, asigneeType){
        const recordsToApprove = []; 
        selectedRecords.forEach((record, index) => {
            const action = {
                id: record.$id.value,
                action: allSelectedAction[index]
            };

            if (asigneeType == "ONE") {
                var key = index;
                var currentStatus = record.ステータス.value;
                var destination;
                var currentAssigneeType;
                var lastIndexCheck = 0;

                // Convert object to array of key-value pairs
                const actionsEntries = Object.entries(actions);
                const foundAction = actionsEntries.find(([key, rec]) => rec.name === allSelectedAction[index] && rec.from === currentStatus);

                if (foundAction) {
                    const [key, rec] = foundAction;
                    destination = rec.to;
                }

                //console.log(states);
                const statesEntries = Object.entries(states);
                var foundEntry = statesEntries.find(([key, rec]) => rec.name === destination);

                if (foundEntry) {
                    const [key, rec] = foundEntry;
                    currentAssigneeType = rec.assignee.type;
                }

                // Initialize variables to track the element with the highest index
                var lastStatusName = getLastStatusName(statesEntries);

                // console.log('Name of the element with the highest index:', lastStatusName);
                if (lastStatusName === destination) {
                    lastIndexCheck = 1;
                }

                if (currentAssigneeType != 'ALL' && lastIndexCheck == 0) {
                    //New Code (31/01/2025)
                    const expectedUser = foundEntry[1].assignee.entities[0].entity.code;

                    if (expectedUser) {
                        //const assignee = expectedUser.value[0].code;
                        const assignee = expectedUser;
                        action.assignee = assignee;
                    } else {
                        console.error('Key does not exist in approval_assignee:', currentStatus, key);
                    }

                    //Old Code
                    // const expectedUser = record[foundEntry[1].assignee.entities[0].entity.code];

                    // if (expectedUser.value[0].code) {
                    //     const assignee = expectedUser.value[0].code;
                    //     action.assignee = assignee;
                    // } else {
                    //     console.error('Key does not exist in approval_assignee:', currentStatus, key);
                    // }

                }
            }else{
                var nextStatus;
                const nextActionData = actionFinder(actions, action.action, record);
                if (nextActionData) {
                    nextStatus = nextActionData[1].to;
                }

                var nextStates = statesFinder(states, nextStatus);
                if(nextStates){
                    var statusAssigneeType = nextStates[1].assignee.type;
                    if(statusAssigneeType == 'ONE' && nextStates[1].assignee.entities != ''){
                        action.assignee = nextStates[1].assignee.entities[0].entity.code;
                    }
                }
            }

            recordsToApprove.push(action);
        });

        //console.log(recordsToApprove);
        return recordsToApprove;
    }

    function actionFinder(allAction, current, record){
        const actionsEntries = Object.entries(allAction);
        const foundAction = actionsEntries.find(([key, rec]) => rec.name === current && rec.from === record.ステータス.value);
        return foundAction;
    }

    function statesFinder(allStatus, current){
        const statesEntries = Object.entries(allStatus);
        var foundEntry = statesEntries.find(([key, rec]) => rec.name === current);
        return foundEntry;
    }

    function getLastStatusName(allStatus) {
        // Initialize variables to track the element with the highest index
        let maxIndex = -1;
        let maxIndexElement = null;

        // Iterate through the array to find the element with the highest index
        allStatus.forEach(([key, rec]) => {
            const index = parseInt(rec.index, 10); // Ensure the index is an integer
            if (index > maxIndex) {
                maxIndex = index;
                maxIndexElement = rec;
            }
        });

        // Extract the name of the element with the highest index
        const lastIndexName = maxIndexElement ? maxIndexElement.name : null;
        return lastIndexName;
    }


    // For all item selection use this function
    function allItemSelect(buttonId, event){
        buttonId.className = 'btn btn-warning mb-3 ml-1';
        buttonId.innerHTML = '<i class="fas fa-check-double mr-1"></i>  全選択';
        buttonId.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.record-checkbox');
        
        checkboxes.forEach(checkbox => {
                // Create a dropdown for each checkbox
                const dataId = checkbox.getAttribute('data-id');
                let dropdown = document.createElement('select');
                dropdown.className = 'row-dropdown';
                dropdown.id = `dropdown-${dataId}`
                dropdown.style.display = 'none'; 

                // Insert the checkbox and dropdown into the first cell of the row
                const row = checkbox.closest('tr');
                const firstCell = row.querySelector('td');

                if (firstCell) {
                    firstCell.innerHTML = '';
                    firstCell.appendChild(checkbox);
                    firstCell.appendChild(dropdown);
                } else {
                    const newFirstCell = row.insertCell(0);
                    newFirstCell.appendChild(checkbox);
                    newFirstCell.appendChild(dropdown);
                }
                
                dropDownColumnGenerator();

                const dataStatus = checkbox.getAttribute('data-status');
                const record = event.records.find(record => record.$id.value === dataId);
            
                // Event listener to show dropdown when checkbox is checked
                checkbox.addEventListener('change', function() {
                    if (checkbox.checked) {
                        fetchActions(dropdown, record, dataStatus).then(() => {
                            dropdown.style.display = 'inline-block';
                        });
                    } else {
                        dropdown.style.display = 'none';
                    }
                });
            
                // Programmatically check all checkboxes (for testing or specific use cases)
                checkbox.checked = true;

                fetchActions(dropdown, record, dataStatus).then(() => {
                    dropdown.style.display = 'inline-block';
                    dropdown.className = 'row-dropdown form-control-sm';
                });
            });

        });
    }

    //For all item deselect use this function
    function allItemDeselect(buttonId){
        buttonId.className = 'btn btn-info mb-3 ml-2';
        buttonId.innerHTML = '<i class="fas fa-undo mr-1"></i>  すべて選択解除';

        buttonId.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('.record-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                let dataId = checkbox.getAttribute('data-id');
                document.getElementById(`dropdown-${dataId}`).style.display = 'none';
            });
        });
    }

    const addButtons = (event) => {
        const el = kintone.app.getHeaderSpaceElement();
        // 既存のheader-contentsをクリア
        const existingHeader = el.querySelector('.header-contents');
        if (existingHeader) {
            existingHeader.remove();
        }

        const headerDiv = document.createElement('div');
        headerDiv.className = 'header-contents d-flex align-items-center text-center';

        const balkApprovalButton = document.createElement('button');
        bulkApprovalFunction(balkApprovalButton, event);

        const selectAllButton = document.createElement('button');
        allItemSelect(selectAllButton, event);

        // For Deselect
        const deSelectAllButton = document.createElement('button');
        allItemDeselect(deSelectAllButton);

        headerDiv.appendChild(balkApprovalButton);
        headerDiv.appendChild(selectAllButton);
        headerDiv.appendChild(deSelectAllButton);
        el.appendChild(headerDiv);
    };

    kintone.events.on('app.record.index.show', async function(event) {
        // Check if the element with ID 'krewsheet' exists
        var krewsheetElementCheck = document.getElementById('krewsheet');
        if (krewsheetElementCheck) {
            return;
        }

        
        

        let processStatus;
    
        try {
            processStatus = await fetchProcessManagementStatus();
            // Store the status in a variable for further use
            window.processStatus = processStatus.actions;
    
            states = processStatus.states;
            const starts = Object.values(states).find(state => state.index === "0")?.name;
            const excludedNames = new Set(processStatus.actions
                .filter(action => action.to === starts)
                .map(action => action.name));
            actions = processStatus.actions.filter(action => !excludedNames.has(action.name));
    
            actions.forEach(action => {
                const conditions = action.filterCond.replace(/\(|\)|"/g, '').split(/and | or /);
                conditions.forEach(condition => {
                    if (condition) {
                        const targets = condition.split(/not in | in /)[1].split(',');
                        const isMenber = ["GROUP", "ORGANIZATION", "USER"].some(item => condition.includes(item));
                        if (isMenber) {
                            const groups = [];
                            for (let i = 0; i < targets.length; i += 2) {
                                groups.push(targets.slice(i, i + 2));
                            }
                            
                            fetchGroupUsers(groups);
                        }
                    }
                });
            });
    
        } catch (error) {
            console.error('Failed to fetch process management status:', error);
        }


        await searchPluginCheck(event);
        // console.log("From ======");
        // console.log(searchPluginExist);
        
        // if(searchPluginExist == false){
        //     await initializeCheckboxes(event.records);
        // }
        
        
        addButtons(event);
    });

    async function searchPluginCheck(event){
        if(ogusuSearchPluginCheck){
            if(ogusuSearchPluginCheck == 0){
                initializeCheckboxes(event.records);
            }else{
                setTimeout(() => {
                    dataTableCheckBoxInitializer(event.records);
                }, 300); // Delay of 3 seconds
                
            }

        }
        
    }

    
    //Test Parpose
    function dataTableCheckBoxInitializer(records) {
        // Get the table once
        let table = document.getElementById('ogusuSearch');
        if (!table) {
            console.error('Table "ogusuSearch" not found.');
            return;
        }

        // Add header cell if it doesn't exist
        let thead = table.querySelector('thead');
        if (thead) {
            let headerRow = thead.querySelector('tr');
            if (headerRow && !headerRow.querySelector('.custom-header-cell')) {
                let newHeaderCell = document.createElement('th');
                newHeaderCell.className = 'recordlist-header-cell-gaia custom-header-cell';
                newHeaderCell.textContent = '選択'; // "Selection" in Japanese
                headerRow.insertBefore(newHeaderCell, headerRow.firstChild);
            }
        }
    
        // Get tbody and rows once
        let tbody = table.querySelector('tbody');
        let rows = tbody.querySelectorAll('tr');
        
        // Get current user name (replace with actual Kintone user retrieval)
        let currentUserName = currentUser.name;

        // Process each row only once
        rows.forEach(row => {
            // Check if the row already has our custom cell to avoid duplicate processing
            if (row.querySelector('.custom-checkbox-cell')) {
                return;
            }
    
            let recordNumberCell = row.querySelector('td:nth-child(2)');
            if (!recordNumberCell) return;

            let recordNumber = recordNumberCell.innerText.trim();

            // Find corresponding record from records array
            let record = records.find(rec => rec['レコード番号'].value.trim() === recordNumber);
            if (!record) return;
            let recordOperator = record['作業者'].value[0].name;
            let recordStatus = record.ステータス.value;

            // Create new cell with custom class
            let newCell = row.insertCell(0);
            newCell.className = 'recordlist-header-cell-gaia custom-checkbox-cell';
    
            // Only create controls if user matches operator and status isn't approved
            if (recordOperator === currentUserName && recordStatus !== '承認済') {
                // Create Checkbox
                let checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'record-checkbox';
                checkbox.setAttribute('data-id', recordNumber);
                checkbox.setAttribute('data-status', recordStatus);
    
                // Create Dropdown
                let dropdown = document.createElement('select');
                dropdown.id = `dropdown-${recordNumber}`;
                dropdown.className = 'row-dropdown form-control-sm';
                dropdown.style.display = 'none';
    
                // Add elements to cell
                newCell.appendChild(checkbox);
                newCell.appendChild(dropdown);
    
                // Checkbox change event
                checkbox.addEventListener('change', function() {
                    if (checkbox.checked) {
                        fetchActions(dropdown, record, record.ステータス.value).then(() => {
                            dropdown.style.display = 'inline-block';
                        });
                    } else {
                        dropdown.style.display = 'none';
                    }
                });
            }
        });
    }
    

    //End Test Parpose
    
    // Function to initialize checkboxes and dropdowns
    function initializeCheckboxes(records) {
        let rowElements = kintone.app.getFieldElements('レコード番号');
        let recordOperator;
    
        records.forEach(function(record) {
            let rowElement = Array.from(rowElements).find(el => el.textContent.trim() === record['レコード番号'].value.trim());

            if (rowElement) {
                if (!rowElement.closest('tr').querySelector(`.record-checkbox[data-id="${record.$id.value}"]`)) {
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'record-checkbox';
                    checkbox.setAttribute('data-id', record.$id.value);
                    checkbox.setAttribute('data-status', record.ステータス.value);
    
                    let dropdown = document.createElement('select');
                    dropdown.id = `dropdown-${record.$id.value}`;
                    dropdown.className = 'row-dropdown form-control-sm'; // Add Bootstrap class here
                    dropdown.style.display = 'none';
    
                    let cell = rowElement.closest('tr').insertCell(0);
                    cell.className = 'recordlist-header-cell-gaia';

                    if(record['作業者'].value != ''){
                        recordOperator = record['作業者'].value[0].name;
                    }

                    dropDownColumnGenerator();

                    if(recordOperator == currentUser.name && record['ステータス'].value != '承認済'){
                        cell.appendChild(checkbox);
                        cell.appendChild(dropdown);
                    }
                    
    
                    checkbox.addEventListener('change', function() {
                        if (checkbox.checked) {
                            fetchActions(dropdown, record, record.ステータス.value).then(() => {
                                dropDownColumnGenerator();
                                dropdown.style.display = 'inline-block';
                            });
                        } else {
                            dropdown.style.display = 'none';
                        }
                    });
                }
            } else {
                console.error(`Row element not found for record: ${record['レコード番号'].value}`);
            }
        });
    }

    //Newly Added
    function fetchGroupUsers(groups) {
        const userdata = {
            "GROUP": "/v1/group/users.json",
            "ORGANIZATION": "/v1/organization/users.json",
            "USER": '/v1/users.json'
        };

        groups.forEach(group => {
            const type = group[0].trim();
            const code = group[1].trim();
            const appId = kintone.app.getId();

            if (!users[type]) {
                users[type] = {};
            }

            if (!users[type][code]) {
                users[type][code] = [];
                const body = {
                    code: code,
                    codes: code,
                    app: appId
                };
                

                fetchUsers(userdata, type, body, code);
            }
        });
    }

    function fetchUsers(userdata, type, body, code) {
        let offset = 0;

        function fetchBatch(offset) {
            body.offset = offset;
            kintone.api(kintone.api.url(userdata[type], true), 'GET', body, (guser) => {
                const userKeys = Object.keys(guser);
                
                if (userKeys.length === 0 || guser[userKeys[0]].length === 0) {
                    console.log(`${type} ${body.code} has no more users.`);
                    return;
                }

                if (!users[type]) {
                    users[type] = {};
                }
                if (!users[type][code]) {
                    users[type][code] = [];
                }
                guser[userKeys[0]].forEach(data => {
                    if (!users[type][code].includes(data.code)) {
                        users[type][code].push(data.code);
                    }
                });

                if (guser[userKeys[0]].length === 100) {
                    fetchBatch(offset + 100);
                } 
                // else {
                //     console.log(type, body.code, guser);
                // }
            });
        }

        fetchBatch(offset);
    }

    function parseFiltercond(filterCond, data) {
        const resultArray = [];
        filterCond.replace(/ and | or /g, match => {
            resultArray.push(match.trim() === 'and' ? '&&' : '||');
        });
    
        const conds = filterCond.split(/ and | or /);
        let results = [];
    
        conds.forEach(cond => {
            const details = cond.split(/ not in | in /);
            const targets = details[1].replace(/\(|\)/g, '').split(",");
            const isMember = ["GROUP", "ORGANIZATION", "USER"].some(item => cond.includes(item));
    
            if (isMember) {
                const chunkedArray = [];
                for (let i = 0; i < targets.length; i += 2) {
                    chunkedArray.push(targets.slice(i, i + 2));
                }
    
                const isName = chunkedArray.some(target => {
                    const fieldName = details[0].trim();
                    const dataArray = data[fieldName]?.value;
    
                    // Handle both array and single object scenarios
                    if (Array.isArray(dataArray)) {
                        const targetGroup = target[0].trim();
                        const targetValue = target[1].trim();
                        const isCode = dataArray.some(code => users[targetGroup]?.[targetValue]?.includes(code.code));
    
                        return isCode;
                    } else if (typeof dataArray === 'object' && dataArray !== null) {
                        // Single-object fields like Creator
                        const targetGroup = target[0].trim();
                        const targetValue = target[1].trim();
                        const isCode = users[targetGroup]?.[targetValue]?.includes(dataArray.code);
    
                        return isCode;
                    }
    
                    console.error(`Expected array or object for field ${fieldName}, but got:`, dataArray);
                    return false;
                });
    
                results.push(isName ? !cond.includes("not in") : cond.includes("not in"));
            } else {
                const fieldValue = data[details[0].trim()]?.value;
                if (!fieldValue) {
                    console.error(`Field ${details[0].trim()} not found in data`);
                    results.push(false);
                    return;
                }
    
                results.push(details[1].includes(fieldValue) ? !cond.includes("not in") : cond.includes("not in"));
            }
        });

        
        if (results.length) {
            let result_string = results[0].toString();
            for (let i = 1; i < results.length; i++) {
                result_string += ` ${resultArray[i - 1]} ${results[i]}`;
            }

            return eval(result_string);
        } else {
            return false;
        }
    }
    
    function getCurrentAssignee(state, record) {
        const assignees = [];
        if (state.assignee && state.assignee.entities) {
            state.assignee.entities.forEach(entity => {
                if (entity.entity.type === "FIELD_ENTITY") {
                    const fieldCode = entity.entity.code;
                    const fieldAssignees = record[fieldCode]?.value;
                    
                    // Ensure that fieldAssignees is an array before using the spread syntax
                    if (Array.isArray(fieldAssignees)) {
                        assignees.push(...fieldAssignees);
                    } else if (typeof fieldAssignees === 'object' && fieldAssignees !== null) {
                        // Handle single-object fields like Creator
                        assignees.push(fieldAssignees);
                    } else {
                        console.error(`Expected array or object for field ${fieldCode}, but got:`, fieldAssignees);
                    }
                }
            });
        }
        return assignees;
    }

    function dropDownColumnGenerator(){
        const table = kintone.app.getFieldElements('ステータス')[0]?.closest('table');
        if (!table) {
            return;
        }

        let thead = table.querySelector('thead');

        if (!thead) {
            thead = document.createElement('thead');
            table.insertBefore(thead, table.firstChild);
        }

        let th = thead.querySelector('.adding-th');
        if (!th) {
            th = document.createElement('th');
            th.style.width = '145px';
            th.className = "recordlist-header-cell-gaia adding-th";
            th.textContent = "レコードの選択";
            thead.insertBefore(th,thead.firstChild);
        }
    }

    async function fetchActions(dropdown, record, status) {
        populateDropdown(dropdown, actions, status, record);
    }

    function populateDropdown(dropdown, actions, status, record) {
        var collletedActions;
        var eligibleActionName = [];

        actions.forEach(action => {
            if (action.from === status) {
                 var approval_action2 = {};
                 collletedActions = actions.filter(item => item.name === action.name);
                 

                collletedActions.some(action => {
                    if (!approval_action2[action.from]) {
                        approval_action2[action.from] = [];
                    }

                    if(action.filterCond == ''){
                        approval_action2[action.from].push(action.name);
                    }
                    

                    if (action.filterCond) {
                        let result = parseFiltercond(action.filterCond.replace(/"/g, ''), record);
                    
                        if (result) {
                            approval_action2[action.from].push(action.name);
                        }
                    }
                });

                if (approval_action2[status]) { 
                    eligibleActionName.push(...approval_action2[status]); 
                }
            }
        });

        // Clear existing options
        dropdown.innerHTML = '';

        // Loop through eligibleActionNames and create option elements
        eligibleActionName.forEach(actionName => {
            let option = document.createElement('option');
            option.value = actionName;
            option.text = actionName;
            dropdown.appendChild(option);
        });
    }
    



})(kintone.$PLUGIN_ID);