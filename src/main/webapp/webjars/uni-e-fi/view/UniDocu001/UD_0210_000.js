/**
 * UD_0210_000    입금내역조회
 * @module uni-e-fi/view/UniDocu001/UD_0210_000
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('dialogGridCurrencyColumnTargetColumnMap', {
            defaultValue: {},
            type: 'json'
        });
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'CLR_AMT') {
                if (Number(gridObj.$V(columnKey, rowIndex)) === 0) return;
                $efi.dialog.clr_amtDialog.open($u.page.getPROGRAM_ID(), gridObj.getJSONDataByRowIndex(rowIndex));
            }
        });
        
        $u.buttons.addHandler({
            createClearing: function () {
                gridObj.asserts.rowSelected();
                $u.navigateByProgramId('UD_0210_001', gridObj.getSELECTEDJSONData()[0]);
            }
        });

        return function () {

        }
    }
});
