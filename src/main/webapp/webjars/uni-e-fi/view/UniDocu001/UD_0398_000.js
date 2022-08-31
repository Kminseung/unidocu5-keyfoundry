/**
 * UD_0398_000 증빙조회
 * @module uni-e-fi/view/UniDocu001/UD_0398_000
 */
define(function () {
    return function () {

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            $efi.handleEvidenceByZUNIECM_5013_RowData(gridObj.getJSONDataByRowIndex(rowIndex));
        });

        return function () {
            $(window).focus().resize();
            $('.page_title').css({"margin-top": 0});
            $('body').addClass('show-as-popup');
            $nst.is_data_ot_data('ZUNIECM_5013', $u.page.getPageParams(), function (ot_data) {
                gridObj.setJSONData(ot_data);
            });
        }
    }
});