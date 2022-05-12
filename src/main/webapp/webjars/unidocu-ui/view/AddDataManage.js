/**
 * @module unidocu-ui/view/AddDataManage
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');
        gridObj.useCRUDHeader();
        gridObj2.useCRUDHeader();

        gridObj.onChangeCell(function (columnKey, rowIndex) {
            if (columnKey === 'ADD_GR') {
                var webDataId = gridObj.$V(columnKey, rowIndex) + '@ADD_DATA_INFO';
                gridObj.$V('WEB_DATA_ID', rowIndex, webDataId);
            }
        });

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'CRUD') {
                if (gridObj.$V('ADD_GR', rowIndex) === '') $u.buttons.runCustomHandler('init', true);
                $u.setValues(gridObj.getJSONDataByRowIndex(rowIndex));
                $u.buttons.runCustomHandler('is_data_ot_data');
            }
            if (columnKey === 'WEB_DATA_ID') {
                var web_data_id = gridObj.$V(columnKey, rowIndex);
                if (web_data_id === '') throw $mls.getByCode('M_addDataManage_click_grid1');
                $debug.navigateDebugPopup('formSetting', {WEB_DATA_ID: web_data_id});
            }
        });

        $u.buttons.addHandler({
            'is_data_ot_data': function () {
                $u.buttons.runCustomHandler('is_data_ot_data');
            },
            'addRowGrid1': function () {
                gridObj.addRow();
                $u.buttons.runCustomHandler('init', false);
            },
            'deleteRowGrid1': function () {
                var activeRowIndex = gridObj.getActiveRowIndex();
                if (activeRowIndex === -1) throw $mls.getByCode('M_noSelectedData');
                gridObj.deleteRow(gridObj.getActiveRowIndex());
            },
            'saveGrid1': function () {
                var crudData = $u.buttons.runCustomHandler('getCRUDData', gridObj, $(this).attr('id'));
                $u.webData.createOrModifyByList({}, crudData['modifiedData'], function () {
                    $u.webData.deleteByList({}, crudData['deletedData'], function () {
                        $u.pageReload();
                    });
                });
            },
            'addRowGrid2': function () {
                if (gridObj.getActiveRowIndex() < 0) throw $mls.getByCode("M_addDataManage_addRowGrid2_validate1");
                if (gridObj.$V('ADD_GR', gridObj.getActiveRowIndex()) === '') throw $mls.getByCode("M_addDataManage_addRowGrid2_validate2");

                gridObj2.addRowByJSONData({ADD_GR: gridObj.$V('ADD_GR', gridObj.getActiveRowIndex())});
            },
            'deleteRowGrid2': function () {
                var activeRowIndex = gridObj2.getActiveRowIndex();
                if (activeRowIndex === -1) throw $mls.getByCode('M_noSelectedData');
                gridObj2.deleteRow(activeRowIndex);
            },
            'saveGrid2': function () {
                var crudData = $u.buttons.runCustomHandler('getCRUDData', gridObj2, $(this).attr('id'));
                $nst.tableParams_nsReturn('ZUNIEFI_4015', {IT_MODIFY: crudData['modifiedData'], IT_DELETE: crudData['deletedData']}, function (nsReturn) {
                    var message = nsReturn.getReturnMessage();
                    if (message) unidocuAlert(message);
                    $u.buttons.runCustomHandler('is_data_ot_data');
                });
            }
        });

        $u.buttons.addCustomHandler({
            'doQuery': function () {
                var webData = $u.webData.selectList({SCOPE: 'formSetting'});
                var addDataGroup = [];
                $.each(webData, function (index, item) {
                    if (/@ADD_DATA_INFO/.test(item['WEB_DATA_ID'])) {
                        addDataGroup.push(item);
                    }
                });

                $.each(addDataGroup, function (i, data) {
                    data['ADD_GR'] = data['WEB_DATA_ID'].substr(0, data['WEB_DATA_ID'].indexOf('@'));
                    var os_data = JSON.parse(data['DATA'])['OS_DATA'];
                    data['DESCRIPTION'] = os_data['DESCRIPTION'];
                });

                gridObj.setJSONData(addDataGroup);
            },
            'is_data_ot_data': function () {
                $nst.is_data_ot_data('ZUNIEFI_4015', $u.getValues('search-condition'), function (ot_data) {
                    gridObj2.setJSONData(ot_data);
                });
            },
            'init': function (flag) {
                gridObj2.clearGridData();
                $.each($u.getNames('search-condition'), function (index, name) {
                    $u.get(name).setEmptyValue();
                });
                if (flag) throw $mls.getByCode('M_addDataManage_click_grid1');
            },
            'getCRUDData': function (_gridObj, buttonId) {
                var crudJSONData = _gridObj.getCRUDJSONData();
                if (crudJSONData.length === 0) throw $mls.getByCode('M_noDataToSave');
                _gridObj.validateGridRequired();

                var modifiedData = [];
                var deletedData = [];
                $.each(crudJSONData, function (index, data) {
                    if (buttonId === 'saveGrid1') {
                        if (data['DATA'] === '') throw $mls.getByCode("M_addDataManage_saveGrid1_validate");
                        var inputData = JSON.parse(data['DATA']);
                        var os_data = inputData['OS_DATA'];
                        os_data['DESCRIPTION'] = data['DESCRIPTION'];
                        data['DESCRIPTION'] = '';
                        data['DATA'] = JSON.stringify({OS_DATA: os_data, OT_DATA: inputData['OT_DATA']});
                    }
                    if (data['CRUD'] === 'C' || data['CRUD'] === 'U') modifiedData.push(data);
                    if (data['CRUD'] === 'D') deletedData.push(data);
                });

                return {modifiedData: modifiedData, deletedData: deletedData};
            }
        });

        return function () {
            $u.buttons.runCustomHandler('doQuery');
            gridObj2.fitToWindowSize();
        }
    }
});