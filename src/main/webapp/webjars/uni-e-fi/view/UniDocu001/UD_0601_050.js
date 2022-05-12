/**
 * UD_0601_050선급금정산현황
 * @module uni-e-fi/view/UniDocu001/UD_0601_050
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onTreeNodeClick(function (rowIndex) {
            $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
        });
        $u.buttons.addHandler({
            queryForGridObj1: function () {
                $nst.is_data_ot_data($(this).data('funcname'), $u.getValues('search-condition'), function (ot_data) {
                    $efi.setTreeModeBELNR_ZUONR(gridObj, ot_data)
                });
            }
        });
        return function () {

        }
    }
});