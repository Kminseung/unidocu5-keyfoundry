/**
 * @module uni-e-fi/$efi/$efiDialog
 */
define(function () {
    return function () {
        $efi.dialog = {};
        $efi.dialog.MULTIPODATADialog = {};
        $efi.dialog.MULTIPODATADialog.open = function (callback) {
            var gridId = 'dialog-search-grid';

            function getGrid() {
                return $u.gridWrapper.getGrid(gridId);
            }

            var dialogButtons = [
                $u.baseDialog.getButton($mls.getByCode('DLB_addRow'), function () {
                    getGrid().addRow();
                }),
                $u.baseDialog.getButton($mls.getByCode('DLB_deleteRow'), function () {
                    getGrid().deleteSelectedRows();
                }),
                $u.baseDialog.getButton($mls.getByCode('DLB_query'), function () {
                    var $dialog = $(this);
                    var jsonData = getGrid().getJSONData();
                    $.each(jsonData, function (index, item) {
                        if (item['EBELN'] === '' && item['EBELP'] !== '') throw $mls.getByCode('M_MULTIPODATA_DIALOG_EBELNEmptyEBELPNotEmpty');
                    });
                    callback(jsonData);
                    $dialog.dialog('close');
                })
            ];
            $u.dialog.dialogLayout001({
                subGroup: 'MULTIPODATA_DIALOG',
                dialogTitle: $mls.getByCode('DLT_MULTIPODATADialog'),
                dialogButtons: dialogButtons,
                dialogWidth: 600
            });
            getGrid().setHeaderCheckBox('SELECTED', true);
            for (var i = 0; i < 10; i++) getGrid().addRow();
            $(getGrid()).height(400);
        };
        $efi.dialog.POHISTORYDialog = {};
        $efi.dialog.POHISTORYDialog.open = function (ot_data) {
            var gridId = 'dialog-search-grid';

            function getGrid() {
                return $u.gridWrapper.getGrid(gridId);
            }

            $u.dialog.dialogLayout001({
                subGroup: 'POHISTORY_DIALOG',
                dialogTitle: $mls.getByCode('DLT_POHISTORYDialog'),
                dialogWidth: 1000
            });
            getGrid().setJSONData(ot_data);
        };
        $efi.dialog.businessTripDialog = {};
        $efi.dialog.businessTripDialog.open = function () {
             return $u.dialog.dialogLayout001({
                'subGroup': 'UD_0220_014_DIALOG',
                'dialogTitle': $mls.getByCode('DLT_UD_0220_014_DIALOG'),
                'dialogSearchButton': function () {
                    var params = $u.getValues('dialog-search-form');
                    $.each(params, function(key){
                        if(/__DIALOG/.test(key)) params[key.replace('__DIALOG', '')] = params[key];
                    });
                    var webData = $u.webData.formSetting.getData('UD_0220_014@search-condition')['OS_DATA']['FUNCNAME'];
                    if(/^UD_0220_112$|^UD_0220_122$|^UD_0220_132$/.test($u.page.getPROGRAM_ID())) webData = $u.webData.formSetting.getData('UD_0220_140@search-condition')['OS_DATA']['FUNCNAME'];
                    $nst.is_data_ot_data(webData, params, $u.gridWrapper.getGrid('dialog-search-grid').setJSONData);
                },
                'dialogButtons': [],
                'dialogWidth': 1200,
                 'draggable': true
            });
        };
        $efi.dialog.batchApplyDialog = {};
        $efi.dialog.batchApplyDialog.open = function (firstSelectedJSONData) {
            function getGrid() {
                return $u.gridWrapper.getGrid();
            }

            var $dialog = $u.dialog.dialogLayout001({
                "subGroup": 'BATCH_APPLY_DIALOG',
                "dialogTitle": $mls.getByCode('DLT_batchApplyDialog'),
                "ignoreGrid": true,
                "dialogButtons": [
                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                        $u.validateRequired('dialog-search-form');
                        var selectedRowIndexes = getGrid().getSelectedRowIndexes();
                        var values = $u.getValues('dialog-search-form');
                        $.each(selectedRowIndexes, function (index, rowIndex) {
                            $.each(values, function (key, value) {
                                if (getGrid().getGridHeader(key)) getGrid().$V(key, rowIndex, value);
                            });
                        });
                        $dialog.dialog('close');
                    })
                ]
            });

            $u.setValues('dialog-search-form', firstSelectedJSONData);
            var $u_GEBER = $u.get('dialog-search-form', 'GEBER');
            if ($u_GEBER) {
                $u_GEBER.onBeforeOpenF4Dialog(function () {
                    var values = $u.getValues('dialog-search-form');
                    delete values['GEBER'];
                    delete values['GEBER_TXT'];
                    $u_GEBER.setQueryParams(values);
                });
            }
            var $u_HKONT = $u.get('dialog-search-form', 'HKONT');
            if ($u_HKONT) {
                $u_HKONT.onBeforeOpenF4Dialog(function () {
                    var values = $u.getValues('dialog-search-form');
                    delete values['HKONT'];
                    delete values['HKONT_TXT'];
                    $u_HKONT.setQueryParams(values);
                });
                $u_HKONT.$el.change(function () {
                    var dialogRowData = $u_HKONT.getDialogRowData();
                    if (dialogRowData) {
                        delete dialogRowData['HKONT'];
                        delete dialogRowData['HKONT_TXT'];
                        $u.setValues('dialog-search-form', dialogRowData);
                    }
                });
            }
        };
        $efi.dialog.evidenceSelectDialog = {};
        $efi.dialog.evidenceSelectDialog.open = function (dialogParams) {
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
                "dialogButtons": [],
                "dialogWidth": 1000,
                "closeCallback": function () {
                    if (!selected && closeWithoutSelectCallback) closeWithoutSelectCallback();
                }
            });
            var gridObj = $u.gridWrapper.getGrid(gridId);
            gridObj.setColumnHide('SELECTED', true);
            if(dialogParams['defaultFormValues']) $u.setValues('dialog-search-form', dialogParams['defaultFormValues']);
            gridObj.onCellClick(function (columnKey, rowIndex) {
                if (columnKey === 'APPR_NO') return $efi.popup.openCardBill(gridObj.$V('CRD_SEQ', rowIndex));
                if (columnKey === 'ISSUE_ID') return $efi.popup.openTaxInvoice(gridObj.$V('INV_SEQ', rowIndex));
                if (columnKey === 'EVI_SEQ') return $efi.popup.showEvidence(gridObj.$V('EVI_SEQ', rowIndex));
                $efi.vendorInfoAddedDataHandler.handleByProgramId(evidencePROGRAM_ID, gridObj.getJSONDataByRowIndex(rowIndex), function (vendorInfoAddedData) {
                    selected = true;
                    $dialog.dialog('close');
                    selectCallback(vendorInfoAddedData);
                });
            });
            $u.util.tryCatchCall(function(){
                $u.buttons.triggerFormTableButtonClick(formId);
            });
            return $dialog;
        };
        $efi.dialog.addDataDialog = {};
        $efi.dialog.addDataDialogHKONT_TXTMap = {};
        $efi.dialog.getAddDataSubGroup = function (hkont) {
            var subGroupList = {};
            var ot_add = $efi.statementInitialData.getAddDataInitialDataList();

            $.each(ot_add, function (index, item) {
                subGroupList[item['HKONT']] = item['ADD_GR'];
            });

            if (subGroupList[hkont]) return subGroupList[hkont];
            return '';
        };

        $efi.dialog.addDataDialog.open = function (programId, addDataKey, rowIndex, jsonStringAddData, hkont_txt) {
            var subGroup = 'addDataDialog_';
            subGroup += programId;
            subGroup += addDataKey;
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") subGroup = $efi.dialog.getAddDataSubGroup(addDataKey);
            if (!subGroup) throw '설정된 추가데이터가 없습니다.\n추가데이터 관리 화면에서 설정 후 사용 가능합니다.';

            var dialogTitle = $u.util.formatString('{HKONT_TXT} ({HKONT})', {
                HKONT_TXT: hkont_txt,
                HKONT: addDataKey
            });
            var formId = 'dialog-search-form';
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") formId = 'ADD_DATA_INFO';
            var $dialog = $u.dialog.dialogLayout001({
                "subGroup": subGroup,
                "dialogTitle": dialogTitle,
                "formId": formId,
                "draggable": true,
                "ignoreGrid": true,
                "dialogWidth": 500,
                "dialogButtons": [$u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                    $efi.dialog.addDataDialog.confirmCallback(rowIndex, addDataKey, $dialog);
                })]
            });

            var panelTitle = $dialog.find('#' + formId).data('webData')['OS_DATA']['PANEL_TITLE'];
            if (panelTitle) $dialog.dialog('option', 'title', panelTitle);
            $u.hidePanel(formId);
            if (jsonStringAddData) $u.setValues(formId, JSON.parse(jsonStringAddData));
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "false") {
                var inputNameList = [];
                $.each($dialog.find('#' + formId + ' .unidocu-table').data('$u_inputList'), function () {
                    inputNameList.push(this.getName());
                });
                $efi.addDataHandler.validateFNAME_FormField(addDataKey, inputNameList);
            }
        };
        $efi.dialog.addDataDialog.confirmCallback = function (rowIndex, addDataKey, $dialog) {
            var formId = 'dialog-search-form';
            if ($u.programSetting.getValue('setADD_DATAOnTheWeb') === "true") formId = 'ADD_DATA_INFO';
            $u.validateRequired(formId);
            var gridObj = $u.gridWrapper.getGrid();
            var values = $u.getValues(formId);
            var addDataJSON = [];
            var hasDataOrOptionInput = false;
            var optionlList = $efi.statementInitialData.getAddDataOptionalList();
            var hasValue = false;
            $.each(values, function (key, value) {
                if (value || $u.util.contains(addDataKey, optionlList)) hasDataOrOptionInput = true;
                if (value) hasValue = true;
            });
            if (!hasDataOrOptionInput) throw $mls.getByCode('M_shouldInputAddData');

            $.each($u.getNames(formId), function (index, item) {
                var params = $u.get(item).params;
                var value_text = '';
                if (params.type === 'Uni_CodePopup' || params.type === 'Uni_CodeCombo') value_text = $u.get(params.name).getTextValue();

                addDataJSON.push({KEY: params.name, VALUE: $u.get(params.name).getValue(), HEADER_TEXT: params.thText, VALUE_TEXT: value_text});
            });

            if (hasValue) {
                gridObj.$H('ADD_DATA', rowIndex, JSON.stringify(values));
                gridObj.$V('ADD_DATA', rowIndex, $mls.getByCode('M_ADD_DATA_INPUT'));
                if (gridObj.getGridHeader('ADD_DATA_JSON')) gridObj.$V('ADD_DATA_JSON', rowIndex, JSON.stringify(addDataJSON));
            } else {
                gridObj.$H('ADD_DATA', rowIndex, '');
                gridObj.$V('ADD_DATA', rowIndex, $mls.getByCode('M_ADD_DATA_INPUT_NULL'));
                if (gridObj.getGridHeader('ADD_DATA_JSON')) gridObj.$V('ADD_DATA_JSON', rowIndex, '');
            }

            $dialog.dialog('close');
            return values;
        }
        $efi.dialog.clearDialog = {};
        $efi.dialog.clearDialog.open = function (programId, openerJsonData, rowIndex) {
            var gridId = 'dialog-search-grid';
            function getGrid() {
                return $u.gridWrapper.getGrid(gridId);
            }
            var subGroup = 'IdDialog';
            subGroup += programId;
            var $dialog = $u.dialog.dialogLayout001({
                "subGroup": subGroup,
                "dialogTitle": '처리자 입력',
                "draggable": true,
                "dialogWidth": 700,
                "dialogButtons": [
                    $u.baseDialog.getButton($mls.getByCode('DLB_addRow'), function () {
                        if (getGrid().getRowCount() > 4) throw '최대 5명까지 추가 할 수 있습니다.';
                        getGrid().addRow();
                    }),
                    $u.baseDialog.getButton($mls.getByCode('DLB_deleteRow'), function () {
                        getGrid().deleteSelectedRows();
                    }),
                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                        getGrid().validateGridRequired();
                        $.each(getGrid().getJSONData(), function (index) {
                            if (getGrid().$V('CLEAR_ID', index) && !getGrid().$V('KUNNR', index) && !getGrid().$V('EARN_FLAG', index)) throw '고객코드, 법인세 중 하나는 필수 입력입니다.';
                        });

                        $nst.is_data_it_data_nsReturn('ZUNIEFI_3702', $.extend(openerJsonData, {I_GB: 'I'}), getGrid().getJSONData(), function () {
                            $u.buttons.triggerFormTableButtonClick('search-condition');
                            $dialog.dialog('close');
                        });
                    })
                ]
            });

            $('#dialog-search-form').hide();

            $nst.is_data_it_data_nsReturn('ZUNIEFI_3702', $.extend(openerJsonData, {I_GB: 'D'}), getGrid().getJSONData(), function (nsReturn) {
                var ot_data = nsReturn.getTableReturn('OT_DATA');
                getGrid().setJSONData(ot_data);
                if (ot_data.length === 0) getGrid().addRow();
            });

            if ($u.gridWrapper.getGrid().$V('GRONO', rowIndex)) {
                $.each(getGrid().getGridHeaders(), function (index, item) {
                    getGrid().makeColumnReadOnly(item['key']);
                });
                $('.ui-dialog-buttonset').hide();
            }
        };
        $efi.dialog.clr_amtDialog = {};
        $efi.dialog.clr_amtDialog.open = function (programId, jsonData) {
            var gridId = 'dialog-search-grid';
            function getGrid() {
                return $u.gridWrapper.getGrid(gridId);
            }
            var subGroup = 'clr_amtDialog';
            subGroup += programId;
            var $dialog = $u.dialog.dialogLayout001({
                "subGroup": subGroup,
                "dialogTitle": '조회',
                "draggable": true,
                "dialogWidth": 700,
                "dialogButtons": [
                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                            $dialog.dialog('close');
                    })
                ]
            });

            $('#dialog-search-form').hide();
            var dialogGridCurrencyColumnTargetColumnMap = $u.programSetting.getValue('dialogGridCurrencyColumnTargetColumnMap');
            if (!$.isEmptyObject(dialogGridCurrencyColumnTargetColumnMap)) {
                var dialogGridPrecisionMap = {};
                $.each($u.f4Data.getCodeMapWithParams('WAERS', 'CURRDEC'), function (waers, currdec) {
                    dialogGridPrecisionMap[waers] = Number(currdec);
                });
                getGrid().setNumberFormatByCurrencyColumn(dialogGridCurrencyColumnTargetColumnMap, dialogGridPrecisionMap);
            }

            $nst.is_data_nsReturn('ZUNIEFI_3703', jsonData, function (nsReturn) {
                var ot_clear = nsReturn.getTableReturn('OT_CLEAR');
                getGrid().setJSONData(ot_clear);
            });
        };
        $efi.dialog.afterCreateStatementDialog = {};
        $efi.dialog.afterCreateStatementDialogInPopup = {};
        $efi.dialog.afterCreateStatementDialogInBusinessTrip = {};
        $efi.dialog.afterCreateStatementDialogNextProgramIdMap = {
            "": "UD_0302_000",
            "DRAFT_0061": "UD_0302_000_D61",
            "UD_0220_001": "UD_0220_014",
            "UD_0220_101": "UD_0220_014",
            "UD_0220_002": "UD_0220_014",
            "UD_0220_102": "UD_0220_014",
            "DRAFT_0012": "UD_0302_006",
            "DRAFT_0013": "UD_0302_006",
            "UD_0220_111": "UD_0220_140",
            "UD_0220_121": "UD_0220_140",
            "UD_0220_122": "UD_0220_140",
            "UD_0220_131": "UD_0220_140",
            "UD_0220_132": "UD_0220_140"
        };
        $efi.dialog.afterCreateStatementDialog.open = function (json, continueCreateStatementCallBack) {
            var mode = 'create_statement';
            if(json['mode']) mode = json['mode'];
            var mode_key = 'mode_' + mode;
            var _mode = {};
            _mode[mode_key] = true;
            var $dialog = $($efi.mustache.afterCreateStatementDialogTemplate($.extend(json, _mode)));

            var closeCallback = function () {
                if ($.type(continueCreateStatementCallBack) === 'function') continueCreateStatementCallBack();
                else if ($u.util.localStorage.get('menu-layout') === "layout-top") $u.navigateByProgramId($('#menu-path').find('span').data().programId);
                else $('.middle-ul').find('.selected').trigger('click');
            };

            var buttonText = $mls.getByCode('DLB_continueCreateStatement');
            if (json['mode'] === 'statement_modify') buttonText = $mls.getByCode('DLB_queryStatement');

            var buttons = [
                $u.baseDialog.getButton(buttonText, function () {
                    $dialog.dialog('close');
                }),
                $u.baseDialog.getButton($mls.getByCode('DLB_requestApproval'), function () {
                    closeCallback = function () {
                        var nextProgramId =$efi.dialog.afterCreateStatementDialogNextProgramIdMap[$u.page.getPROGRAM_ID()];
                        if(!nextProgramId) nextProgramId = $efi.dialog.afterCreateStatementDialogNextProgramIdMap[''];
                        $u.navigateByProgramId(nextProgramId, json);
                    };
                    $dialog.dialog('close');
                }, 'unidocu-button blue')
            ];
            var titleText = $mls.getByCode('DLT_afterCreateStatementDialog');
            if (json['mode'] === 'statement_modify') titleText = $mls.getByCode('DLT_afterModifyStatementDialog');

            return $u.baseDialog.openModalDialog($dialog, {
                title: titleText,
                draggable: true,
                buttons: buttons,
                close: function () {
                    closeCallback();
                }
            });
        };

        $efi.dialog.afterCreateStatementDialogInPopup.open = function (json) {
            var mode = 'create_statement';
            if(json['mode']) mode = json['mode'];
            var mode_key = 'mode_' + mode;
            var _mode = {};
            _mode[mode_key] = true;
            var $dialog = $($efi.mustache.afterCreateStatementDialogTemplate($.extend(json, _mode)));
            $dialog.find('#question').remove();

            var buttonText = $mls.getByCode('DLB_confirm');
            if (json['mode'] === 'statement_modify') buttonText = $mls.getByCode('DLB_queryStatement');

            var buttons = [ $u.baseDialog.getButton(buttonText, function() {
                setTimeout(window.close, 150);
            })];
            var titleText = $mls.getByCode('DLT_afterCreateStatementDialog');
            if (json['mode'] === 'statement_modify') titleText = $mls.getByCode('DLT_afterModifyStatementDialog');

            return $u.baseDialog.openModalDialog($dialog, {
                title: titleText,
                draggable: true,
                buttons: buttons,
                close: function () {
                    setTimeout(window.close, 150);
                }
            });
        };

        $efi.dialog.afterCreateStatementDialogInBusinessTrip.open = function (json) {
            var mode = 'create_statement';
            if(json['mode']) mode = json['mode'];
            var mode_key = 'mode_' + mode;
            var _mode = {};
            _mode[mode_key] = true;
            var $dialog = $($efi.mustache.afterCreateStatementDialogTemplate($.extend(json, _mode)));

            var closeCallback = function () {
                $dialog.dialog('close');
            };

            var buttons = [
                $u.baseDialog.getButton($mls.getByCode('DLB_continueCreateStatement'), function () {
                    if ($u.page.getPROGRAM_ID() === 'UD_0220_002') {
                        closeCallback = function() {
                            var pageParams = $u.page.getPageParams();
                            if (!pageParams['gridData']) $u.navigateByProgramId($u.page.getPROGRAM_ID());
                            else $u.navigateByProgramId($u.programSetting.getValue('WhereToContinueAt'));
                        }
                    }
                    $dialog.dialog('close');
                }),
                $u.baseDialog.getButton($mls.getByCode('DLB_requestApproval'), function () {
                    closeCallback = function () {
                        var nextProgramId =$efi.dialog.afterCreateStatementDialogNextProgramIdMap[$u.page.getPROGRAM_ID()];
                        if(!nextProgramId) nextProgramId = $efi.dialog.afterCreateStatementDialogNextProgramIdMap[''];
                        $u.navigateByProgramId(nextProgramId, json);
                    };
                    $dialog.dialog('close');
                }, 'unidocu-button blue')
            ];

            return $u.baseDialog.openModalDialog($dialog, {
                title: $mls.getByCode('DLT_afterCreateStatementDialogBusinessTripExpenses'),
                draggable: true,
                buttons: buttons,
                close: function () {
                    closeCallback();
                }
            });
        };

        $efi.dialog.openRequestApprovalConfirm = function (title, message, tableContents, question, confirmRequestApprovalCallbackJson, cancelCallbackJson) {
            var $dialog = $($efi.mustache.requestApprovalConfirmTemplate({message: message, tableContents: tableContents, question: question}));
            var closeCallback = null;
            return $u.baseDialog.openModalDialog($dialog, {
                title: title,
                draggable: true,
                buttons:  [
                    $u.baseDialog.getButton(cancelCallbackJson.text, function () {
                        closeCallback = cancelCallbackJson.fn;
                        $dialog.dialog('close');
                    }),
                    $u.baseDialog.getButton(confirmRequestApprovalCallbackJson.text, function () {
                        closeCallback = confirmRequestApprovalCallbackJson.fn;
                        $dialog.dialog('close');
                    }, 'unidocu-button blue')
                ],
                close: function () {
                    closeCallback();
                }
            });
        };
    }
});
