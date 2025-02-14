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

// Convert states object to array of key-value pairs
const statesEntries = Object.entries(states);
const foundEntry = statesEntries.find(([key, rec]) => rec.name === destination);

if (foundEntry) {
    const [key, rec] = foundEntry;
    currentAssigneeType = rec.assignee.type;
}

// Check if the destination is the last index
var lastStatusName = getLastStatusName(statesEntries);
if (lastStatusName === destination) {
    lastIndexCheck = 1;
}

// Check if approval_assignee[currentStatus] is defined and is an array
if (approval_assignee[currentStatus] && Array.isArray(approval_assignee[currentStatus])) {
    // Check if the key exists in the array
    if (approval_assignee[currentStatus][key] !== undefined) {
        const assignee = approval_assignee[currentStatus][key];
        action.assignee = assignee;
    } else {
        console.error('Key does not exist in approval_assignee:', currentStatus, key);
    }
} else {
    console.error('approval_assignee[currentStatus] is not defined or not an array:', currentStatus);
}
