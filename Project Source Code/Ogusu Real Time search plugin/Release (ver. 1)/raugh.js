(function() {
    'use strict';

    // Load FontAwesome
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/sweetalert/dist/sweetalert.min.js';
    document.head.appendChild(script);

    // Load Bootstrap
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.href = "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/css/bootstrap.css";
    bootstrapCSS.rel = "stylesheet";
    document.head.appendChild(bootstrapCSS);

    const bootstrapCSS2 = document.createElement('link');
    bootstrapCSS2.href = "https://cdn.datatables.net/2.2.1/css/dataTables.bootstrap4.css";
    bootstrapCSS2.rel = "stylesheet";
    document.head.appendChild(bootstrapCSS2);

    // Load FontAwesome
    const fontAwesome = document.createElement('link');
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css";
    fontAwesome.rel = "stylesheet";
    document.head.appendChild(fontAwesome);

     // Load DataTables CSS
    const dataTableCSS = document.createElement('link');
    dataTableCSS.href = "https://cdn.datatables.net/2.2.1/css/dataTables.dataTables.css";
    dataTableCSS.rel = "stylesheet";
    document.head.appendChild(dataTableCSS);
  
    // Load DataTables JS
    const dataTableJS = document.createElement('script');
    dataTableJS.src = "https://code.jquery.com/jquery-3.7.1.js";
    document.head.appendChild(dataTableJS);
    
    const dataTableJS2 = document.createElement('script');
    dataTableJS2.src = "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js";
    document.head.appendChild(dataTableJS2);

    const dataTableJS3 = document.createElement('script');
    dataTableJS3.src = "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.2/js/bootstrap.min.js";
    document.head.appendChild(dataTableJS3);

    const dataTableJS4 = document.createElement('script');
    dataTableJS4.src = "https://cdn.datatables.net/2.2.1/js/dataTables.js";
    document.head.appendChild(dataTableJS4);

    const dataTableJS5 = document.createElement('script');
    dataTableJS5.src = "https://cdn.datatables.net/2.2.1/js/dataTables.bootstrap4.js";
    document.head.appendChild(dataTableJS5);

    const el = kintone.app.getHeaderSpaceElement();
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-contents d-flex  align-items-center text-center';

    // Create the search field container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'input-group mr-3 mb-3 ml-3'; // Bootstrap class for input group
    searchContainer.style.width = '400px'; // Adjust width of the search box container

    // Add the search icon
    const searchIcon = document.createElement('div');
    searchIcon.className = 'input-group-prepend';
    searchIcon.innerHTML = `<span class="input-group-text"><i class="fas fa-search"></i></span>`;
    searchContainer.appendChild(searchIcon);

    // Create the search input field
    const searchField = document.createElement('input');
    searchField.type = 'text';
    searchField.className = 'form-control'; // Add Bootstrap class for styling
    searchField.placeholder = 'Search anything here ...'; // Placeholder text in Japanese for "Search"
    searchContainer.appendChild(searchField);

    // Add the search container to the header
    headerDiv.appendChild(searchContainer);
    // Add the header div to the Kintone header space
    el.appendChild(headerDiv);


    
    
    //getAllFieldName();

    // Define the global variable
    let globalRecords;
    let filterdFiledList;
    let tabledata;
    // let tabledata = `
    //     <th>Name</th>
    //     <th>Position</th>
    //     <th>Office</th>
    //     <th>Age</th>
    //     <th>Start date</th>
    //     <th>Salary</th>
    // `;


    
  
    
    

   

    kintone.events.on('app.record.index.show', async function (event) {
        //document.getElementById('view-list-data-gaia').style.display = 'none';
        //console.log(event);
        await getAllData();
        await getAllFieldName();

         // Create a table to display search results
        const tableContainer = document.createElement('div');
        const table = document.createElement('table');
        table.id = 'example';
        table.className = 'table table-striped table-bordered display';
        table.style.width = '100%';


        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        tr.innerHTML = tabledata;
        thead.appendChild(tr);
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
    
        tableContainer.appendChild(table);
        el.appendChild(tableContainer);

        // Initialize DataTable
        dataTableJS5.onload = function () {
            new DataTable('#example');
        };
            
        
        //console.log(cybozu.data);
        //console.log(globalRecords); // This will now have the correct value

       // console.log(cybozu.data.uri.STATIC_IMAGE_PREFIX);
       //console.log(filterdFiledList);

        //let allField = getAllFieldName();
       // console.log(allField);

       

        searchField.addEventListener('keyup', async () => {
          const queryForSearch = searchField.value.trim();
          let filterRecord = filterRecords(queryForSearch);

          // Clear all previous rows 
          const tbody = document.querySelector('tbody'); 
          while (tbody.firstChild) { 
                tbody.removeChild(tbody.firstChild); 
            }

           

          filterRecord.forEach(record =>{

            const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="recordlist-cell-gaia detail-action-${record['$id'].value} recordlist-action-gaia">
                          <a class="recordlist-show-gaia" href="/k/904/show#record=${record['$id'].value}" target="_self" title="View record details">
                            <span class="recordlist-detail-gaia"></span>
                          </a>
                        </td>
                        <td>
                          <div><span>${record['$id'].value}</span></div>
                        </td>
                        <td>
                          <div><span>${record['文字列__1行_'].value}</span></div>
                        </td>

                        <td>
                            <div>
                                <ul> 
                          ${record['組織選択'].value.map(file => ` <a style="cursor: pointer;"> 
                            <span><img src="${cybozu.data.uri.STATIC_IMAGE_PREFIX}/argo/form/userselect/org16.png" width="16" height="16"> ${file.name}</span></a> 
                            `).join('')} 
                         </ul>
                            </div>
                        </td>
                        <td class= "recordlist-cell-gaia recordlist-status-gaia">
                          <div><span>${record['ステータス'].value}</span></div>
                        </td>

                        <td class="recordlist-cell-gaia recordlist-status_assignee-gaia value-7467270">
                            <div>
                                <button class="recordlist-username-gaia" aria-expanded="false">
                                <img src="${cybozu.data.LOGIN_USER.photo['small']}" width="16" height="16">
                                <span>${record['作業者'].value[0].name}</span>
                                </button>
                            </div>
                        </td>

                        <td class="recordlist-cell-gaia recordlist-action-gaia">
                            <div class="recordlist-cell-edit-and-remove-action">
                                <button type="button" class="recordlist-edit-gaia" title="Edit" aria-label="Edit">
                                <img class="recordlist-edit-icon-gaia" src="https://static.cybozu.com/contents/k/image/argo/component/recordlist/record-edit.png" alt="">
                                </button>
                                <button type="button" class="recordlist-remove-gaia" title="Delete" aria-label="Delete">
                                <img class="recordlist-remove-icon-gaia" src="https://static.cybozu.com/contents/k/image/argo/component/recordlist/record-delete.png" alt="">
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
          });
        })

        //return event;
    });




    

    async function getAllFieldName(){
        const dataRetriveType = cybozu.data.page;
        const allFieldCode = dataRetriveType.SCHEMA_DATA.table.fieldList;
        const getAllFieldName = dataRetriveType.VIEW_DATA.fields[0].row;
        const FieldCode = [];
        getAllFieldName.forEach(fields =>{
            FieldCode.push(fields.id);
        });

        filterdFiledList = FieldCode.map(id => allFieldCode[id]);
        tabledata = await tableGenerator(filterdFiledList);
        console.log(tabledata);
    }



    async function tableGenerator(allHeader){
        let dynamicHeaders = '';
        allHeader.forEach(title => { 
            dynamicHeaders += `<th>${title.label}</th>`; 
        }); 
        //console.log(dynamicHeaders);
        return dynamicHeaders;
    
    }




    async function getAllData() {
        const dataRetriveType = cybozu.data.page;
        const operatorStatus = dataRetriveType['VIEW_DATA'].builtinType;
        let kintoneQuery = '';

        if (operatorStatus === 'ASSIGN') {
            let queryForSearch = cybozu.data.LOGIN_USER.code;
            kintoneQuery = `作業者 in ("${queryForSearch}")`;
        }

        const appId = kintone.app.getId();

        let body = {
            'app': appId,
            'query': kintoneQuery,
        };

        try {
            let resp = await kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body);
            //console.log(resp);
            globalRecords = resp.records; // Set the global variable
        } catch (error) {
            console.log(error);
        }
    }

    // Filter function
    function filterRecords(query) {
      let filteredData = [];
      //console.log(query);
     //console.log(globalRecords);
      
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
                              //console.log(`Match found: ${currentValue}`);
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


















    



    // Add Kintone event listener
    // Add Kintone event listener
    // kintone.events.on('app.record.index.show', function (event) {
    //     //console.log(event);
    //     getAllData();
    //     console.log(cybozu.data);
        

    //     console.log(globalResponse);

      








        // searchField.addEventListener('keyup', async () => {
            
        //     const queryForSearch = searchField.value.trim();
        //     const appId = kintone.app.getId();
        //     let kintoneQuery = '';

        //     console.log(queryForSearch);

        //     if (queryForSearch.length > 0) {
        //         kintoneQuery = `文字列__1行_ like "${queryForSearch}"`; // Replace '文字列__1行_' with the correct field code
        //     }

        //     var body = {
        //         'app': appId,
        //         'query': kintoneQuery,
        //         'fields': ['$id', '文字列__1行_']
        //       };
              
              
        //       kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
        //         console.log(resp);
        //       }, function(error) {
        //         console.log(error);
        //       });


              




    //     //     // try {
    //     //     //     const response = await kintone.api(
    //     //     //         kintone.api.url('/k/v1/records', true),
    //     //     //         'GET',
    //     //     //         {
    //     //     //             app: 904,
    //     //     //             query: kintoneQuery,
    //     //     //         }
    //     //     //     );

    //     //     //     const records = response.records;
    //     //     //     console.log(records);

    //     //     //     // Update the datatable with the filtered records
    //     //     //     //updateTable(records);
    //     //     // } catch (error) {
    //     //     //     console.error('Error fetching filtered records:', error);
    //     //     // }
    //     // });

    //     return event;
    // });


   

    

// // Call the function
// getAllData();

// // Example usage of the global variable (you may need to wait for the API call to complete)
// setTimeout(function() {
//     console.log(globalResponse);
// }, 3000); // Adjust the timeout as needed





})();















const el = kintone.app.getHeaderSpaceElement();
const headerDiv = document.createElement('div');
headerDiv.className = 'header-contents d-flex align-items-center justify-content-center text-center';

// Add content to the headerDiv
const content = document.createElement('div');
content.innerHTML = 'Centered Content';
headerDiv.appendChild(content);

el.appendChild(headerDiv);



<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Delete Button Example</title>
</head>
<body>
    <button type="button" class="recordlist-remove-gaia" title="Delete" aria-label="Delete" id="deleteButton">
        <img class="recordlist-remove-icon-gaia" src="${cybozu.data.uri.STATIC_IMAGE_PREFIX}/argo/component/recordlist/record-delete.png" alt="">
    </button>

    <script>
        // Wait for the DOM to be fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            const deleteButton = document.getElementById('deleteButton');
            
            deleteButton.addEventListener('click', async () => {
                alert("Ok Here we go!!");
            });
        });
    </script>
</body>
</html>

