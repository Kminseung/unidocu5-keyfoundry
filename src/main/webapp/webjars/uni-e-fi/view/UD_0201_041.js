/**
 * UD_0201_041    반제처리
 * @module uni-e-fi/view/UD_0201_041
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        var searchGrid = $u.gridWrapper.getGrid('search-grid');
        gridObj2.fitToWindowSize();

        searchGrid.onBeforeOpenF4Dialog(function (columnKey, rowIndex) {
            if (columnKey === 'NEWKO') {
                var codeKey;
                if(searchGrid.$V('KOART', rowIndex) === 'K') codeKey = 'LIFNR';
                else if(searchGrid.$V('KOART', rowIndex) === 'S') codeKey = 'HKONT';
                else codeKey = 'KUNNR ';
                searchGrid.setF4CodeKey(columnKey, codeKey);
            }
        });

        searchGrid.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey === 'KOART') searchGrid.makePopupCellEmpty('NEWKO', rowIndex);
            else if (/^(WRBTR|NEWBS)$/.test(columnKey)) $efi.createStatementCommon.setAmountDisplay($u.buttons.runCustomHandler('getBalance'));
        });

        searchGrid.addRow();
        searchGrid.addRow();

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue) {
            if (newValue === undefined) {
                return gridObj.triggerChangeCell(columnKey, rowIndex, '', gridObj.$V(columnKey, rowIndex));
            }
            var targetRowIndex = $u.buttons.runCustomHandler('getTargetRowIndex');
            if (columnKey === 'SELECTED') {
                if (newValue === '1') gridObj.$V('WRBTR_I', rowIndex, gridObj.$V('WRBTR_J', rowIndex));
                else gridObj.$V('WRBTR_I', rowIndex, 0);
                gridObj.triggerChangeCell('WRBTR_I', rowIndex, 0, gridObj.$V('WRBTR_I', rowIndex));
            } else if (columnKey === 'WRBTR_I') {
                var isNewValueZero = !newValue || parseInt(newValue) === 0;
                gridObj.$V('SELECTED', rowIndex, isNewValueZero ? "0" : "1");
                var wrbtrI = $u.buttons.runCustomHandler('getTotalWRBTRI', gridObj);
                searchGrid.$V('NEWBS', targetRowIndex, wrbtrI < 0 ? 'H' : 'S');
                searchGrid.$V('WRBTR', targetRowIndex, wrbtrI < 0 ? -wrbtrI : wrbtrI);
                $efi.createStatementCommon.setAmountDisplay($u.buttons.runCustomHandler('getBalance'));
            }
        });

        gridObj2.onChangeCell(function (columnKey, rowIndex, oldValue, newValue) {
            if (newValue === undefined) {
                return gridObj2.triggerChangeCell(columnKey, rowIndex, '', gridObj2.$V(columnKey, rowIndex));
            }
            var targetRowIndex = 1;
            if (columnKey === 'SELECTED') {
                if (newValue === '1') gridObj2.$V('WRBTR_I', rowIndex, gridObj2.$V('WRBTR_J', rowIndex));
                else gridObj2.$V('WRBTR_I', rowIndex, 0);
                gridObj2.triggerChangeCell('WRBTR_I', rowIndex, 0, gridObj2.$V('WRBTR_I', rowIndex));
            } else if (columnKey === 'WRBTR_I') {
                var isNewValueZero = !newValue || parseInt(newValue) === 0;
                gridObj2.$V('SELECTED', rowIndex, isNewValueZero ? "0" : "1");
                var wrbtrI = $u.buttons.runCustomHandler('getTotalWRBTRI', gridObj2);
                searchGrid.$V('NEWBS', targetRowIndex, wrbtrI < 0 ? 'H' : 'S');
                searchGrid.$V('WRBTR', targetRowIndex, wrbtrI < 0 ? -wrbtrI : wrbtrI);
                $efi.createStatementCommon.setAmountDisplay($u.buttons.runCustomHandler('getBalance'));
            }
        });

        $u.buttons.addHandler({
            'doQuery': function () {
                searchGrid.asserts.rowSelected();
                var DATE = $u.get('DATE').getValue();
                var PRCTR = $u.get('PRCTR').getValue();
                var ZUONR = $u.get('ZUONR').getValue();

                var it_date = searchGrid.getSELECTEDJSONData().map(function (rowData) {
                    rowData['BUDAT_FR'] = DATE['fromDate'];
                    rowData['BUDAT_TO'] = DATE['toDate'];
                    rowData['PRCTR'] = PRCTR;
                    rowData['ZUONR'] = ZUONR;
                    if (rowData['KOART'] === 'K') rowData['LIFNR'] = rowData['NEWKO'];
                    else if(rowData['KOART'] === 'S') rowData['HKONT'] = rowData['NEWKO'];
                    else rowData['KUNNR'] = rowData['NEWKO'];
                    return rowData;
                });

                $nst.it_data_nsReturn('ZUNIEFI_3709', it_date, function (nsReturn) {
                    var ot_data1 = nsReturn.getTableReturn('OT_DATA1');
                    var ot_data2 = nsReturn.getTableReturn('OT_DATA2');
                    gridObj.setJSONData(ot_data1);
                    if(ot_data2.length !== 0) {
                        $(gridObj2).show();
                        $(gridObj).height(300);
                        $(window).resize();
                        gridObj2.setJSONData(ot_data2);
                    }
                    searchGrid.makeColumnReadOnly('SELECTED');
                    searchGrid.loopRowIndex(function (rowIndex) {
                        if (searchGrid.$V('SELECTED', rowIndex) === '1') {
                            var koart = searchGrid.$V('KOART', rowIndex);
                            searchGrid.$V('NEWBS', rowIndex, koart === 'K' ? 'H' : 'S');
                            $.each(searchGrid.getGridHeaders(), function (_, header) {
                                searchGrid.makeCellReadOnly(header['key'], rowIndex);
                            });
                            if (koart === 'S') searchGrid.makeCellEditable('WRBTR', rowIndex);
                        } else {
                            $.each(['WRBTR', 'PRCTR'], function (_, columnKey) {
                                searchGrid.makeCellEditable(columnKey, rowIndex);
                            });
                            searchGrid.triggerChangeCell('NEWKO', rowIndex, '', searchGrid.$V('NEWKO', rowIndex));
                        }
                    });
                });
            },
            'release': function () {
                $u.buttons.runCustomHandler('initializeSearchGrid', searchGrid);
                gridObj.clearGridData();
                gridObj2.clearGridData();
                $u.buttons.runCustomHandler('initializeGridObj2');
            },
            'createStatement': function () {
                if ($u.get('difference_amount').getValue() !== 0) throw '차변/대변의 합이 맞지 않습니다.';
                var params = $u.getValues();
                var selectedGridData = gridObj.getSELECTEDJSONData();
                var selectedGrid2Data = gridObj2.getSELECTEDJSONData();
                var it_gl = selectedGridData.concat(selectedGrid2Data);
                if (it_gl.length === 0) throw '미결항목을 하나 이상 선택해주세요';
                var tableParams = {
                    IT_DATA: searchGrid.getJSONData(),
                    IT_GL: it_gl
                };

                function isSame(gridData, column1, column2) {
                    var res = true;
                    $.each(gridData, function (_, data) {
                        if (data[column1] !== data[column2]) {
                            res = false;
                            return false;
                        }
                    });
                    return res;
                }

                params['PARTIAL'] = !isSame(selectedGridData, 'WRBTR_J', 'WRBTR_I') || !isSame(selectedGrid2Data, 'WRBTR_J', 'WRBTR_I') ? 'X' : '';
                params['ALL'] = isSame(selectedGridData, 'WRBTR', 'WRBTR_I') && isSame(selectedGrid2Data, 'WRBTR', 'WRBTR_I') ? 'X' : '';
                $nst.is_data_tableParams_os_docno('ZUNIEFI_3710', params, tableParams, function (docno) {
                    $efi.dialog.afterCreateStatementDialog.open(docno);
                });
            }
        });

        $u.buttons.addCustomHandler({
            initializeGridObj2: function() {
                $(gridObj2).hide();
                $(gridObj).height($(gridObj).height() + 453);
                $(window).resize();
            },
            initializeSearchGrid: function (gridObj) {
                gridObj.makeColumnEditable('SELECTED');
                var readOnlyTargets = ['KOSTL', 'PRCTR', 'WRBTR'];

                gridObj.loopRowIndex(function (rowIndex) {
                    gridObj.makePopupCellEmptyDisable('KOSTL', rowIndex);
                    gridObj.makePopupCellEmptyDisable('PRCTR', rowIndex);
                    gridObj.$V('WRBTR', rowIndex, 0);

                    $.each(gridObj.getGridHeaders(), function (_, header) {
                        if ($u.util.contains(header['key'], readOnlyTargets)) gridObj.makeCellReadOnly(header['key'], rowIndex);
                        else if (!/_TXT$/.test(header['key'])) gridObj.makeCellEditable(header['key'], rowIndex);
                    });
                });
                $efi.createStatementCommon.setAmountDisplay({
                    creditSum: 0,
                    debitSum: 0
                });
            },
            getBalance: function () {
                var creditSum = searchGrid.getJSONData().filter(function (data) {
                    return data['NEWBS'] === 'S';
                }).reduce(function (acc, data) {
                    return acc + (parseInt(data['WRBTR']) || 0);
                }, 0);
                var debitSum =  searchGrid.getJSONData().filter(function (data) {
                    return data['NEWBS'] === 'H';
                }).reduce(function (acc, data) {
                    return acc + (parseInt(data['WRBTR']) || 0);
                }, 0);
                return {creditSum : creditSum, debitSum: debitSum};
            },
            getTotalWRBTRI: function (gridObj) {
                var total = 0;
                gridObj.loopRowIndex(function (rowIndex) {
                    var wrbtrI = gridObj.$V('WRBTR_I', rowIndex) || 0;
                    wrbtrI = parseInt(wrbtrI);
                    if (wrbtrI === 0) return;
                    var shkzg = gridObj.$V('SHKZG', rowIndex);
                    total += (shkzg === 'S' ? -wrbtrI : wrbtrI);
                });
                return total;
            },
            getTargetRowIndex: function () {
                var indexes = searchGrid.getSelectedRowIndexes();
                return indexes.length === 1 ? indexes[0] : 0;
            }
        });

        return function () {
            $u.get('DATE').setEmptyValue();
            $u.buttons.runCustomHandler('initializeSearchGrid', searchGrid);
            $u.buttons.runCustomHandler('initializeGridObj2');
        }
    }
});