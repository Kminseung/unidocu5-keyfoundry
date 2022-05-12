/**
 * UD_7010_011    결재선관리
 * @module uni-e-approval/view/UD_7010_011
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey !== 'SEQ_TXT') return;
            $nst.is_data_tableReturns('ZUNIEWF_2203', gridObj.getJSONDataByRowIndex(rowIndex), function (tableReturns) {
                $('#approval-line-table-wrapper').empty().append($ewf.getApprovalLineEl({}, staticProperties.user, tableReturns));
                gridObj.loopRowIndex(function (rowIndex) {
                    gridObj.$V('SELECTED', rowIndex, '0');
                });
                gridObj.$V('SELECTED', rowIndex, '1');
            });
        });
        $u.buttons.addHandler({
            "createApprovalLine": function () {
                $ewf.dialog.modifyApprovalDialog.open({
                    "saveCallback": function saveCallBack() {
                        getApprovalList();
                    }
                });
            },
            "editApprovalLine": function () {
                gridObj.asserts.rowSelected();
                $ewf.dialog.modifyApprovalDialog.open({
                    "saveCallback": function () {
                        getApprovalList();
                    },
                    "selectedJSONData": gridObj.getSELECTEDJSONData()[0]
                });
            },
            "removeApprovalLine": function () {
                gridObj.asserts.rowSelected();
                var paramMap = gridObj.getSELECTEDJSONData()[0];
                $nst.is_data_returnMessage('ZUNIEWF_2204', paramMap, function (message) {
                    unidocuAlert(message, function () {
                        getApprovalList();
                    });
                });
            }
        });

        function getApprovalList() {
            $nst.is_data_ot_data('ZUNIEWF_2200', {}, function (ot_data) {
                gridObj.setJSONData(ot_data);
                $('#approval-line-table-wrapper').empty();
            });
        }

        return function () {
            gridObj.setCheckBarAsRadio('SELECTED');
            getApprovalList();

        }
    }
});