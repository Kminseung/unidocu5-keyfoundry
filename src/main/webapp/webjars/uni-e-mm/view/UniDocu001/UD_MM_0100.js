/**
 * @module uni-e-mm/view/UniDocu001/UD_MM_0100
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('createPORFC', {
            defaultValue: 'ZUNIEMM_1009',
            description: 'createPO button named service id'
        });
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (/REQNO/.test(columnKey)) $u.navigateByProgramId('DRAFT_0011', rowData);
            if (/FILE_LINK/.test(columnKey)) {
                var fileGroupId = rowData['EBELN'] + rowData['EBELP'];
                var $dialog = $u.dialog.fineUploaderDialog.open(fileGroupId, false);
                $dialog.on('fileCountChange', function (event, fileCount) {
                    gridObj.$V('FILE_LINK', rowIndex, fileCount);
                });
            }
            if (/EVI_SEQ|SIGN_SEQ/.test(columnKey)) {
                var attachSeq = gridObj.$V(columnKey, rowIndex);
                if (attachSeq === '') return;
                $u.dialog.fineUploaderDialog.open(attachSeq, true);
            }
        });
        $u.buttons.addHandler({
            assignVendor: function () {
                gridObj.asserts.rowSelected();
                $u.dialog.f4CodeDialog.open({
                    popupKey: 'LIFNR',
                    codePopupCallBack: function (lifnr) {
                        $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                            gridObj.setRowBgColor(rowIndex, '147|215|142');
                            gridObj.$V('LIFNR', rowIndex, lifnr);
                        });
                    }
                });
            },
            createPO: function () {
                gridObj.asserts.rowSelected();
                $u.popup.openByProgramId('UD_MM_0100_02', 1280, 700, {selectedGridDataString: JSON.stringify(gridObj.getSELECTEDJSONData())});
            },
            createInvoice: function () {
                gridObj.asserts.rowSelected();
                $u.navigateByProgramId('UD_MM_0200', {selectedJSONData: gridObj.getSELECTEDJSONData()});
            },
            cancleGR: function () {
                gridObj.asserts.selectedExactOneRow();
                $nst.is_data_returnMessage('ZUNIEMM_2008', gridObj.getSELECTEDJSONData()[0], function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    })
                });
            },
            requestApprovalDemo: function(){
                gridObj.asserts.rowSelected();
                var programid = $u.page.getPROGRAM_ID();
                var wf_gb = {
                    UD_MM_0010: 'DEMO1',
                    UD_MM_0100_01: 'DEMO2'
                }[programid];
                $u.popup.openByProgramId('DRAFT_0010', 1035, 1200, {
                    WF_GB: wf_gb,
                    selectedGridDataString: JSON.stringify(gridObj.getSELECTEDJSONData()),
                    gridSubGroup: programid
                });
            }
        });

        return function () {
        }
    }
});
