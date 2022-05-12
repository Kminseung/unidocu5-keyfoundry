/**
 * UD_0201_013    송장처리
 * UD_0201_014    송장처리
 * @module uni-e-fi/view/UD_0201_013
 */
define(function () {
    return function () {
        $('#searchForm').find('#amount-display-wrapper-td').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');

        $efi.createStatement.bindEvent.bindBUDATChange();
        $efi.createStatement.bindEvent.bindZTERM_BUDATChange();

        $u.get('BUDAT').$el.change(function () {
            if ($u.get('ZFBDT')) $u.get('ZFBDT').$el.val($u.get('BUDAT').$el.val());
        });
        $u.get('xware_bnk_table', 'XWARE_BNK').$el.change(function () {
            $u.buttons.runCustomHandler('handleGrid2Data');
        });
        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();

        gridObj.onChangeCell(function () {
            $u.buttons.runCustomHandler('calculateBalance');
        });
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'PO_NUMBER') {
                $nst.is_data_ot_data('ZUNIEFI_2012', gridObj.getJSONDataByRowIndex(rowIndex), function (ot_data) {
                    $efi.dialog.POHISTORYDialog.open(ot_data);
                });
            }
        });
        gridObj2.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey !== 'SELECTED') return;
            var grid2Data = gridObj2.getSELECTEDJSONData();
            var keyMap = {};
            $.each(grid2Data, function (index, item) {
                keyMap[item['KSCHL'] + item['EBELN']] = true;
            });
            var zunid_2210_ot_item = $u.page.getCustomParam('zunid_2210_ot_item');
            var gridData = [];
            $.each(keyMap, function (key) {
                $.each(zunid_2210_ot_item, function (index, item) {
                    if (key === item['COND_TYPE'] + item['PO_NUMBER']) gridData.push(item);
                });
            });
            gridObj.setJSONData(gridData);
            $u.buttons.runCustomHandler('calculateBalance');
            if (gridObj2.$V('SELECTED', rowIndex) === '1' && gridData.length === 0) {
                gridObj2.$V('SELECTED', rowIndex, 0);
                return unidocuAlert($mls.getByCode('M_UD_0201_013_gridDataNotExistsOnSelectedGridObj2'));
            }
        });

        $u.buttons.addCustomHandler({
            calculateBalance: function () {
                var pageParamCHARGETOTALFieldName = 'CHARGETOTAL';
                if (($u.page.getPROGRAM_ID() === 'UD_0201_014')) pageParamCHARGETOTALFieldName = 'FWBAS';
                var chargetotal = -Number($u.page.getPageParams()[pageParamCHARGETOTALFieldName]);

                var jsonData = gridObj.getSELECTEDJSONData();
                for (var x = 0, len = jsonData.length; x < len; x++) chargetotal += Number(jsonData[x]['WRBTR']);
                $u.setValues({difference_amount: chargetotal});
            },
            handleGrid2Data: function () {
                var xware_bnk = $u.get('xware_bnk_table', 'XWARE_BNK').getValue();
                var zunid_2210_ot_data = $u.page.getCustomParam('zunid_2210_ot_data');
                var gridData = [];
                $.each(zunid_2210_ot_data, function (index, item) {
                    if (xware_bnk === '1' && item['KSCHL'] !== '') gridData.push(item);
                    if (xware_bnk === '2' && item['KSCHL'] === '') gridData.push(item);
                    if (xware_bnk === '3') gridData.push(item);
                });
                gridObj2.setJSONData(gridData);
            },
            setRequestOrderData: function (it_polist) {
                var importParam = $.extend({}, $u.page.getPageParams(), {
                    BUKRS: staticProperties.user['BUKRS']
                });
                $nst.is_data_tableParams_nsReturn('ZUNIEFI_2010', importParam, {IT_POLIST: it_polist}, function (nsReturn) {
                    $u.page.setCustomParam('zunid_2210_ot_data', nsReturn.getTableReturn('OT_DATA'));
                    $u.page.setCustomParam('zunid_2210_os_header', nsReturn.getExportMap('OS_HEADER'));
                    $u.page.setCustomParam('zunid_2210_ot_item', nsReturn.getTableReturn('OT_ITEM'));
                    gridObj.setJSONData([]);
                    gridObj2.setJSONData($u.page.getCustomParam('zunid_2210_ot_data'));
                });
            }
        });
        $u.buttons.addHandler({
            initPage: $efi.createStatementCommon.initPage,
            doQuery: function () {
                if ($u.get('EBELN').getValue() !== '') {
                    $u.buttons.runCustomHandler('setRequestOrderData', [{EBELN: $u.get('EBELN').getValue()}]);
                    return false;
                }

                unidocuConfirm("구매문서번호를 입력하시겠습니까? \n미입력시 전체 조회됩니다.", function () {
                    $efi.dialog.MULTIPODATADialog.open(function (it_polist) {
                        $u.buttons.runCustomHandler('setRequestOrderData', it_polist);
                    });
                }, function () {
                    $u.buttons.runCustomHandler('setRequestOrderData', []);
                });
            },
            createStatement: function () {
                $u.validateRequired();
                gridObj.asserts.rowSelected($mls.getByCode('M_UD_0201_013_createStatementValidateRowSelect'));
                gridObj.validateSELECTEDGridRequired();
                if ($u.get('amount-display', 'difference_amount').getValue() !== 0) throw $mls.getByCode('M_UD_0201_013_diffAmountNotZero');
                var paramMap = $.extend($u.page.getPageParams(), $u.page.getCustomParam('zunid_2210_os_header'), $u.getValues());
                $nst.is_data_it_data_nsReturn('ZUNIEFI_2011', paramMap, gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.dialog.afterCreateStatementDialog.open(nsReturn.getExportMap('OS_DOCNO'));
                });
            }
        });

        return function () {
            $u.buttons.runCustomHandler('calculateBalance');
            $u.unidocuCurrency.setKRUSF();
            $u.buttons.runCustomHandler('setRequestOrderData', []);
            if ($u.get('WAERS')) {
                $u.get('DMBTR').setValue($u.page.getPageParams()['WRBTR']);
                $u.get('HWBAS').setValue($u.page.getPageParams()['FWBAS']);
                $u.get('HWSTE').setValue($u.page.getPageParams()['FWSTE']);
            }

            if ($u.page.getPROGRAM_ID() === 'UD_0201_014') {
                $u.get('WRBTR').setValue($u.get('DMBTR').getValue());
                $u.get('WMWST').setValue($u.get('HWSTE').getValue());
            }
            $('#header-invoicer-content-2').find('.fa-minus').parent().click();

            if ($u.page.getPROGRAM_ID() === 'UD_0201_013') $('#statement-information-content-evi').remove();
            if ($u.page.getPROGRAM_ID() === 'UD_0201_014') $('#statement-information-content').remove();

            if ($u.get('ISSUE_ID')) $u.get('ISSUE_ID').$el.append($efi.get$evidenceIcon($u.page.getPageParams()));
            if ($u.get('EVI_SEQ')) $u.get('EVI_SEQ').$el.append($efi.get$evidenceIcon($u.page.getPageParams()));
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            gridObj.fitToWindowSize();
            gridObj2.fitToWindowSize();
        }
    }
});