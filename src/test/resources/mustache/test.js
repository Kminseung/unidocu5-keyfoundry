/**
 * @module vendorCustom\daedong\view\customizeUD_0220_132
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('UD_0220_132-grid2');
        var gridView = gridObj2._rg.gridView;
        var formFineUploader;
        var pageParams = $u.page.getPageParams();

        gridObj.setSortEnable(false);
        gridObj2.setSortEnable(false);
        gridObj.setHeaderCheckBox('SELECTED', true);

        $ewf.UD_0220_002.fileAttachableInGrid = true;
        formFineUploader = $u.fileUI.getFineUploader();

        gridObj2.setGroupHeader([
            {groupText: '출장지', childColumns: ['LAND1', 'LAND1_', 'LAND1_TXT', 'D_GRADE', 'WAERSF', 'WAERS']},
            {groupText: '출장기간', childColumns: ['FDATE', 'TDATE', 'TR_NIGHT', 'TR_DAY']},
            {groupText: '숙박비', childColumns: ['ROOM_EXP_A', 'ROOM_EXP_T']},
            {groupText: '식비', childColumns: ['FOOD_EXP_A', 'FOOD_EXP_T']},
            {groupText: '활동비', childColumns: ['DAY_EXP_A', 'DAY_EXP_T']},
            {groupText: '기타', childColumns: ['ETC_EXP_A', 'ETC_EXP_T']},
            {groupText: '교통비', childColumns: ['TRAN_EXP_A', 'TRAN_EXP_T']}
        ]);

        gridObj.setComboOptions('WAERSF', [
            {value: 'EUR', text: ' '},
            {value: 'USD', text: ' '},
            {value: 'KRW', text: ' '}
        ]);
        gridObj.setColumnNumberPrecision('KURSF', 2);
        gridObj2.setColumnNumberPrecision('KURSF', 2);

        $.each(['ROOM_EXP_A', 'FOOD_EXP_A', 'DAY_EXP_A', 'ETC_EXP_A', 'TRAN_EXP_A', 'SUM_EXP_A'], function (_, columnKey) {
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

        gridObj2.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            var pernr = gridObj2.$V('PERNR', rowIndex);
            var land1 = gridObj2.$V('LAND1', rowIndex);
            if (/DATE$/.test(columnKey) && gridObj2.getGridHeader('TR_DAY')) {
                $u.buttons.runCustomHandler('calculateDate', rowIndex);
            }
            if (/WAERSF/.test(columnKey)) {
                var waersf = gridObj2.$V('WAERSF', rowIndex);
                gridObj.loopRowIndex(function (index) {
                    if (gridObj.$V('PERNR', index) === pernr && gridObj.$V('LAND1', index) === land1 && gridObj.$V('WRBTRF', index) === '') {
                        gridObj.$V('WAERSF', index, waersf);
                        gridObj.triggerChangeCell('WAERSF', index);
                    }
                });
                if (gridObj2.getGridHeader('TR_DAY')) {
                    $u.buttons.runCustomHandler('calculateDate', rowIndex);
                }
            }
            if (/LAND1/.test(columnKey) && jsonObj) {
                jsonObj ? gridObj2.$V('D_GRADE', rowIndex, jsonObj['D_GRADE']) : gridObj2.$V('D_GRADE', rowIndex, '');
                jsonObj ? gridObj2.$V('WAERS', rowIndex, jsonObj['WAERS']) : gridObj2.$V('WAERS', rowIndex, '');
                jsonObj ? gridObj2.$V('WAERSF', rowIndex, jsonObj['WAERSF']) : gridObj2.$V('WAERSF', rowIndex, '');
                var jsonData = gridObj2.getJSONData();
                var isValid = jsonData.filter(function (data) {
                    return data['PERNR'] === pernr && data['LAND1'] === land1;
                }).length <= 1;
                if (!isValid) {
                    gridObj2.$V('LAND1', rowIndex, '');
                    gridObj2.$V('LAND1_TXT', rowIndex, '');
                    unidocuAlert($mls.getByCode('M_UD_0220_122_alreadyExistsCity'));
                }
            }

            gridObj2.$V('SELECTED', rowIndex, '1');
        });

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue) {
            function setWrbtrCalculated() {
                var fWrbtr = Number(gridObj.$V('KURSF', rowIndex)) * Number(gridObj.$V('WRBTRF', rowIndex));
                gridObj.$V('WRBTR', rowIndex, fWrbtr);
            }

            if (columnKey === 'EVI_GB') {
                gridObj.$V('EVKEY', rowIndex, '');
                gridObj.setImage('EVKEY_', rowIndex, '');
                var evi_gb = gridObj.$V('EVI_GB', rowIndex);
                var find = gridObj2.getJSONData().filter(function (data) {
                    return data['PERNR'] === gridObj.$V('PERNR', rowIndex) && data['LAND1'] === gridObj.$V('LAND1', rowIndex);
                });
                if (evi_gb === 'C') {
                    gridObj.$V('WAERSF', rowIndex, 'KRW');
                    gridObj.triggerChangeCell('WAERSF', rowIndex);
                    gridObj.$V('WRBTRF', rowIndex, '');
                    if (gridObj.$V('EXP_GB', rowIndex) === 'D') {
                        $.each(['DEPART', 'DESTIN', 'TRAN_TYPE'], function (_, item) {
                            gridObj.makeCellReadOnly(item, rowIndex);
                        });
                    }
                    var defaultFormValues = null;
                    if ($u.programSetting.getValue('법인카드 내역조회 사용자 검색 조건 선택된 행데이터로 설정') === 'true') {
                        defaultFormValues = {
                            PERNR__DIALOG: gridObj.$V('PERNR', rowIndex),
                            PERNR__DIALOG_TXT: gridObj.$V('PERNR_TXT', rowIndex)
                        }
                    }
                    $u.buttons.runCustomHandler('evidenceSelectDialog', columnKey, rowIndex, defaultFormValues);
                    gridObj.triggerChangeCell('EXP_GB', rowIndex, '', gridObj.$V('EXP_GB', rowIndex));
                } else if (evi_gb === '') {
                    gridObj.$V('MWSKZ', rowIndex, 'ZZ');
                    gridObj.$V('WAERSF', rowIndex, find[0]['WAERSF']);
                    gridObj.triggerChangeCell('WAERSF', rowIndex);
                } else if (evi_gb === 'E') {
                    gridObj.setImage('EVKEY_', rowIndex, '/images/btn/btn_view.gif');
                    gridObj.$V('MWSKZ', rowIndex, 'WZ');
                    gridObj.$V('WAERSF', rowIndex, find[0]['WAERSF']);
                    gridObj.triggerChangeCell('WAERSF', rowIndex);
                }
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
            } else if (columnKey === 'EXP_DIVIDE') gridObj.$V(columnKey, rowIndex, !oldValue ? '0' : oldValue);
            if (columnKey === 'WAERSF') {
                if (gridObj.$V('WAERSF', rowIndex) === 'KRW') gridObj.$V('KURSF', rowIndex, '1');
                else if (gridObj.$V('WAERSF', rowIndex) === 'USD') gridObj.$V('KURSF', rowIndex, gridObj.$V('USD_KURSF', rowIndex));
                else gridObj.$V('KURSF', rowIndex, gridObj.$V('EUR_KURSF', rowIndex));
                setWrbtrCalculated();
            }
            var $grid_waersf;
            if ($u.util.contains(columnKey, ['BUDAT', 'WAERSF'])) {
                $grid_waersf = gridObj.getJSONDataByRowIndex(rowIndex)['WAERSF'];
                var $grid_budat = gridObj.getJSONDataByRowIndex(rowIndex)['BUDAT'];
                if (($grid_waersf && $grid_budat) === '') return;
                setWrbtrCalculated();
            }
            if ($u.util.contains(columnKey, ['WAERSF', 'KURSF', 'WRBTRF'])) {
                $grid_waersf = gridObj.getJSONDataByRowIndex(rowIndex)['WAERSF'];
                var $grid_kursf = gridObj.getJSONDataByRowIndex(rowIndex)['KURSF'];
                var $grid_wrbtrf = gridObj.getJSONDataByRowIndex(rowIndex)['WRBTRF'];
                if (($grid_waersf && $grid_kursf && $grid_wrbtrf) === '') return;
                setWrbtrCalculated();
            }
            if (columnKey === 'EXP_GB') {
                if (gridObj.$V('BELNR', rowIndex) === '') {
                    if (gridObj.$V('EXP_GB', rowIndex) !== 'D' || gridObj.$V('EVI_GB', rowIndex) === 'C') {
                        $.each(['DEPART', 'DESTIN', 'TRAN_TYPE'], function (_, item) {
                            gridObj.$V(item, rowIndex, '');
                        });
                    }
                } else {
                    $.each(['DEPART', 'DESTIN', 'TRAN_TYPE'], function (_, item) {
                        gridObj.$V(item, rowIndex, '');
                    });
                    if (gridObj.$V('EVI_GB', rowIndex) !== 'C' && gridObj.$V('EXP_GB', rowIndex) === 'D') {
                        gridObj.$V('EXP_GB', rowIndex, oldValue);
                        $u.buttons.runCustomHandler('setSummaryFormValues');
                        unidocuAlert($mls.getByCode('M_UD_0220_122_gridObjNotSelected_trans'));
                    }
                }
            }
            $u.buttons.runCustomHandler('controlReadonlyState', rowIndex);
            $u.buttons.runCustomHandler('setSummaryFormValues');
        });

        var $u_bt_gbn = $u.get('BT_GBN');
        if ($u_bt_gbn) $u_bt_gbn.$el.change(function () {
            $u.get('HKONT').setOptions($u.f4Data.getCodeComboOption($u.get('HKONT').params['codeKey'], {'BT_GBN': $u_bt_gbn.getValue()}));
        });

        var $u_hkont = $u.get('HKONT');
        if ($u_hkont) {
            $u_hkont.$el.change(function () {
                gridObj.loopRowIndex(function (rowIndex) {
                    gridObj.$V('HKONT', rowIndex, $u_hkont.getValue());
                    gridObj.$V('HKONT_TXT', rowIndex, $u_hkont.getTextValue());
                });
            });
        }

        var $u_kostl = $u.get('KOSTL');
        if ($u_kostl) {
            $u_kostl.$el.change(function () {
                gridObj.loopRowIndex(function (rowIndex) {
                    gridObj.$V('KOSTL', rowIndex, $u_kostl.getValue());
                    gridObj.$V('KOSTL_TXT', rowIndex, $u_kostl.getTextValue());
                });
            });
        }

        $u.buttons.addHandler({
            "addRow": function () {
                gridObj2.asserts.rowSelected($mls.getByCode('M_UD_0220_122_gridObjNotSelected'));
                gridObj2.validateSELECTEDGridRequired();
                gridObj.addRow();
                var selectedjsonData = gridObj2.getSELECTEDJSONData()[0];
                var paramMap = {
                    HKONT: $u_hkont.getValue(),
                    HKONT_TXT: $u_hkont.getTextValue(),
                    KOSTL: $u_kostl.getValue(),
                    KOSTL_TXT: $u_kostl.getTextValue(),
                    MWSKZ: 'ZZ'
                };
                gridObj.setRowDataByJSONObj(gridObj.getActiveRowIndex(), $.extend(selectedjsonData, paramMap));
            },
            "addEmployee": function () {
                if (!gridObj2.getRowCount()) {
                    $u.dialog.f4CodeDialog.open({
                        popupKey: 'PERNR',
                        codePopupCallBack: function (code) {
                            $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: code}, function (os_data) {
                                gridObj2.addRowByJSONData($.extend(os_data, {
                                    PERNR_TXT: os_data['SNAME'],
                                    POS_KEY: os_data['POS_KEY']
                                }));
                            });
                        }
                    });
                } else {
                    var selectedJsonData = gridObj2.getJSONData()[0];
                    gridObj2.addRowByJSONData({
                        PERNR: selectedJsonData['PERNR'],
                        PERNR_TXT: selectedJsonData['PERNR_TXT'],
                        POS_KEY: selectedJsonData['POS_KEY']
                    });
                }
            },
            "deleteEmployee": function () {
                gridObj2.asserts.rowSelected();
                var selectedPERNR = gridObj2.getSELECTEDJSONData()[0]['PERNR'];
                var selectedLAND1 = gridObj2.getSELECTEDJSONData()[0]['LAND1'];
                if (gridObj.$F(selectedPERNR, 'PERNR').length > 0 && gridObj.$F(selectedLAND1, 'LAND1').length > 0)
                    throw $mls.getByCode('M_DRAFT_0061_deleteEmployee') + gridObj2.getSELECTEDJSONData()[0]['PERNR_TXT'] + ' / ' + gridObj2.getSELECTEDJSONData()[0]['LAND1_TXT'];
                gridObj2.deleteSelectedRows();
            },
            'createStatement': function () {
                $u.validateRequired('header-invoicer-content');
                gridObj2.validateSELECTEDGridRequired();
                gridObj.asserts.rowSelected();
                gridObj.validateRequiredBySelected();
                $u.buttons.runCustomHandler('gridCellRequired');
                var tableData = gridObj.getJSONData();
                if ($u.buttons.runCustomHandler('isBELNRCreated', gridObj.getSELECTEDJSONData())) throw '선택된 건에 전표 생성된 내역이 포함되어 있습니다.';
                if ($u.programSetting.getValue('isAttachmentRequired') === 'true') $u.buttons.runCustomHandler('validateAttachmentsInGrid');
                if (tableData.length < 1) throw $mls.getByCode('M_noDataToSave');
                $u.buttons.runCustomHandler('saveDocument2', $u.buttons.runCustomHandler('getDocument'))
            },
            'SAVE': function () {
                $u.validateRequired('header-invoicer-content');
                gridObj.validateSELECTEDGridRequired();
                gridObj2.validateSELECTEDGridRequired();
                $u.buttons.runCustomHandler('gridCellRequired');
                $u.buttons.runCustomHandler('saveDocument', $u.buttons.runCustomHandler('getDocument'))
            }
        });

        $u.buttons.addCustomHandler({
            "calculateDate": function (rowIndex) {
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
                if (nights >= 0) {
                    gridObj2.$V('TR_DAY', rowIndex, nights + 1);
                    gridObj2.$V('TR_NIGHT', rowIndex, nights);
                    var activeRowJsonData = gridObj2.getJSONData()[rowIndex];
                    $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('CalculateFunction'), {}, {IT_HEAD: [activeRowJsonData]}, function (nsReturn) {
                        var ot_head = nsReturn.getTableReturn('OT_HEAD');
                        var jsonData = gridObj2.getJSONData();
                        jsonData[rowIndex] = $.extend(activeRowJsonData, ot_head[0]);
                        gridObj2.setJSONData(jsonData);
                        $u.buttons.runCustomHandler('setEXP_T', rowIndex);

                        if ($u.programSetting.getValue('정액 기준 사용여부') === 'true') {
                            $u.buttons.runCustomHandler('setGridExpense', jsonData[rowIndex]);
                        }
                    });
                } else {
                    $u.buttons.runCustomHandler('setEmptyTargets', rowIndex);
                }
            },
            "setEmptyTargets": function (rowIndex) {
                var emptyTargets = ['TR_DAY', 'TR_NIGHT', 'ROOM_EXP', 'FOOD_EXP', 'DAY_EXP', 'ETC_EXP', 'TRAN_EXP', 'SUM_EXP'];
                $.each(emptyTargets, function (_, item) {
                    gridObj2.$V(item, rowIndex, '');
                });
            },
            "setGridExpense": function (data) {
                var mappingKey = {ROOM_EXP: 'A', DAY_EXP: 'B', ETC_EXP: 'C', TRAN_EXP: 'D', FOOD_EXP: 'E'};

                function findTargetIndex(pernr, land1, exp_gb) {
                    var index = -1;
                    gridObj.loopRowIndex(function (rowIndex) {
                        if (gridObj.$V('PERNR', rowIndex) === pernr && gridObj.$V('LAND1', rowIndex) === land1 && gridObj.$V('EXP_GB', rowIndex) === exp_gb) {
                            index = rowIndex;
                        }
                    });
                    return index;
                }

                $.each(data, function (columnKey, item) {
                    if ($u.util.contains(columnKey, ['DAY_EXP']) && Number(item) > '0') {
                        var targetIndex = findTargetIndex(data['PERNR'], data['LAND1'], mappingKey[columnKey]);
                        if (targetIndex < 0) gridObj.addRow();
                        else gridObj.setActiveRowIndex(targetIndex);
                        gridObj2.$V('SELECTED', gridObj2.getActiveRowIndex(), '1');
                        var paramMap = {
                            HKONT: $u_hkont.getValue(),
                            HKONT_TXT: $u_hkont.getTextValue(),
                            KOSTL: $u_kostl.getValue(),
                            KOSTL_TXT: $u_kostl.getTextValue(),
                            MWSKZ: 'ZZ',
                            WAERS: 'KRW',
                            EXP_GB: mappingKey[columnKey],
                            WRBTR: item,
                            AUTO_ROW: 'X'
                        };
                        data['WRBTRF'] = data['DAY_EXP_F'];
                        gridObj.setRowDataByJSONObj(gridObj.getActiveRowIndex(), $.extend(data, paramMap));
                        gridObj.makeCellReadOnly('EXP_GB', gridObj.getActiveRowIndex());
                        gridObj.makeCellReadOnly('DEPART', gridObj.getActiveRowIndex());
                        gridObj.makeCellReadOnly('DESTIN', gridObj.getActiveRowIndex());
                        gridObj.makeCellReadOnly('WAERSF', gridObj.getActiveRowIndex());
                    }
                });
                $u.buttons.runCustomHandler('setSummaryFormValues');
            },
            'setGridData': function (gridData, useDelete) {
                if (useDelete) {
                    gridObj.setJSONData(gridData);
                    $u.buttons.runCustomHandler('setSummaryFormValues');
                } else {
                    gridObj.setJSONData(gridData['OT_DATA']);
                    gridObj2.setJSONData(gridData['OT_HEAD']);
                    $u.buttons.runCustomHandler('setSummaryFormValues');
                }
                $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                $ewf.UD_0220_002.setGridEvidenceImage();
            },
            'setSummaryFormValues': function () {
                var expMappingTable = {
                    A: 'ROOM_EXP',
                    B: 'DAY_EXP',
                    C: 'ETC_EXP',
                    D: 'TRAN_EXP',
                    E: 'FOOD_EXP'
                }

                function getSummaries(jsonData) {
                    function getOrCreate(obj, key, initValue) {
                        if (!obj[key]) obj[key] = initValue;
                        return obj[key];
                    }

                    return jsonData.reduce(function (summaries, data) {
                        var perPernr = getOrCreate(summaries, data['PERNR'], {});
                        var perLand = getOrCreate(perPernr, data['LAND1'], {});
                        var perExpGb = getOrCreate(perLand, data['EXP_GB'], 0);
                        perLand[data['EXP_GB']] = perExpGb + parseInt(data['WRBTR'] || 0);
                        return summaries;
                    }, {});
                }

                function setSummaries(summaries, mappingTable) {
                    var jsonData = gridObj2.getJSONData();
                    $.each(jsonData, function (_, data) {
                        var perPernr = summaries[data['PERNR']];
                        var perLand = perPernr ? perPernr[data['LAND1']] : undefined;
                        $.each(mappingTable, function (_, columnKey) {
                            data[columnKey + '_A'] = 0;
                            data[columnKey] = parseInt(data[columnKey]);
                        });
                        if (!perLand) return true;
                        $.each(perLand, function (exp_gb, wrbtr) {
                            data[mappingTable[exp_gb] + '_A'] = wrbtr;
                        });
                    });
                    var total = 0;
                    var limited = ['ROOM_EXP', 'FOOD_EXP', 'DAY_EXP'];
                    var unlimited = ['ETC_EXP', 'TRAN_EXP']; // 무제한
                    $.each(jsonData, function (index, item) {
                        total = item['ROOM_EXP_A'] + +item['FOOD_EXP_A'] + item['DAY_EXP_A'] + item['ETC_EXP_A'] + item['TRAN_EXP_A'];
                        item['SUM_EXP_A'] = total;
                    });

                    $.each(jsonData, function (_, item) {
                        item['SUM_EXP'] = 0;
                        $.each(limited, function (_, expName) {
                            if (item[expName + '_FLAG'] === 'X') item[expName] = item[expName + '_A'];
                            item['SUM_EXP'] += item[expName];
                        });
                        $.each(unlimited, function (_, expName) {
                            item[expName] = item[expName + '_A'];
                            item['SUM_EXP'] += item[expName];
                        });
                    });
                    gridObj2.setJSONData(jsonData);
                    gridObj2.loopRowIndex(function (rowIndex) {
                        $u.buttons.runCustomHandler('setEXP_T', rowIndex);
                    });
                }

                setSummaries(getSummaries(gridObj.getJSONData()), expMappingTable);
            },
            "setEXP_T": function (rowIndex) {
                var ot_head = gridObj2.getJSONDataByRowIndex(rowIndex);
                var total = Number(ot_head['ROOM_EXP']) + Number(ot_head['FOOD_EXP']) + Number(ot_head['DAY_EXP']) + Number(ot_head['ETC_EXP']) + Number(ot_head['TRAN_EXP']);
                var total_f = Number(ot_head['ROOM_EXP_F']) + Number(ot_head['FOOD_EXP_F']) + Number(ot_head['DAY_EXP_F']) + Number(ot_head['ETC_EXP_F']) + Number(ot_head['TRAN_EXP_F']);
                gridObj2.$V('SUM_EXP', rowIndex, total);
                gridObj2.$V('SUM_EXP_F', rowIndex, total_f);
                var room_exp = Number(gridObj2.$V('ROOM_EXP', rowIndex)).toLocaleString();
                var room_exp_f = Number(gridObj2.$V('ROOM_EXP_F', rowIndex)).toLocaleString();
                var food_exp = Number(gridObj2.$V('FOOD_EXP', rowIndex)).toLocaleString();
                var food_exp_f = Number(gridObj2.$V('FOOD_EXP_F', rowIndex)).toLocaleString();
                var day_exp = Number(gridObj2.$V('DAY_EXP', rowIndex)).toLocaleString();
                var day_exp_f = Number(gridObj2.$V('DAY_EXP_F', rowIndex)).toLocaleString();
                var etc_exp = Number(gridObj2.$V('ETC_EXP', rowIndex)).toLocaleString();
                var etc_exp_f = Number(gridObj2.$V('ETC_EXP_F', rowIndex)).toLocaleString();
                var tran_exp = Number(gridObj2.$V('TRAN_EXP', rowIndex)).toLocaleString();
                var tran_exp_f = Number(gridObj2.$V('TRAN_EXP_F', rowIndex)).toLocaleString();
                var sum_exp = Number(gridObj2.$V('SUM_EXP', rowIndex)).toLocaleString();
                var sum_exp_f = Number(gridObj2.$V('SUM_EXP_F', rowIndex)).toLocaleString();
                var sign = '';
                if (gridObj2.$V('WAERSF', rowIndex) === 'USD') sign = '$ ';
                else if (gridObj2.$V('WAERSF', rowIndex) === 'EUR') sign = '€ ';
                else if (gridObj2.$V('WAERSF', rowIndex) === 'JPY') sign = '¥ ';
                gridObj2.$V('ROOM_EXP_T', rowIndex, '₩ ' + room_exp + '\n' + sign + room_exp_f);
                gridObj2.$V('FOOD_EXP_T', rowIndex, '₩ ' + food_exp + '\n' + sign + food_exp_f);
                gridObj2.$V('DAY_EXP_T', rowIndex, '₩ ' + day_exp + '\n' + sign + day_exp_f);
                gridObj2.$V('ETC_EXP_T', rowIndex, '₩ ' + etc_exp + '\n' + sign + etc_exp_f);
                gridObj2.$V('TRAN_EXP_T', rowIndex, '₩ ' + tran_exp + '\n' + sign + tran_exp_f);
                gridObj2.$V('SUM_EXP_T', rowIndex, '₩ ' + sum_exp + '\n' + sign + sum_exp_f);
            },
            "evidenceSelectDialog": function (columnKey, rowIndex, defaultFormValues) {
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
                        var paramMap = {
                            HKONT: $u.get('HKONT').getValue(),
                            HKONT_TXT: $u.get('HKONT').getTextValue(),
                            KOSTL: $u.get('KOSTL').getValue(),
                            KOSTL_TXT: $u.get('KOSTL').getTextValue(),
                            WRBTRF: data['TOTAL']
                        }
                        data = $.extend(data, paramMap)
                        gridObj.setRowDataByJSONObj(rowIndex, data);
                        gridObj.setImage('EVKEY_', rowIndex, '/images/btn/icon_ev.gif');
                        gridObj.fillPopupText();
                        $u.buttons.runCustomHandler('setSummaryFormValues');
                    },
                    closeWithoutSelectCallback: function () {
                        gridObj.$V(columnKey, rowIndex, '');
                        $u.buttons.runCustomHandler('setGrid3WRBTREditable');
                    },
                    defaultFormValues: defaultFormValues
                });
                var $u_kostl = $u.get('KOSTL__DIALOG');
                if ($u.get('CTYPE__DIALOG')) {
                    $u.get('CTYPE__DIALOG').$el.change(function () {
                        if ($u.get('CTYPE__DIALOG').getValue() === 'A') {
                            $u_kostl.setThText('처리팀');
                            $u_kostl.setValue({
                                code: staticProperties.user['KOSTL'],
                                text: staticProperties.user['KOSTL_TXT']
                            });
                        } else {
                            $u_kostl.setThText('처리자');
                            $u_kostl.setValue({
                                code: staticProperties.user['PERNR'],
                                text: staticProperties.user['SNAME']
                            });
                        }
                        $u_kostl.params['codeKey'] = $u.get('CTYPE__DIALOG').getValue() === 'A' ? 'KOSTL' : 'PERNR';
                        $u_kostl.$el.change();
                    }).change();
                }

                if ($u_kostl) {
                    $u_kostl.setValue({
                        code: $u.get('KOSTL').getValue(),
                        text: $u.get('KOSTL').getTextValue()
                    });
                    $u_kostl.$el.change(function () {
                        var value = $u_kostl.getValue();
                        var codeKey = $u_kostl.params['codeKey'];
                        var param = {'KOSTL': value};
                        if (codeKey === 'PERNR') {
                            param = {'PERNR': value};
                        }
                        $u.get('CARDNO__DIALOG').setOptions($u.f4Data.getCodeComboOption('CARDNO__DIALOG', param));
                    }).change();
                }
            },
            'gridCellRequired': function () {
                gridObj.loopRowIndex(function (rowIndex) {
                    if (gridObj.$V('EXP_GB', rowIndex) === 'D') {
                        $.each(['DEPART', 'DESTIN', 'TRAN_TYPE'], function (_, item) {
                            gridObj.validateCellRequired(item, rowIndex);
                        });
                    }
                });
            },
            'saveDocument2': function (doc) {
                doc['formData'] = $.extend(doc['formData'], {BUPLA: $u.get('BUPLA').getValue()});
                $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {
                    IT_HEAD: doc['gridData']['OT_HEAD'],
                    IT_DATA: doc['gridData']['OT_DATA']
                }, function (nsReturn) {
                    var paramMap = $.extend({}, doc['formData'], {REQNO: nsReturn.getExportMap('OS_DATA')['REQNO']});
                    $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                        .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                        .then(function (document) {
                            $u.setValues(paramMap);
                            doc = document;
                            var returnMessage = '';
                            gridObj.loopRowIndex(function (rowIndex) {
                                gridObj.$V('SEQ', rowIndex, doc['gridData']['OT_DATA'][rowIndex]['SEQ']);
                            });
                            if ($u.programSetting.getValue('기준 금액 체크 사용여부') === 'true') {
                                doc['formData'] = $.extend(doc['formData'], {CHECK_EXP: 'X'});
                            }
                            doc['formData'] = $.extend(doc['formData'], {
                                BUPLA: $u.get('BUPLA').getValue(),
                                KOSTL: $u.get('KOSTL').getValue(),
                                HKONT: $u.get('HKONT').getValue()
                            });
                            $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), doc['formData'], {
                                IT_HEAD: doc['gridData']['OT_HEAD'],
                                IT_DATA: gridObj.getSELECTEDJSONData()
                            }, function (nsReturn) {
                                returnMessage = nsReturn.getReturnMessage();
                                $u.buttons.runCustomHandler('fetchDocument2', paramMap)
                                    .then($u.buttons.getCustomHandler('convertNSReturnToDocument'))
                                    .then(function (document) {
                                        doc = document;
                                        return $u.buttons.runCustomHandler('fillThePageWithDocument', document)
                                    }).then(function () {
                                    if ($u.buttons.runCustomHandler('haveAllLinesBELNR', gridObj.getJSONData()))
                                        $u.buttons.runCustomHandler('showResultDialog', doc['formData']);
                                    else if (returnMessage) unidocuAlert(returnMessage);
                                })
                            })
                        })
                });
            },
            'getDocument': function () {
                var is_data = $u.getValues();
                is_data['EVI_SEQ'] = formFineUploader.getFileGroupId();
                $u.buttons.runCustomHandler('setSummaryFormValues');
                return {
                    'EVI_SEQ': is_data['EVI_SEQ'],
                    'formData': is_data,
                    'gridData': {OT_DATA: gridObj.getJSONData(), OT_HEAD: gridObj2.getJSONData()}
                }
            },
            'setRowsReadOnlyIfBELNRIsExistsByRowIndex': (function () {
                var columnKeys = gridObj.getGridHeaders().map(function (header) {
                    return header['key'];
                }).filter(function (columnKey) {
                    return columnKey !== 'SELECTED';
                });
                return function (rowIndex) {
                    var isGronoCreated = $u.get('GRONO').getValue() !== '';
                    var excludes = isGronoCreated ? [] : $u.programSetting.getValue('editableColumnsEvenAfterBELNRHasCreated');
                    if (isGronoCreated) $ewf.UD_0220_002.fileAttachableInGrid = false;
                    if (gridObj.$V('BELNR', rowIndex)) {
                        columnKeys.forEach(function (header) {
                            if ($u.util.contains(header, excludes)) return;
                            gridObj.makeCellReadOnly(header, rowIndex);
                        });
                    }
                };
            })(),
            "controlReadonlyState": function (rowIndex) {
                var ediTableColumns = ['TRAN_TYPE', 'DEPART', 'DESTIN', 'WAERSF', 'KURSF', 'WRBTRF', 'WRBTR'];
                var readOnlyColumns = [];
                var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
                if (rowData['BELNR']) return $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExistsByRowIndex', rowIndex);
                if (rowData['EVI_GB'] === 'C') {
                    readOnlyColumns = readOnlyColumns.concat('TRAN_TYPE', 'DEPART', 'DESTIN', 'WAERSF', 'KURSF', 'WRBTRF', 'WRBTR');
                } else {
                    if (rowData['EXP_GB'] !== 'D') {
                        readOnlyColumns = readOnlyColumns.concat('TRAN_TYPE', 'DEPART', 'DESTIN');
                        if (rowData['AUTO_ROW'] === 'X') readOnlyColumns = readOnlyColumns.concat('WAERSF');
                    }
                }
                $.each(ediTableColumns, function (_, columns) {
                    gridObj.makeCellEditable(columns, rowIndex);
                });
                $.each(readOnlyColumns, function (_, columns) {
                    gridObj.makeCellReadOnly(columns, rowIndex);
                });
            }
        });

        var grid2ColumnList = ['ROOM_EXP_T', 'FOOD_EXP_T', 'DAY_EXP_T', 'ETC_EXP_T', 'TRAN_EXP_T', 'SUM_EXP_T'];
        $.each(grid2ColumnList, function (_, item) {
            gridObj2._rg.setColumnProperty(item, "styles", {textWrap: 'explicit'});
        });

        if ($.isEmptyObject(pageParams)) {
            $nst.is_data_os_data('ZUNIEWF_1042', {
                IS_KEY_PROGRAM_ID: $u.page.getPROGRAM_ID(),
                PERNR: staticProperties.user['PERNR']
            }, function (os_data) {
                gridObj2.addRowByJSONData({
                    PERNR: staticProperties.user['PERNR'],
                    PERNR_TXT: staticProperties.user['SNAME'],
                    POS_KEY: os_data['POS_KEY']
                });
            });
        }
        if (pageParams['REQNO'] || pageParams['REQNO_A']) {
            $u.setValues(pageParams);
            if (pageParams['OT_DATA']) $u.buttons.runCustomHandler('setGridData', pageParams);
            $u.buttons.runCustomHandler('setRowsReadOnlyIfBELNRIsExists');
        }
        $u.fileUI.load(pageParams['EVI_SEQ'], false);
        if (pageParams['GRONO']) {
            $u.makeReadOnlyForm('header-invoicer-content');
            $u.fileUI.getFineUploader().setReadOnly(true);
            $('#uni-buttons, #uni-buttons2').hide();
            $('#uni-grid_buttons').hide();
            gridObj2.makeReadOnlyGrid();
            gridObj.makeReadOnlyGrid();
        }
        if (pageParams['disableEditingStatement'] || pageParams['GRONO']) $u.buttons.runCustomHandler('disableEditingStatement');
        $('#file-attach-content').on('fileCountChange', function () {
            var fineUploader = $u.fileUI.getFineUploader();
            fineUploader.setContentsVisible(fineUploader.getFileCount() > 0);
        });
    }
});