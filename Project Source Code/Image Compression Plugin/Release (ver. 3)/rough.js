const record = {
    // Your record object here...
};

// Initialize counters
let userSelectCount = 0;
let subtableCount = 0;
let fileCount = 0;

// Iterate through the record object
for (const key in record) {
    if (record.hasOwnProperty(key)) {
        const field = record[key];

        // Count USER_SELECT fields
        if (field.type === 'USER_SELECT') {
            userSelectCount++;
        }

        // Count SUBTABLE fields
        if (field.type === 'SUBTABLE') {
            subtableCount++;
        }

        // Count FILE fields
        if (field.type === 'FILE') {
            fileCount++;
        }
    }
}

console.log(`Number of USER_SELECT fields: ${userSelectCount}`);
console.log(`Number of SUBTABLE fields: ${subtableCount}`);
console.log(`Number of FILE fields: ${fileCount}`);


// Iterate through the record object
for (const key in record) {
    if (record.hasOwnProperty(key)) {
        const field = record[key];

        // Check if the field type is 'FILE'
        if (field.type === 'FILE') {
            const files = field.value; // Dynamically access the value
            console.log(`Files for field ${key}:`, files);
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
                    [key]: { // Use key as a dynamic property name
                        value: filesValue
                    }
                }
            }
        );

        console.log('Record updated successfully:', updateResponse);
    } catch (error) {
        console.error('Error updating record:', error);
    }
}


