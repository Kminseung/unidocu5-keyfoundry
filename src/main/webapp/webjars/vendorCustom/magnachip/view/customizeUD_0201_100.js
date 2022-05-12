/**
 * @module vendorCustom/magnachip/view/customizeUD_0201_100
 */

define([], function () {
    return function (initFn) {
        initFn();
        $('#unidocu-td-PERNR').change(function () {
            $magnachip.magnaPernrComboOption('CARDNO');
        })
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if (columnKey !== 'SELECTED') gridObj.$V('SELECTED', rowIndex, '1');
            if (columnKey === 'MWSKZ') $u.buttons.runCustomHandler('changeMWSKZ', rowIndex);
            if (columnKey === 'TAX') $u.buttons.runCustomHandler('changeTAX', rowIndex);
            $efi.createStatement.setGridBudget(columnKey, rowIndex);
            if (columnKey === 'KOSTL') {
                var kostl = gridObj.$V(columnKey, rowIndex);
                if (kostl) {
                    if (jsonObj && jsonObj['AUFNR']) gridObj.$V('AUFNR', rowIndex, jsonObj['AUFNR']);
                    if (jsonObj && jsonObj['AUFNR_TXT']) gridObj.$V('AUFNR_TXT', rowIndex, jsonObj['AUFNR_TXT']);
                }
            }
            if (columnKey === 'HKONT') {
                if ($u.programSetting.getValue('useADD_DATA') === 'true') {
                    $efi.addDataHandler.handleADD_DATAKeyChange(rowIndex);
                }
                $u.buttons.runCustomHandler('setMWSKZ_By_HKONT_F4', columnKey, rowIndex, jsonObj);
                $u.buttons.runCustomHandler('changeMWSKZ', rowIndex);
            }
        });


        gridObj.onCellClick(function (columnKey, rowIndex) {
            $magnachip.UD_0201_100EventHandler.gridCellClick(columnKey, rowIndex);
        })

        $u.buttons.addHandler({
            "is_data_ot_data": function () {
                var $self = $(this);
                var mwskzList = []
                $nst.is_data_ot_data($self.data('funcname'), $u.getValues('search-condition'), function (ot_data) {
                    $.each(ot_data, function (index, item) {
                        item['_EVI_SEQ'] = '/images/btn/btn_view.gif';
                    });
                    $u.gridWrapper.getGrid().setJSONData(ot_data);
                    $magnachip.handleEVIKBIconVisible()
                    gridObj.loopRowIndex(function (rowIndex) {
                        mwskzList.push(gridObj.$V('MWSKZ', rowIndex));
                    });
                    gridObj.loopRowIndex(function (rowIndex) {
                        gridObj.$V('TAX_READ_ONLY', rowIndex, gridObj.$V('TAX', rowIndex));
                    });
                });

            },
            "createStatement": function () {
                gridObj.asserts.rowSelected();
                gridObj.validateSELECTEDGridRequired();

                var gridData = gridObj.getSELECTEDJSONData();

                if ($u.programSetting.getValue('useADD_DATA') === 'true') {
                    $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                        $efi.addDataHandler.validateAddDataByRowIndex(rowIndex);
                        $efi.addDataHandler.setADD_DATA(gridData);
                    });
                }
                $nst.is_data_it_data_nsReturn($u.programSetting.getValue('setCreateStatementFunction'), $u.getValues(), gridData, function (nsReturn) {
                    var message = nsReturn.getReturnMessage();
                    var returnType = nsReturn.getReturnType();
                    var ot_data = nsReturn.getTableReturn('OT_DATA');

                    if (gridObj.getGridHeader('EVI_CNT') && gridObj.getGridHeader('_EVI_SEQ')) {
                        $.each(ot_data, function (index, item) {
                            var type = 'attachable';
                            if (Number(item['EVI_CNT']) > 0) type = 'hasEvidence';
                            item['_EVI_SEQ'] = $u.util.getFileAttachIcon(type);
                        });
                    }

                    gridObj.setJSONData(ot_data);

                    if ($u.programSetting.getValue('useADD_DATA') === 'true') {
                        gridObj.loopRowIndex(function (rowIndex) {
                            if (gridObj.$V('ADD_DATA', rowIndex)) {
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
                        unidocuAlert(message, function () {
                            if (returnType === 'W' && gridObj.getGridHeader('MESSAGE') && gridObj.getRowCount() > 0) gridObj.setCellFocus('MESSAGE', 0);
                        });
                    }

                    if ($u.buttons.getCustomHandler('UD_0201_100_after_createStatement')) {
                        $u.buttons.runCustomHandler('UD_0201_100_after_createStatement', nsReturn);
                    }
                });
            },
            "batchApplyByDialog": function () {
                gridObj.asserts.rowSelected();
                $u.buttons.runCustomHandler('batchApplyDialog');
            }
        });
    }
});