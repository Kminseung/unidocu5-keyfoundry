/**
 * @module vendorCustom/magnachip/view/customizeUD_0220_122
 */
define(function () {
    return function (initFn) {
        var $fileAttachWrapper = $('#file-attach-wrapper');
        $fileAttachWrapper.append($efi.mustache.approvalDbdata());
        $u.unidocuUI();
        $magnachip.setGridHeaderDescription($('#header-invoicer-content'),'*출장정산서 한 건당 하나의 품의서로 작성 부탁드립니다.');
        $magnachip.setGridHeaderDescription($u.gridWrapper.getGrid('UD_0220_122-grid2'), '*출장자는 지급 기준으로 작성 부탁드립니다.');
        var formFineUploader;
        $efi.createStatementCommon.init();
        $u.programSetting.appendTemplate('정액 기준 사용여부', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('기준 금액 체크 사용여부', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('기준 금액 사용여부', {defaultValue: 'true'});

        $u.programSetting.appendTemplate('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름', {defaultValue: ''});
        $u.programSetting.appendTemplate('setSaveFunction', {
            defaultValue: 'ZUNIEWF_6711',
            description: '저장 RFC 정의'
        });
        $u.programSetting.appendTemplate('businessCreditSearchFunction', {
            defaultValue: 'ZUNIEWF_6701',
            description: '법인카드 내역 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('searchFunction', {
            defaultValue: 'ZUNIEWF_6714',
            description: '품의 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('DeleteFunction', {
            defaultValue: 'ZUNIEWF_6731',
            description: '품의 삭제시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('AfterWhenConsultationIsDeleted', {
            defaultValue: 'UD_0220_122',
            description: '품의 삭제후 이동할 화면'
        });
        $u.programSetting.appendTemplate('CalculateFunction', {
            defaultValue: 'ZUNIEWF_6710',
            description: '비용 계산시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('DeleteStatementFunction', {
            defaultValue: 'ZUNIEWF_6713',
            description: '전표 삭제시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('editableColumnsEvenAfterBELNRHasCreated', {
            defaultValue: '',
            type: 'json',
            description: '전표번호 생성 후에도 수정이 가능한 열들의 배열'
        });
        $u.programSetting.appendTemplate('DividedStatementFunction', {
            defaultValue: 'ZUNIEWF_6702',
            description: '분할전표 생성시 사용할 함수'
        });
        $u.programSetting.appendTemplate('sendExpsWhenCreateDividedStatement', {
            defaultValue: 'true',
            description: '분할전표 생성함수 호출시 품의 정산번호 전달여부'
        });

        var useAttachSetting = $u.programSetting.getValue('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름');

        if(useAttachSetting === 'yes') $fileAttachWrapper.show();
        else if(useAttachSetting === 'no') $fileAttachWrapper.hide();

        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('UD_0220_122-grid2');
        var gridObjDB = $u.gridWrapper.getGrid('approvalDbData');
        var gridView = gridObj2._rg.gridView;
        var textarea=$('#unidocu-td-TEXT4 textarea')
        gridObj.fitToWindowSize();
        gridObj2.setCheckBarAsRadio('SELECTED', true);
        gridObj.setHeaderCheckBox('SELECTED', true);

        gridObj2.setGroupHeader([
            {groupText: '출장지', childColumns: ['CITY', 'CITY_', 'CITY_TXT']},
            {groupText: '출장기간', childColumns: ['FDATE','TDATE','TR_NIGHT','TR_DAY']},
            {groupText: '숙박비', childColumns: ['ROOM_EXP_A','ROOM_EXP']},
            {groupText: '식대/잡비', childColumns: ['DAY_EXP_A','DAY_EXP']},
            {groupText: '교통비', childColumns: ['TRAN_EXP_A','TRAN_EXP']},
            {groupText: '합계', childColumns: ['SUM_EXP_A','SUM_EXP']}
        ]);
        gridObj2._rg.gridView.setHeader({height: 65});

        if($u.programSetting.getValue('기준 금액 사용여부') === 'false') {
            $.each(['ROOM_EXP','DAY_EXP','ETC_EXP','TRAN_EXP','SUM_EXP'], function (_, item) {
                gridObj2.setColumnHide(item);
            });
        } else {
            $.each(['ROOM_EXP_A', 'DAY_EXP_A', 'ETC_EXP_A', 'TRAN_EXP_A', 'SUM_EXP_A'], function(_, columnKey) {
                var targetColumn = columnKey.substring(0, columnKey.length - 2);
                var criteria_under = '(value < value["' + targetColumn + '"])';
                var criteria_over = '(value > value["' + targetColumn + '"])';
                gridView.setColumnProperty(
                    gridView.columnByField(columnKey),
                    "dynamicStyles", [{
                        criteria: criteria_under,
                        styles: "foreground=#0000ff"
                    }, {
                        criteria: criteria_over,
                        styles: "foreground=#ff0000"
                    }]
                )
            });
        }

        gridObj2.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if (/DATE$/.test(columnKey) && gridObj2.getGridHeader('TR_DAY')) {
                $magnachip.validateFdate(gridObj2)
                $u.buttons.runCustomHandler('calculateDate',columnKey, rowIndex);
            }
            if (/CITY/.test(columnKey) && jsonObj) {
                $magnachip.validateDestinaion(gridObj,gridObj2,'CITY',rowIndex)
                if(gridObj2.$V('FDATE',rowIndex)&&gridObj2.$V('TDATE',rowIndex)){
                    $magnachip.validateFdate(gridObj2)
                    $u.buttons.runCustomHandler('calculateDate',columnKey, rowIndex);
                }
            }
            gridObj2.$V('SELECTED', rowIndex, '1');
        });
        gridObj2.onBlockPaste(function(startColumnKey, startRowIndex, endColumnKey, endRowIndex) {
            var i, len;
            for (i = startRowIndex, len = endRowIndex; i <= len; i++) {
                gridObj2.triggerChangeCell('FDATE', i);
            }
        })

        gridObj.onCellClick($ewf.UD_0220_122.onCellClick);
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue) {
            if (columnKey === 'EVI_GB') {
                gridObj.$V('EVKEY', rowIndex, '');
                gridObj.setImage('EVKEY_', rowIndex, '');
                var evi_gb = gridObj.$V('EVI_GB', rowIndex);
                if (evi_gb === 'C') {
                    if(gridObj.$V('EXP_GB', rowIndex) === 'D') {
                        $.each(['DEPART', 'DESTIN', 'TRAN_TYPE'], function (_, item) {
                            gridObj.makeCellReadOnly(item, rowIndex);
                        });
                    }
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
                            delete data['HKONT'];
                            delete data['SGTXT'];
                            gridObj.setRowDataByJSONObj(rowIndex, data);
                            gridObj.setImage('EVKEY_', rowIndex, '/images/btn/icon_ev.gif');
                            gridObj.$V('BLART', rowIndex, 'KC');
                            gridObj.fillPopupText();
                            $u.buttons.runCustomHandler('setSummaryFormValues');
                        },
                        closeWithoutSelectCallback: function () {
                            gridObj.$V(columnKey, rowIndex, '');
                            $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                        },
                        defaultFormValues: defaultFormValues
                    });
                    if (staticProperties.user['ROLE'] !== 'ALL') $u.get('PERNR__DIALOG').setReadOnly(true);
                    gridObj.triggerChangeCell('EXP_GB', rowIndex, '', gridObj.$V('EXP_GB', rowIndex));
                } else if (evi_gb === 'E') gridObj.setImage('EVKEY_', rowIndex, '/images/btn/btn_view.gif');
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
            } else if (columnKey === 'EXP_DIVIDE') gridObj.$V(columnKey, rowIndex, !oldValue ? '0' : oldValue);
            if (columnKey === 'EXP_GB') {
                if(gridObj.$V('BELNR', rowIndex) === '') {
                    if(gridObj.$V('EXP_GB', rowIndex) !== 'D' || gridObj.$V('EVI_GB', rowIndex) === 'C') {
                        $.each(['DEPART', 'DESTIN', 'TRAN_TYPE', 'OIL', 'KM','GAS_MIL','GAS_EXP'], function (_, item) {
                            gridObj.$V(item, rowIndex, '');
                        });
                    }
                } else {
                    $.each(['DEPART', 'DESTIN', 'TRAN_TYPE', 'OIL', 'KM','GAS_MIL','GAS_EXP'], function (_, item) {
                        gridObj.$V(item, rowIndex, '');
                    });
                    if(gridObj.$V('EVI_GB', rowIndex) !== 'C' && gridObj.$V('EXP_GB', rowIndex) === 'D') {
                        gridObj.$V('EXP_GB', rowIndex, oldValue);
                        $u.buttons.runCustomHandler('setSummaryFormValues');
                        unidocuAlert($mls.getByCode('M_UD_0220_122_gridObjNotSelected_trans'));
                    }
                }
            }
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (columnKey === 'TRAN_TYPE' && gridObj.$V('EXP_GB',rowIndex)==='D') {
                if(!/^A$|^B$/.test(rowData['TRAN_TYPE'])){
                    $.each(['OIL', 'KM','GAS_MIL','GAS_EXP'], function (_, item) {
                        gridObj.$V(item, rowIndex, '');
                    });
                }
            }
            var exp_gb = gridObj.$V('EXP_GB', rowIndex);
            if (exp_gb === 'D') {
                if (/^A$|^B$/.test(rowData['TRAN_TYPE'])) {
                    var columnArray = ['KM', 'OIL','GAS_EXP', 'GAS_MIL', 'WRBTR']
                    if (columnArray.indexOf(columnKey) !== -1) {
                        $magnachip.tranCalculate(gridObj,rowIndex,'WRBTR')
                    }
                }
            }
            $u.buttons.runCustomHandler('controlReadonlyState', rowIndex);
            $u.buttons.runCustomHandler('setSummaryFormValues');
        });

        $u.buttons.addHandler({
            "getDbData": function () {
                $magnachip.getGwDbDialog()
            },
            "deleteRowDB": function () {
                $u.gridWrapper.getGrid("approvalDbData").deleteSelectedRows();
            },
            "addRow": function () {
                gridObj2.asserts.rowSelected($mls.getByCode('비용을 입력할 출장자를 먼저 선택해 주세요'));
                gridObj2.validateSELECTEDGridRequired();
                gridObj.addRow();
                var selectedIndex = gridObj2._rg.getCheckedItems()
                var index = gridObj2.$V('INDEX', selectedIndex)
                var selectedjsonData = gridObj2.getSELECTEDJSONData()[0];
                $.extend(selectedjsonData, {INDEX: index})
                gridObj.setRowDataByJSONObj(gridObj.getActiveRowIndex(), selectedjsonData);
                gridObj.makeCellReadOnly('GAS_EXP', gridObj.getActiveRowIndex());
                $magnachip.SGTXTChange(gridObj)
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
                $u.buttons.runCustomHandler('setSummaryFormValues');
            },
            'SAVE': function() {
                $u.validateRequired('header-invoicer-content');
                $u.buttons.runCustomHandler('saveDocument', $u.buttons.runCustomHandler('getDocument'))
            },
            'LOAD': function() {
                var $dialog = $efi.dialog.businessTripDialog.open();
                if (staticProperties.user['ROLE'] !== 'ALL') $u.get('PERNR__DIALOG').setReadOnly(true);
                var doc_type = {
                    "UD_0220_122": 'T20',
                    "UD_0220_112": 'T11'
                };
                $u.get('DOC_TYPE__DIALOG').setValue(doc_type[$u.page.getPROGRAM_ID()]);
                $('#dialog-search-form').find('.panel-search-button').click();
                var dialogGrid = $u.gridWrapper.getGrid('dialog-search-grid');
                dialogGrid.onCellClick(function (columnKey, rowIndex) {
                    $u.buttons.runCustomHandler('fetchDocument', dialogGrid.getJSONDataByRowIndex(rowIndex))
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then(function(document) {
                            return $u.buttons.runCustomHandler('fillThePageWithDocument', document,  true)
                        })
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
                $u.validateRequired('header-invoicer-content');
                gridObj.asserts.rowSelected();
                gridObj.validateRequiredBySelected();
                gridObj2.validateSELECTEDGridRequired();
                var tableData = gridObj.getJSONData();
                if ($u.buttons.runCustomHandler('isBELNRCreated', gridObj.getSELECTEDJSONData())) throw '선택된 건에 전표 생성된 내역이 포함되어 있습니다.';
                if ($u.programSetting.getValue('isAttachmentRequired') === 'true') $u.buttons.runCustomHandler('validateAttachmentsInGrid');
                if (tableData.length < 1) throw $mls.getByCode('M_noDataToSave');
                $u.buttons.runCustomHandler('saveDocument2', $u.buttons.runCustomHandler('getDocument'))
            },
            'deleteStatement': function() {
                gridObj.asserts.rowSelected();
                $u.buttons.runCustomHandler('setSummaryFormValues');
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('DeleteStatementFunction'), {REQNO: $u.get('REQNO').getValue()}, gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $u.buttons.runCustomHandler('setGridData', nsReturn.getTableReturn('OT_DATA'), true);
                    $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
                    unidocuAlert(nsReturn.getReturnMessage());
                });
            },
            "addEmployee": function () {
                $u.validateRequired('header-invoicer-content');
                if(!gridObj2.getRowCount()) {
                    $u.dialog.f4CodeDialog.open({
                        popupKey: 'PERNR',
                        codePopupCallBack: function (code) {
                            $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: code}, function (os_data) {
                                gridObj2.addRowByJSONData($.extend(os_data, {PERNR_TXT: os_data['SNAME'], POS_KEY: os_data['POS_KEY']}));
                                gridObj2.$V('INDEX',0,'1');
                            });
                        }
                    });
                }else{
                    var employeedata ={}
                    employeedata.INDEX = gridObj2.getRowCount() + 1
                    employeedata.PERNR = gridObj2.getJSONData()[0].PERNR
                    employeedata.PERNR_TXT = gridObj2.getJSONData()[0].PERNR_TXT
                    employeedata.POS_KEY = gridObj2.getJSONData()[0].POS_KEY
                    employeedata.JOB_KEY = gridObj2.getJSONData()[0].JOB_KEY
                    gridObj2.addRowByJSONData(employeedata);
                }
            },
            "deleteEmployee": function () {
                gridObj2.asserts.rowSelected();
                // var selectedPERNR = gridObj2.getSELECTEDJSONData()[0]['PERNR'];
                var selectedIndex = gridObj2._rg.getCheckedItems()
                var index = gridObj2.$V('INDEX', selectedIndex)
                if (gridObj.$F(index, 'INDEX').length > 0) throw $mls.getByCode('M_DRAFT_0061_deleteEmployee') + gridObj2.getSELECTEDJSONData()[0]['PERNR_TXT'];
                gridObj2.deleteSelectedRows();
            }
        });
        $u.buttons.addCustomHandler({
            "calculateDate": function(columnKey,rowIndex) {
                function stringToDate(strDate) {
                    return new Date(strDate.substring(0, 4) + '-' + strDate.substring(4, 6) + '-' + strDate.substring(6));
                }
                var fdate = gridObj2.$V('FDATE', rowIndex);
                var tdate = gridObj2.$V('TDATE', rowIndex);
                if (!fdate || !tdate) {
                    $u.buttons.runCustomHandler('setEmptyTargets', rowIndex);
                    return;
                }
                var nights = Math.floor((stringToDate(tdate) - stringToDate(fdate)) / (60 * 60 * 24 * 1000));
                if (fdate > tdate) {
                    gridObj2.$V('TDATE', rowIndex, gridObj2.$V('FDATE', rowIndex));
                    nights = 0;
                }
                if(nights >= 0) {
                    gridObj2.$V('TR_DAY', rowIndex, nights + 1);
                    gridObj2.$V('TR_NIGHT', rowIndex, nights);
                    if($u.page.getPROGRAM_ID() === 'UD_0220_112') return;
                    var activeRowJsonData = gridObj2.getJSONData()[rowIndex];
                    var dateValidation = false;
                    $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('CalculateFunction'), {},{IT_HEAD: [activeRowJsonData]}, function (nsReturn) {
                        var ot_head = nsReturn.getTableReturn('OT_HEAD');
                        var jsonData = gridObj2.getJSONData();
                        jsonData[rowIndex] = $.extend(activeRowJsonData, ot_head[0]);
                        gridObj2.setJSONData(jsonData);
                        var total = Number(ot_head[0]['ROOM_EXP']) + Number(ot_head[0]['DAY_EXP']) + Number(ot_head[0]['ETC_EXP']) + Number(ot_head[0]['TRAN_EXP']);
                        gridObj2.$V('SUM_EXP',rowIndex,total);
                        dateValidation = true;
                        if ($u.programSetting.getValue('정액 기준 사용여부') === 'true') {
                            $u.buttons.runCustomHandler('setGridExpense', jsonData[rowIndex]);
                        }
                    });
                } else {
                    $u.buttons.runCustomHandler('setEmptyTargets', rowIndex);
                }
                if(!dateValidation){
                    gridObj2.$V(columnKey, rowIndex,'')
                }
            },
            "setEmptyTargets": function(rowIndex) {
                var emptyTargets = ['TR_DAY','TR_NIGHT','ROOM_EXP','DAY_EXP','ETC_EXP','TRAN_EXP','SUM_EXP'];
                $.each(emptyTargets, function (_, item) {
                    gridObj2.$V(item, rowIndex, '');
                });
            },
            "setGridExpense": function (data) {
                var mappingKey = {ROOM_EXP: 'A', DAY_EXP: 'B', ETC_EXP: 'C', TRAN_EXP: 'D'};
                function findTargetIndex(pernr, exp_gb) {
                    var index = -1;
                    gridObj.loopRowIndex(function(rowIndex) {
                        if (gridObj.$V('PERNR', rowIndex) === pernr && gridObj.$V('EXP_GB', rowIndex) === exp_gb) {
                            index = rowIndex;
                        }
                    });
                    return index;
                }

                $.each(data, function(columnKey, item) {
                    if ($u.util.contains(columnKey,['ROOM_EXP','DAY_EXP','ETC_EXP','TRAN_EXP']) && Number(item) > '0') {
                        var targetIndex = findTargetIndex(data['PERNR'], mappingKey[columnKey]);
                        if (targetIndex < 0) gridObj.addRow();
                        else gridObj.setActiveRowIndex(targetIndex);
                        gridObj2.$V('SELECTED', gridObj2.getActiveRowIndex(), '1');
                        gridObj.$V('PERNR', gridObj.getActiveRowIndex(), gridObj2.getSELECTEDJSONData()[0]['PERNR']);
                        gridObj.$V('PERNR_TXT', gridObj.getActiveRowIndex(), gridObj2.getSELECTEDJSONData()[0]['PERNR_TXT']);
                        gridObj.$V('EXP_GB', gridObj.getActiveRowIndex(), mappingKey[columnKey]);
                        gridObj.$V('WRBTR', gridObj.getActiveRowIndex(), item);
                        gridObj.makeCellReadOnly('EXP_GB', gridObj.getActiveRowIndex());
                        gridObj.makeCellReadOnly('WRBTR', gridObj.getActiveRowIndex());
                    }
                });
                $u.buttons.runCustomHandler('setSummaryFormValues');
            },
            "callZUNIEWF_6700": function(rowIndex) {
                $nst.is_data_os_data('ZUNIEWF_6700', gridObj.getJSONData()[rowIndex], function(os_data) {
                    if(parseInt(os_data['KM']) === 0) os_data['KM'] = '';
                    gridObj.$V('KM', rowIndex, os_data['KM']);
                    gridObj.$V('WRBTR', rowIndex, os_data['WRBTR']);
                    $u.buttons.runCustomHandler('setSummaryFormValues');
                });
            },
            'setSummaryFormValues': function() {
                function getSummaries(jsonData) {
                    function getOrCreate(obj, key, initValue) {
                        if (!obj[key]) obj[key] = initValue;
                        return obj[key];
                    }
                    return jsonData.reduce(function(summaries, data) {
                        var perIndex = getOrCreate(summaries, data['INDEX'], {});
                        var perCity = getOrCreate(perIndex, data['CITY'], {});
                        var perExpGb = getOrCreate(perCity, data['EXP_GB'], 0);
                        perCity[data['EXP_GB']] = perExpGb + parseInt(data['WRBTR'] || 0);
                        return summaries;
                    }, {});
                }
                function setSummaries(summaries, mappingTable) {
                    var jsonData = gridObj2.getJSONData();
                    $.each(jsonData, function(_, data) {
                        var perIndex = summaries[data['INDEX']];
                        var perCity = perIndex ? perIndex[data['CITY']] : undefined;
                        $.each(mappingTable, function(_, columnKey) {
                            data[columnKey] = 0;
                        });
                        if (!perCity) return true;
                        $.each(perCity, function(exp_gb, wrbtr) {
                            data[mappingTable[exp_gb]] = wrbtr;
                        });
                    });
                    var total = 0;
                    $.each(jsonData, function(index, item) {
                        total = item['ROOM_EXP_A'] + item['DAY_EXP_A'] + item['ETC_EXP_A'] + item['TRAN_EXP_A']+item['AIR_EXP_A'];
                        item['DAY_EXP_A'] = item['DAY_EXP_A']+item['ETC_EXP_A']
                        item['TRAN_EXP_A'] = item['TRAN_EXP_A']+item['AIR_EXP_A']
                        item['SUM_EXP_A'] = total;
                    })
                    gridObj2.setJSONData(jsonData);
                }
                setSummaries(getSummaries(gridObj.getJSONData()), {
                    A: 'ROOM_EXP_A',
                    B: 'DAY_EXP_A',
                    C: 'ETC_EXP_A',
                    D: 'TRAN_EXP_A',
                    E: 'AIR_EXP_A'
                });
            },
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
                    if (item['BELNR'] !== '') $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
                    if (item['EVI_GB'] === 'C' && item['BELNR'] === '') {
                        gridObj.makeCellReadOnly('WRBTR', index);
                    } else if(item['EVI_GB'] !== 'C' && item['BELNR'] === ''){
                        $.each(['BUDAT', 'WRBTR'], function (_, item) {
                            gridObj.makeCellEditable(item, index);
                        });
                    }
                });
            },
            'fetchDocument': function(is_data) {
                var deferred = $.Deferred();
                var funcName = is_data['FUNC_NAME'];
                $nst.is_data_nsReturn(funcName, is_data, function(nsReturn) {
                    deferred.resolve(nsReturn);
                });
                return deferred.promise();
            },
            'fetchDocument2': function(is_data) {
                var deferred = $.Deferred();
                $nst.is_data_nsReturn($u.programSetting.getValue('searchFunction'), is_data, function(nsReturn) {
                    deferred.resolve(nsReturn);
                });
                return deferred.promise();
            },
            'fillThePageWithDocument': function(doc, useload) {
                if(useload) {
                    gridObj2.clearGridData();
                    gridObj2.addRow();
                    gridObj2.makeReadOnlyGrid();
                    gridObj2.setColumnHide('SELECTED', false);
                    gridObj2.makeColumnEditable('SELECTED');
                    gridObj.clearGridData();
                }
                $u.setValues(doc['formData']);
                $u.fileUI.load(doc['EVI_SEQ'], false);
                $u.buttons.runCustomHandler('setGridData', doc['gridData']);
                $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
            },
            'getDocument': function() {
                var is_data = $u.getValues();
                is_data.TEXT4=is_data.TEXT4.replaceAll('\n','@_@')
                textarea.css('min-height','100px')
                formFineUploader = $u.fileUI.getFineUploader();
                is_data['EVI_SEQ'] = formFineUploader.getFileGroupId();
                $u.buttons.runCustomHandler('setSummaryFormValues');
                return {
                    'EVI_SEQ': is_data['EVI_SEQ'],
                    'formData': is_data,
                    'gridData': {OT_DATA: gridObj.getJSONData(), OT_HEAD: gridObj2.getJSONData(),OT_USR1:gridObjDB.getJSONData()}
                }
            },
            'convertNSReturnToDocument': function(nsReturn) {
                var os_data = nsReturn.getExportMap('OS_DATA');
                var ot_data = nsReturn.getTableReturn('OT_DATA');
                var ot_head = nsReturn.getTableReturn('OT_HEAD');
                var ot_usr1 = nsReturn.getTableReturn('OT_USR1');
                return {
                    'EVI_SEQ': os_data['EVI_SEQ'],
                    'formData': $.extend(true, {}, os_data, nsReturn.getExportMap('OS_TEXT')),
                    'gridData': {OT_DATA: ot_data, OT_HEAD: ot_head, OT_USR1:ot_usr1}
                }
            },
            'setGridData': function (gridData, useDelete) {
                if(useDelete) {
                    $.each(gridData, function(index, item) {
                        if(parseInt(item['KM']) === 0) item['KM'] = '';
                    });
                    gridObj.setJSONData(gridData);
                    $u.buttons.runCustomHandler('setSummaryFormValues');
                } else {
                    $.each(gridData['OT_DATA'], function(index, item) {
                        if(parseInt(item['KM']) === 0) item['KM'] = '';
                    });
                    gridObj.setJSONData(gridData['OT_DATA']);
                    gridObj2.setJSONData(gridData['OT_HEAD']);
                    gridObjDB.setJSONData(gridData['OT_USR1']);
                    $u.buttons.runCustomHandler('setSummaryFormValues');
                }
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                $ewf.UD_0220_002.setGridEvidenceImage();
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
            'setRowsReadOnlyIfBELNRIsExists': function() {
                gridObj.loopRowIndex(function(index) {
                    $u.buttons.runCustomHandler('controlReadonlyState', index);
                });
            },
            'setRowsReadOnlyIfBELNRIsExistsByRowIndex': (function() {
                var columnKeys = gridObj.getGridHeaders().map(function (header) {
                    return header['key'];
                }).filter(function (columnKey) {
                    return columnKey !== 'SELECTED';
                });
                return function(rowIndex) {
                    var isGronoCreated = $u.get('GRONO').getValue() !== '';
                    var excludes = isGronoCreated ? [] : $u.programSetting.getValue('editableColumnsEvenAfterBELNRHasCreated');
                    if (isGronoCreated) $ewf.UD_0220_002.fileAttachableInGrid = false;
                    if (gridObj.$V('BELNR', rowIndex)) {
                        columnKeys.forEach(function(header) {
                            if ($u.util.contains(header, excludes)) return;
                            gridObj.makeCellReadOnly(header, rowIndex);
                        });
                        $u.buttons.runCustomHandler('controlEXP_GBState', rowIndex);
                    }
                };
            })(),
            'setDividedDataFromChild': function(rowIndex, os_data) {
                gridObj.$V('EXP_DIVIDE', rowIndex, "1");
                gridObj.$V('S_FLAG', rowIndex, "X");
                gridObj.$V('SEQ', rowIndex, os_data['SEQ']);
                gridObj.$V('BUKRS', rowIndex, os_data['BUKRS']);
                gridObj.$V('BELNR', rowIndex, os_data['BELNR']);
                gridObj.$V('HKONT', rowIndex, os_data['HKONT']);
                gridObj.$V('GJAHR', rowIndex, os_data['GJAHR']);
                gridObj.$V('BUDAT', rowIndex, os_data['BUDAT']);
                gridObj.$V('WRBTR', rowIndex, os_data['WRBTR']);
                gridObj.$V('SGTXT', rowIndex, os_data['SGTXT']);
                gridObj.$V('BLART', rowIndex, os_data['BLART']);
                gridObj.$V('MWSKZ', rowIndex, os_data['MWSKZ']);
            },
            'saveDocument': function(doc) {
                var IT_USR1 = gridObjDB.getJSONData();
                $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA'],IT_USR1:IT_USR1}, function (nsReturn) {
                    doc['formData'].TEXT4 = doc['formData'].TEXT4.replaceAll('@_@','\n')
                    var paramMap = $.extend({}, doc['formData'], {REQNO : nsReturn.getExportMap('OS_DATA')['REQNO']});
                    $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then(function(document) {
                            $u.setValues(paramMap);
                            doc = document;
                        }).then(function () {
                        if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData())) {
                            $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                        } else {
                            unidocuAlert('자료를 저장하였습니다.', function () {
                                $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                                    .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                                    .then(function(document) {
                                        return $u.buttons.runCustomHandler('fillThePageWithDocument', document)
                                    })
                                    .then(
                                        function () {
                                            $magnachip.getText4()
                                        }
                                    )
                            });
                        }
                    });
                });
            },
            'saveDocument2': function(doc) {
                var IT_USR1 = gridObjDB.getJSONData();
                $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA'],IT_USR1:IT_USR1}, function (nsReturn) {
                    var paramMap = $.extend({}, doc['formData'], {REQNO : nsReturn.getExportMap('OS_DATA')['REQNO']});
                    $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then(function(document) {
                            $u.setValues(paramMap);
                            doc = document;
                            var returnMessage = '';
                            gridObj.loopRowIndex(function (rowIndex) {
                                gridObj.$V('SEQ', rowIndex, doc['gridData']['OT_DATA'][rowIndex]['SEQ']);
                            });
                            if ($u.programSetting.getValue('기준 금액 체크 사용여부') === 'true') {
                                doc['formData'] = $.extend(doc['formData'], {CHECK_EXP : 'X'});
                            }
                            $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setCreateStatementFunction'),  doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: gridObj.getSELECTEDJSONData()}, function(nsReturn) {
                                returnMessage = nsReturn.getReturnMessage();
                                $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                                    .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                                    .then(function(document) {
                                        doc = document;
                                        return $u.buttons.runCustomHandler('fillThePageWithDocument', document)
                                    }).then(function () {
                                    if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData()))
                                        $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                                    else if (returnMessage) unidocuAlert(returnMessage);
                                })
                                    .then(
                                        function () {
                                            $magnachip.getText4()
                                        }
                                    );
                            });
                        })
                });
            },
            'saveDocument3': function(doc) {    // 비용분할
                var IT_USR1 = gridObjDB.getJSONData();
                $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA'],IT_USR1:IT_USR1}, function (nsReturn) {
                    var paramMap = $.extend({}, doc['formData'], {REQNO : nsReturn.getExportMap('OS_DATA')['REQNO']});
                    $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then(function(document) {
                            doc = document;
                            var returnMessage = '';
                            gridObj.loopRowIndex(function (rowIndex) {
                                gridObj.$V('SEQ', rowIndex, doc['gridData']['OT_DATA'][rowIndex]['SEQ']);
                            });
                            $u.buttons.runCustomHandler('fillThePageWithDocument', document);
                            $u.buttons.runCustomHandler('setSummaryFormValues');
                            if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData()))
                                $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                            else if (returnMessage) unidocuAlert(returnMessage);
                        })
                        .then(
                            function () {
                                $magnachip.getText4()
                            }
                        )
                });
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
                        gridObj.makeCellEditable('EXP_GB', index);
                        gridObj.makeCellEditable('EXP_DIVIDE', index);
                    });
                };
            })(),
            "controlReadonlyState": function (rowIndex) {
                var ediTableColumns = [];
                var readOnlyColumns = [];
                var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
                if (rowData['BELNR']) return $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExistsByRowIndex', rowIndex);

                if (rowData['EXP_GB'] === 'D') {
                    ediTableColumns = ediTableColumns.concat('TRAN_TYPE', 'DEPART', 'DESTIN');
                    if (/^A$|^B$/.test(rowData['TRAN_TYPE'])) {
                        ediTableColumns = ediTableColumns.concat('KM', 'OIL', 'GAS_MIL','GAS_EXP');
                    }else{
                        readOnlyColumns = readOnlyColumns.concat('KM', 'OIL', 'GAS_MIL','GAS_EXP');
                    }
                    gridObj.rg.style._setColumnStyles('KM','numberFormat','#,##0.00');
                    gridObj.rg.style._setColumnStyles('GAS_MIL','numberFormat','#,##0.00')
                }else{
                    readOnlyColumns = readOnlyColumns.concat('TRAN_TYPE', 'DEPART', 'DESTIN', 'OIL', 'GAS_MIL', 'KM','GAS_EXP');
                }
                $.each(ediTableColumns, function (_, columns) {
                gridObj.makeCellEditable(columns, rowIndex);
                });
                $.each(readOnlyColumns, function (_, columns) {
                    gridObj.makeCellReadOnly(columns, rowIndex);
                });
            },
            'controlEXP_GBState': function (rowIndex) {
                gridObj.makeCellReadOnly('EXP_GB', rowIndex);
            }
        });
        initFn()
        var pageParams = $u.page.getPageParams();
        $magnachip.SGTXTChange(gridObj)
        if($u.page.getPageParams()['REQNO']){
            $magnachip.openApproval(gridObjDB);
            textarea.css('min-height','100px')
        }
        if (pageParams['GRONO']) {
            $u.makeReadOnlyForm('header-invoicer-content');
            $u.fileUI.getFineUploader().setReadOnly(true);
            $('#uni-buttons, #uni-buttons2').hide();
            $('#uni-grid_buttons').hide();
            $('#getDbData, #deleteRowDB').hide();
            gridObj2.makeReadOnlyGrid();
            gridObj.makeReadOnlyGrid();
            gridObjDB.makeReadOnlyGrid();
        }
        $magnachip.businessTripText4();
    }
});