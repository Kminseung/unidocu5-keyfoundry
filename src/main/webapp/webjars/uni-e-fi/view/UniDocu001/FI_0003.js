/**
 * @module uni-e-fi/view/UniDocu001/FI_0003
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'REQNO') {
                var jsonData = gridObj.getJSONDataByRowIndex(rowIndex);
                jsonData['navigateFromFI_0003'] = true;
                $u.navigateByProgramId('FI_0001', jsonData);
            }
        });
        return function () {
        }
    }
});
