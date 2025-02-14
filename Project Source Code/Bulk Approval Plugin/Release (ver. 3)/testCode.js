if (selectedRecords.length > 0) {
    if (approval_action) {
        swal({
            title: 'Are you sure you want to approve everything?',
            text: 'Approve all the displayed records',
            icon: 'warning',
            buttons: {
                cancel: 'Cancel',
                confirm: {
                    text: 'Proceed',
                    value: true,
                    visible: true,
                    className: 'btn btn-danger',
                    closeModal: false
                }
            }
        }).then(async (willApprove) => {
            if (willApprove) {
                swal({
                    title: 'Processing...',
                    text: 'Please wait while we update the records.',
                    buttons: false, // Disable buttons
                    closeOnClickOutside: false,
                    content: {
                        element: "div",
                        attributes: {
                            innerHTML: '<div class="spinner-border" role="status"><span class="sr-only">Loading...</span></div>'
                        }
                    }
                });

                const recordsToApprove = [];

                selectedRecords.forEach((record, index) => {
                    let currentStatus = record.ステータス.value;
                    const action = {
                        id: record.$id.value,
                        action: approval_action[currentStatus][index]
                    };

                    if (asigneeType == "ONE") {
                        const assignee = approval_assignee[currentStatus][index];
                        action.assignee = assignee;
                    }

                    recordsToApprove.push(action);
                });

                const requestObj = {
                    app: kintone.app.getId(),
                    records: recordsToApprove
                };

                try {
                    await kintone.api(kintone.api.url('/k/v1/records/status.json', true), 'PUT', requestObj);
                    swal({
                        title: 'Success',
                        text: 'All records have been updated successfully.',
                        icon: 'success',
                        timer: 1000,
                        button: false
                    }).then(() => {
                        location.reload();
                    });
                } catch (error) {
                    console.error('Error updating records:', error);
                    swal({
                        title: 'Error',
                        text: 'There was an error updating the records. Please try again.',
                        icon: 'error'
                    });
                }
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
