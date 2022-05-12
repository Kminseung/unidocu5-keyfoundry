/**
 * UD_0201_051    지로/인출 전기
 * @module uni-e-fi/view/UniDocu001/UD_0201_051
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            createStatement: function () {
                gridObj.asserts.selectedExactOneRow();
                if (gridObj.getSELECTEDJSONData()[0]['BENLR'] === '') throw $mls.getByCode('M_UD_0201_051_BELNR_EMPTY');
                $efi.popup.openUD_0201_052(gridObj.getSELECTEDJSONData()[0]);
            }
        });
        return function () {

        }
    }
});