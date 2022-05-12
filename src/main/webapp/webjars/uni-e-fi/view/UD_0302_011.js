/**
 * UD_0302_011    임시전표수정
 * UD_0302_021    증빙관리
 *
 * @module uni-e-fi/view/UD_0302_011
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        $efi.createStatement.bindGridEvent();
        $u.get('BELNR').$el.click(function () {
            $efi.popup.openStatementViewWithParamMap(window.statementData)
        }).css({'color': 'blue', 'text-decoration': 'underline', 'cursor': 'pointer'});
        $u.buttons.addHandler({
            createStatement: function () {
                var params = $efi.createStatement.getCreateStatementCommonParams();
                var tableParams = {IT_DATA: params.gridData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), params.paramMap, tableParams, function (os_docno) {
                    os_docno['mode'] = 'statement_modify';
                    $efi.dialog.afterCreateStatementDialog.open(os_docno);
                });
            },
            initPage: $efi.createStatementCommon.initPage
        });


        return function () {
            gridObj.fitToWindowSize();
            gridObj.setNumberNegative('WRBTR', 'false');
            if ($u.page.getPageParams()['BELNR']) {
                $nst.is_data_nsReturn('ZUNIEFI_4105', $u.page.getPageParams(), function (nsReturn) {
                    var os_head = nsReturn.getExportMap("OS_HEAD");
                    var os_data = nsReturn.getExportMap("OS_DATA");
                    var ot_data = nsReturn.getTableReturn("OT_DATA");

                    window.statementData = $.extend({}, $u.page.getPageParams(), os_head, os_data);
                    $u.setValues('header-invoicer-content', window.statementData);
                    var $etcSeq = $u.get('ETC-SEQ').$el;
                    $etcSeq.append(os_data['CRD_SEQ'] + os_data['INV_SEQ'] + os_data['EVI_SEQ']);
                    $etcSeq.append($efi.get$evidenceIcon(os_data));

                    gridObj.setJSONData(ot_data);
                    $u.fileUI.load(os_data['EVI_SEQ']);
                });
            }
            var currentYear = $u.util.date.getCurrentYear();
            var options = [];
            for (var i = currentYear - 5; i < currentYear + 5; i++) options.push({value: i, text: ''});
            if ($u.get('_GJAHR')) $u.get('_GJAHR').setOptions(options, currentYear);
        }
    }
});