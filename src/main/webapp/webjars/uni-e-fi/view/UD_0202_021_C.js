/**
 * UD_0202_021_C 종이(세금)계산서/지로 - 복수AP
 * @module uni-e-fi/view/UD_0202_021_C
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('evidenceAmountNegative', {
            defaultValue: 'false',
            description: '입력 금액 -로 처리. 차대변 지시자 반대로 적용 H, S'
        });
        $u.programSetting.appendTemplate('onGridBeforeOpenF4DialogParams', {
            defaultValue: {},
            type: 'json',
            description: 'grid codePopup F4 조회시 추가 파라미터 설정'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var pageParams = $u.page.getPageParams();

        gridObj.onCellClick($efi.createStatement.handleClickCell);
        gridObj.onChangeCell(function(columnKey) {
            if (columnKey === 'WRBTR' || columnKey === 'MWSKZ') {
                gridObj.setNumberNegative('WRBTR', 'false');
                $u.buttons.runCustomHandler('changeWRBTRExpense');
            }
        });

        gridObj.onBeforeOpenF4Dialog(function (columnKey, rowIndex) {
            if (columnKey === 'KOSTL' || columnKey === 'PRCTR') {
                if ($u.get('BUDAT')) {
                    gridObj.setQueryParams(columnKey, {BUDAT: $u.get('BUDAT').getValue()});
                }
            } else if (columnKey === 'HKONT') {
                var isRowMultiAP = gridObj.$V('KOART', rowIndex) === 'K';
                gridObj.setF4CodeKey(columnKey, isRowMultiAP ? 'AKONTG' : 'HKONT');
                if (isRowMultiAP) {
                    var lifnr = $u.get('LIFNR').getValue();
                    if (!lifnr) throw '먼저 구매처를 입력하세요';
                    gridObj.setQueryParams(columnKey, {LIFNR: lifnr});
                }
            }

        });
        gridObj.onBlockPaste($efi.createStatement.afterMultiCellChange);

        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();
        $u.buttons.addHandler({
            addRow: $efi.createStatementCommon.addRow,
            deleteRow: function () {
                gridObj.deleteSelectedRows();
                $u.buttons.runCustomHandler('changeWRBTRExpense');
            },
            initPage: $efi.createStatementCommon.initPage,
            createStatement: function () {
                var origin = $efi.createStatement.validateHKONT_LIFNR;
                $efi.createStatement.validateHKONT_LIFNR = function () {
                    var hkontHeaderText = gridObj.getColumnHeaderText('HKONT');
                    var lifnrHeaderText = gridObj.getColumnHeaderText('LIFNR');
                    var gridData = gridObj.getJSONData();
                    var prefix = $u.util.formatString('[{hkontHeaderText}, {lifnrHeaderText}]', {
                        hkontHeaderText: hkontHeaderText,
                        lifnrHeaderText: lifnrHeaderText
                    });
                    $.each(gridData, function (item, rowData) {
                        if (rowData['HKONT'] !== '' && rowData['LIFNR'] !== '' && rowData['KOART'] !== 'K') throw $u.util.formatString($mls.getByCode('M_shouldInputOnlyOne'), {namesString: prefix});
                        if (rowData['HKONT'] === '' && rowData['LIFNR'] === '') throw $u.util.formatString($mls.getByCode('M_shouldInput'), {elementNameString: prefix});
                    });
                };
                $efi.createStatement.validateCreateStatement();
                $efi.createStatement.validateHKONT_LIFNR = origin;
                var sumOfAP = gridObj.getJSONData().filter(function(rowData) {
                    return rowData['KOART'] === 'K'
                }).reduce(function(acc, rowData) {
                    var wrbtr = rowData['WRBTR'] ? parseInt(rowData['WRBTR']) : 0;
                    wrbtr = rowData['SHKZG'] === 'H' ? wrbtr : -wrbtr;
                    return acc + wrbtr;
                }, 0);
                if (sumOfAP !== $u.get('WRBTR').getValue()) {
                    throw $u.util.formatString("복수AP행 금액 합과 지급금액이 일치하지 않습니다.\n복수AP행 합: {sumOfAP}, 지급금액: {WRBTR}",
                        {sumOfAP: sumOfAP.toLocaleString(), WRBTR: $u.get('WRBTR').getValue().toLocaleString()});
                }
                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['useReload'] = true;
                $efi.createStatement.callCreateStatementFn(params);
            },
            'addAPRow': function(ignoreValidation) {
                if (!ignoreValidation && !$u.get('LIFNR').getValue()) throw '헤더/공급자정보의 구매처를 입력해주세요';
                $efi.createStatementCommon.addRow();
                var rowIndex = gridObj.getActiveRowIndex();
                $u.buttons.runCustomHandler("setEditableStateOnApRow", rowIndex);
                gridObj.$V('HKONT', rowIndex, $u.get('AKONT').getValue());
                gridObj.$V('HKONT_TXT', rowIndex, $u.get('AKONT').getTextValue());
                gridObj.$V('LIFNR', rowIndex, $u.get('LIFNR').getValue());
                gridObj.$V('LIFNR_TXT', rowIndex, $u.get('LIFNR').getTextValue());
                gridObj.$V('SHKZG', rowIndex, 'H');
                gridObj.$V('KOART', rowIndex, 'K');
                gridObj.triggerChangeCell('LIFNR', rowIndex, '', $u.get('LIFNR').getValue());
            },
            "excelUpload": function() {
                if (!$u.get('LIFNR').getValue()) unidocuAlert('구매처가 입력되지 않은경우 지급계좌를 양식에서 불러올 수 없습니다.');
            },
            'templateDownload': function () {
                $u.excel.templateDownload(gridObj, function() {
                    $efi.createStatementCommon.addRow()
                    $u.buttons.runHandler('addAPRow', true);
                });
            }
        });

        $u.excel.bindExcelUploadHandler(gridObj, function(gridData){
            $.each(gridData, function(_, data)  {
                data['KOART'] = data['LIFNR'] ? 'K' : 'S'
            });
            gridObj.orderBy();
            gridObj.setJSONData(gridData);
            gridObj.loopRowIndex(function(rowIndex) {
                if (gridObj.$V('KOART', rowIndex) === 'K') $u.buttons.runCustomHandler("setEditableStateOnApRow", rowIndex);
            });
            gridObj.orderBy('KOART');
            var startColumnKey = gridObj.getGridHeaders()[0].key;
            var endColumnKey = gridObj.getGridHeaders()[gridObj.getGridHeaders().length - 1].key;
            var startRowIndex = 0;
            var endRowIndex = gridData.length - 1;
            $efi.createStatement.afterMultiCellChange(startColumnKey, startRowIndex, endColumnKey, endRowIndex);
        });

        $u.buttons.addCustomHandler({
            "setEditableStateOnApRow": function(rowIndex) {
                gridObj.makePopupCellEmpty('KOSTL', rowIndex);
                makeCellsReadOnly(['LIFNR', 'MWSKZ', 'PRCTR', 'KOSTL', 'AUFNR'], rowIndex);
                makeCellsEditable(['BVTYP', 'ZTERM', 'ZFBDT'], rowIndex);
            },
            "afterVendorCodeChange": function () {
                $u.get('AKONT').triggerChange();
            },
            "changeWRBTRExpense": function(useWMWSTFormValue) {
                function getGridWMWSTSum() {
                    var precision = $u.unidocuCurrency.getPrecision($u.getValues()['WAERS']);
                    var gridDebitWMWSTSum = 0, gridCreditWMWSTSum = 0;
                    $.each(gridObj.getJSONData().filter(function(rowData) {
                        return rowData['KOART'] === 'S';
                    }), function (index, rowData) {
                        var taxRate = $efi.createStatementCommon.getTaxRateByMWSKZ(rowData['MWSKZ']);

                        var poweredWRBTR = Math.round(Number(rowData['WRBTR']) * Math.pow(10, precision));
                        var singleWMWST = Math.round(poweredWRBTR * taxRate);

                        if (rowData['SHKZG'] === 'S') gridDebitWMWSTSum += singleWMWST;
                        else gridCreditWMWSTSum += singleWMWST;
                    });
                    gridDebitWMWSTSum /= Math.pow(10, precision);
                    gridCreditWMWSTSum /= Math.pow(10, precision);
                    return gridDebitWMWSTSum - gridCreditWMWSTSum;
                }

                function getChargeTotal() {
                    return gridObj.getJSONData().filter(function(rowData) {
                        return rowData['KOART'] === 'S';
                    }).reduce(function (acc, rowData) {
                        if (rowData['SHKZG'] === 'S')
                            return acc + Number(rowData['WRBTR']);
                        else
                            return acc - Number(rowData['WRBTR']);
                    }, 0);
                }

                gridObj.setNumberNegative('WRBTR', 'false');
                var chargeTotal = getChargeTotal();
                var wmwst = useWMWSTFormValue ? $u.get('WMWST').getValue() : getGridWMWSTSum();
                var wrbtr = chargeTotal + wmwst;

                $u.get('WRBTR').setValue(Math.abs(wrbtr));
                $u.get('CHARGETOTAL').setValue(Math.abs(chargeTotal));
                $u.get('WMWST').setValue(useWMWSTFormValue ? wmwst : Math.abs(wmwst));
                $efi.createStatementCommon.setAmountDisplay($efi.createStatementCommon.getCalculatedDisplayAmount_multiAP());

            }
        });

        function makeCellsReadOnly(columns, rowIndex) {
            columns.forEach(function (column) {
                gridObj.makeCellReadOnly(column, rowIndex);
            })
        }

        function makeCellsEditable(columns, rowIndex) {
            columns.forEach(function (column) {
                gridObj.makeCellEditable(column, rowIndex);
            })
        }

        return function () {
            $efi.createStatement.bindEvent.bindCommonFormEvent();
            $u.get('MWSKZ').$el.unbind('change', $efi.createStatementCommon.changeMWSKZ);
            $efi.createStatement.bindEvent.bindChange('MWSKZ', function () {
                var oldValue = $u.get('MWSKZ').getOldValue();
                var currentValue = $u.get('MWSKZ').getValue();
                $u.get('MWSKZ').setOldValue(currentValue);

                var optionText = $u.get('MWSKZ').getOptionsText(currentValue);
                var filtered = gridObj.$F(oldValue, 'MWSKZ').concat(gridObj.$F('', 'MWSKZ'));
                $.each(filtered, function (index, rowIndex) {
                    gridObj.$V('MWSKZ', rowIndex, currentValue);
                    if (gridObj.getGridHeader('MWSKZ_TXT')) gridObj.$V('MWSKZ_TXT', rowIndex, optionText);
                });
                $u.buttons.runCustomHandler('changeWRBTRExpense');
                $efi.mwskzNonDeduction.alertChangeFormCombo();
            });
            $u.get('WMWST').$el.unbind('change', $efi.createStatementCommon.changeWMWSTExpense);
            $efi.createStatement.bindEvent.bindChange('WMWST', function () {
                $u.buttons.runCustomHandler('changeWRBTRExpense', true);
            });

            gridObj.setNumberNegative('WRBTR', 'false');
            $efi.createStatementCommon.addRow();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();

            $u.get('LIFNR').$el.change(function () {
                var vendorCode = $u.get('LIFNR').getValue();

                gridObj.setComboOptions('BVTYP',
                    $u.f4Data.getCodeComboOption('BVTYP', {'LIFNR': vendorCode, doNotShowProgressBar: true}).map(function(data) {
                        return {value: data['BVTYP'], text: data['BKREF']}
                    })
                );
                gridObj.loopRowIndex(function(rowIndex) {
                    if (gridObj.$V('KOART', rowIndex) === 'K') {
                        gridObj.$V('LIFNR', rowIndex, vendorCode);
                        gridObj.$V('LIFNR_TXT', rowIndex, $u.get('LIFNR').getTextValue());
                        gridObj.makePopupCellEmpty('HKONT', rowIndex)
                    }
                    gridObj.$V('BVTYP', rowIndex, '');
                })
            });

            $u.get('AKONT').$el.change(function () {
                gridObj.loopRowIndex(function(rowIndex) {
                    if (gridObj.$V('KOART', rowIndex) === 'K' && !gridObj.$V('HKONT', rowIndex)) {
                        gridObj.$V('HKONT', rowIndex, $u.get('AKONT').getValue());
                        gridObj.$V('HKONT_TXT', rowIndex, $u.get('AKONT').getTextValue());
                    }
                });
            });

            if (pageParams['callByFI_0002']) $efi.createStatement.handleCallByFI_0002();
            if (pageParams['showAsPopup']) {
                if (pageParams['hideFileUI'] === 'true') $u.fileUI.hide();
                if (pageParams['EVKEY']) $u.fileUI.getFineUploader().setFileGroupId(pageParams['EVKEY']);
                if (pageParams['WRBTR']) gridObj.$V('WRBTR', 0, pageParams['WRBTR']);
                $ewf.UD_0220_002.closeWhenOpenerIsClosed();
                $ewf.UD_0220_002.addHandlerCreateStatementInPopup();
            }
            gridObj.orderBy('KOART');
            $u.buttons.runHandler('addAPRow', true);
        }
    }
});