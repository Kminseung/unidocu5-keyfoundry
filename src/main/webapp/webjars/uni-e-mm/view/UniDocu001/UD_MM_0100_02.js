/**
 * @module uni-e-mm/view/UniDocu001/UD_MM_0100_02
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('useFileSearchDialog', {
            defaultValue: 'false',
            description: '모바일 첨부파일 추가 기능'
        });
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            createPO: function () {
                gridObj.asserts.rowSelected();
                $u.validateRequired('statement-information-content');
                var is_data = $u.getValues('statement-information-content');
                $u.fileUI.setFileAttachKeyParam(is_data);
                $nst.is_data_it_data_returnMessage('ZUNIEMM_2009', is_data, gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        if ($u.isPopupView()) {
                            opener.$u.buttons.triggerFormTableButtonClick();
                            window.close();
                        } else {
                            $u.buttons.triggerFormTableButtonClick();
                        }
                    });
                });
            }
        });

        return function () {
            if ($u.programSetting.getValue('useFileSearchDialog') === 'true') $u.fileUI.getFineUploader().useSearchButton();
            $u.fileUI.getFineUploader().setContentsVisible(true);
            var pageParams = JSON.parse($u.page.getPageParams().selectedGridDataString);
            gridObj.setJSONData(pageParams);
        }
    }
});
