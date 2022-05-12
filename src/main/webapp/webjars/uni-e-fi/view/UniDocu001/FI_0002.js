/**
 * @module uni-e-fi/view/UniDocu001/FI_0002
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'REQNO') $u.navigateByProgramId('FI_0001', gridObj.getJSONDataByRowIndex(rowIndex));
        });

        $u.buttons.addHandler({
            createStatement: function () {
                gridObj.asserts.selectedExactOneRow();

                var jsonData = gridObj.getSELECTEDJSONData()[0];

                var evidencePROGRAM_ID = {
                    1: 'UD_0201_010', // 매입세금계산서
                    2: 'UD_0201_000' // 법인카드
                }[jsonData['EVI_TYPE']];

                if (evidencePROGRAM_ID) {
                    $efi.dialog.evidenceSelectDialog.open({
                        evidencePROGRAM_ID: evidencePROGRAM_ID,
                        selectCallback: function (selectedData) {
                            if(evidencePROGRAM_ID === 'UD_0201_000') {
                                selectedData['WRBTR'] = selectedData['TOTAL'];
                                selectedData['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(selectedData['APPR_DATE']) + ' ' + selectedData['APPR_TIME'];
                            }
                            $u.navigateByProgramId(jsonData['PROGRAM_ID'], $.extend({callByFI_0002: true}, jsonData, selectedData));
                        }
                    });
                    $u.setValues('dialog-search-form', jsonData);
                    var $u_dialogLIFNR = $u.get('dialog-search-form', 'LIFNR__DIALOG');
                    if ($u_dialogLIFNR) {
                        $u_dialogLIFNR.setValue({code: jsonData['LIFNR'], text: jsonData['LIFNR_TXT']});
                        $u_dialogLIFNR.setReadOnly(true);
                    }
                        
                } else {
                    $u.navigateByProgramId(jsonData['PROGRAM_ID'], $.extend({callByFI_0002: true}, jsonData));
                }
            }
        });

        return function () {
        }
    }
});
