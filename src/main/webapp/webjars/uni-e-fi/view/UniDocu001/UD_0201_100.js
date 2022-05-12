/**
  * @module uni-e-fi/view/UniDocu001/UD_0201_100
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('tax_read_only', {
            defaultValue: 'false',
            description: '세금코드 존재시 TAX -> TAX_READ_ONLY'
        });
        $u.programSetting.appendTemplate('useADD_DATA', {
            defaultValue: 'false',
            description: '그리드 추가 데이터 사용 여부'
        });
        $u.programSetting.appendTemplate('onGridBeforeOpenF4DialogParams', {
            defaultValue: {},
            type: 'json',
            description: 'grid codePopup F4 조회시 추가 파라미터 설정'
        });

        if ($u.programSetting.getValue('useADD_DATA') === 'true') {
            $efi.createStatementCommon.init();
        } else {
            $u.programSetting.appendTemplate('setCreateStatementFunction', {
                defaultValue: $efi.createStatementCommon.getNamedServiceId(),
                description: '전표생성 RFC 정의'
            });
        }

        var gridObj = $u.gridWrapper.getGrid();
        var $u_MODE2 = $u.get('search-condition', 'MODE2');
        var MWSKZFlagMap;
        var mwskzList = [];
        $efi.bindCARDNO_Handler();
        $efi.createStatement.bindEvent.bindGL_ALIASChange();

        if ($u_MODE2) {
            $u_MODE2.$el.change(function () {
                $u.buttons.runCustomHandler('setDefaultVisibleButtons');
            });
        }

        $u.buttons.addHandler({
            "is_data_ot_data": function() {
                var $self = $(this);
                $nst.is_data_ot_data($self.data('funcname'), $u.getValues('search-condition'), function(ot_data) {
                    $.each(ot_data, function(index, item){
                        item['_EVI_SEQ'] = '/images/btn/btn_view.gif';
                    });
                    $u.gridWrapper.getGrid().setJSONData(ot_data);
                    gridObj.loopRowIndex(function (rowIndex) {
                        mwskzList.push(gridObj.$V('MWSKZ', rowIndex));
                    });
                    gridObj.loopRowIndex(function (rowIndex) {gridObj.$V('TAX_READ_ONLY',rowIndex, gridObj.$V('TAX', rowIndex));});
                });
            },
            "createStatement": function () {
                gridObj.asserts.rowSelected();
                gridObj.validateSELECTEDGridRequired();

                var gridData = gridObj.getSELECTEDJSONData();

                if($u.programSetting.getValue('useADD_DATA') === 'true') {
                    $.each(gridObj.getSelectedRowIndexes(), function(index, rowIndex){
                        $efi.addDataHandler.validateAddDataByRowIndex(rowIndex);
                        $efi.addDataHandler.setADD_DATA(gridData);
                    });
                }
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), $u.getValues(), gridData, function (nsReturn) {
                    var message = nsReturn.getReturnMessage();
                    var returnType = nsReturn.getReturnType();
                    var ot_data = nsReturn.getTableReturn('OT_DATA');

                    if(gridObj.getGridHeader('EVI_CNT') && gridObj.getGridHeader('_EVI_SEQ')) {
                        $.each(ot_data, function(index, item){
                            var type = 'attachable';
                            if (Number(item['EVI_CNT']) > 0) type = 'hasEvidence';
                            item['_EVI_SEQ'] = $u.util.getFileAttachIcon(type);
                        });
                    }

                    gridObj.setJSONData(ot_data);

                    if($u.programSetting.getValue('useADD_DATA') === 'true') {
                        gridObj.loopRowIndex(function(rowIndex){
                            if(gridObj.$V('ADD_DATA', rowIndex)) {
                                var values = $efi.addDataHandler.sapStringAddDataToJson(gridObj.$V('HKONT', rowIndex), gridObj.$V('ADD_DATA', rowIndex));
                                gridObj.$H('ADD_DATA', rowIndex, JSON.stringify(values));
                                gridObj.$V('ADD_DATA', rowIndex, $mls.getByCode('M_ADD_DATA_INPUT'));
                            }
                            if (gridObj.getGridHeader('ADD_DATA_JSON') && gridObj.$V('ADD_DATA_JSON', rowIndex)) {
                                var addDataJSON = JSON.parse(gridObj.$V('ADD_DATA_JSON', rowIndex));
                                var hidden_input = {};

                                $.each(addDataJSON, function (index, item) {
                                    hidden_input[item['KEY']] = item['VALUE'];
                                    if (item['VALUE_TEXT'] !== '') hidden_input[item['KEY'] + '_TXT'] = item['VALUE_TEXT'];
                                });
                                gridObj.$H('ADD_DATA', rowIndex, JSON.stringify(hidden_input));
                                gridObj.$V('ADD_DATA', rowIndex, $mls.getByCode('M_ADD_DATA_INPUT'));
                            }
                        });
                    }

                    if (message) {
                        unidocuAlert(message, function(){
                            if(returnType === 'W' && gridObj.getGridHeader('MESSAGE') && gridObj.getRowCount() > 0) gridObj.setCellFocus('MESSAGE', 0);
                        });
                    }

                    if($u.buttons.getCustomHandler('UD_0201_100_after_createStatement')) {
                        $u.buttons.runCustomHandler('UD_0201_100_after_createStatement', nsReturn);
                    }
                });
            },
            "batchApplyByDialog": function () {
                gridObj.asserts.rowSelected();
                $u.buttons.runCustomHandler('batchApplyDialog');
            }
        });
        $u.buttons.addCustomHandler({
            changeTAX: function (rowIndex) {
                gridObj.$V('AMOUNT', rowIndex, (gridObj.$V('TOTAL', rowIndex) - gridObj.$V('TAX', rowIndex) - gridObj.$V('TIPS', rowIndex)));
            },
            changeMWSKZ: function (rowIndex) {
                if(!MWSKZFlagMap) MWSKZFlagMap = $u.f4Data.getCodeMapWithParams('MWSKZ', 'FLAG');

                var mwskz = gridObj.$V('MWSKZ', rowIndex);
                var hasVAT = MWSKZFlagMap[mwskz] === 'X';
                var tax = 0;
                if (hasVAT) {
                    tax = $efi.precisionRoundByWAERS(gridObj.$V('TOTAL', rowIndex) / 11, $u.getValues()['WAERS']);
                    if ($u.programSetting.getValue('tax_read_only') === 'true'){
                        if(gridObj.$V('TAX_READ_ONLY',rowIndex) !== "0") tax = gridObj.$V('TAX_READ_ONLY', rowIndex);
                    }
                }
                gridObj.$V('TAX', rowIndex, tax);
                $u.buttons.runCustomHandler('changeTAX', rowIndex);
            },
            setDefaultVisibleButtons: function () {
                var buttonVisible = true;
                if ($u_MODE2.getValue() === 'B') buttonVisible = false;
                $u.buttons._setVisible('uni-buttons', 'createStatement,batchApplyByDialog', buttonVisible);
            },
            batchApplyDialog: function () {
                var subGroup = 'BATCH_APPLY_DIALOG';
                var formId = 'dialog-search-form';
                var $dialog = $u.dialog.dialogLayout001({
                    "subGroup": subGroup,
                    "dialogTitle": $mls.getByCode('DLT_batchApplyDialog'),
                    "ignoreGrid": true,
                    "draggable": true,
                    "dialogWidth": 700,
                    "dialogButtons": [
                        $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                            $u.validateRequired(formId);
                            var values = $u.getValues(formId);
                            $.each(values, function (key) {
                                if (/__DIALOG/.test(key)) values[key.replace('__DIALOG', '')] = values[key];
                            });
                            $u.buttons.runCustomHandler('fillGridDataByBatchDialogInput', values);
                            $dialog.dialog('close');
                        }, 'unidocu-button blue'),
                        $u.baseDialog.getButton($mls.getByCode('DLB_cancel'), function () {
                            $dialog.dialog('close');
                        })
                    ]
                });
                $u.get('BUDAT__DIALOG').setEmptyValue();
                var $u_hkont = $u.get('dialog-search-form', 'HKONT__DIALOG');
                if($u_hkont) {
                    $u_hkont.$el.change(function () {
                        $.each($u.f4Data.getCodeDataWithParams('HKONT'), function (index, item) {
                            if(item['HKONT'] === $u_hkont.getValue()) $u.get('dialog-search-form', 'MWSKZ__DIALOG').setValue(item['MWSKZ']);
                        });
                    });
                }
            },
            fillGridDataByBatchDialogInput: function (values) {
                if (gridObj.getRowCount() < 1) return;
                $.each(values, function (key, value) {
                    if (gridObj.getGridHeader(key)) {
                        gridObj.loopRowIndex(function (rowIndex) {
                            if (gridObj.$V('SELECTED', rowIndex) !== '1')  return true;
                            if (value === '') return true;
                            if (!gridObj.getGridHeader(key)) return true;

                            gridObj.$V(key, rowIndex, value);
                            if (key === 'MWSKZ') $u.buttons.runCustomHandler('changeMWSKZ', rowIndex);
                            if($u.programSetting.getValue('useADD_DATA') === 'true') {
                                if (key === 'HKONT') $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
                            }
                        })
                    }
                });
            },
            setMWSKZ_By_HKONT_F4: function (columnKey, rowIndex, jsonObj) {
                if(columnKey === 'HKONT') {
                    var gridObj = $u.gridWrapper.getGrid();
                    if(jsonObj && jsonObj['MWSKZ']) gridObj.$V('MWSKZ', rowIndex, jsonObj['MWSKZ']);
                    else {
                        gridObj.$V('MWSKZ', rowIndex, mwskzList[rowIndex]);
                    }
                }
            }
        });

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'APPR_NO') $efi.popup.openCardBill(gridObj.$V('CRD_SEQ', rowIndex));
            if($u.programSetting.getValue('useADD_DATA') === 'true') {
                if (columnKey === 'ADD_DATA') $efi.addDataHandler.handleClickADD_DATA(rowIndex)
            }

            if (columnKey === '_EVI_SEQ') {
                var evi_seq = gridObj.$V('EVI_SEQ', rowIndex);
                var $dialog = $u.dialog.fineUploaderDialog.open(evi_seq);

                $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                    $u.util.setFileAttachIconByFileCount(gridObj, '_EVI_SEQ', rowIndex, fileCount);

                    gridObj.$V('EVI_SEQ', rowIndex, $dialog.data('fineUploader').getFileGroupId());
                    if(gridObj.getGridHeader('EVI_CNT')) gridObj.$V('EVI_CNT', rowIndex, fileCount);
                });
            }
        });
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if(columnKey !== 'SELECTED') gridObj.$V('SELECTED', rowIndex, '1');
            if (columnKey === 'MWSKZ') $u.buttons.runCustomHandler('changeMWSKZ', rowIndex);
            if (columnKey === 'TAX') $u.buttons.runCustomHandler('changeTAX', rowIndex);
            $efi.createStatement.setGridBudget(columnKey, rowIndex);

            if (columnKey === 'HKONT') {
                if($u.programSetting.getValue('useADD_DATA') === 'true') {
                    $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
                }
                $u.buttons.runCustomHandler('setMWSKZ_By_HKONT_F4', columnKey, rowIndex, jsonObj);
                $u.buttons.runCustomHandler('changeMWSKZ', rowIndex);
            }
        });
        gridObj.onBeforeOpenF4Dialog($efi.createStatement.handleBeforeOpenF4Dialog);

        return function() {
            gridObj.setHeaderCheckBox('SELECTED', true);
            gridObj.setBlockPasteMode('none');
        }
    }
});