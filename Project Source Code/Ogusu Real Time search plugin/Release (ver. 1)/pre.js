(function() {
    'use strict';
  
    // Load SweetAlert
    var script = document.createElement('script');
    script.src = 'https://unpkg.com/sweetalert/dist/sweetalert.min.js';
    document.head.appendChild(script);
  
    // Load Bootstrap
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.href = "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css";
    bootstrapCSS.rel = "stylesheet";
    document.head.appendChild(bootstrapCSS);
  
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
    dataTableJS2.src = "https://cdn.datatables.net/2.2.1/js/dataTables.js";
    document.head.appendChild(dataTableJS2);
  
    // Create header space and search box
    const el = kintone.app.getHeaderSpaceElement();
    const headerDiv = document.createElement('div');
    headerDiv.className = 'header-contents d-flex align-items-center text-center';
  
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'input-group mr-3 mb-3 ml-3';
    searchContainer.style.width = '400px';
  
    const searchIcon = document.createElement('div');
    searchIcon.className = 'input-group-prepend';
    searchIcon.innerHTML = `<span class="input-group-text"><i class="fas fa-search"></i></span>`;
    searchContainer.appendChild(searchIcon);
  
    const searchField = document.createElement('input');
    searchField.type = 'text';
    searchField.className = 'form-control';
    searchField.placeholder = 'Search anything here...';
    searchContainer.appendChild(searchField);
  
    headerDiv.appendChild(searchContainer);
    el.appendChild(headerDiv);
  
    // Create a table to display search results
    const tableContainer = document.createElement('div');
    const table = document.createElement('table');
    table.id = 'example';
    table.className = 'view-list-data-gaia';
    table.style.width = '100%';
  
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
  
    // Table headers with specified classes
    tr.innerHTML = `
        <th class="recordlist-header-cell-gaia" width="1%" style="width: 41px;"></th>
        <th class="recordlist-header-cell-gaia label-7467264 recordlist-header-sortable-gaia" width="1%" style="width: 126px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia" title="Sort in descending order">
              <span class="recordlist-header-label-gaia">Record Number Sabbir</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia label-7467286 recordlist-header-sortable-gaia" style="width: 175px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia" title="Sort in descending order">
              <span class="recordlist-header-label-gaia">Text (1 line)</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia label-7467288" width="1%" style="width: 215px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia">
              <span class="recordlist-header-label-gaia">Organization Selection</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia label-7469725" width="1%" style="width: 525px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia">
              <span class="recordlist-header-label-gaia">Attachments</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia label-7467269 recordlist-header-sortable-gaia" width="1%" style="width: 200px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia" title="Sort in descending order">
              <span class="recordlist-header-label-gaia">Status</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia label-7467270" width="1%" style="width: 200px;">
          <div class="recordlist-header-cell-inner-wrapper-gaia">
            <div class="recordlist-header-cell-inner-gaia">
              <span class="recordlist-header-label-gaia">Operator</span>
            </div>
            <div><span class="recordlist-resizer-gaia" style="height: 211px;"></span></div>
          </div>
        </th>
        <th class="recordlist-header-cell-gaia" width="1%" style="width: 85px;"></th>
    `;
  
    thead.appendChild(tr);
    table.appendChild(thead);
  
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
  
    tableContainer.appendChild(table);
    el.appendChild(tableContainer);
  
    // Initialize DataTable
    dataTableJS2.onload = function () {
        new DataTable('#example');
    };
  
    // Add Kintone event listener
    kintone.events.on('app.record.index.show', function (event) {
        document.getElementById('view-list-data-gaia').style.display = 'none';
  
        const queryForSearch = searchField.value.trim();
        const appId = kintone.app.getId();
        let kintoneQuery = '';
  
        if (queryForSearch.length > 0) {
            kintoneQuery = `文字列__1行_ like "${queryForSearch}"`; // Adjust field code here
        }
  
        var body = {
            'app': appId,
            'query': kintoneQuery,
            'fields': ['$id', '文字列__1行_']
        };
  
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
            console.log(resp);
            // Clear existing rows
            tbody.innerHTML = '';
  
            // Populate table with records from the search results
            resp.records.forEach(record => {
                const row = document.createElement('tr');
                row.className = 'recordlist-row-gaia recordlist-row-gaia-hover-highlight';
                row.innerHTML = `
                    <td class="recordlist-cell-gaia detail-action-${record['$id'].value} recordlist-action-gaia">
                      <a class="recordlist-show-gaia" href="/k/904/show#record=${record['$id'].value}" target="_self" title="View record details">
                        <span class="recordlist-detail-gaia"></span>
                      </a>
                    </td>
                    <td class="recordlist-cell-gaia recordlist-record_id-gaia value-7467264">
                      <div><span>${record['$id'].value}</span></div>
                    </td>
                    <td class="recordlist-cell-gaia recordlist-single_line_text-gaia value-7467286">
                      <div class="line-cell-gaia recordlist-ellipsis-gaia"><span>${record['文字列__1行_'].value}</span></div>
                    </td>
                    <td class="recordlist-cell-gaia recordlist-organization_select-gaia value-7467288"><div></div></td>
                    <td class="recordlist-cell-gaia recordlist-file-gaia value-7469725">
                      <ul>
                        <li class="recordlist-file-image-gaia">
                          <a class="recordlist-file-image-container-gaia" style="cursor: pointer;">
                            <img class="gaia-ui-slideshow-thumbnail" src="https://example.com/image.jpg" title="Attachment">
                          </a>
                        </li>
                      </ul>
                    </td>
                    <td class="recordlist-cell-gaia recordlist-status-gaia value-7467269">
                      <div><span>Unapplied</span></div>
                    </td>
                    <td class="recordlist-cell-gaia recordlist-status_assignee-gaia value-7467270">
                      <div>
                        <button class="recordlist-username-gaia" aria-expanded="false">
                          <img src="https://static.cybozu.com/contents/k/image/icon/user/user_16.svg" width="16" height="16">
                          <span>SABBIR</span>
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
  
            // Reinitialize DataTable after table content is populated
            new DataTable('#example');
        }, function(error) {
            console.log(error);
        });
  
        // Event listener for search field
        searchField.addEventListener('keyup', async () => {
            const queryForSearch = searchField.value.trim();
            let kintoneQuery = '';
  
            if (queryForSearch.length > 0) {
                kintoneQuery = `文字列__1行_ like "${queryForSearch}"`; // Adjust field code here
            }
  
            var body = {
                'app': appId,
                'query': kintoneQuery,
                'fields': ['$id', '文字列__1行_']
            };
  
            kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
                console.log(resp);
                // Clear existing rows
                tbody.innerHTML = '';
  
                // Populate table with records from the search results
                resp.records.forEach(record => {
                    const row = document.createElement('tr');
                    row.className = 'recordlist-row-gaia recordlist-row-gaia-hover-highlight';
                    row.innerHTML = `
                        <td class="recordlist-cell-gaia detail-action-${record['$id'].value} recordlist-action-gaia">
                          <a class="recordlist-show-gaia" href="/k/904/show#record=${record['$id'].value}" target="_self" title="View record details">
                            <span class="recordlist-detail-gaia"></span>
                          </a>
                        </td>
                        <td class="recordlist-cell-gaia recordlist-record_id-gaia value-7467264">
                          <div><span>${record['$id'].value}</span></div>
                        </td>
                        <td class="recordlist-cell-gaia recordlist-single_line_text-gaia value-7467286">
                          <div class="line-cell-gaia recordlist-ellipsis-gaia"><span>${record['文字列__1行_'].value}</span></div>
                        </td>
                        <td class="recordlist-cell-gaia recordlist-organization_select-gaia value-7467288"><div></div></td>
                        <td class="recordlist-cell-gaia recordlist-file-gaia value-7469725">
                          <ul>
                            <li class="recordlist-file-image-gaia">
                              <a class="recordlist-file-image-container-gaia" style="cursor: pointer;">
                                <img class="gaia-ui-slideshow-thumbnail" src="https://example.com/image.jpg" title="Attachment">
                              </a>
                            </li>
                          </ul>
                        </td>
                        <td class="recordlist-cell-gaia recordlist-status-gaia value-7467269">
                          <div><span>Unapplied</span></div>
                        </td>
                        <td class="recordlist-cell-gaia recordlist-status_assignee-gaia value-7467270">
                          <div>
                            <button class="recordlist-username-gaia" aria-expanded="false">
                              <img src="https://static.cybozu.com/contents/k/image/icon/user/user_16.svg" width="16" height="16">
                              <span>SABBIR</span>
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
  
                // Reinitialize DataTable after table content is populated
                new DataTable('#example');
            }, function(error) {
                console.log(error);
            });
        });
  
        return event;
    });
  })();
  