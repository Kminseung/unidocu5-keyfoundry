/**
 * UD_0207_020    선급비용 등록 전표생성
 * UD_0207_030    선급비용 중도해지 전표생성
 *
 * @module uni-e-fi/view/UD_0207_020
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        $efi.createStatement.bindGridEvent();
        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                var tableParams = {IT_DATA: params.gridData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), params.paramMap, tableParams, function (os_docno) {
                    $efi.dialog.afterCreateStatementDialog.open(os_docno);
                });
            }
        });

        function onAC_GBChange() {
            if (!window['acGBMap']) {
                var acGBMap = {};
                $.each($u.f4Data.getCodeDataWithParams('AC_GB'), function (index, item) {
                    acGBMap[item['AC_GB']] = item['AC_PERIOD'];
                });
                window['acGBMap'] = acGBMap;
            }
            $u.get('AC_PERIOD').setValue(window['acGBMap'][$u.get('AC_GB').getValue()]);
        }

        function initPage() {
            if ($u.get('EVIKB')) $efi.createStatement.UD_0205_000_EvikbChangeHandler();
            if ($u.get('EVIKB')) $efi.evidenceHandler();
            $u.get('AC_GB').$el.change(onAC_GBChange);

            $efi.createStatement.bindEvent.bindCommonFormEvent();

            $efi.createStatement.bindEvent.triggerVendorCodeChange();
            $efi.createStatement.bindEvent.triggerWRBTRChange();

            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
        }

        return function () {
            gridObj.fitToWindowSize();
            gridObj.setNumberNegative('WRBTR', 'false');
            $efi.createStatementCommon.addRow();
            if ($u.page.getPROGRAM_ID() === 'UD_0207_030') {
                $nst.is_data_nsReturn('ZUNIDU_6104', $u.page.getPageParams(), function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var os_head = nsReturn.getExportMap('OS_HEAD');
                    var os_vend = nsReturn.getExportMap('OS_VEND');
                    var ot_data = nsReturn.getTableReturn('OT_DATA');

                    $u.setValues($.extend({}, os_data, os_head, os_vend));
                    gridObj.setJSONData(ot_data);
                    initPage();
                });
            } else {
                initPage();
            }
        }
    }
});