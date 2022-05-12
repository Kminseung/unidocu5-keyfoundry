/**
 * @module vendorCustom/poongsan/view/PSC_0601_001
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR') $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
        });

        return function () {

        }
    }
});