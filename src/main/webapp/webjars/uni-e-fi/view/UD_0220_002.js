/**
 * UD_0220_002    출장비정산
 *
 * @module uni-e-fi/view/UD_0220_002
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $efi.createStatementCommon.init();
        $u.programSetting.appendTemplate('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름', {defaultValue: ''});
        $u.programSetting.appendTemplate('setSaveFunction', {
            defaultValue: 'ZUNIEWF_6610',
            description: '저장 RFC 정의'
        });
        $u.programSetting.appendTemplate('businessCreditSearchFunction', {
            defaultValue: 'ZUNIEWF_6612',
            description: '법인카드 내역 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('searchFunction', {
            defaultValue: 'ZUNIEWF_6621',
            description: '품의 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('DeleteFunction', {
            defaultValue: 'ZUNIEWF_6630',
            description: '품의 삭제시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('AfterWhenConsultationIsDeleted', {
            defaultValue: 'UD_0220_004',
            description: '품의 삭제후 이동할 화면'
        });
        $u.programSetting.appendTemplate('WhereToContinueAt', {
            defaultValue: 'UD_0220_013',
            description: '선 전표결재후 후 품의작성(저장)시 계속작성을 눌렀을 때 이동할 화면'
        });
        $u.programSetting.appendTemplate('DeleteStatementFunction', {
            defaultValue: 'ZUNIEWF_6632',
            description: '전표 삭제시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('expKeyMappingTable', {
            defaultValue: {'A': 'ROOM_EXP', 'B': 'TRAN_EXP', 'C': 'DAY_EXP', 'ETC': 'ETC_EXP'},
            type: 'json',
            description: '그리드의 비용구분 코드키와 합계 폼 키를 매핑'
        });
        $u.programSetting.appendTemplate('editableColumnsEvenAfterBELNRHasCreated', {
            defaultValue: ['EXP_GB'],
            type: 'json',
            description: '전표번호 생성 후에도 수정이 가능한 열들의 배열'
        });
        $u.programSetting.appendTemplate('DividedStatementFunction', {
            defaultValue: 'ZUNIEWF_6650',
            description: '분할전표 생성시 사용할 함수'
        });
        $u.programSetting.appendTemplate('sendExpsWhenCreateDividedStatement', {
            defaultValue: 'true',
            description: '분할전표 생성함수 호출시 품의 정산번호 전달여부'
        });

        var useAttachSetting = $u.programSetting.getValue('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름');

        var $fileAttachWrapper = $('#file-attach-wrapper');
        if(useAttachSetting === 'yes') $fileAttachWrapper.show();
        else if(useAttachSetting === 'no') $fileAttachWrapper.hide();

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        gridObj.onCellClick($ewf.UD_0220_002.onCellClick);
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue) {
            function setWrbtrCalculated() {
                var fWrbtr = Number(gridObj.$V('KURSF',rowIndex)) * Number(gridObj.$V('WRBTRF',rowIndex));
                gridObj.$V('WRBTR',rowIndex,fWrbtr);
            }
            if (columnKey === 'EVI_GB') {
                gridObj.$V('EVKEY', rowIndex, '');
                gridObj.setImage('EVKEY_', rowIndex, '');
                var evi_gb = gridObj.$V('EVI_GB', rowIndex);
                if (evi_gb === 'C') {
                    var defaultFormValues = null;
                    if($u.programSetting.getValue('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정') === 'true') {
                        defaultFormValues = {
                            PERNR__DIALOG: gridObj.$V('PERNR', rowIndex),
                            PERNR__DIALOG_TXT: gridObj.$V('PERNR_TXT', rowIndex)
                        }
                    }
                    $efi.dialog.evidenceSelectDialog.open({
                        evidencePROGRAM_ID: 'UD_0201_000',
                        selectCallback: function (data) {
                            $.extend(data, {
                                SELECTED: '1',
                                EVKEY: data['CRD_SEQ'],
                                BUDAT: data['APPR_DATE'],
                                WRBTR: data['TOTAL']
                            });
                            delete data['PERNR'];
                            gridObj.setRowDataByJSONObj(rowIndex, data);
                            gridObj.setImage('EVKEY_', rowIndex, '/images/btn/icon_ev.gif');
                            gridObj.fillPopupText();
                            $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
                        },
                        closeWithoutSelectCallback: function () {
                            gridObj.$V(columnKey, rowIndex, '');
                            $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                        },
                        defaultFormValues: defaultFormValues
                    });
                } else if (evi_gb === 'E') gridObj.setImage('EVKEY_', rowIndex, '/images/btn/btn_view.gif');
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
            } else if (columnKey === 'EXP_DIVIDE') gridObj.$V(columnKey, rowIndex, !oldValue ? '0' : oldValue);
            if ($u.util.contains(columnKey,['BUDAT','WAERSF'])) {
                if ($u.page.getPROGRAM_ID() !== 'UD_0220_112') return;
                var $grid_waersf = gridObj.getJSONDataByRowIndex(rowIndex)['WAERSF'];
                var $grid_budat = gridObj.getJSONDataByRowIndex(rowIndex)['BUDAT'];
                if (($grid_waersf && $grid_budat) === '') return;

                var params = {WAERS: $grid_waersf, BUDAT: $grid_budat};
                $nst.is_data_nsReturn('ZUNIECM_7008',params,function(nsReturn) {
                    var o_kursf = nsReturn.getStringReturns()['O_KURSF'];
                    gridObj.$V('KURSF',rowIndex,o_kursf);
                    setWrbtrCalculated();
                },function() {
                    $.each(['KURSF','WRBTRF','WRBTR'],function(index,item) {
                        gridObj.$V(item,rowIndex,'0');
                    });
                });
            }
            if ($u.util.contains(columnKey,['KURSF','WRBTRF'])) {
                setWrbtrCalculated();
            }
            $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
        });

        $u.buttons.addHandler({
            "addRow": function () {
                gridObj.addRow();
                var index = gridObj.getActiveRowIndex();
                gridObj.$V('SELECTED', index, '1');
                var targetPernr = $u.get('PERNR') || $u.get('T_PERNR')
                gridObj.$V('PERNR', index, targetPernr.getValue());
                gridObj.$V('PERNR_TXT', index, targetPernr.getTextValue());
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
            "deleteRow": function () {
                gridObj.asserts.rowSelected();
                $.each(gridObj.getSELECTEDJSONData(), function (index, item) {
                    if (item['BELNR']) throw $mls.getByCode('M_DRAFT_0061_cannotDelete');
                });
                gridObj.deleteSelectedRows();
                $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
            },
            'SAVE': function() {
                var doc = {};
                var msg = '';
                $u.buttons.runCustomHandler('saveDocument', $u.buttons.runCustomHandler('getDocument'))
                    .then(function(nsReturn) {
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        msg = nsReturn.getReturnMessage();
                        $u.setValues(os_data);
                        return os_data;
                    })
                    .then($u.buttons.getCustomHandler('fetchDocument'))
                    .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                    .then(function(docu) {
                        doc = docu;
                        return docu;
                    })
                    .then($u.buttons.getCustomHandler('fillThePageWithDocument'))
                    .then(function() {
                        if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData()))
                            $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                        else unidocuAlert(msg);
                    });
            },
            'LOAD': function() {
                var $dialog = $efi.dialog.businessTripDialog.open();
                var dialogGrid = $u.gridWrapper.getGrid('dialog-search-grid');
                dialogGrid.setColumnHide('SELECTED', true);
                dialogGrid.onCellClick(function (columnKey, rowIndex) {
                    $u.buttons.runCustomHandler('fetchDocument', dialogGrid.getJSONDataByRowIndex(rowIndex))
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then($u.buttons.getCustomHandler('fillThePageWithDocument'));
                    $dialog.dialog('close');
                });
            },
            'DELETE': function() {
                $nst.is_data_returnMessage($u.programSetting.getValue('DeleteFunction'), $u.getValues(), function(msg) {
                    unidocuAlert(msg, function() {
                        $u.navigateByProgramId($u.programSetting.getValue('AfterWhenConsultationIsDeleted'));
                    });
                });
            },
            'createStatement': function () {
                $u.validateRequired();
                gridObj.asserts.rowSelected();
                gridObj.validateRequiredBySelected();
                var tableData = gridObj.getJSONData();
                if ($u.buttons.runCustomHandler('isBELNRCreated', gridObj.getSELECTEDJSONData())) throw '선택된 건에 전표 생성된 내역이 포함되어 있습니다.';
                if ($u.programSetting.getValue('isAttachmentRequired') === 'true') $u.buttons.runCustomHandler('validateAttachmentsInGrid');
                if (tableData.length < 1) throw $mls.getByCode('M_noDataToSave');
                var selectedIndexes = [];
                $.each(tableData, function (index, data) {
                    if (data['SELECTED'] === '1') selectedIndexes.push(index);
                })

                var returnMessage = '';
                var doc = {};

                $u.buttons.runCustomHandler('saveDocument', $u.buttons.runCustomHandler('getDocument'))
                    .then(function(nsReturn) {
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        $u.setValues(os_data);
                        return os_data;
                    })
                    .then($u.buttons.getCustomHandler('fetchDocument'))
                    .then(function(nsReturn) {
                        doc = $u.buttons.runCustomHandler('convertNSReturnToDocument', nsReturn);
                        doc['gridData'] = doc['gridData'].filter(function(data, index) {
                            return $u.util.contains(index, selectedIndexes);
                        });
                        return doc;
                    })
                    .then(verifyingStatement)
                    .then(createStatement)
                    .then(function(doc) {
                        return $u.buttons.runCustomHandler('fetchDocument', doc['formData']);
                    }, function() {
                        return $u.buttons.runCustomHandler('fetchDocument', doc['formData']);
                    })
                    .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                    .then($u.buttons.getCustomHandler(function (docu) {
                        doc = docu;
                        return docu;
                    }))
                    .then($u.buttons.getCustomHandler('fillThePageWithDocument'))
                    .then(function() {
                        $.each(selectedIndexes, function (_, v) {
                            gridObj.$V('SELECTED', v, '1');
                        })
                        if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData()))
                            $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                        else if (returnMessage) unidocuAlert(returnMessage);
                    });

                function verifyingStatement(doc) {
                    var deferred = $.Deferred();
                    $efi.createStatement.confirmBeforeCreateStatement(doc['formData'], {'IT_DATA': doc['gridData']}, function () {
                        deferred.resolve(doc);
                    });
                    return deferred.promise();
                }

                function createStatement(doc) {
                    var deferred = $.Deferred();
                    $nst.is_data_it_data_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), doc['formData'], doc['gridData'], function (nsReturn) {
                        returnMessage = nsReturn.getReturnMessage();
                        deferred.resolve(doc);
                    }, deferred.reject);
                    return deferred.promise();
                }
            },
            'deleteStatement': function() {
                gridObj.asserts.rowSelected();
                $nst.it_data_nsReturn($u.programSetting.getValue('DeleteStatementFunction'), gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $u.buttons.runCustomHandler('setGridData', nsReturn.getTableReturn('OT_DATA'));
                    $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
                    unidocuAlert(nsReturn.getReturnMessage());
                });
            }
        });
        $u.buttons.addCustomHandler({
            'getExpensesSummaries': $ewf.UD_0220_002.getExpensesSummaries,
            'setSummaryFormValues': $ewf.UD_0220_002.setSummaryFormValues,
            'getExpensesFieldNameMappingTable': $ewf.UD_0220_002.getExpensesFieldNameMappingTable,
            'isBELNRCreated': function(gridData) {
                var flag = false;
                $.each(gridData, function(_, data) {
                    if (data['BELNR'] !== '') {
                        flag = true;
                        return false;
                    }
                });
                return flag;
            },
            'setGrid3WRBTREditable': function () {
                $.each(gridObj.getJSONData(), function (index, item) {
                    if (item['BELNR'] !== '') return;
                    if (item['EVI_GB'] === 'C') {
                        gridObj.makeCellReadOnly('BUDAT', index);
                        gridObj.makeCellReadOnly('WRBTR', index);
                    } else {
                        gridObj.makeCellEditable('BUDAT', index);
                        gridObj.makeCellEditable('WRBTR', index);
                    }
                });
            },
            'fetchDocument': function(is_data) {
                var deferred = $.Deferred();
                $nst.is_data_nsReturn($u.programSetting.getValue('searchFunction'), is_data, function(nsReturn) {
                    deferred.resolve(nsReturn);
                });
                return deferred.promise();
            },
            'fillThePageWithDocument': function(doc) {
                $u.setValues(doc['formData']);
                $u.fileUI.load(doc['EVI_SEQ'], false);
                $u.buttons.runCustomHandler('setGridData', doc['gridData']);
                $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
            },
            'getDocument': function() {
                var is_data = $u.getValues();
                $u.fileUI.setFileAttachKeyParam(is_data);
                return {
                    'EVI_SEQ': is_data['EVI_SEQ'],
                    'formData': is_data,
                    'gridData': gridObj.getJSONData()
                }
            },
            'convertNSReturnToDocument': function(nsReturn) {
                var os_data = nsReturn.getExportMap('OS_DATA');
                return {
                    'EVI_SEQ': os_data['EVI_SEQ'],
                    'formData': $.extend(true, {}, os_data, nsReturn.getExportMap('OS_TEXT')),
                    'gridData': nsReturn.getTableReturn('OT_DATA')
                }
            },
            'setGridData': function (gridData) {
                gridObj.setJSONData(gridData);
                $ewf.UD_0220_002.setGridEvidenceImage();
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
            },
            'validateAttachmentsInGrid': function() {
                var gridData = gridObj.getJSONData();
                $.each(gridData,function(index, data) {
                    if (data['EVI_GB'] === 'E' && data['EVKEY_'] !== '/images/btn/icon_ev.gif') throw index + 1 + '행에 증빙파일을 첨부해주세요';
                });
            },
            'disableEditingStatement': function() {
                $('#uni-grid_buttons').find('button').hide();
                $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
            },
            'setRowsReadOnlyIfBELNRIsExists': (function() {
                var columnKeys = gridObj.getGridHeaders().map(function (header) {
                    return header['key'];
                }).filter(function (columnKey) {
                    return columnKey !== 'SELECTED';
                });
                return function() {
                    var isGronoCreated = $u.get('GRONO').getValue() !== '';
                    var excludes = isGronoCreated ? [] : $u.programSetting.getValue('editableColumnsEvenAfterBELNRHasCreated');
                    if (isGronoCreated) $ewf.UD_0220_002.fileAttachableInGrid = false;
                    gridObj.loopRowIndex(function(index) {
                        if (gridObj.$V('BELNR', index)) {
                            columnKeys.forEach(function(header) {
                                if ($u.util.contains(header, excludes)) return;
                                gridObj.makeCellReadOnly(header, index);
                            });
                        }
                    });
                };
            })(),
            'alignSummaryTableVertical': $ewf.UD_0220_002.alignSummaryTableVertical,
            'setDividedDataFromChild': function(rowIndex, os_doc) {
                gridObj.$V('EXP_DIVIDE', rowIndex, "1");
                gridObj.$V('S_FLAG', rowIndex, "X");
                gridObj.$V('BELNR', rowIndex, os_doc['BELNR']);
                gridObj.$V('BUDAT', rowIndex, os_doc['BUDAT']);
                gridObj.$V('BUKRS', rowIndex, os_doc['BUKRS']);
                gridObj.$V('GJAHR', rowIndex, os_doc['GJAHR']);
            },
            'saveDocument': function(doc) {
                var deferred = $.Deferred();
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], doc['gridData'], function(nsReturn) {
                    deferred.resolve(nsReturn);
                }, function (errReturn) {
                    deferred.reject(errReturn);
                });
                return deferred.promise();
            },
            'showResultDialog': function (dialogData) {
                $efi.dialog.afterCreateStatementDialogInBusinessTrip.open($.extend({}, dialogData,
                    {'mode': 'create_statement_business_trip_expenses'}));
            },
            'haveAllLinesBELNR': function(gridData) {
                return gridData.length === 0
                    ? false
                    : gridData.filter(function(data) {
                        return !data['BELNR'];
                    }).length === 0;
            },
            'setColorIndicatorOnEXP': function() {
                var expTable = $.extend({'SUM': 'SUM_EXP'}, $u.buttons.runCustomHandler('getExpensesFieldNameMappingTable'));
                $.each(expTable, function(key, value) {
                    if (!$u.get(value + '_A')) return true;
                    var expValue = $u.get(value).getValue();
                    var denominator = $u.get(value + '_A').getValue();
                    var color = ''
                    if (expValue > denominator) color = 'red'
                    else if (expValue < denominator) color = 'blue';
                    $u.get(value).$el.find('input').css('color', color);
                });
            }
        });

        return function () {
            var pageParams = $u.page.getPageParams();
            $ewf.UD_0220_002.setTargetGridObj(gridObj);
            $ewf.UD_0220_002.fileAttachableInGrid = true;
            $u.buttons.runCustomHandler('alignSummaryTableVertical');
            if (pageParams['REQNO'] || pageParams['REQNO_A']) {
                if (pageParams['OT_DATA']) $u.buttons.runCustomHandler('setGridData', pageParams['OT_DATA']);
                $u.setValues(pageParams);
                $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
                $u.buttons.runCustomHandler('setColorIndicatorOnEXP');
            }
            $u.fileUI.load(pageParams['EVI_SEQ'], false);
            if (pageParams['gridData']) $u.buttons.runCustomHandler('setGridData', pageParams['gridData']);
            if (pageParams['GRONO']) {
                $u.makeReadOnlyForm('header-invoicer-content');
                $u.fileUI.getFineUploader().setReadOnly(true);
                $('#uni-buttons').hide();
            }
            if (pageParams['disableEditingStatement'] || pageParams['GRONO']) $u.buttons.runCustomHandler('disableEditingStatement');

            gridObj.setSortEnable(false);
            gridObj.setHeaderCheckBox('SELECTED', true);

            $('#file-attach-content').on('fileCountChange', function() {
                var fineUploader = $u.fileUI.getFineUploader();
                fineUploader.setContentsVisible(fineUploader.getFileCount() > 0);
            });
        }
    }
});