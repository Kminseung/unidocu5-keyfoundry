/**
 * @module vendorCustom/magnachip/view/customizeUD_0201_000
 */

define([
    'vendorCustom/magnachip/view/assertSameCardGroup'
],function(assertSameCardGroup) {
    return function(initFn) {
        function changeCell(columnKey, rowIndex) {
            if(columnKey !== 'SELECTED') return;
            $u.util.tryCatchCall(function(){
                assertSameCardGroup(gridObj, rowIndex);
            }, function(){
                gridObj.$V('SELECTED', rowIndex, 0);
            });
        }
        initFn();

        $('#unidocu-td-PERNR').change(function(){
            $magnachip.magnaPernrComboOption('CARDNO');
        })

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onChangeCell(changeCell);

        $u.buttons.addHandler({
            "receivableStatement": function () {
                $u.buttons.runCustomHandler('receivableStatement', 'receivableStatement');
            },
        })
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
                    $('#deleteStatement,#createStatement,#createStatement2,#createStatement3,#createMassStatement,#assignHKONT,#receivableStatement')[mode2 === 'B' ? 'hide' : 'show']();
                    $('#restoreStatement')[mode2 === 'B' ? 'show' : 'hide']();

                    var showColumnsIfDeleteSelected = false;
                    if (mode2 === 'B') showColumnsIfDeleteSelected = true;

                    $.each(['DELCODE_TXT', 'DPERNR', 'DPERNR_TXT', 'DERDAT', 'DERZET'], function (index, item) {
                        gridObj.setColumnHide(item, !showColumnsIfDeleteSelected);
                    });
                }
            },
            "receivableStatement" : function (buttonId){
                gridObj.asserts.selectedExactOneRow();
                var selectedData = gridObj.getSELECTEDJSONData()[0];

                if (selectedData['USE_DOC'] === 'X') throw $mls.getByCode('M_cannotCreateStatmentWithFinishedDoc');
                if (selectedData['LIFNR'] === '') throw $mls.getByCode('M_UD_0201_000_LIFNR_EMPTY');

                selectedData['WRBTR'] = selectedData['TOTAL'];
                selectedData['APPR_DATE_APPR_TIME'] = $u.util.date.getDateAsUserDateFormat(selectedData['APPR_DATE']) + ' ' + selectedData['APPR_TIME'];

                var nextProgramIdBySubId = '';
                if(buttonId === 'receivableStatement') nextProgramIdBySubId = $u.programSetting.getValue('receivableButtonSubId');

                var nextPROGRAM_ID = 'UD_0201_001B';
                if (nextProgramIdBySubId) nextPROGRAM_ID = nextProgramIdBySubId;
                if (selectedData['PROGRAM_ID']) nextPROGRAM_ID = selectedData['PROGRAM_ID'];

                selectedData['BUTTON_ID'] = nextProgramIdBySubId;
                $efi.vendorInfoAddedDataHandler.handleByProgramId('UD_0201_000', selectedData, function (vendorAddedData) {
                    $u.navigateByProgramId(nextPROGRAM_ID, vendorAddedData);
                });
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
                        '    <div class="unidocu-form-table-wrapper" data-sub-group="uiDialog" id="{dialogId}"></div>' +
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
                                if (BPERNR==="") {
                                    unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '수임자'}));
                                    return;
                                }else if (COMMT==="") {
                                    unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '위임사유'}));
                                    return;
                                }else{
                                    callZUNIEFI_1003({
                                        BPERNR: BPERNR,
                                        COMMT:COMMT
                                    });
                                }
                                $dialog.dialog("close");
                            })
                        ],
                        close: function () {
                            $dialog.dialog('destroy');
                        }
                    });
                } else if(buttonId === 'cancelAssignPerson'){
                        var dialogId2 = 'cancelAssignPerson';
                        var cancelAssignPersonDialog = '' +
                            '<div>' +
                            '    <div class="unidocu-form-table-wrapper" data-sub-group="uiDialog" id="{dialogId}"></div>' +
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
                                    if (COMMT==="") {
                                        unidocuAlert($u.util.formatString($mls.getByCode('M_formInputValidation'), {thText: '취소사유'}));
                                        return;
                                    }else{
                                        callZUNIEFI_1003({
                                        CLEAR: 'X',
                                        COMMT: $u.get('COMMT').getValue()
                                    });
                                    }
                                    $dialog2.dialog('destroy');
                                })
                            ],
                            close: function () {
                                $dialog2.dialog('destroy');
                            }
                        });

                }else {
                    gridObj.asserts.rowSelected();
                    callZUNIEFI_1003({CLEAR: 'X'});
                }

            },
        });
    }

});