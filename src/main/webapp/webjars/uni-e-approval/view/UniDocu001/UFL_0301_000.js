/**
 * UFL_0301_000    국내출장 품의 리스트 조회
 * UFL_0301_100    법인카드 품의 리스트 조회
 * @module uni-e-approval/view/UniDocu001/UFL_0301_000
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (/^(REQTXT)|(REQNO)|(TITLE)|(WF_KEY)$/.test(columnKey) && rowData[columnKey]) {
                if (rowData['WF_KEY']) {
                    $u.navigateByProgramId('DRAFT_0011', rowData);
                    return;
                }
                rowData['mode'] = 'edit';
                $u.navigateByProgramId(rowData['PROGRAM_ID'], rowData);
            }
        });

        return function(){
            $u.buttons.triggerFormTableButtonClick();
        }
    }
});
