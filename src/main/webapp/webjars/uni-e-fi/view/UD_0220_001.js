/**
 * UD_0220_001    출장비 신청
 *
 * @module uni-e-fi/view/UD_0220_001
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('searchFunction', {
            defaultValue: 'ZUNIEWF_6603',
            description: '품의 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('DeleteFunction', {
            defaultValue: 'ZUNIEWF_6630',
            description: '품의 삭제시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('CalculateFunction', {
            defaultValue: 'ZUNIEWF_6602',
            description: '비용 계산시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('CalculateTarget', {
            defaultValue: ['ROOM_EXP', 'TRAN_EXP', 'DAY_EXP', 'ETC_EXP'],
            type: 'json',
            description: '계산 대상 컬럼(ex ROOM_EXP)'
        });
        $u.programSetting.appendTemplate('shouldCalculateEXP', {
            defaultValue: 'true',
            description: '계산함수를 통한 비용계산 필수 여부'
        });
        $u.programSetting.appendTemplate('AfterWhenConsultationIsDeleted', {
            defaultValue: 'UD_0220_004',
            description: '품의 삭제후 이동할 화면'
        });

        $u.programSetting.appendTemplate('f4ColumnKeyOrderBy', {
            defaultValue: {},
            type: 'json',
            description: 'F4 Dialog 정렬 키 지정 - {popupKey : orderByPopupKey}'
        });

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if (/_EXP$/.test(columnKey) && columnKey !== 'SUM_EXP') {
                var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
                var sum = 0;
                $.each(rowData, function(key, value) {
                    if (/_EXP$/.test(key) && key !== 'SUM_EXP') {
                        sum += parseFloat(value !== '' ? value : 0);
                    }
                });

                gridObj.$V('SUM_EXP', rowIndex, sum);
            } else if (/DATE$/.test(columnKey) && gridObj.getGridHeader('TR_DAY')) {
                $u.buttons.runCustomHandler('calculateDate', rowIndex);
            } else if (columnKey === 'TRAN_TYPE') {
                $u.buttons.runCustomHandler('setCellEditableByTranType', rowIndex);
                if (newValue === 'A') gridObj.$V('TRAN_EXP', rowIndex, '');
            }
            if (columnKey === 'LAND1') {jsonObj ? gridObj.$V('D_GRADE',rowIndex,jsonObj['D_GRADE']) : gridObj.$V('D_GRADE',rowIndex,'');}
        });

        gridObj.onBlockPaste(function (startColumnKey, startRowIndex, endColumnKey, endRowIndex){
            var columnKey = gridObj.getActiveColumnKey();
            for (var i = startRowIndex, len = endRowIndex; i <= len; i++) {
                if (columnKey === 'LAND1') gridObj.$V('D_GRADE',i, gridObj.getCachedCodeMap('LAND1')[gridObj.$V(columnKey,i)]['D_GRADE']);
                if (/DATE$/.test(columnKey)) gridObj.triggerChangeCell(columnKey, i);
            }
        });

        $u.buttons.addHandler({
            'createStatement': function () {
                $u.validateRequired();
                gridObj.validateGridRequired();
                if ($u.programSetting.getValue('isAttachmentRequired') === 'true' && $('.file-count').html() === '0') throw '[증빙]을 첨부해 주세요';
                var formData = $u.getValues('header-invoicer-content');
                var gridData = gridObj.getJSONData();
                $u.fileUI.setFileAttachKeyParam(formData);

                if ($u.programSetting.getValue('shouldCalculateEXP') === 'true') {
                    $u.buttons.runCustomHandler('calculateTrans')
                        .then(function (calculatedGridData) {
                            $.each(calculatedGridData, function (index, data) {
                                $.each($u.programSetting.getValue('CalculateTarget'), function (_, value) {
                                    if ($u.util.contains(value, $u.programSetting.getValue('CalculateTarget')) && parseFloat(data[value]) !== parseFloat(gridData[index][value] || 0)) {
                                        unidocuAlert('품의 저장전에 출장비 계산을 선행해주세요');
                                        throw '품의 저장전에 출장비 계산을 선행해주세요';
                                    }
                                });
                            });
                            return calculatedGridData;
                        })
                        .then(function (calculatedGridData) {
                            $u.buttons.runCustomHandler('createStatement', formData, calculatedGridData);
                        })
                } else $u.buttons.runCustomHandler('createStatement', formData, gridData);
            },
            'DELETE': function () {
                $nst.is_data_returnMessage($u.programSetting.getValue('DeleteFunction'), $u.getValues(), function (msg) {
                    unidocuAlert(msg, function() {
                        $u.navigateByProgramId($u.programSetting.getValue('AfterWhenConsultationIsDeleted'));
                    });
                });
            },
            "addRow": function () {
                gridObj.addRow();
                if (!/_\w?$/.test($u.page.getPROGRAM_ID())) {
                    var index = gridObj.getActiveRowIndex();
                    if (!$u.get('DATE')) return;
                    gridObj.$V('FDATE', index, $u.get('DATE').getValue()['fromDate']);
                    gridObj.$V('TDATE', index, $u.get('DATE').getValue()['toDate']);
                }
            },
            "deleteRow": function () {
                gridObj.asserts.rowSelected();
                gridObj.deleteSelectedRows();
            },
            "showRules": function () {
                $nst.is_data_ot_data('ZUNIEWF_6640', {}, function(ot_data) {
                    $u.dialog.dialogLayout001({
                        'subGroup': 'UD_0220_002_dialog',
                        'dialogTitle': $mls.getByCode('M_UD_0220_002_search_business_trip_expenses_rules'),
                        'dialogWidth': 812,
                        'draggable': true,
                        'resizable': true
                    });

                    var dialogGridObj = $u.gridWrapper.getGrid('dialog-search-grid');
                    dialogGridObj.setColumnHide('SELECTED', true);
                    dialogGridObj.setJSONData(ot_data);
                    $.each(ot_data, function (index, data) {
                        if (data['FLAG'] === 'X') dialogGridObj.setRowBgColor(index, '255|255|0');
                    });
                });
            },
            "calculateTrans": function() {
                $u.buttons.runCustomHandler('calculateTrans')
                    .then(gridObj.setJSONData)
                    .then(function() {
                        gridObj.loopRowIndex($u.buttons.getCustomHandler('setCellEditableByTranType'));
                    });
            }
        });
        $u.buttons.addCustomHandler({
            "setCellEditableByTranType": function(rowIndex) {
                if (!gridObj.getGridHeader('TRAN_TYPE')) return;
                var tranType = gridObj.$V('TRAN_TYPE', rowIndex);
                if (tranType === 'A') {
                    gridObj.makeCellReadOnly('TRAN_EXP', rowIndex);
                    gridObj.makeCellEditable('KM', rowIndex);
                    gridObj.makeCellEditable('OIL', rowIndex);
                }
                else {
                    gridObj.makeCellEditable('TRAN_EXP', rowIndex);
                    readOnlyAndBlankCell('KM', rowIndex);
                    readOnlyAndBlankCell('OIL', rowIndex);
                }

                function readOnlyAndBlankCell(columnKey, rowIndex) {
                    gridObj.makeCellReadOnly(columnKey, rowIndex);
                    gridObj.$V(columnKey, rowIndex, '');
                }
            },
            "createStatement": function (formData, gridData) {
                $efi.createStatement.confirmBeforeCreateStatement(formData, {'IT_DATA': gridData}, function () {
                    $nst.is_data_it_data_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), formData, gridData, function (nsReturn) {
                        $efi.dialog.afterCreateStatementDialog.open($.extend({},
                            nsReturn.getExportMap("OS_DATA"),
                            {'mode': 'request_business_trip_expenses'}),
                            function () {
                                $u.navigateByProgramId($u.page.getPROGRAM_ID());
                            });
                        $('.ui-dialog-title').text($mls.getByCode('DLT_afterRequestDialogBusinessTripExpenses'));
                    });
                });
            },
            'setRowsReadOnly': (function() {
                var columnKeys = gridObj.getGridHeaders().map(function (header) {
                    return header['key'];
                }).filter(function (columnKey) {
                    return columnKey !== 'SELECTED';
                });
                return function() {
                    var isGronoCreated = $u.get('GRONO').getValue() !== '';
                    if (isGronoCreated) $ewf.UD_0220_002.fileAttachableInGrid = false;
                    gridObj.loopRowIndex(function(index) {
                        columnKeys.forEach(function(header) {
                            gridObj.makeCellReadOnly(header, index);
                        });
                    });
                };
            })(),
            "calculateTrans": function() {
                var deferred = $.Deferred();
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('CalculateFunction'), $u.getValues(), gridObj.getJSONData(), function (nsReturn) {
                    deferred.resolve(nsReturn.getTableReturn('OT_DATA'));
                });
                return deferred.promise();
            },
            "calculateDate": function(rowIndex) {
                function stringToDate(strDate) {
                    return new Date(strDate.substring(0, 4) + '-' + strDate.substring(4, 6) + '-' + strDate.substring(6));
                }
                if (!gridObj.$V('FDATE', rowIndex) || !gridObj.$V('TDATE', rowIndex)) {
                    $.each(['TR_DAY','TR_NIGHT'],function(index,item) {gridObj.$V(item,rowIndex,'');});
                    return;
                }
                var nights = Math.floor((stringToDate(gridObj.$V('TDATE', rowIndex)) - stringToDate(gridObj.$V('FDATE', rowIndex))) / (60 * 60 * 24 * 1000));
                gridObj.$V('TR_DAY', rowIndex, nights + 1);
                gridObj.$V('TR_NIGHT', rowIndex, nights);
            }
        })

        var $u_T_PERNR = $u.get('T_PERNR');
        if ($u_T_PERNR && $u.page.getPROGRAM_ID() === 'UD_0220_111') $u_T_PERNR.$el.change(function() {
            if ($u_T_PERNR.getValue() === '') $u.get('POS_KEY').setValue('');
            var posKeyVal = $u_T_PERNR.getDialogRowData() ? $u_T_PERNR.getDialogRowData()['POS_KEY'] : $u.f4Data.getCodeDataWithParams($u_T_PERNR['params']['codeKey'],{PERNR:$u_T_PERNR.getValue()})[0]['POS_KEY'];
            $u.get('POS_KEY').setValue(posKeyVal);
        });

        return function () {
            if (/_(101|111)$/.test($u.page.getPROGRAM_ID())) {
                var periodColumnKeys = ['FDATE','TDATE','TR_NIGHT','TR_DAY'];
                var transportationColumnKeys = ['TRAN_TYPE','KM','OIL','TRAN_EXP'];
                var groupHeader = [{groupText: '출장기간', childColumns: periodColumnKeys}];
                if (gridObj.getGridHeader('TRAN_TYPE')) groupHeader.push({groupText: '교통비', childColumns: transportationColumnKeys});
                if ($u.page.getPROGRAM_ID() === 'UD_0220_111') {
                    groupHeader.push({ groupText:"출장지",childColumns:['LAND1','LAND1_TXT','LAND1_','D_GRADE']});
                    $u.get('T_PERNR').$el.css({'float':'left','margin-right':'3px'});
                    $u.get('POS_KEY').$el.css('float','left');
                }
                gridObj.setGroupHeader(groupHeader);
            }
            var pageParams = $u.page.getPageParams();
            if (!pageParams['REQNO']) {
                $u.get('REQNO').$el.hide();
                $('#unidocu-th-REQNO').text('').css('background', 'none');
                $('#unidocu-th-GRONO').closest('tr').hide();
                $('button#DELETE').hide();
            } else {
                $u.setValues(pageParams);
                gridObj.setJSONData(pageParams['OT_DATA']);
                gridObj.loopRowIndex($u.buttons.getCustomHandler('setCellEditableByTranType'));
                $u.fileUI.load(pageParams['EVI_SEQ'], false);
            }
            if (pageParams['GRONO']) {
                $('#uni-buttons').hide();
                $('#uni-grid_top_buttons').hide();
                $u.makeReadOnlyForm('header-invoicer-content');
                $u.fileUI.getFineUploader().setReadOnly(true);
                $u.buttons.runCustomHandler('setRowsReadOnly');
            }

            $('#file-attach-content').on('fileCountChange', function() {
                var fineUploader = $u.fileUI.getFineUploader();
                fineUploader.setContentsVisible(fineUploader.getFileCount() > 0);

            });
            if (gridObj.getRowCount() < 1) $u.buttons.runHandler('addRow');
            if ($u_T_PERNR) $u_T_PERNR.$el.change();
        }
    }
});