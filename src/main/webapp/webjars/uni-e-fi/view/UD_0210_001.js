/**
 * UD_0210_001  입금반제처리
 * @module uni-e-fi/view/UD_0210_001
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();
        var gridObj = $u.gridWrapper.getGrid('unidocu-grid');
        gridObj.fitToWindowSize();
        gridObj.setBlockPasteMode('none');
        var pageParams = $u.page.getPageParams();
        var $u_RECE_FLAG = $u.get('RECE_FLAG');
        var $u_RECE_AMT = $u.get('RECE_AMT');
        var $u_DIF_AMT = $u.get('DIF_AMT');
        var $u_FEE_AMT = $u.get('FEE_AMT');
        var $u_TAX_AMT = $u.get('TAX_AMT');
        var $u_SUM_AMT = $u.get('SUM_AMT');
        var $u_CLEAR_AMT = $u.get('CLEAR_AMT');
        var $u_TOT_AMT_2 = $u.get('TOT_AMT_2');

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue) {
            if ($u_RECE_FLAG.getValue()) {
                gridObj.$V(columnKey, rowIndex, oldValue);
                throw '선수금 처리 해제 후 처리 바랍니다.';
            }
            var bln_amt = Number(gridObj.$V('BLN_AMT', rowIndex));
            var clr_amt = Number(gridObj.$V('CLR_AMT', rowIndex));
            if (columnKey === 'SELECTED') $u.buttons.runCustomHandler('handleGridSELECTED', rowIndex);
            if (columnKey === 'CLR_AMT') {
                if(clr_amt > bln_amt) {
                    unidocuAlert('처리금액을 초과 하였습니다.');
                    gridObj.$V('CLR_AMT', rowIndex, oldValue);
                    return;
                }
                gridObj.$V('DIF_AMT', rowIndex, bln_amt - clr_amt);
            }

            $u.buttons.runCustomHandler('handleFormAmount');
        });

        $u_RECE_FLAG.$el.change(function () {
            if ($u_RECE_FLAG.getValue() === 'X') {
                if ($u_DIF_AMT.getValue() <= 0) {
                    unidocuAlert('차이금액이 0 보다 큰 경우만 선택 가능합니다.');
                    $u_RECE_FLAG.setEmptyValue();
                    return;
                }
                $u_RECE_AMT.setValue($u_DIF_AMT.getValue());
            } else {
                $u_RECE_AMT.setEmptyValue();
            }
            $u.buttons.runCustomHandler('handleFormAmount');
        });
        $u.buttons.addHandler({
            createClearing: function () {
                var is_data = $u.getValues('search-condition');
                $.extend(is_data, {BUKRS: pageParams['BUKRS'], GJAHR: pageParams['GJAHR'], BUZEI: pageParams['BUZEI']});
                if ($u.get('RECE_FLAG').getValue() !== 'X') gridObj.asserts.rowSelected();
                var namedServiceId = 'ZUNIEFI_3705';
                if($u.page.getPROGRAM_ID() === 'UD_0210_003') namedServiceId = 'ZUNIEFI_3709';
                $nst.is_data_it_data_nsReturn(namedServiceId, is_data, gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.dialog.afterCreateStatementDialog.open(nsReturn.getExportMap('OS_DOCNO'));
                });
            }
        });

        $u.buttons.addCustomHandler({
            handleGridSELECTED: function (rowIndex) {
                var bln_amt = Number(gridObj.$V('BLN_AMT', rowIndex));
                if (bln_amt === 0) {
                    gridObj.$V('SELECTED', rowIndex, '0');
                    return;
                }

                if (gridObj.$V('SELECTED', rowIndex) === '1') {
                    gridObj.makeCellRequired('CLR_AMT', rowIndex);
                    gridObj.$V('CLR_AMT', rowIndex, bln_amt);
                    gridObj.$V('DIF_AMT', rowIndex, 0);
                } else {
                    gridObj.makeCellReadOnly('CLR_AMT', rowIndex);
                    gridObj.$V('CLR_AMT', rowIndex, 0);
                    gridObj.$V('DIF_AMT', rowIndex, bln_amt);
                }
            },
            handleFormAmount: function () {
                var selectedGridSum = 0;
                $.each(gridObj.getSELECTEDJSONData(), function (index, item) {
                    selectedGridSum += Number(item['CLR_AMT']);
                });
                var fee_amt = $u_FEE_AMT.getValue();
                var tax_amt = $u_TAX_AMT.getValue();
                var clear_amt_amt = $u_CLEAR_AMT.getValue();
                var rece_amt = $u_RECE_AMT.getValue();
                var sum_amt = clear_amt_amt + fee_amt + tax_amt;
                var dif_amt = sum_amt - selectedGridSum - rece_amt;
                $u_SUM_AMT.setValue(sum_amt);
                $u_DIF_AMT.setValue(dif_amt);
                $u_TOT_AMT_2.setValue(selectedGridSum)
            }
        });

        return function () {
            if (pageParams['KUNNR']) {
                var it_data = [];
                it_data.push({CLEAR_ID: staticProperties.user['ID'], KUNNR: pageParams['KUNNR'], WAERS: pageParams['WAERS']});
                $nst.is_data_it_data_nsReturn('ZUNIEFI_3702', $.extend(pageParams, {I_GB: 'D'}), it_data, function (nsReturn) {
                    var ot_clear_data = nsReturn.getTableReturn('OT_CLEAR_DATA');
                    gridObj.setTreeData('CLEAR_KEY', ot_clear_data,'REBZG','BELNR', '*');
                    gridObj.setSortEnable(false);
                    gridObj.enableTreeClickEvent(false);
                    gridObj.expandAll();
                });
            }
            if ($u_FEE_AMT.getValue()) $u.get('HKONT').setReadOnly(false);
            if ($u_TAX_AMT.getValue()) $u.get('HKONT_TAX').setReadOnly(false);

            $u.buttons.runCustomHandler('handleFormAmount'); // #10798
        }
    }
});