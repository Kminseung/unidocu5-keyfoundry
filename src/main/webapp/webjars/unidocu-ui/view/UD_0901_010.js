/**
 * @module unidocu-ui/view/UD_0901_010
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
                if (columnKey !== 'FUNCNAME') return;
                $u.popup.openUD_0901_020(gridObj.getJSONDataByRowIndex(rowIndex));
            }
        );

        return function () {
            $u.buttons.triggerFormTableButtonClick();
        }
    }
});