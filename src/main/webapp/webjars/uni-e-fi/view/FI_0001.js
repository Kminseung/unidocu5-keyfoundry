/**
 * @module uni-e-fi/view/FI_0001
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var $u_H_FWBAS = $u.get('H_FWBAS');
        var $u_H_FWSTE = $u.get('H_FWSTE');
        var $u_H_WRBTR = $u.get('H_WRBTR');
        var $u_MWSKZ = $u.get('MWSKZ');
        var $u_LIFNR = $u.get('LIFNR');
        var $u_CON_TYPE = $u.get('CON_TYPE');
        var $u_PAY_GB = $u.get('PAY_GB');
        var zuniefi_3690_os_data = null;

        gridObj2.setColumnHide('SELECTED');
        gridObj2.onChangeCell(function (columnKey, rowIndex) {
            var jsonData = gridObj2.getJSONDataByRowIndex(rowIndex);
            if ($u.util.contains(columnKey, ['ZTERM', 'BLDAT', 'BUDAT'])) {
                if (jsonData['ZTERM'] && jsonData['BLDAT'] && jsonData['BUDAT']) {
                    gridObj2.setRowDataByJSONObj(rowIndex, $nst.is_data_os_data('ZUNIEFI_4003', jsonData));
                } else {
                    gridObj2.setRowDataByJSONObj(rowIndex, {ZLSCH: '', ZFBDT: ''});
                }
            }

            if (columnKey === 'WRBTR') $u.buttons.runCustomHandler('setGrid2FWBAS_FWSTE_By_WRBTR', rowIndex);
        });

        $u.buttons.addCustomHandler({
            setH_WRBTR_By_calculatedH_FWSTE: function(){
                if($efi.createStatementCommon.getFormTaxRate() === 0) $u_H_FWSTE.setReadOnly(true);
                else $u_H_FWSTE.setReadOnly(false);

                $u_H_FWSTE.setValue($u_H_FWBAS.getValue() * $efi.createStatementCommon.getFormTaxRate());
                $u_H_WRBTR.setValue($u_H_FWBAS.getValue() + $u_H_FWSTE.getValue());
            },
            setH_WRBTR_By_H_FWSTE_input: function(){
                $u_H_WRBTR.setValue($u_H_FWBAS.getValue() + $u_H_FWSTE.getValue());
            },
            getGridObj2SumMap: function(){
                var targetSumFields = ['WRBTR', 'FWBAS', 'FWSTE'];
                var sumMap = {};
                $.each(targetSumFields, function (index, item) {
                    sumMap[item] = 0
                });
                $.each(gridObj2.getJSONData(), function (index, item) {
                    $.each(targetSumFields, function (index2, item2) {
                        sumMap[item2] += Number(item[item2]);
                    });
                });
                $.each(targetSumFields, function (index, item) {
                    sumMap[item + '_formatted'] = $.number(sumMap[item]);
                });
                return sumMap;
            },
            displaySummary: function () {
                var sumMap = $u.buttons.runCustomHandler('getGridObj2SumMap');

                var $amountDisplay = $('#amount-display');
                $amountDisplay.html($u.util.formatString('총금액: <span class="wrbtr">{WRBTR_formatted}</span> 과표: <span class="fwbas">{FWBAS_formatted}</span> 세액: <span class="fwste">{FWSTE_formatted}</span>', sumMap));

                var os_data = $u.buttons.runCustomHandler('getZUNIEFI_3690_OS_DATA');
                if (os_data && os_data['CHECK_GB'] === 'X') {
                    if ($u_H_WRBTR.getValue() !== sumMap['WRBTR']) $amountDisplay.find('.wrbtr').css('color', 'red');
                    if ($u_H_FWBAS.getValue() !== sumMap['FWBAS']) $amountDisplay.find('.fwbas').css('color', 'red');
                    if ($u_H_FWSTE.getValue() !== sumMap['FWSTE']) $amountDisplay.find('.fwste').css('color', 'red');
                }
            },
            getZUNIEFI_3690_OS_DATA: function(){
                return zuniefi_3690_os_data;
            },
            setZUNIEFI_3690_OS_DATA: function(os_data){
                zuniefi_3690_os_data = os_data;
            },
            callZUNIEFI_3690: function(callback){
                $nst.is_data_os_data('ZUNIEFI_3690', $u.getValues(), function (os_data) {
                    $u.buttons.runCustomHandler('setZUNIEFI_3690_OS_DATA', os_data);
                    $u.setValues(os_data);
                    var multi_gb = os_data['MULTI_GB'];
                    var list_gb = os_data['LIST_GB'];
                    var check_gb = os_data['CHECK_GB'];
                    var dist_gb = os_data['DIST_GB'];
                    var $gridButtons = $('#addRow,#deleteRow');

                    $gridButtons.hide();
                    $(gridObj2).hide();

                    if (multi_gb === 'X') $gridButtons.show();
                    if (list_gb === 'X') $(gridObj2).show();

                    if (check_gb === 'X') $u.get('H_WRBTR').setReadOnly(false);
                    else $u.get('H_WRBTR').setReadOnly(true);

                    var targetControlFields = ['WRBTR', 'FWBAS', 'FWSTE'];
                    var amountEditable = false;
                    if(dist_gb === 'X') amountEditable = true;

                    $.each(targetControlFields, function(index, item){
                        if(amountEditable) gridObj2.makeColumnEditable(item);
                        else gridObj2.makeColumnReadOnly(item);
                    });

                    $u.buttons.runCustomHandler('displaySummary');
                    if(callback) callback();
                });
            },
            handleGrid2_WRBTR_FWBAS_FWSTE_Editable: function () {
                var check_gb = $u.buttons.runCustomHandler('getZUNIEFI_3690_OS_DATA')['CHECK_GB'];
                var pay_gb = $u_PAY_GB.getValue();

                var wrbtr_fwbas_fwste_Editable = false;

                if (check_gb === 'X') wrbtr_fwbas_fwste_Editable = true;
                if (pay_gb === 'A') wrbtr_fwbas_fwste_Editable = false;

                $.each(['WRBTR', 'FWBAS', 'FWSTE'], function(index, item){
                    if(wrbtr_fwbas_fwste_Editable) gridObj2.makeColumnEditable(item);
                    else gridObj2.makeColumnReadOnly(item);
                });
            },
            validateBeforeSaveAction: function(){
                $u.validateRequired();
                gridObj.validateGridRequired();
                gridObj2.validateGridRequired();

                $efi.createStatement.validateHKONTCOObject();
            },
            setGrid2FWBAS_FWSTE_By_WRBTR: function (rowIndex) {
                var jsonData = gridObj2.getJSONDataByRowIndex(rowIndex);
                var wrbtr = Number(jsonData['WRBTR']);
                var fwbas = $efi.precisionRoundByWAERS(wrbtr / (1 + $efi.createStatementCommon.getFormTaxRate()), $u.get('WAERS').getValue());
                var fwste = wrbtr - fwbas;
                gridObj2.setRowDataByJSONObj(rowIndex, {FWBAS: fwbas, FWSTE: fwste});
                var sumMap = $u.buttons.runCustomHandler('getGridObj2SumMap');
                $u_H_FWBAS.setValue(sumMap['FWBAS']);
                $u_H_FWSTE.setValue(sumMap['FWSTE']);
                $u_H_WRBTR.setValue(sumMap['WRBTR']);
                $u.buttons.runCustomHandler('displaySummary');
            }
        });

        $u.buttons.addHandler({
            save: function () {
                $u.buttons.runCustomHandler('validateBeforeSaveAction');

                var params = $u.getValues();
                var tableParams = {
                    IT_GL: gridObj.getJSONData(),
                    IT_ITEM: gridObj2.getJSONData()
                };

                $u.fileUI.setFileAttachKeyParam(params);

                $nst.is_data_tableParams_nsReturn('ZUNIEFI_3600', params, tableParams, function (nsReturn) {
                    if($u.get('APPR_GB').getValue() === 'X') {
                        var os_data = nsReturn.getExportMap('OS_DATA');

                        var title = $u.getPageTitle();
                        var message = nsReturn.getReturnMessage();
                        var tableContents = [{title: '정기지급번호', value: os_data['REQNO']}];
                        var question = '신규 작성을 진행 하시곘습니까?';
                        var confirmRequestApprovalCallbackJson = {text: $mls.getByCode('DLB_requestApproval'), fn: function () {$u.navigateByProgramId('UD_0302_007', os_data);}};
                        var cancelCallbackJson = {text: $mls.getByCode('DLB_continueCreateStatement'), fn: function () {$u.locationReload();}};

                        $efi.dialog.openRequestApprovalConfirm(title, message, tableContents, question, confirmRequestApprovalCallbackJson, cancelCallbackJson);
                    } else {
                        $u.navigateByProgramId('FI_0002');
                    }
                });
            },
            addRow: function () {
                gridObj.addRow();
                gridObj.$V('SHKZG', gridObj.getActiveRowIndex(), 'S');
            },
            deleteRow: function () {
                gridObj.deleteSelectedRows();
            },
            generateContractList: function () {
                $nst.is_data_nsReturn('ZUNIEFI_3605', $u.getValues(), function (nsReturn) {
                    gridObj2.setJSONData(nsReturn.getTableReturn('OT_ITEM'));
                    $u.buttons.runCustomHandler('displaySummary');
                });
            },
            deleteContractList: function () {
                gridObj2.setJSONData([]);
            },
            extendContract: function () {
                $u.buttons.runCustomHandler('validateBeforeSaveAction');
                var params = $u.getValues();
                var tableParams = {
                    IT_GL: gridObj.getJSONData(),
                    IT_ITEM: gridObj2.getJSONData()
                };
                params['ORG_REQNO'] = params['REQNO'];
                delete params['REQNO'];
                $nst.is_data_tableParams_nsReturn('ZUNIEFI_3602', params, tableParams, function (nsReturn) {
                    unidocuAlert(nsReturn.getReturnMessage(), function(){
                        $u.navigateByProgramId('FI_0003');
                    });
                });
            },
            expireContract: function () {
                $u.dialog.singleTextAreaDialog.open('종료사유', function(value){
                    var params = $u.getValues();
                    params['CLOSE_TEXT'] = value;
                    $nst.is_data_returnMessage('ZUNIEFI_3601', params, function (message) {
                        unidocuAlert(message, function(){
                            $u.navigateByProgramId('FI_0003');
                        });
                    });
                }, 250);
            },
            modifyContract: function () {
                $u.buttons.runCustomHandler('validateBeforeSaveAction');
                var params = $u.getValues();
                var tableParams = {
                    IT_GL: gridObj.getJSONData(),
                    IT_ITEM: gridObj2.getJSONData()
                };
                $nst.is_data_tableParams_nsReturn('ZUNIEFI_3603', params, tableParams, function (nsReturn) {
                    unidocuAlert(nsReturn.getReturnMessage(), function(){
                        $u.navigateByProgramId('FI_0003');
                    });
                });

            },
            deleteContract: function () {
                var params = $u.getValues();

                $nst.is_data_returnMessage('ZUNIEFI_3604', params, function (message) {
                    unidocuAlert(message, function(){
                        $u.navigateByProgramId('FI_0003');
                    });
                });
            }
        });

        $u_LIFNR.$el.change(function () { // $efi.createStatement.bindEvent.bindVendorCodeChange();
            var values = $u.getValues();
            if (!values['LIFNR']) return;
            var namedServiceId = 'ZUNIEFI_4001';
            $nst.is_data_ot_data(namedServiceId, values, function (ot_data) {
                if (ot_data.length === 0) return;
                if ($u.hasTable('statement-information-content')) $u.setValues('statement-information-content', ot_data[0]);
                if ($u.hasTable('header-invoicer-content')) $u.setValues('header-invoicer-content', ot_data[0]);
                if ($u.hasTable('vendor-info')) $u.setValues('vendor-info', ot_data[0]);

                var comboCodeQueryParams = {LIFNR: values['LIFNR']};

                if ($u.get('BVTYP')) $u.get('BVTYP').setOptions($u.f4Data.getCodeComboOption($u.get('BVTYP').params['codeKey'], comboCodeQueryParams), ot_data[0]['BVTYP']);
                if ($u.get('ZLSCH')) $u.get('ZLSCH').setOptions($u.f4Data.getCodeComboOption($u.get('ZLSCH').params['codeKey'], comboCodeQueryParams), ot_data[0]['ZLSCH']);
                if ($u.get('ZTERM')) $u.get('ZTERM').setOptions($u.f4Data.getCodeComboOption($u.get('ZTERM').params['codeKey'], comboCodeQueryParams), ot_data[0]['ZTERM']);
                if ($u.get('EMPFB')) {
                    if ($u.get('EMPFB').setOptions) $u.get('EMPFB').setOptions($u.f4Data.getCodeComboOption($u.get('EMPFB').params['codeKey'], comboCodeQueryParams));
                    else if ($u.get('EMPFB').setQueryParams) $u.get('EMPFB').setQueryParams(comboCodeQueryParams)
                }
                if ($u.get('AKONT')) $u.get('AKONT').setOptions($u.f4Data.getCodeComboOption($u.get('AKONT').params['codeKey'], comboCodeQueryParams), ot_data[0]['AKONT']);

                $efi.createStatement.bindEvent.triggerMWSKZChange();
                $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            });
        });
        $u_H_FWBAS.$el.change(function(){
            $u.buttons.runCustomHandler('setH_WRBTR_By_calculatedH_FWSTE');
        });
        $u_MWSKZ.$el.change(function(){
            $u.buttons.runCustomHandler('setH_WRBTR_By_calculatedH_FWSTE');
        });
        $u_H_FWSTE.$el.change(function(){
            $u.buttons.runCustomHandler('setH_WRBTR_By_H_FWSTE_input');
        });
        $u_CON_TYPE.$el.change(function () {
            gridObj.setJSONData([]);
            $u.buttons.runHandler('addRow');
            gridObj2.setJSONData([]);
            $u.buttons.runCustomHandler('callZUNIEFI_3690', function(){
                var os_data = $u.buttons.runCustomHandler('getZUNIEFI_3690_OS_DATA');
                if (os_data['MULTI_GB'] === 'X') {
                    $u.buttons.runHandler('addRow');
                    $u.buttons.runHandler('addRow');
                }
                $u.buttons.runCustomHandler('handleGrid2_WRBTR_FWBAS_FWSTE_Editable');

            });
        });
        $u_PAY_GB.$el.change(function () {
            $u.buttons.runCustomHandler('handleGrid2_WRBTR_FWBAS_FWSTE_Editable');
            gridObj2.setJSONData([]);
        });

        $.each(['DATE', 'H_FWBAS', 'H_FWSTE', 'CON_REP', 'CON_DT', 'WAERS', 'MWSKZ'], function (index, item) {
            $u.get(item).$el.change(function(){
                gridObj2.setJSONData([]);
                $u.buttons.runCustomHandler('displaySummary');
            });
        });

        return function () {
            $u.buttons.runCustomHandler('setH_WRBTR_By_calculatedH_FWSTE');
            $u.buttons.runCustomHandler('displaySummary');

            var pageParams = $u.page.getPageParams();
            if(pageParams['navigateFromFI_0003']) {
                $('#save').hide();
            } else {
                $('#extendContract, #expireContract, #modifyContract, #deleteContract').hide();
            }

            if (pageParams['REQNO']) {
                $u_CON_TYPE.setReadOnly(true);
                $nst.is_data_nsReturn('ZUNIEFI_3607', {REQNO: pageParams['REQNO']}, function (nsReturn) {
                    var os_data_ZUNIEFI_3607 = nsReturn.getExportMap('OS_DATA');
                    $u.setValues(os_data_ZUNIEFI_3607);

                    gridObj.setJSONData(nsReturn.getTableReturn('OT_GL'));
                    gridObj2.setJSONData(nsReturn.getTableReturn('OT_ITEM'));
                    $nst.is_data_os_data('ZUNIEFI_3690', $u.getValues(), function (os_data) {
                        $u.buttons.runCustomHandler('setZUNIEFI_3690_OS_DATA', os_data);
                        $u.buttons.runCustomHandler('callZUNIEFI_3690', function () {
                            var fileUIReadOnly = false;
                            if (os_data_ZUNIEFI_3607['GRONO']) {
                                fileUIReadOnly = true;
                                $.each(['form1', 'form2'], function (index, formName) {
                                    $.each($u.getNames(formName), function (index, item) {
                                        $u.get(formName, item).setReadOnly(true);
                                    });
                                });
                                $.each([gridObj, gridObj2], function (index, grid) {
                                    $.each(grid.getGridHeaders(), function (index, header) {
                                        grid.makeColumnReadOnly(header.key);
                                    });
                                });
                                $('.unidocu-button').hide();
                            }

                            if(fileUIReadOnly) {
                                $u.fileUI.load(os_data_ZUNIEFI_3607['EVI_SEQ'], true);
                            } else if(!pageParams['navigateFromFI_0003']) {
                                $u.fileUI.load(os_data_ZUNIEFI_3607['EVI_SEQ']);
                            }
                        });
                    });
                });
            } else {
                $u_CON_TYPE.$el.change();
            }
        }
    }
});