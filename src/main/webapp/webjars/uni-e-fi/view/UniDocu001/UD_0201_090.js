/**
 * UD_0201_090    예산현황
 * @module uni-e-fi/view/UniDocu001/UD_0201_090
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();

        return function () {
            $(window).focus();
            if ($u.page.getPageParams().gridData == null) {
                unidocuAlert('popup parameter does not exists. $u.page.getPageParams().gridData == null');
                return;
            }
            gridObj.setJSONData(JSON.parse($u.page.getPageParams().gridData));
        }
    }
});