/**
 * @module uni-e-approval/view/DRAFT_0070
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('useFileSearchDialog', {
            defaultValue: 'false',
            description: '모바일 첨부파일 추가 기능'
        });
        $u.programSetting.appendTemplate('showSummary', {
            defaultValue: 'false',
            description: '금액 필드 합계 표시'
        });

        var gridObj = $u.gridWrapper.getGrid();

        if ($u.programSetting.getValue('useFileSearchDialog') === 'true') $u.fileUI.getFineUploader().useSearchButton();
        if ($u.programSetting.getValue('showSummary') === 'true') gridObj.setSummaryVisible(true);

        $u.buttons.addHandler({
            addRow: function () {
                gridObj.addRow();
            },
            deleteRow: function () {
                gridObj.asserts.rowSelected();
                gridObj.deleteSelectedRows();
            }
        });

        return function () {
            gridObj.fitToWindowSize();
        }
    }
});