document.addEventListener('DOMContentLoaded', function () {
    let table = document.getElementById('ogusuSearch');
    if (!table) {
        console.error('Table "ogusuSearch" not found.');
        return;
    }

    let tbody = table.querySelector('tbody');
    let rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        let recordNumberCell = row.querySelector('td:nth-child(2)'); // Assuming the second column has the record number
        if (!recordNumberCell) return;

        let recordNumber = recordNumberCell.innerText.trim(); // Extract record number
        let recordOperator = row.querySelector('.recordlist-username-gaia span')?.innerText.trim() || "";
        let recordStatus = row.querySelector('td:nth-child(3) span')?.innerText.trim() || "";

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

        // Populate Dropdown with Options
        let options = ['Option 1', 'Option 2', 'Option 3']; // Replace with actual values
        options.forEach(opt => {
            let option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            dropdown.appendChild(option);
        });

        // Create a new column (td) and append checkbox & dropdown
        let newCell = row.insertCell(0);
        newCell.className = 'recordlist-header-cell-gaia';

        // Check if current user matches the operator and status is not "Approved"
        let currentUserName = "SABBIR"; // Replace this with actual Kintone current user retrieval logic

        if (recordOperator === currentUserName && recordStatus !== '承認済') {
            newCell.appendChild(checkbox);
            newCell.appendChild(dropdown);
        }
    });
});
