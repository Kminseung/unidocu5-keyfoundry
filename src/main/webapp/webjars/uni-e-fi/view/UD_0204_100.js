/**
 * @module uni-e-fi/view/UD_0204_100
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
        $u.programSetting.appendTemplate('grid2CurrencyColumnTargetColumnMap', {
            defaultValue: {},
            type: 'json'
        });
        $u.programSetting.appendTemplate('선급금 증빙정보 세액 자동 계산', {
            defaultValue: 'false',
            description: '[증빙구분-세금계산서] 지급금액 - 증빙금액(승인금액) 사용 (redmine refs #20946)'
        });
        $u.programSetting.appendTemplate('선급금 증빙정보 승인금액 자동 계산', {
            defaultValue: 'false',
            description: '[증빙구분-세금계산서] 세금금액 - 증빙금액(세액) 사용 (redmine refs #20946)'
        });
        $u.programSetting.appendTemplate('선급금 한 건인 경우 증빙 금액 사용', {
            defaultValue: 'false',
            description: '[증빙구분-세금계산서] 세금코드 존재시 WMWST -> 증빙세액, gridWRBTR -> 증빙 공급가액 사용'
        });
        $u.programSetting.appendTemplate('증빙정보 승인금액 자동 계산사용', {
            defaultValue: 'false',
            description: '[증빙구분-법인카드] 지급금액 - 증빙금액(승인금액) 사용 (redmine refs #18602)'
        });
        $u.programSetting.appendTemplate('증빙정보 세액 자동 계산사용', {
            defaultValue: 'false',
            description: '[증빙구분-법인카드] 세금금액 - 증빙금액(세액) 사용 (redmine refs #18602)'
        });
        $u.programSetting.appendTemplate('한 건인 경우 증빙 금액 사용', {
            defaultValue: 'false',
            description: '[증빙구분-법인카드] 세금코드 존재시 WMWST -> 증빙세액, gridWRBTR -> 증빙 공급가액 사용'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var grid2SelectedOldRowIndex;

        var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
        var vendorCodeINput2Name = vendorCodeInput.getName() + '2';
        var vendorCodeInput2 = $u.get(vendorCodeINput2Name);
        if (!vendorCodeInput2) {
            unidocuAlert(vendorCodeINput2Name + ' does not exists');
            return;
        }

        var gridObj__onCellClick = gridObj._onCellClick;
        gridObj._onCellClick = function (columnKey, rowIndex) {
            $u.buttons.runCustomHandler('validateGrid2NotSelected');
            gridObj__onCellClick(columnKey, rowIndex)
        };

        var gridObj__onChangeCell = gridObj._onChangeCell;
        gridObj._onChangeCell = function (columnKey, rowIndex, oldValue, newValue) {
            $u.buttons.runCustomHandler('validateGrid2NotSelected', function () {
                gridObj.clearGridData();
                $efi.createStatementCommon.addRow();
            });
            gridObj__onChangeCell(columnKey, rowIndex, oldValue, newValue)
        };

        gridObj.onCellClick($efi.createStatement.handleClickCell);
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, code, jsonObj) {
            $efi.createStatement.handleChangeCell(columnKey, rowIndex, oldValue, code, jsonObj);
            if (columnKey === 'WRBTR' || columnKey === 'SHKZG' || columnKey === 'MWSKZ') $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');
        });
        gridObj.onBlockPaste($efi.createStatement.afterMultiCellChange);
        gridObj.onBeforeOpenF4Dialog($efi.createStatement.handleBeforeOpenF4Dialog);
        gridObj2.onChangeCell(function (columnKey, rowIndex, oldValue) {
            if (columnKey === 'SELECTED') {
                var selectedJSONData = gridObj2.getSELECTEDJSONData();
                if (selectedJSONData.length === 1) {
                    var json = selectedJSONData[0];
                    var shkzg = json['SHKZG'];
                    if (shkzg !== 'S') {
                        gridObj2.$V('SELECTED', rowIndex, oldValue);
                        if (grid2SelectedOldRowIndex !== '') gridObj2.$V('SELECTED', grid2SelectedOldRowIndex, '1');
                        return;
                    }
                }
                if (gridObj2.$V('SELECTED', rowIndex) !== '1') {
                    gridObj2.$V('SELECTED', rowIndex, '1');
                    return;
                }
                grid2SelectedOldRowIndex = rowIndex;
                $u.get('PAYGB').$el.change();
            }
        });
        gridObj2.onTreeNodeClick(function (rowIndex) {
            $efi.popup.openStatementViewWithParamMap(gridObj2.getJSONDataByRowIndex(rowIndex));
        });

        $efi.evidenceHandler();
        vendorCodeInput2.$el.change(function () {
            if ($(this).find('.code > input').val() === '') return;
            gridObj2.clearGridData();
            $u.buttons.triggerFormTableButtonClick();
            $u.buttons.runCustomHandler('setVendorCodeInputByVendorCodeInput2');
            $efi.createStatement.bindEvent.triggerVendorCodeChange();
        });
        $u.get('PAYGB').$el.change(function () {
            $u.buttons.runCustomHandler('onPAYGBChange');
        });

        if ($u.get('EVIKB')) {
            $u.get('EVIKB').$el.change(function () {
                $u.buttons.runCustomHandler('onEVIKBChange');
            });
        }

        var $el = $u.buttons.getEl('incompleteStatement').css("margin", '5px 0 0 5px');
        $('#search-condition h2').after($el[0]);
        $('#incompleteStatement').click(function () {
            var $dialog = $u.dialog.dialogLayout001({
                "subGroup": 'INCOMPLETE_STATEMENT_DIALOG',
                "dialogTitle": '미결항목조회',
                "draggable": true,
                "resizable": true,
                "dialogWidth": 900,
                "dialogButtons": [
                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                        $dialog.dialog('close');
                    })
                ]
            });
            $('#dialog-search-form').hide();
            var dialogGridObj = $u.gridWrapper.getGrid('dialog-search-grid');
            dialogGridObj.setColumnHide('SELECTED', true);
            $nst.is_data_ot_data('ZUNIEFI_5006', {I_LUFNR: $u.get('LIFNR2').getValue()}, function (ot_data) {
                dialogGridObj.setJSONData(ot_data);
            });
            dialogGridObj.onCellClick(function (columnKey, rowIndex) {
                if (columnKey === 'LIFNR' || columnKey === 'BELNR') {
                    $u.page.setCustomParam('getSelectedDialogBELNR', dialogGridObj.$V('BELNR', rowIndex));
                    vendorCodeInput2.setValue({code: dialogGridObj.$V('LIFNR', rowIndex), text: dialogGridObj.$V('LIFNR_TXT', rowIndex)});
                    vendorCodeInput2.$el.change();
                    $dialog.dialog('close');
                }
            });
        });

        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            "doQuery": function () {
                vendorCodeInput2.validateRequired();
                $u.buttons.runCustomHandler('setInitialData');
                var paramMap = $u.getValues('search-condition');
                paramMap[vendorCodeInput2.getName().replace(/2$/, '')] = vendorCodeInput2.getValue();
                $nst.is_data_ot_data('ZUNIEFI_5002', paramMap, function (ot_data) {
                    $efi.setTreeModeBELNR_ZUONR(gridObj2, ot_data);
                    if ($u.page.getCustomParam('getSelectedDialogBELNR')) {
                        var belnrIndex = gridObj2.$F($u.page.getCustomParam('getSelectedDialogBELNR'), 'BELNR')[0];
                        if (belnrIndex !== null && belnrIndex !== undefined) {
                            gridObj2.$V('SELECTED', belnrIndex, '1');
                            gridObj2.triggerChangeCell('SELECTED', belnrIndex);
                        }

                        $u.page.setCustomParam('getSelectedDialogBELNR', '');
                    }
                }, function () {
                    gridObj2.clearGridData();
                });
            },
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
                if (gridObj2.getSELECTEDJSONData().length < 1) throw "거래처를 선택한 후 전표생성 가능합니다.";
                var BUDAT = $u.get('BUDAT').getValue();
                $.each(gridObj2.getSELECTEDJSONData(), function (index, item) {
                    var gridObj2_Budat = item['BUDAT'].replace(/-/g, '');
                    if (gridObj2_Budat > BUDAT) throw "정산 일자는 신청일자 이후만 가능합니다.";
                });

                var paygb = $u.get('PAYGB').getValue();
                var form_wrbtr_val = $u.get('WRBTR').getValue();
                var wrbtr_paygb_val = $u.get('WRBTR_PAYGB').getValue();

                if (wrbtr_paygb_val === 0) {
                    if (paygb === 'A') throw "정산예정금액은 0보다 커야 합니다.";
                    if (paygb === 'B') throw "반환예정금액이 존재하지 않습니다.";
                    if (paygb === 'C') throw "초과예정금액이 존재하지 않습니다.";
                }

                if (paygb === 'A' && form_wrbtr_val !== wrbtr_paygb_val) throw "지급금액과 정산예정금액은 같아야 합니다.";
                if (paygb === 'C' && form_wrbtr_val <= wrbtr_paygb_val) throw "지급금액이 정산예정금액 보다 커야 합니다.";

                if (paygb === 'A' && wrbtr_paygb_val > Number(gridObj2.getSELECTEDJSONData()[0]['DIV_AMT'])) throw $mls.getByCode('M_FI_0204_001_adjustmentCannotExceedBalance');

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
                var select_condition_data = $u.getValues('select-condition');
                select_condition_data['WRBTR'] = select_condition_data['WRBTR_PAYGB'];
                vendData.push($.extend({}, paramMap, select_condition_data));
                if (/[BC]/.test($u.get('PAYGB').getValue())) vendData.push($.extend({}, paramMap));
                if (vendData[1]) vendData[1]['PAYGB'] = '';
                var tableParams = {IT_DATA: gridData, IT_VEND: vendData};
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $efi.createStatement.confirmBeforeCreateStatement(paramMap, tableParams, function () {
                    $nst.is_data_tableParams_os_docno($u.programSetting.getValue('setCreateStatementFunction'), paramMap, tableParams, function (os_docNo) {
                        $efi.dialog.afterCreateStatementDialog.open(os_docNo, $u.pageReload);
                    });
                });
            },
            "reSelectTax": function () {
                $u.buttons.runCustomHandler('onCommonChange', true);
            }
        });

        $u.buttons.addCustomHandler({
            changeWRBTR_AMOUNT: function () {
                var payGBValue = $u.get('PAYGB').getValue();
                var headerWRBTRAmount = $u.get('WRBTR').getValue();
                var wrbtr_paygb_value = $u.get('WRBTR_PAYGB').getValue();

                if (payGBValue === 'A') {
                    $u.get('WRBTR_PAYGB').setValue($u.get('WRBTR').getValue());
                }
                if (payGBValue === 'C') {
                    if (headerWRBTRAmount > wrbtr_paygb_value) $u.get('AMOUNT').setValue(headerWRBTRAmount - wrbtr_paygb_value);
                    else $u.get('AMOUNT').setEmptyValue();
                }
            },
            setVendorCodeInputByVendorCodeInput2: function () {
                if (!new RegExp(vendorCodeInput.getName()).test(vendorCodeInput2.getName())) return;
                vendorCodeInput.setValue({
                    code: vendorCodeInput2.getValue(),
                    text: vendorCodeInput2.getTextValue()
                });
            },
            onEVIKB_EvidenceSelected: function () {
                $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');
            },
            onPAYGBChange: function () {
                if ($u.page.getCustomParam('isDoQuery') !== true) {
                    $u.buttons.runCustomHandler('validateGrid2NotSelected', function () {
                        $u.get('PAYGB').setValue('A');
                    });
                }
                $u.page.setCustomParam('isDoQuery', false);
                var paygbSelectedValue = $u.get('PAYGB').getValue();
                if (paygbSelectedValue === 'B') $u.get('EVIKB').setValue('Z');

                var selectedJSONData = gridObj2.getSELECTEDJSONData();
                if (selectedJSONData.length === 1) {
                    var json = selectedJSONData[0];
                    json['WRBTR'] = json['DIV_AMT'].replace(/,/g, '');
                    json['AMOUNT'] = json['WRBTR'];
                    if ($u.get('WRBTR_PAYGB')) $u.get('WRBTR_PAYGB').setValue(json['WRBTR']);
                    if ($u.get('AMOUNT')) $u.get('AMOUNT').setValue(json['AMOUNT']);
                    if ($u.get('ZUONR')) $u.get('ZUONR').setValue(json['ZUONR']);
                }

                $u.buttons.runCustomHandler('setFormTable');
                $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');

                gridObj.clearGridData();
                $efi.createStatementCommon.addRow();
                $(gridObj).show();
                var amountColumnTextPrefix, amountColumnVisible;
                if (paygbSelectedValue === 'A') {
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_adjustment');
                    amountColumnVisible = false;
                } else if (paygbSelectedValue === 'B') {
                    gridObj.clearGridData();
                    $(gridObj).hide();
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_refund');
                    amountColumnVisible = true;
                    setTimeout(function () {
                        $u.get('WRBTR').setValue($u.get('AMOUNT').getValue()); // #1594
                    }, 300);
                } else if (paygbSelectedValue === 'C') {
                    amountColumnTextPrefix = $mls.getByCode('M_FI_0204_001_exceed');
                    amountColumnVisible = true;
                }

                $u.get('AMOUNT').setThText(amountColumnTextPrefix + $mls.getByCode('M_FI_0204_001_estimatedAmount'));
                if (amountColumnVisible) {
                    $('#unidocu-th-AMOUNT').show();
                    $('#unidocu-td-AMOUNT').show();
                } else {
                    $('#unidocu-th-AMOUNT').hide();
                    $('#unidocu-td-AMOUNT').hide();
                }

                var $createStatement = $('#createStatement');
                var $i = $createStatement.find('i').detach();
                $createStatement.html(amountColumnTextPrefix + $mls.getByCode('M_FI_0204_001_createStatement'));
                $createStatement.prepend($i);
                var $autoInputSelectForm = $('#autoInput-select-condition');
                $u.programSetting.getValue('useSelectForm') === 'true' && paygbSelectedValue !== 'B' ? $autoInputSelectForm.show() : $autoInputSelectForm.hide();

                $(window).resize();
            },
            onEVIKBChange: function () {
                $u.buttons.runCustomHandler('validateGrid2NotSelected', function () {
                    $u.get('EVIKB').setValue('Z');
                    if ($u.get('EVIKB').getValue() !== 'Z') $u.get('EVIKB').setValue('');
                });

                // 초과전표일 경우 초과예정금액을 초기화
                if ($u.get('PAYGB') && $u.get('PAYGB').getValue() === 'C') {
                    if ($u.get('AMOUNT')) $u.get('AMOUNT').setEmptyValue();
                }
                $u.util.tryCatchCall(function () {
                    var evikb = $u.get('EVIKB').getValue();
                    var isNoEvidence = evikb === '' || evikb === 'Z';
                    if (!isNoEvidence && $u.get('PAYGB').getValue() === 'B') throw $mls.getByCode('M_UD_0204_001_evikb_only_set_z_when_paygb_b');
                    if (!isNoEvidence) vendorCodeInput2.validateRequired();
                    $u.buttons.runCustomHandler('setFormTable');
                }, function () {
                    $u.get('EVIKB').setValue('');
                    if ($u.get('EVIKB').getValue() !== '') $u.get('EVIKB').setValue('Z'); // 증빙없음으로 Z 추가,
                    $u.get('EVIKB').$el.first().change();
                    $u.buttons.runCustomHandler('onPAYGBChange');
                });
            },
            onCommonChange: function (reSelectFlag) {
                function initializeValues() {
                    if (reSelectFlag === true) return;
                    gridObj.clearGridData();
                    $efi.createStatementCommon.addRow();
                    $.each(['WRBTR_READ_ONLY', 'CHARGETOTAL', 'WMWST_READ_ONLY', 'difference_amount', 'debitSum', 'creditSum'], function (index, name) {
                        $u.get(name).setEmptyValue();
                    });
                    $('#statement-information-content').hide();
                    $u.page.setCustomParam('selected_evidence_is_key', null);
                }

                function setEVIKBToNoEvidence() {
                    if (reSelectFlag === true) return;
                    $u.get('EVIKB').setValue('Z');
                    if ($u.get('EVIKB').getValue() !== 'Z') $u.get('EVIKB').setValue('');
                    $u.get('EVIKB').$el.first().change();
                }

                var vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();
                if (vendorCodeInput) $u.buttons.runCustomHandler('setVendorCodeInputByVendorCodeInput2');

                var evikb = $u.get('EVIKB').getValue();
                var programId = 'UD_0201_031';
                if (evikb === 'A') programId = 'UD_0201_001';
                else if (evikb === 'B') programId = 'UD_0201_011';
                else if (evikb === 'Z') programId = $u.page.getPROGRAM_ID();
                else programId = $u.page.getPROGRAM_ID() + (evikb ? evikb : '');

                var comboQueryParams = {GIVEN_IS_KEY_PROGRAM_ID: programId};

                if (reSelectFlag !== true) {
                    $.each(['LIFNR', 'ZTERM', 'MWSKZ'], function (index, key) {
                        var gridHeader = gridObj.getGridHeader(key);

                        if ($u.get(key) && $u.get(key).getType() === 'Uni_CodeCombo' || gridHeader && gridHeader.type === 't_combo') {
                            var combo = $u.f4Data.getCodeComboOption(key, comboQueryParams);
                            if ($u.get(key) && $u.get(key).getType() === 'Uni_CodeCombo') $u.get(key).setOptions(combo);
                            if (gridHeader && gridHeader.type === 't_combo') gridObj.setComboOptions(key, combo);
                        }

                        if ($u.get(key) && $u.get(key).getType() === 'Uni_CodePopup') $u.get(key).setQueryParams($.extend({}, $u.get(key).getQueryParams(), {PROGRAM_ID: programId}));
                        if (gridHeader && gridObj.isPopupCodeColumn(key)) gridObj.setQueryParams(key, {PROGRAM_ID: programId});
                    });
                }

                $efi.statementInitialData.setStatementInitialData(programId, function () {
                    initializeValues();
                    var selected_SU_ID = '';
                    if (gridObj2.getSELECTEDJSONData().length > 0) selected_SU_ID = gridObj2.getSELECTEDJSONData()[0]['SU_ID'];
                    var defaultFormValues = {LIFNR__DIALOG: vendorCodeInput2.getValue(), LIFNR__DIALOG_TXT: vendorCodeInput2.getTextValue(), SU_ID__DIALOG: selected_SU_ID};
                    var evidencePROGRAM_ID = null;

                    if (evikb === 'A') evidencePROGRAM_ID = 'UD_0201_000';
                    if (evikb === 'B') evidencePROGRAM_ID = 'UD_0201_010';

                    if (!evidencePROGRAM_ID) {
                        $efi.createStatement.bindEvent.triggerVendorCodeChange();
                        return;
                    }

                    $u.buttons.runCustomHandler('evidenceDialog', ({
                        "evidencePROGRAM_ID": evidencePROGRAM_ID,
                        "defaultFormValues": defaultFormValues,
                        "selectCallback": function (selectedData) {
                            var $statement = $('#statement-information-content');
                            $statement.show();
                            $statement.find('.panel-search-button').text('증빙 재선택').css('width', '90px');
                            $(window).resize();
                            var selectedPopupData = $efi.createStatement.reMapSelectedPopupData($.extend({}, selectedData));
                            delete selectedPopupData['BLART'];
                            delete selectedPopupData['EVIKB'];
                            gridObj.clearGridData();
                            $efi.createStatementCommon.addRow();
                            $u.page.setCustomParam('selected_evidence_is_key', selectedPopupData);
                            selectedPopupData['ID'] = selectedPopupData['SU_ID'];

                            if (selectedPopupData['STCD2'] !== '') selectedPopupData['IP_ID'] = selectedPopupData['STCD2'];
                            $u.setValues('statement-information-content', selectedPopupData);
                            if ($u.hasTable('header-invoicer-content')) $u.setValues('header-invoicer-content', selectedPopupData);
                            if ($u.hasTable('vendor-info')) $u.setValues('vendor-info', selectedPopupData);
                            $u.get('MWSKZ').setOldValue($u.get('MWSKZ').getValue());
                            var chargeTotal = Number(selectedPopupData['CHARGETOTAL']);
                            if ((chargeTotal) < 0) gridObj.$V('SHKZG', 0, 'H');
                            gridObj.$V('WRBTR', 0, chargeTotal);
                            gridObj.$V('MWSKZ', 0, $u.get('MWSKZ').getValue());
                            $efi.createStatementCommon.changeWRBTRExpenseInitial();

                            var f4QueryParams = {LIFNR: selectedPopupData['LIFNR']};
                            if ($u.get('BVTYP')) $u.get('BVTYP').setOptions($u.f4Data.getCodeComboOption($u.get('BVTYP').params['codeKey'], f4QueryParams), selectedPopupData['BVTYP']);
                            if ($u.get('AKONT')) $u.get('AKONT').setOptions($u.f4Data.getCodeComboOption($u.get('AKONT').params['codeKey'], f4QueryParams), selectedPopupData['AKONT']);
                            if ($u.get('EMPFB')) {
                                if ($u.get('EMPFB').setOptions) $u.get('EMPFB').setOptions($u.f4Data.getCodeComboOption($u.get('EMPFB').params['codeKey'], f4QueryParams));
                                else if ($u.get('EMPFB').setQueryParams) $u.get('EMPFB').setQueryParams(f4QueryParams)
                            }
                            if ($u.get('ZLSCH')) $u.get('ZLSCH').setOptions($u.f4Data.getCodeComboOption($u.get('ZLSCH').params['codeKey'], f4QueryParams), selectedPopupData['ZLSCH']);
                            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();

                            $efi.handleTYPE_CODE_0104_0204(selectedPopupData['TYPE_CODE']); // #20739 #7593

                            if($u.buttons.getCustomHandler('onEVIKB_EvidenceSelected')) $u.buttons.runCustomHandler('onEVIKB_EvidenceSelected', selectedPopupData);
                        },
                        closeWithoutSelectCallback: function () {
                            setEVIKBToNoEvidence();
                        }
                    }));
                });
                $u.showSubContent();
                $u.gridWrapper.getGrid().fitToWindowSize();
            },
            evidenceDialog: function (dialogParams) {
                var formId = 'dialog-search-form';
                var gridId = 'dialog-search-grid';
                var evidenceDialogInfoMap = {
                    UD_0201_000: {
                        subGroup: 'UD_0201_000_DIALOG',
                        dialogTitle: $mls.getByCode('DLT_UD_0201_000_DIALOG'),
                        dialogSearchFunction: 'ZUNIEFI_1000'
                    },
                    UD_0201_010: {
                        subGroup: 'UD_0201_010_DIALOG',
                        dialogTitle: $mls.getByCode('DLT_UD_0201_010_DIALOG'),
                        dialogSearchFunction: 'ZUNIEFI_2000'
                    }
                };

                var evidencePROGRAM_ID = dialogParams['evidencePROGRAM_ID'];
                var selectCallback = dialogParams['selectCallback'];
                var closeWithoutSelectCallback = dialogParams['closeWithoutSelectCallback'];
                var selected = false;

                var evidenceDialogInfo = evidenceDialogInfoMap[evidencePROGRAM_ID];
                if (!evidenceDialogInfo) throw 'evidence dialog info does not exist. evidencePROGRAM_ID: ' + evidencePROGRAM_ID;

                var $dialog = $u.dialog.dialogLayout001({
                    "subGroup": evidenceDialogInfo.subGroup,
                    "dialogTitle": evidenceDialogInfo.dialogTitle,
                    "dialogSearchButton": function () {
                        var params = $u.getValues(formId);
                        $.each(params, function(key){
                            if(/__DIALOG/.test(key)) params[key.replace('__DIALOG', '')] = params[key];
                        });
                        $nst.is_data_ot_data(evidenceDialogInfo.dialogSearchFunction, params, function (ot_data) {
                            $u.gridWrapper.getGrid(gridId).setJSONData(ot_data);
                        });
                    },
                    "dialogButtons": [$u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                        if ($u.gridWrapper.getGrid(gridId).getSELECTEDJSONData().length === 0) throw '증빙을 선택해 주세요.';
                        $efi.vendorInfoAddedDataHandler.handleByProgramId(evidencePROGRAM_ID, gridObj.getSELECTEDJSONData()[0], function (vendorInfoAddedData) {
                            selected = true;
                            $dialog.dialog('close');
                            selectCallback(vendorInfoAddedData);
                        });
                    })],
                    "dialogWidth": 1000,
                    "closeCallback": function () {
                        if (!selected && closeWithoutSelectCallback) closeWithoutSelectCallback();
                    }
                });
                var gridObj = $u.gridWrapper.getGrid(gridId);
                gridObj.setCheckBarAsRadio('SELECTED');
                if(dialogParams['defaultFormValues']) $u.setValues('dialog-search-form', dialogParams['defaultFormValues']);
                gridObj.onCellClick(function (columnKey, rowIndex) {
                    if (columnKey === 'APPR_NO') return $efi.popup.openCardBill(gridObj.$V('CRD_SEQ', rowIndex));
                    if (columnKey === 'ISSUE_ID') return $efi.popup.openTaxInvoice(gridObj.$V('INV_SEQ', rowIndex));
                    if (columnKey === 'EVI_SEQ') return $efi.popup.showEvidence(gridObj.$V('EVI_SEQ', rowIndex));
                });
                $u.util.tryCatchCall(function(){
                    $u.buttons.triggerFormTableButtonClick(formId);
                });
                return $dialog;
            },
            setFormTable: function () {
                var $header = $('#header-invoicer-content');
                var $scope = $header.parent();
                var subGroup = $u.page.getPROGRAM_ID() + $u.get('PAYGB').getValue();
                if ($u.get('EVIKB').getValue() === 'B') subGroup += '_TAX';
                $header.data('subGroup', subGroup);
                $u.renderUIComponents($scope);

                vendorCodeInput = $efi.statementInitialData.getVendorCodeInput();

                $efi.createStatement.bindEvent.bindCommonFormEvent();

                if ($u.get('header-invoicer-content', 'MWSKZ')) {
                    $u.get('header-invoicer-content', 'MWSKZ').$el.change(function () {
                        $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');
                    })
                }
                $u.unidocuCurrency.bind_setKRUSF_onWAERS_BUDAT_change();
                if ($u.get('header-invoicer-content', 'WAERS')) {
                    var grid2SelectedData = gridObj2.getSELECTEDJSONData();
                    if (grid2SelectedData.length === 1) {
                        $u.get('header-invoicer-content', 'WAERS').setValue(grid2SelectedData[0]['WAERS']);
                        $u.get('header-invoicer-content', 'WAERS').$el.change();
                    }
                }

                var $_WMWST = $u.get('WMWST');
                if ($_WMWST) $_WMWST.$el.change(function () {
                    $u.buttons.runCustomHandler('changeWRBTR_AMOUNT');
                });

                $u.buttons.runCustomHandler('onCommonChange');
            },
            validateGrid2NotSelected: function (callback) {
                if (gridObj2.getSELECTEDJSONData().length === 0) {
                    if (callback) callback();
                    throw $mls.getByCode('M_FI_0204_100_isGrid2SelectedChangeFlag');
                }
            },
            setInitialData: function () {
                grid2SelectedOldRowIndex = '';
                $u.get('PAYGB').setValue('A');
                $u.get('EVIKB').setValue('Z');
                if ($u.get('EVIKB').getValue() !== 'Z') $u.get('EVIKB').setValue('');
                $u.page.setCustomParam('isDoQuery', true);
                $u.get('PAYGB').$el.change();
            }
        });

        return function () {
            var grid2CurrencyColumnTargetColumnMap = $u.programSetting.getValue('grid2CurrencyColumnTargetColumnMap');
            if (!$.isEmptyObject(grid2CurrencyColumnTargetColumnMap)) {
                var precisionMap = {};
                $.each($u.f4Data.getCodeMapWithParams('WAERS', 'CURRDEC'), function (waers, currdec) {
                    precisionMap[waers] = Number(currdec);
                });
                gridObj2.setNumberFormatByCurrencyColumn(grid2CurrencyColumnTargetColumnMap, precisionMap);
            }
            if ($u.get('EVIKB').$el.filter('input').length === 1) {
                $('h3.statement-title').hide();
                $('#statement-wrapper').hide();
            }
            gridObj.setNumberNegative('WRBTR', 'false');
            gridObj2.setCheckBarAsRadio('SELECTED');
            $('#statement-information-content').hide();

            $u.buttons.runCustomHandler('setFormTable');
            $('#unidocu-th-AMOUNT').hide();
            $('#unidocu-td-AMOUNT').hide();

            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.fitToWindowSize();
        }
    }
});