/**
 * UD_0502_000    보유카드조회
 * @module uni-e-fi/view/UD_0502_000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        $u.get('PERNR').$el.on('onCodeChange', function(){
            $u.buttons.triggerFormTableButtonClick();
        });

        gridObj.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey !== "SELECTED") return;
            if (gridObj.$V('SELECTED', rowIndex) === '0') {
                $u.get('PERNR').setValue({});
                return;
            }
            $u.get('PERNR').setValue({
                code: gridObj.getSELECTEDJSONData()[0].PERNR,
                text: gridObj.getSELECTEDJSONData()[0].PERNR_TXT
            });
        });

        $u.buttons.addHandler({
            doSave: function () {
                gridObj.asserts.rowSelected();
                var jsonData = gridObj.getSELECTEDJSONData()[0];
                var params = $.extend(jsonData, {
                    PERNR: $u.get('PERNR').getValue(),
                    PERNR_TXT: $u.get('PERNR').getTextValue(),
                    MODE: 'D'
                });
                params.CARDNO = params.CARDNO.replace(/-/gi, '');
                $u.navigateByProgramId('UD_0501_000', params);
            },
            doQuery: function () {
                $nst.is_data_ot_data('ZUNIEFI_1100', $u.getValues('search-condition'), function (gridData) {
                    gridObj.setJSONData(gridData);
                }, gridObj.clearGridData());
            }
        });

        return function () {
            gridObj.setCheckBarAsRadio('SELECTED');
            $u.buttons.triggerFormTableButtonClick();
            $('#expandCardInfo').hide();
        }
    }
});