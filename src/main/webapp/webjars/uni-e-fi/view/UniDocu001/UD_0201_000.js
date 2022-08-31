/**
 * UD_0201_000    법인카드 전표등록 - 내역조회
 * @module uni-e-fi/view/UniDocu001/UD_0201_000
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR') {
                if (gridObj.$V('BELNR', rowIndex)) $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
            }
            if (columnKey === 'APPR_NO') $efi.popup.openCardBill(gridObj.$V('CRD_SEQ', rowIndex));
        });
        $efi.bindCARDNO_Handler();
        $efi.UD_0201ButtonHandler.handleCreateStatement();

        $u.buttons.addHandler({
            "createMassStatement": function () {
                // todo remove deprecated since #14783, #16992 2020-03-05
                // 대량 전표 팝업 처리 제거 createStatement 로직과 동
                // 단건 처리 validation program setting default 단건.
                $u.buttons.getHandler()['createStatement'].call(this);
            },
            "createStatement": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement');
            },
            "createStatement2": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement2');
            },
            "createStatement3": function () {
                $u.buttons.runCustomHandler('createStatement', 'createStatement3');
            },
            "assignPerson": function() {
                $u.buttons.runCustomHandler('ZUNIEFI_1003_Handler', {buttonId: 'assignPerson', buttonText: $(this).text()})
            },
            "cancelAssignPerson": function() {
                $u.buttons.runCustomHandler('ZUNIEFI_1003_Handler', {buttonId: 'cancelAssignPerson', buttonText: $(this).text()})
            },
            "assignHKONT": function() {
                gridObj.asserts.rowSelected();
                $u.dialog.codeComboDialog.open('HKONT', {}, '', function(code) {
                    $nst.is_data_it_data_returnMessage('ZUNIEFI_1005', {HKONT: code}, gridObj.getSELECTEDJSONData(), function(message) {
                        unidocuAlert(message, function() {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                });
            },
            "deleteStatement": function() {
                gridObj.asserts.rowSelected();
                function afterCheeckDelOpinion(params) {
                    $nst.is_data_it_data_returnMessage('ZUNIEFI_1004', params, gridObj.getSELECTEDJSONData(), function(message) {
                        unidocuAlert(message, function() {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                }
                $u.dialog.codeComboDialog.open('DELCODE', {}, 'B', function(delCode){
                    afterCheeckDelOpinion({DELFLG: 'X', DELCODE: delCode});
                });
            },
            "restoreStatement" : function() {
                gridObj.asserts.rowSelected();
                unidocuConfirm($mls.getByCode('M_UD_0201_000_restoreStatementConfirm'), function(){
                    $nst.is_data_it_data_returnMessage('ZUNIEFI_1004', {DELFLG: '', DELCODE: ''}, gridObj.getSELECTEDJSONData(), function(message) {
                        unidocuAlert(message, function() {
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                },null);

            },
            "checkAll": function() {
                var rowLen = gridObj.getRowCount();
                if(rowLen === 0) throw  $mls.getByCode('M_noDataForSelect');
                $.each(gridObj.getJSONData(), function(index) { gridObj.$V('SELECTED', index, '1'); });
            },
            "unCheckAll": function() {
                var rowLen = gridObj.getRowCount();
                for(var i = 0;i < rowLen; i++) gridObj.$V('SELECTED', i, '0');
            }
        });

        $u.buttons.addCustomHandler({
            "handleButtonFieldVisibleByMODEChange": function () {
                if ($u.get('MODE')) {
                    $('#assignPerson,#cancelAssignPerson').show();
                    if ($u.get('MODE').getValue() === 'B') $('#assignPerson').hide();
                    else $('#cancelAssignPerson').hide();
                }

                if ($u.get('MODE2')) {
                    var mode2 = $u.get('MODE2').getValue();

                    if(mode2 === 'B') $('#assignPerson,#cancelAssignPerson').hide();
                    $('#deleteStatement,#createStatement,#createStatement2,#createStatement3,#createMassStatement,#assignHKONT')[mode2 === 'B' ? 'hide' : 'show']();
                    $('#restoreStatement')[mode2 === 'B' ? 'show' : 'hide']();

                    var showColumnsIfDeleteSelected = false;
                    if (mode2 === 'B') showColumnsIfDeleteSelected = true;

                    $.each(['DELCODE_TXT', 'DPERNR', 'DPERNR_TXT', 'DERDAT', 'DERZET'], function (index, item) {
                        gridObj.setColumnHide(item, !showColumnsIfDeleteSelected);
                    });
                }
            },
            "ZUNIEFI_1003_Handler": function (params) {
                var buttonId = params.buttonId;
                gridObj.asserts.rowSelected();

                function callZUNIEFI_1003(importParam, callback) {
                    $nst.is_data_it_data_returnMessage('ZUNIEFI_1003', importParam, gridObj.getSELECTEDJSONData(), function(message) {
                        unidocuAlert(message, function() {
                            if(callback) callback();
                            $u.buttons.triggerFormTableButtonClick();
                        });
                    });
                }
                if(buttonId === 'assignPerson') {
                    var dialogId = 'assignPersonDialog';
                    var assignPersonDialog = '' +
                        '<div>' +
                        '   <div class="unidocu-form-table-wrapper" data-sub-group="uiDailog" id="{dialogId}">' +
                        '</div>';
                    var $dialog = $($u.util.formatString(assignPersonDialog, {dialogId: dialogId}));

                    $u.renderUIComponents($dialog);
                    $u.baseDialog.openModalDialog($dialog, {
                        title: '위임',
                        draggable: true,
                        width: 400,
                        buttons: [
                            $u.baseDialog.getButton('저장', function () {
                                var BPERNR = $u.get('BPERNR').getValue();
                                var COMMT = $u.get('COMMT').getValue();

                                if(BPERNR === '') {
                                    unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '수임자'}));
                                    return;
                                } else if(COMMT === '') {
                                    unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '위임사유'}));
                                    return;
                                } else {
                                    callZUNIEFI_1003({
                                        BPERNR: BPERNR,
                                        COMMT: COMMT
                                    });
                                }
                                $dialog.dialog('destroy');
                            })
                        ]
                    });
                } else if(buttonId === 'cancelAssignPerson') {
                    var dialogId2 = 'cancelAssignPerson';
                    var cancelAssignPersonDialog = '' +
                        '<div>' +
                        '   <div class="unidocu-form-table-wrapper" data-sub-group="uiDialog" id="{dialogId}"</div>' +
                        '</div>';
                    var $dialog2 = $($u.util.formatString(cancelAssignPersonDialog, {dialogId: dialogId2}));

                    $u.renderUIComponents($dialog2);
                    $u.baseDialog.openModalDialog($dialog2, {
                        title: '위임취소',
                        draggable: true,
                        width: 400,
                        buttons: [
                            $u.baseDialog.getButton('확인', function () {
                                var COMMT = $u.get('COMMT').getValue();
                                if(COMMT === '') {
                                    unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '취소사유'}));
                                    return;
                                } else {
                                    callZUNIEFI_1003({
                                        CLEAR: 'X',
                                        COMMT: $u.get('COMMT').getValue()
                                    });
                                }
                                $dialog2.dialog('destroy');
                            })
                        ]
                    });
                } else {
                    gridObj.asserts.rowSelected();
                    callZUNIEFI_1003({CLEAR: 'X'});
                }
            },
            createStatement: function (buttonId) {
                gridObj.asserts.selectedExactOneRow();

                var selectedData = gridObj.getSELECTEDJSONData()[0];

                if (selectedData['USE_DOC'] === 'X') throw $mls.getByCode('M_cannotCreateStatmentWithFinishedDoc');
                if (selectedData['LIFNR'] === '') throw $mls.getByCode('M_UD_0201_000_LIFNR_EMPTY');

                selectedData['WRBTR'] = selectedData['TOTAL'];
                selectedData['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(selectedData['APPR_DATE']) + ' ' + selectedData['APPR_TIME'];

                var nextProgramIdBySubId = '';
                if(buttonId === 'createStatement') nextProgramIdBySubId = $u.programSetting.getValue('createButtonSubId');
                if(buttonId === 'createStatement2') nextProgramIdBySubId = $u.programSetting.getValue('create2ButtonSubId');
                if(buttonId === 'createStatement3') nextProgramIdBySubId = $u.programSetting.getValue('create3ButtonSubId');

                var nextPROGRAM_ID = 'UD_0201_001';
                if (nextProgramIdBySubId) nextPROGRAM_ID = nextProgramIdBySubId;
                if (selectedData['PROGRAM_ID']) nextPROGRAM_ID = selectedData['PROGRAM_ID'];

                selectedData['BUTTON_ID'] = nextProgramIdBySubId;
                $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_000', selectedData, function (vendorAddedData) {
                    $u.navigateByProgramId(nextPROGRAM_ID, vendorAddedData);
                });
            }
        });

        $.each([$u.get('MODE'), $u.get('MODE2')], function (index, $u_input) {
            if ($u_input) {
                $u_input.$el.change(function () {
                    $u.buttons.runCustomHandler('handleButtonFieldVisibleByMODEChange');
                    $u.buttons.triggerFormTableButtonClick();
                });
            }
        });

        return function () {
            $u.buttons.runCustomHandler('handleButtonFieldVisibleByMODEChange');
        }
    }
});
