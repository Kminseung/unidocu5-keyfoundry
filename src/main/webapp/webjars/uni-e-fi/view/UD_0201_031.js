/**
 * UD_0201_031    기타(일반G/L) 전표등록
 * UD_0201_032    다중지급처
 * UD_0201_033    구매처 대체(외화) SOIL 사용
 * UD_0201_034    기타(일반G/L) 전표등록 COPY
 * @module uni-e-fi/view/UD_0201_031
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('onGridBeforeOpenF4DialogParams', {
            defaultValue: {},
            type: 'json',
            description: 'grid codePopup F4 조회시 추가 파라미터 설정'
        });

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick($efi.createStatement.handleClickCell);
        gridObj.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey === 'WRBTR' || columnKey === 'SHKZG' || columnKey === 'MWSKZ') $efi.createStatementCommon.changeWRBTRGL(columnKey);
            if (columnKey === 'HKONT') $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
            $efi.createStatement.changeGridAlert(columnKey, rowIndex);

            $efi.createStatement.koart_newko.onKOARTChange(columnKey, rowIndex);
        });
        gridObj.onBeforeOpenF4Dialog($efi.createStatement.handleBeforeOpenF4Dialog);
        gridObj.onBlockPaste($efi.createStatement.afterMultiCellChange);

        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();
        $efi.createStatement.bindEvent.bindSGTXTChange();

        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['useReload'] = true;
                $efi.createStatement.callCreateStatementFn(params);
            },
            addRow: function () {
                gridObj.addRowWithGridPopupIcon();
                var activeRowIndex = gridObj.getActiveRowIndex();
                if ($efi.createStatementCommon.isEvidenceAmountNegative()) gridObj.$V('SHKZG', activeRowIndex, 'H');
                else gridObj.$V('SHKZG', activeRowIndex, 'S');

                if ($u.get('MWSKZ') && gridObj.getGridHeader('MWSKZ')) gridObj.$V('MWSKZ', activeRowIndex, $u.get('MWSKZ').getValue());
                if ($u.get('SGTXT') && gridObj.getGridHeader('SGTXT')) gridObj.$V('SGTXT', activeRowIndex, $u.get('SGTXT').getValue());
                $efi.createStatementCommon.setDefaultGridValues(activeRowIndex);

                // #2106 선급비용 그리드에 사업영역 default 값지정 ( 사용자요구 )
                if (gridObj.getGridHeader('GSBER') && staticProperties.user['GSBER']) gridObj.$V('GSBER', activeRowIndex, staticProperties.user['GSBER']);
                if (gridObj.getGridHeader('GSBER_TXT') && staticProperties.user['GSBER_TXT']) gridObj.$V('GSBER_TXT', activeRowIndex, staticProperties.user['GSBER_TXT']);
                $efi.createStatementCommon.changeWRBTRGL();
                $efi.addDataHandler.handleADD_DATAKeyChange(activeRowIndex);
            },
            deleteRow: function () {
                gridObj.deleteSelectedRows();
                $efi.createStatementCommon.changeWRBTRGL();
            }
        });
        return function () {
            $u.buttons.runHandler('addRow');
            gridObj.$V('SHKZG', gridObj.getActiveRowIndex(), 'S');
            $u.buttons.runHandler('addRow');
            var activeRowIndex = gridObj.getActiveRowIndex();
            gridObj.$V('SHKZG', activeRowIndex, 'H');
            $u.unidocuCurrency.setKRUSF();
            gridObj.fitToWindowSize();
        }
    }
});