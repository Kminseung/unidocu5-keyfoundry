/**
 * UD_0501_000    위임설정
 * @module uni-e-fi/view/UD_0501_000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();

        $u.buttons.addHandler({
            "doSave": function () {
                $u.validateRequired();
                var jsonData = $u.getValues('delegate-card');
                jsonData['BPERNR'] = jsonData['BPERNR2'];
                jsonData['MODE'] = 'I';

                $nst.is_data_returnMessage('ZUNIEFI_1006', jsonData, function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "doQuery": function () {
                $nst.is_data_ot_data('ZUNIEFI_1007', $u.getValues('delegate-card,search-condition'), function (gridData) {
                    gridObj.setJSONData(gridData);
                });
            },
            "revokeCommission": function () {
                gridObj.asserts.selectedExactOneRow();
                var jsonData = gridObj.getSELECTEDJSONData()[0];
                jsonData['MODE'] = 'D';
                $nst.is_data_returnMessage('ZUNIEFI_1006', jsonData, function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            }
        });

        return function () {
            gridObj.fitToWindowSize();
            gridObj.setCheckBarAsRadio('SELECTED');

            // 현재 날짜 이전으로 설정 할 수 없음.
            var $DATAB = $u.get('DAT').$el.filter('input');
            // $DATAB.setMinDate($u.util.date.getCurrentServerDate());
            $DATAB.data('oldValue', $DATAB.val());
            $efi.bindCARDNO_Handler('delegate-card');

            var pageParams = $u.page.getPageParams();

            if (!$.isEmptyObject(pageParams)) {
                $u.get('PERNR').setValue({
                    code: pageParams['PERNR'],
                    text: pageParams['PERNR_TXT']
                });

                $u.get('PERNR').triggerChange();

                if (/Uni_CodeCombo/.test($u.get('CARDNO').getType())) {
                    $u.get('CARDNO').setValue(pageParams.CARDNO);
                } else if (/Uni_CodePopup/.test($u.get('CARDNO').getType())) {
                    var textField = $u.f4Data.getCodeInfo('CARDNO')['textFieldKey'];
                    var obj = $u.f4Data.getCodeMapWithParams('CARDNO', textField, {CARDNO: pageParams['CARDNO']})
                    var text = obj[pageParams['CARDNO']];
                    $u.get('CARDNO').setValue({code: pageParams['CARDNO'], text: text});}
            }
        }
    }
});