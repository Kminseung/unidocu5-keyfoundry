/**
 * UD_9050_110 UniDocu Code Grid Test
 * @module unidocu-ui/view/UD_9050_110
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');

        return function () {
            $('#addRow').click(function () {
                gridObj.addRowWithGridPopupIcon();
                gridObj2.addRowWithGridPopupIcon();
            });
        }
    }
});