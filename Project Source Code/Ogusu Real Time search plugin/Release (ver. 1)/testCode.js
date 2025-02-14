(function() {
  'use strict';

  // Load FontAwesome
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



  // Add Kintone event listener
  // Add Kintone event listener
  kintone.events.on('app.record.index.show', function (event) {
      //console.log(event);
      console.log(cybozu.data);

    var body = {
      'app': 904
    };

    kintone.api(kintone.api.url('/k/v1/app/form/fields.json', true), 'GET', body, function(resp) {
      // success
      console.log(resp);
    }, function(error) {
      // error
      console.log(error);
    });




      searchField.addEventListener('keyup', async () => {
          const queryForSearch = searchField.value.trim();
          const appId = kintone.app.getId();
          let kintoneQuery = '';

          console.log(queryForSearch);

          if (queryForSearch.length > 0) {
              kintoneQuery = `文字列__1行_ like "${queryForSearch}"`; // Replace '文字列__1行_' with the correct field code
          }

          var body = {
              'app': appId,
              'query': kintoneQuery,
              'fields': ['$id', '文字列__1行_']
            };
            
            
            kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp) {
              console.log(resp);
            }, function(error) {
              console.log(error);
            });


            




          // try {
          //     const response = await kintone.api(
          //         kintone.api.url('/k/v1/records', true),
          //         'GET',
          //         {
          //             app: 904,
          //             query: kintoneQuery,
          //         }
          //     );

          //     const records = response.records;
          //     console.log(records);

          //     // Update the datatable with the filtered records
          //     //updateTable(records);
          // } catch (error) {
          //     console.error('Error fetching filtered records:', error);
          // }
      });

      return event;
  });




})();
