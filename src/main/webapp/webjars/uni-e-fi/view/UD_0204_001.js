/**
 * UD_0204_001	전도금 정산 전표생성
 * UD_0204_011	선급금정산(거래처)
 * UD_0204_021	사업상 정산 - 생성
 * UD_0204_031	보증금 수탁
 * UD_0204_041	거래처선급정산(공급업체)
 * UD_0204_051	거래처선급정산(자산)
 * @module uni-e-fi/view/UD_0204_001
 */
define(function() {
    return function(){
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('grid2CurrencyColumnTargetColumnMap', {
            defaultValue: {},
            type: 'json'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');

        var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
        var vendorCodeINput2Name = vendorCodeInput.getName() + '2';
        var vendorCodeInput2 = $u.get(vendorCodeINput2Name);
        if(!vendorCodeInput2) {
            unidocuAlert(vendorCodeINput2Name + ' does not exists');
            return;
        }

        gridObj.onCellClick($efi.createStatement.handleClickCell);
        gridObj.onChangeCell(function(columnKey, rowIndex, oldValue, code, jsonObj){
            $efi.createStatement.handleChangeCell(columnKey, rowIndex, oldValue, code, jsonObj);
            if(columnKey === 'WRBTR' || columnKey === 'SHKZG' || columnKey === 'MWSKZ') $u.buttons.runCustomHandler('changGrid3Filed');
        });
        gridObj.onBlockPaste($efi.createStatement.afterMultiCellChange);
        gridObj2.onChangeCell(function (columnKey, rowIndex, oldValue) {
            if (columnKey === 'SELECTED') {
                var selectedJSONData = gridObj2.getSELECTEDJSONData();
                if(selectedJSONData.length === 1) {
                    var json =  selectedJSONData[0];
                    var shkzg = json['SHKZG'];
                    if (shkzg !== 'S') {
                        gridObj2.$V('SELECTED', rowIndex, oldValue);
                        return;
                    }

                    var $u_WAERS = $u.get('header-invoicer-content', 'WAERS');
                    if($u_WAERS) {
                        $u_WAERS.setValue(json['WAERS']);
                        $u_WAERS.$el.change();
                    }
                }
                $u.get('PAYGB').$el.change();
            }
        });
        gridObj2.onTreeNodeClick(function (rowIndex) {
            $efi.popup.openStatementViewWithParamMap(gridObj2.getJSONDataByRowIndex(rowIndex));
        });
        gridObj3.onChangeCell(function (columnKey, rowIndex) {
            gridObj3.handleCommonGridPopupValueChange(columnKey, rowIndex);
            if (columnKey === 'WRBTR') {
                var selecedRadioValue = $u.get('PAYGB').getValue();
                if(selecedRadioValue === 'A') {
                    var grid2WrbtrValue = Number(gridObj2.$V('DIV_AMT', gridObj2.$F(gridObj3.$V('BELNR', rowIndex), 'BELNR')[0]));
                    var grid3WrbtrValue = Number(gridObj3.$V('WRBTR', rowIndex));
                    if(grid3WrbtrValue > grid2WrbtrValue) {
                        unidocuAlert($mls.getByCode('M_FI_0204_001_adjustmentCannotExceedBalance'), function() {
                            gridObj3.$V('WRBTR', rowIndex, grid2WrbtrValue);
                        });
                    }
                }
            }
        });

        $efi.createStatement.bindEvent.bindCommonFormEvent();
        $efi.evidenceHandler();
        vendorCodeInput2.$el.change(function(){
            if($(this).find('.code > input').val() === '') return;
            gridObj2.clearGridData();
            gridObj3.clearGridData();
            $u.buttons.triggerFormTableButtonClick();
            $u.buttons.runCustomHandler('setVendorCodeInputByVendorCodeInput2');
            $efi.createStatement.bindEvent.triggerVendorCodeChange();
        });
        $u.get('PAYGB').$el.change(function () {
            $u.buttons.runCustomHandler('onPAYGBChange');
        });

        if($u.get('EVIKB')) {
            $u.get('EVIKB').$el.change(function () {
                $u.buttons.runCustomHandler('onEVIKBChange');
            });
        }

        $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();

        var $u_MWSKZ = $u.get('MWSKZ');
        if ($u_MWSKZ) {
            $u_MWSKZ.$el.change(function () {
                $u.buttons.runCustomHandler('changGrid3Filed');
            })
        }

        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            "doQuery": function () {
                vendorCodeInput2.validateRequired();
                var paramMap = $u.getValues('search-condition');
                paramMap[vendorCodeInput2.getName().replace(/2$/, '')] = vendorCodeInput2.getValue();
                $nst.is_data_ot_data('ZUNIEFI_5002', paramMap, function(ot_data){
                    $efi.setTreeModeBELNR_ZUONR(gridObj2, ot_data);
                }, function(){
                    gridObj2.clearGridData();
                    gridObj3.clearGridData();
                });
            },
            "grid3Init": function(){
                gridObj3.clearGridData();
                gridObj2.unCheckAll('SELECTED');
            },
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
                var BUDAT = $u.get('BUDAT').getValue();
                $.each(gridObj2.getSELECTEDJSONData(), function (index, item) {
                    var gridObj2_Budat = item['BUDAT'].replace(/-/g, '');
                    if (gridObj2_Budat > BUDAT) throw "정산 일자는 신청일자 이후만 가능합니다.";
                });

                var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');
                var grid3WRBTRSum = 0;
                var WRBTR = $u.get('WRBTR').getValue();
                var paygb = $u.get('PAYGB').getValue();
                $.each(gridObj3.getJSONData(), function (index, item) {
                    grid3WRBTRSum += Number(item['WRBTR']);
                });

                if (grid3WRBTRSum === 0) {
                    if (paygb === 'A') throw "정산예정금액은 0보다 커야 합니다.";
                    if (paygb === 'B') throw "반환예정금액이 존재하지 않습니다.";
                    if (paygb === 'C') throw "초과예정금액이 존재하지 않습니다.";
                }

                if (paygb === 'A' && WRBTR !== grid3WRBTRSum) throw "지급금액과 정산예정금액은 같아야 합니다.";
                if (paygb === 'C' && WRBTR <= grid3WRBTRSum) throw "지급금액이 정산예정금액 보다 커야 합니다.";

                if (paygb === 'A' && grid3WRBTRSum > Number(gridObj2.getSELECTEDJSONData()[0]['DIV_AMT'])) throw $mls.getByCode('M_FI_0204_001_adjustmentCannotExceedBalance');

                var params = $efi.createStatement.getCreateStatementCommonParams();
                var gridData = params['gridData'];
                var paramMap = params['paramMap'];

                var selected_evidence_is_key = $u.page.getCustomParam('selected_evidence_is_key');

                if (selected_evidence_is_key) {
                    if (selected_evidence_is_key['INV_SEQ']) paramMap['INV_SEQ'] = selected_evidence_is_key['INV_SEQ'];
                    if (selected_evidence_is_key['CRD_SEQ']) paramMap['CRD_SEQ'] = selected_evidence_is_key['CRD_SEQ'];
                    if (selected_evidence_is_key['EVI_SEQ']) paramMap['EVI_SEQ'] = selected_evidence_is_key['EVI_SEQ'];
                }

                var vendData = [];

                if (gridObj3.getRowCount() !== 0) vendData.push($.extend({}, paramMap, gridObj3.getJSONData()[0]));
                if (/[BC]/.test($u.get('PAYGB').getValue())) vendData.push($.extend({}, paramMap));
                if (vendData[1]) vendData[1]['PAYGB'] = '';
                var tableParams = {IT_DATA: gridData, IT_VEND: vendData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $efi.createStatement.confirmBeforeCreateStatement(paramMap, tableParams, function () {
                    $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), paramMap, {
                        IT_DATA: gridData,
                        IT_VEND: vendData
                    }, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo, $u.pageReload);
                    });
                });
            }
        });

        $u.buttons.addCustomHandler({
            changGrid3Filed: function () {
                if (gridObj3.getRowCount() === 0) return;
                var payGBValue = $u.get('PAYGB').getValue();
                var grid3WRBTRSum = 0;

                $.each(gridObj3.getJSONData(), function(index, item){
                    grid3WRBTRSum += Number(item['WRBTR']);
                });

                if (payGBValue === 'A') {
                    gridObj3.$V('WRBTR', 0, $u.get('WRBTR').getValue());
                } else if (payGBValue === 'B') {
                    gridObj3.$V('AMOUNT', 0, grid3WRBTRSum);
                } else if (payGBValue === 'C') {
                    var headerWRBTRAmount = $u.get('WRBTR').getValue();
                    if (headerWRBTRAmount > grid3WRBTRSum) gridObj3.$V('AMOUNT', 0, headerWRBTRAmount - grid3WRBTRSum);
                    else gridObj3.$V('AMOUNT', 0, '');
                }
            },
            setVendorCodeInputByVendorCodeInput2: function () {
                if (!new RegExp(vendorCodeInput.getName()).test(vendorCodeInput2.getName())) return;
                vendorCodeInput.setValue({
                    code: vendorCodeInput2.getValue(),
                    text: vendorCodeInput2.getTextValue()
                });
            },
            onEVIKB_EvidenceSelected: function(){
                $u.buttons.runCustomHandler('changGrid3Filed');
            },
            handleFormEditableByPAYGB_EVIKB: function(){
                var paygb = $u.get('PAYGB').getValue();
                var evikb = $u.get('EVIKB').getValue();

                var editableInfo = $u.buttons.runCustomHandler('getEditableInfoByPAYGB_EVIKB', paygb, evikb);

                $.each(editableInfo.disabledFields, function (index, value) {
                    var $u_input = $u.get('header-invoicer-content', value);
                    if ($u_input) $u_input.setReadOnly(true);
                });
                $.each(editableInfo.enabledFields, function (index, value) {
                    var $u_input = $u.get('header-invoicer-content', value);
                    if ($u_input) $u_input.setReadOnly(false);
                });
            },
            getEditableInfoByPAYGB_EVIKB: function(paygb, evikb){
                return {
                    A: function(evikb){
                        if (evikb === 'B' || evikb === 'C') {
                            return {
                                enabledFields: ['BUPLA', 'MWSKZ', 'EMPFB', 'BVTYP', 'AKONT', 'ZLSCH'],
                                disabledFields: ['WRBTR', 'WMWST', 'ZTERM', vendorCodeInput.getName()]
                            }
                        }

                        return {
                            enabledFields: ['BUPLA', 'MWSKZ', 'EMPFB', 'BVTYP', 'ZLSCH', 'WMWST', 'AKONT', 'WRBTR', vendorCodeInput.getName()],
                            disabledFields: ['ZTERM']
                        }
                    },
                    B: function(){
                        return {
                            enabledFields: [],
                            disabledFields: ['ZLSCH', 'BUPLA', 'MWSKZ', 'EMPFB', 'BVTYP', 'ZTERM', 'WRBTR', 'WMWST', 'AKONT', vendorCodeInput.getName()]
                        }
                    },
                    C: function(evikb){
                        if (evikb === 'B' || evikb === 'C') {
                            return {
                                enabledFields: ['ZLSCH', 'BUPLA', 'MWSKZ', 'EMPFB', 'BVTYP', 'ZTERM', 'AKONT'],
                                disabledFields: ['WRBTR', 'WMWST', vendorCodeInput.getName()]
                            }
                        }
                        return {
                            enabledFields: ['ZLSCH', 'BUPLA', 'MWSKZ', 'EMPFB', 'BVTYP', 'ZTERM', 'WMWST', 'AKONT', 'WRBTR', vendorCodeInput.getName()],
                            disabledFields: []
                        }
                    }
                }[paygb](evikb);
            },
            onPAYGBChange: function(){
                var paygbSelectedValue = $u.get('PAYGB').getValue();
                if (paygbSelectedValue === 'B') $u.get('EVIKB').setValue('Z');

                var selectedJSONData = gridObj2.getSELECTEDJSONData();
                if(selectedJSONData.length === 1) {
                    var json =  selectedJSONData[0];
                    json['WRBTR'] = json['DIV_AMT'].replace(/,/g, '');
                    json['AMOUNT'] = json['WRBTR'];
                    gridObj3.setJSONData([json]);
                }

                $efi.createStatement.onEVIKBChange();
                $u.buttons.runCustomHandler('changGrid3Filed');
                var amountColumnTextPrefix, amountColumnVisible, wrbtrEditable;
                gridObj.clearGridData();
                $efi.createStatementCommon.addRow();
                $(gridObj).show();
                if (paygbSelectedValue === 'A') {
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_adjustment');
                    amountColumnVisible = true;
                    wrbtrEditable = true;
                } else if (paygbSelectedValue === 'B') {
                    $(gridObj).hide();
                    gridObj.clearGridData();
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_refund');
                    amountColumnVisible = false;
                    wrbtrEditable = false;
                    $u.buttons.runCustomHandler('setVendorCodeInputByVendorCodeInput2');
                    setTimeout(function () {
                        if (gridObj3.getRowCount() === 1) $u.get('WRBTR').setValue(gridObj3.$V('AMOUNT', 0)); // #1594
                    }, 300);
                } else if (paygbSelectedValue === 'C') {
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_exceed');
                    amountColumnVisible = false;
                    wrbtrEditable = false;
                }
                gridObj3.setColumnHeaderText('AMOUNT', amountColumnTextPrefix + $mls.getByCode('M_FI_0204_001_estimatedAmount'));
                gridObj3.setColumnWidth('AMOUNT', 100);
                gridObj3.setColumnHide('AMOUNT', amountColumnVisible);
                if (wrbtrEditable) {
                    gridObj3.makeColumnEditable('WRBTR');
                    gridObj3.setColumnBgColor('WRBTR', '214|228|255');
                } else {
                    gridObj3.makeColumnReadOnly('WRBTR');
                    gridObj3.setColumnBgColor('WRBTR', '221|221|221');
                }

                var $createStatement = $('#createStatement');
                var $i = $createStatement.find('i').detach();
                $createStatement.html(amountColumnTextPrefix + $mls.getByCode('M_FI_0204_001_createStatement'));
                $createStatement.prepend($i);

                $u.buttons.runCustomHandler('handleFormEditableByPAYGB_EVIKB');
                $(window).resize();
            },
            onEVIKBChange: function(){
                function checkEvikbType(evikb) {
                    if(evikb === 'B') {
                        if($u.get('header-invoicer-content','BLDAT')) $u.get('header-invoicer-content','BLDAT').setReadOnly(true);
                        if($u.get('header-invoicer-content','BUPLA')) $u.get('header-invoicer-content','BUPLA').setReadOnly(true);
                    } else {
                        if($u.get('header-invoicer-content','BLDAT')) $u.get('header-invoicer-content','BLDAT').setReadOnly(false);
                        if($u.get('header-invoicer-content','BUPLA')) $u.get('header-invoicer-content','BUPLA').setReadOnly(false);
                    }
                }
                // 초과전표일 경우 초과예정금액을 초기화
                if ($u.get('PAYGB') && $u.get('PAYGB').getValue() === 'C') {
                    var gridObj3 = $u.gridWrapper.getGrid('unidocu-grid3');
                    if (gridObj3) gridObj3.$V('AMOUNT', 0, '');
                }
                $u.util.tryCatchCall(function () {
                    var evikb = $u.get('EVIKB').getValue();
                    var isNoEvidence = evikb === '' || evikb === 'Z';
                    if (!isNoEvidence && $u.get('PAYGB').getValue() === 'B') throw $mls.getByCode('M_UD_0204_001_evikb_only_set_z_when_paygb_b');
                    if (!isNoEvidence) vendorCodeInput2.validateRequired();

                    $efi.createStatement.onEVIKBChange();
                    if (/UD_0204_0(01|11)/.test($u.page.getPROGRAM_ID())) checkEvikbType(evikb); // #3239
                }, function () {
                    $u.get('EVIKB').setValue('');
                    if ($u.get('EVIKB').getValue() !== '') $u.get('EVIKB').setValue('Z'); // 증빙없음으로 Z 추가,
                    $u.get('EVIKB').$el.first().change();
                });
            }
        });

        return function(){
            var grid2CurrencyColumnTargetColumnMap = $u.programSetting.getValue('grid2CurrencyColumnTargetColumnMap');
            if(!$.isEmptyObject(grid2CurrencyColumnTargetColumnMap)) {
                var precisionMap = {};
                $.each($u.f4Data.getCodeMapWithParams('WAERS', 'CURRDEC'), function(waers, currdec){
                    precisionMap[waers] = Number(currdec);
                });
                gridObj2.setNumberFormatByCurrencyColumn(grid2CurrencyColumnTargetColumnMap, precisionMap);
            }
            $('#select-condition').find('header').append($('#uni-grid3_buttons'));
            if($u.get('EVIKB').$el.filter('input').length === 1) {
                $('h3.statement-title').hide();
                $('#statement-wrapper').hide();
            }
            gridObj.setNumberNegative('WRBTR', 'false');
            gridObj2.setCheckBarAsRadio('SELECTED');
            gridObj3.setColumnHide('SELECTED', true);
            gridObj3.setColumnHide('AMOUNT', false);
            $('#statement-information-content').hide();

            $u.get('PAYGB').$el.change();
            if($u.get('EVIKB')) $u.get('EVIKB').$el.first().change();

            $u.get('WRBTR').$el.change(function() {
                gridObj3.$V('WRBTR',0, $u.get('WRBTR').getValue());
            });

            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();
        }
    }
});