/**
 * @module uni-e-approval/view/DRAFT_0061
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름', {defaultValue: ''});
        $u.programSetting.appendTemplate('grid3CurrencyColumnTargetColumnMap', {
            defaultValue: {},
            type: 'json'
        });

        var useAttachSetting = $u.programSetting.getValue('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름');

        var $fileAttachWrapper = $('#file-attach-wrapper');
        if(useAttachSetting === 'yes') $fileAttachWrapper.show();
        else if(useAttachSetting === 'no') $fileAttachWrapper.hide();

        var gridObj = $u.gridWrapper.getGrid('DRAFT_0061-grid');
        var gridObj3 = $u.gridWrapper.getGrid('DRAFT_0061-grid3');

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'BELNR' && gridObj.$V(columnKey, rowIndex)) $efi.popup.openStatementViewWithParamMap(gridObj.getJSONDataByRowIndex(rowIndex));
        });
        gridObj3.onCellClick($ewf.DRAFT_0061.gridObj3OnCellClick);
        gridObj3.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey === 'EVI_GB') {
                gridObj3.$V('EVKEY', rowIndex, '');
                $ewf.DRAFT_0061.setEVKEY_Image(rowIndex, 'noEvidence');
                var evi_gb = gridObj3.$V('EVI_GB', rowIndex);
                if (evi_gb === 'C') {
                    var defaultFormValues = null;
                    if($u.programSetting.getValue('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정') === 'true') {
                        defaultFormValues = {
                            PERNR__DIALOG: gridObj3.$V('PERNR', rowIndex),
                            PERNR__DIALOG_TXT: gridObj3.$V('PERNR_TXT', rowIndex)
                        }
                    }
                    $efi.dialog.evidenceSelectDialog.open({
                        evidencePROGRAM_ID: 'UD_0201_000',
                        selectCallback: function (data) {
                            $.extend(data, {
                                EVKEY: data['CRD_SEQ'],
                                BUDAT: data['APPR_DATE'],
                                WRBTR: data['TOTAL']
                            });
                            delete data['PERNR'];
                            gridObj3.setRowDataByJSONObj(rowIndex, data);
                            $ewf.DRAFT_0061.setHasEvidenceImage(rowIndex);
                            $ewf.DRAFT_0061.summaryGrid3ToGrid();
                        },
                        closeWithoutSelectCallback: function () {
                            gridObj3.$V(columnKey, rowIndex, '');
                            $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                        },
                        defaultFormValues: defaultFormValues
                    });
                }
                if (evi_gb === 'E') $ewf.DRAFT_0061.setAttachableImage(rowIndex);
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
            }
            $ewf.DRAFT_0061.summaryGrid3ToGrid();
        });

        $u.buttons.addHandler({
            "tempSave": function () {
                $.when($u.buttons.runCustomHandler('callZUNIEWF_6530_tempSave')).done(function (zuniewf_6530_nsReturn) {
                    var os_data = zuniewf_6530_nsReturn.getExportMap('OS_DATA');
                    $u.buttons.runCustomHandler('handleComplete', os_data['COMPLETE']);
                });
            },
            "addEmp_exp": function () {
                gridObj.asserts.rowSelected($mls.getByCode('M_draft_0031_gridObjNotSelected'));
                gridObj3.addRow();
                var selectedjsonData = gridObj.getSELECTEDJSONData()[0];
                delete selectedjsonData['BELNR'];
                delete selectedjsonData['GJAHR'];
                delete selectedjsonData['BUKRS'];
                if($u.get('WAERS')) selectedjsonData['WAERS'] = $u.get('WAERS').getValue();
                gridObj3.setRowDataByJSONObj(gridObj3.getActiveRowIndex(), selectedjsonData)
            },
            "deleteEmp_exp": function () {
                gridObj3.asserts.rowSelected();
                $.each(gridObj3.getSELECTEDJSONData(), function (index, item) {
                    if (item['BELNR']) throw $mls.getByCode('M_DRAFT_0061_cannotDelete');
                });
                gridObj3.deleteSelectedRows();
                $ewf.DRAFT_0061.summaryGrid3ToGrid();
            },
            "grid3CreateBELNR": function () {
                gridObj3.asserts.rowSelected();
                var rowIndexes = gridObj3.getSelectedRowIndexes();
                $.when($u.buttons.runCustomHandler('callZUNIEWF_6530_tempSave')).done(function () {
                    var reqno = $ewf.draftUtil.getREQNO();
                    $.each(rowIndexes, function(index, rowIndex){
                        gridObj3.$V('SELECTED', rowIndex, '1');
                    });
                    var it_emp_exp = gridObj3.getSELECTEDJSONData();
                    $.each(it_emp_exp, function (index, item) {
                        item['REQNO'] = reqno;
                    });
                    $nst.tableParams_nsReturn('ZUNIEWF_6539', {IT_EMP_EXP: it_emp_exp}, function(nsReturn){
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        $u.buttons.runCustomHandler('handleComplete', os_data['COMPLETE'], $u.buttons.getCustomHandler('callZUNIEWF_6531_setSavedData'));
                    }, function(){
                        $u.buttons.runCustomHandler('callZUNIEWF_6531_setSavedData');
                    });
                });
            },
            "grid3DeleteBELNR": function () {
                var rowIndexes = gridObj3.getSelectedRowIndexes();

                $.when($u.buttons.runCustomHandler('callZUNIEWF_6530_tempSave')).done(function () {
                    var reqno = $ewf.draftUtil.getREQNO();
                    $.each(rowIndexes, function(index, rowIndex){
                        gridObj3.$V('SELECTED', rowIndex, '1');
                    });
                    var selected_it_emp_exp = gridObj3.getSELECTEDJSONData();
                    $.each(selected_it_emp_exp, function (index, item) {
                        item['REQNO'] = reqno;
                    });
                    $nst.tableParams_nsReturn('ZUNIEWF_6540', {IT_EMP_EXP: selected_it_emp_exp}, $u.buttons.getCustomHandler('callZUNIEWF_6531_setSavedData'));
                });
            },
            "addEmployee": function () {
                $u.dialog.f4CodeDialog.open({
                    popupKey: 'PERNR',
                    codePopupCallBack: function (code) {
                        $.each(gridObj.getJSONData(), function (index, item) {
                            if (item['PERNR'] === code) throw $mls.getByCode('M_draft_0030_draft_0031_alreadyExists');
                        });
                        $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: code}, function (os_data) {
                            gridObj.addRowByJSONData($.extend(os_data, {PERNR_TXT: os_data['SNAME']}));
                        });
                    }
                });
            },
            "deleteEmployee": function () {
                gridObj.asserts.rowSelected();
                var selectedPERNR = gridObj.getSELECTEDJSONData()[0]['PERNR'];
                if (gridObj3.$F(selectedPERNR, 'PERNR').length > 0) throw $mls.getByCode('M_DRAFT_0061_deleteEmployee') + gridObj.getSELECTEDJSONData()[0]['PERNR_TXT'];
                gridObj.deleteSelectedRows();
            },
            "deleteDraft": function () {
                unidocuConfirm($mls.getByCode('M_deleteConfirm'), function () {
                    $nst.is_data_returnMessage('ZUNIEWF_6533', {REQNO: $ewf.draftUtil.getREQNO()}, function(message){
                        unidocuAlert(message, function(){
                            $u.navigateByProgramId($u.page.getPROGRAM_ID());
                        });
                    });
                });
            }
        });

        $u.buttons.addCustomHandler({
            callZUNIEWF_6530_tempSave: function () { // temp save
                var $deferredZUNIEWF_6530 = $.Deferred();
                $u.validateRequired('DRAFT_0061-form');
                gridObj.validateGridRequired();
                gridObj3.validateGridRequired();
                if (gridObj3.getRowCount() === 0) throw $mls.getByCode('M_draft_0031_grid3Empty');

                var it_emp = gridObj.getJSONData();
                var it_emp_exp = gridObj3.getJSONData();

                $.each(it_emp.concat(it_emp_exp), function (index, item) {
                    item['REQNO'] = $ewf.draftUtil.getREQNO();
                });
                var tableParams = {
                    IT_EMP: it_emp,
                    IT_EMP_EXP: it_emp_exp
                };
                var params = $.extend($u.getValues('DRAFT_0061-form'), {REQNO: $ewf.draftUtil.getREQNO()});
                $u.fileUI.setFileAttachKeyParam(params);
                $nst.is_data_tableParams_nsReturn('ZUNIEWF_6530', params, tableParams, function (nsReturn) {
                    $ewf.draftUtil.setREQNO(nsReturn.getExportMap('OS_DATA')['REQNO']);
                    $.when($u.buttons.runCustomHandler('callZUNIEWF_6531_setSavedData')).done(function () {
                        $deferredZUNIEWF_6530.resolve(nsReturn);
                    });
                });
                return $deferredZUNIEWF_6530;
            },
            callZUNIEWF_6531_setSavedData: function () {
                var $deferred = $.Deferred();
                $nst.is_data_nsReturn('ZUNIEWF_6531', {REQNO: $ewf.draftUtil.getREQNO()}, function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var os_text = nsReturn.getExportMap('OS_TEXT');
                    var tableReturns = nsReturn.getTableReturns();
                    var emp = tableReturns['OT_EMP'];
                    var emp_exp = tableReturns['OT_EMP_EXP'];

                    $u.setValues($.extend(os_data, os_text));

                    gridObj.setJSONData(emp);
                    gridObj3.setJSONData(emp_exp);
                    $u.fileUI.load(os_data['EVI_SEQ']);

                    $ewf.DRAFT_0061.summaryGrid3ToGrid();
                    $u.buttons.runCustomHandler('setGrid3WRBTREditable');

                    $ewf.DRAFT_0061.setGrid3EvidenceImage(gridObj3);

                    if ($u.get('DRAFT_0061-form', 'WAERS')) $u.get('DRAFT_0061-form', 'WAERS').$el.change();

                    $.each(emp_exp, function (index, item) {
                        if (item['BELNR']) {
                            $.each(gridObj3.getGridHeaders(), function (index2, header) {
                                if (header.key === 'SELECTED') return true;
                                gridObj3.makeCellReadOnly(header.key, index);
                            });
                        }
                    });
                    if (os_data['GRONO']) {
                        $('.btn_area.uni-form-table-button-area button').hide();
                        $.each($u.getNames('DRAFT_0061-form'), function (index, name) {
                            $u.get(name).setReadOnly(true);
                        });
                        $.each(gridObj.getGridHeaders(), function (index, header) {
                            gridObj.makeColumnReadOnly(header.key);
                        });
                        $.each(gridObj3.getGridHeaders(), function (index, header) {
                            gridObj3.makeColumnReadOnly(header.key);
                        });

                        gridObj3.loopRowIndex(function (rowIndex) {
                            gridObj3.makeCellReadOnly('WRBTR', rowIndex);
                        });
                    }
                    $deferred.resolve();
                });
                return $deferred;
            },
            handleComplete: function (complete, incompleteCallback) {
                if (complete === 'X') {
                    $efi.dialog.afterCreateStatementDialog.open({
                        mode: 'create_statement_draft_0061',
                        REQTXT: $u.get('REQTXT').getValue()
                    });
                    return;
                }

                if (incompleteCallback) incompleteCallback();
            },
            setGrid3WRBTREditable: function () {
                $.each(gridObj3.getJSONData(), function (index, item) {
                    if (item['BELNR'] !== '') return;
                    if (item['EVI_GB'] === 'C') {
                        gridObj3.makeCellReadOnly('BUDAT', index);
                        gridObj3.makeCellReadOnly('WRBTR', index);
                    } else {
                        gridObj3.makeCellEditable('BUDAT', index);
                        gridObj3.makeCellEditable('WRBTR', index);
                    }
                });
            }
        });

        return function () {
            $ewf.DRAFT_0061.setTargetGridObj(gridObj, gridObj3);
            $ewf.DRAFT_0061.gridObj3_FileAttacheReadOnly = false;

            var grid3CurrencyColumnTargetColumnMap = $u.programSetting.getValue('grid3CurrencyColumnTargetColumnMap');
            if(!$.isEmptyObject(grid3CurrencyColumnTargetColumnMap)) {
                var precisionMap = {};
                $.each($u.f4Data.getCodeMapWithParams('WAERS', 'CURRDEC'), function(waers, currdec){
                    precisionMap[waers] = Number(currdec);
                });
                gridObj3.setNumberFormatByCurrencyColumn(grid3CurrencyColumnTargetColumnMap, precisionMap);
            }
            gridObj.setCheckBarAsRadio('SELECTED');
            gridObj.setSortEnable(false);
            gridObj3.setSortEnable(false);
            gridObj3.setHeaderCheckBox('SELECTED', true);

            $('#cloned-buttons').append($('#uni-buttons').find('button').clone());
            if ($ewf.draftUtil.hasSavedData()) $u.buttons.runCustomHandler('callZUNIEWF_6531_setSavedData');
        }
    }
});