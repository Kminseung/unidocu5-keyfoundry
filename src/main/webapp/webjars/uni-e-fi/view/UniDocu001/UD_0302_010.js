/**
 * UD_0302_010 전표조회
 * UD_0302_030 편철현황
 * unidocu-ui/layout/UniDocu001 레이아웃 사용.
 * @see module:uni-e-fi/module/UD_0302_000/eventHandler
 * @module uni-e-fi/view/UniDocu001/UD_0302_010
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('use handle group check', {defaultValue: 'true'});
        $u.programSetting.appendTemplate('regularStatementPostingFuncName',{
            defaultValue: 'ZUNIEFI_9010',
            description: 'regularStatementPosting의 FuncName #20465'
        });

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue) {
            $u.util.tryCatchCall(function () {
                if (columnKey === 'SELECTED') {
                    if ($u.programSetting.getValue('use handle group check') === 'true') gridObj.handleGroupCheck('SELECTED', 'GRONO', rowIndex, newValue);
                }
            }, function () {
                gridObj.$V('SELECTED', rowIndex, oldValue);
            });
        });

        gridObj.onCellClick($efi.UD_0302_000EventHandler.gridCellClick);

        $efi.UD_0302EventHandler.handleDeleteStatement();

        $u.buttons.addHandler({
            "editStatement": $efi.UD_0302_000EventHandler.editStatement,
            "cancelGroup": $efi.UD_0302_000EventHandler.cancelGroup,
            "regularStatementPosting": $efi.UD_0302_000EventHandler.regularStatementPosting,
            "reprocess": function () {
                gridObj.asserts.selectedExactOneRow();
                var selectedRow = gridObj.getSELECTEDJSONData()[0];
                if (selectedRow['BSTAT'] !== 'V' || selectedRow['STATS'] !== '4') throw $mls.getByCode('M_UD_0302_010_reprocessBSTAT_not_V_or_STATS_not_4');

                $nst.is_data_returnMessage('ZUNID_4201', gridObj.getSELECTEDJSONData()[0], function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "batchPrint": function () {
                gridObj.asserts.rowSelected();
                $efi.pdf.downloadMultiStatementZUNIDU_6202({it_docString: JSON.stringify(gridObj.getSELECTEDJSONData())});
            },
            "eachPrint": function () {
                gridObj.asserts.rowSelected();
                $efi.pdf.downloadSingleStatementZUNIDU_6203({it_docString: JSON.stringify(gridObj.getSELECTEDJSONData())});
            },
            "downloadFromZUNIEFI_4108": function () {
                gridObj.asserts.rowSelected();
                $efi.pdf.downloadFromZUNIEFI_4108({it_dataString: JSON.stringify(gridObj.getSELECTEDJSONData())});
            },
            "printEvidence": function () {
                gridObj.asserts.rowSelected();

                $u.popup.openByProgramId('PRINT_EVIDENCE', 1000, 800, {selectedGridData: JSON.stringify(gridObj.getSELECTEDJSONData())});
            },
            "is_data_ot_data": function() {
                var namedServiceId = $(this).data('funcname');
                var values = $u.getValues('search-condition');
                $nst.is_data_ot_data(namedServiceId, values, function(ot_data) {
                    gridObj.setJSONData(ot_data);
                    $efi.handleEVIKBIconVisible();
                });
            },
            "changeInfo": function(){
                gridObj.asserts.rowSelected();
                var it_data = gridObj.getSELECTEDJSONData();
                $nst.is_data_it_data_returnMessage('YKHJ_002', {}, it_data, function(message) {
                    unidocuAlert(message, function() {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "SAVE": function(){
                gridObj.asserts.rowSelected();
                var it_data = gridObj.getSELECTEDJSONData();
                $nst.is_data_it_data_returnMessage('YCSH_002', {}, it_data, function(message) {
                    unidocuAlert(message, function() {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            }
        });

        return function () {

        }
    }
});