/**
 * @module unidocu-debug/subView/formSetting
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        gridObj.setSortEnable(false);
        gridObj.setBlockPasteMode('clipboardareabase');
        gridObj.onChangeCell(function (columnKey) {
            if (columnKey !== 'NOT_IN_USE') return;
            $u.buttons.runCustomHandler('handleNotInUse');
        });

        gridObj.onCellClick(function (columnKey, rowIndex) {
                if (columnKey === 'OPTIONS') $u.dialog.openOptionsDialog(gridObj, rowIndex);
                if (columnKey === 'QUERY_PARAMS') $u.dialog.openQueryParamsDialog(gridObj, rowIndex);
            }
        );
        $debug.bindDragEventForProgramSetting(gridObj);
        $u.get('funcnameSearch').onClick(function () {
            $u.popup.openUD_0901_010($u.getValues('search-condition,form-data'));
        });

        $u.get('IS_SEARCH').$el.change(function () {
            var $u_showPanelCollapse = $u.get('showPanelCollapse');
            if ($u.get('IS_SEARCH').getValue() === '1') $u_showPanelCollapse.show();
            else $u_showPanelCollapse.hide();
        });

        $u.buttons.addHandler({
            addRow: function () {
                gridObj.addRow();
            },
            deleteRow: function () {
                gridObj.deleteSelectedRows();
            },
            rowUp: function () {
                gridObj.swapRow(-1);
                $u.buttons.runCustomHandler('handleNotInUse');
            },
            rowDown: function () {
                gridObj.swapRow(1);
                $u.buttons.runCustomHandler('handleNotInUse');
            },
            doQuery: function () {
                var web_data_id = $u.get('search-condition', 'WEB_DATA_ID').getValue();
                $u.webData.ignoreCacheSelectOne('formSetting', web_data_id, function (data) {
                    var $doSave = $('#doSave');
                    if ($u.webData.hasCustomWebData(web_data_id)) $doSave.hide();
                    /*
                    * 추가데이터 f8 debug 모드 저장버튼 show()
                    */
                    // else if (/addDataDialog_/.test(web_data_id)) $doSave.hide();
                    else $doSave.show();
                    $u.setValues('form-data', data['OS_DATA']);
                    $u.get('IS_SEARCH').$el.change();
                    var jsonData = data['OT_DATA'];
                    $.each(jsonData, function (index, item) {
                        if ($.type(item['OPTIONS']) === 'array') item['OPTIONS'] = JSON.stringify(item['OPTIONS']);
                        if ($.type(item['QUERY_PARAMS']) === 'array') item['QUERY_PARAMS'] = JSON.stringify(item['QUERY_PARAMS']);
                    });
                    gridObj.setJSONData(jsonData);
                    $u.buttons.runCustomHandler('handleNotInUse');

                    // todo 전체 해당 컬럼 안쓰는 걸로.
                    if (opener.$u.page.getVIEW_NAME() === 'unidocu-ui/layout/form_grid_crud_layout') {
                        $u.get('form-data', 'SEARCH_BTN_ID').setThText('').$el.closest('td').empty();
                        $u.get('form-data', 'FUNCNAME').setThText('').$el.closest('td').empty();
                    }
                });
            },
            doSave: function () {
                gridObj.validateDebugModeGridRequired();
                var web_data_id = $u.get('search-condition', 'WEB_DATA_ID').getValue();
                var webData = $u.buttons.runCustomHandler('getWebData');
                $u.webData.createOrModifySingle('formSetting', web_data_id, webData, function () {
                    $u.buttons.triggerFormTableButtonClick();
                });
            },
            JSON: function () {
                var webData = $u.buttons.runCustomHandler('getWebData');
                $u.dialog.jsonDialog.open(webData);
            },
            setByJSON: function () {
                $u.dialog.JSONInputDialog.open(function (json) {
                    $u.setValues('form-data', json['OS_DATA']);
                    $u.get('IS_SEARCH').$el.change();
                    $.each(json['OT_DATA'], function (index, item) {
                        if (item['OPTIONS']) item['OPTIONS'] = JSON.stringify(item['OPTIONS']);
                        if (item['QUERY_PARAMS']) item['QUERY_PARAMS'] = JSON.stringify(item['QUERY_PARAMS']);
                    });
                    gridObj.setJSONData(json['OT_DATA']);
                    $u.buttons.runCustomHandler('handleNotInUse');
                });
            }
        });

        $u.buttons.addCustomHandler({
            handleNotInUse: function () {
                $.each(gridObj.getJSONData(), function (rowIndex, item) {
                    if (item['NOT_IN_USE'] === '1') gridObj.setRowBgColor(rowIndex, '255|100|100');
                    else gridObj.setRowBgColor(rowIndex, 'default');
                });
            },
            getWebData: function () {
                var ids = {};

                var gridData = gridObj.getJSONData();
                $.each(gridData, function (index, item) {
                    if (ids[item['COLUMN_ID']]) throw 'Column Id is duplicated. ' + item['COLUMN_ID'];
                    ids[item['COLUMN_ID']] = true;
                });
                $.each(gridData, function (index, item) {
                    delete item['SELECTED'];
                    $.each('APPEND_INPUT,CODE_WIDTH,MAX_LENGTH,NOT_IN_USE,READ_ONLY,REQUIRED,TEXTAREA_HEIGHT'.split(','), function (index, key) {
                        if (item[key] === '0' || item[key] === '-1') delete item[key];
                    });
                    $.each(item, function (key, value) {
                        if (value === '') delete item[key];
                    });
                    if (item['COL_SPAN'] === '1' || item['COL_SPAN'] === '0') delete item['COL_SPAN'];
                    if (item['OPTIONS']) item['OPTIONS'] = JSON.parse(item['OPTIONS']);
                    if (item['OPTIONS'] && item['OPTIONS'].length === 0) delete item['OPTIONS'];

                    if (item['QUERY_PARAMS']) item['QUERY_PARAMS'] = JSON.parse(item['QUERY_PARAMS']);
                    if (item['QUERY_PARAMS'] && item['QUERY_PARAMS'].length === 0) delete item['QUERY_PARAMS'];
                    if (item['TARGET_ID'] && !item['APPEND_INPUT']) throw $mls.getByCode('M_checkAppendByTargetId');
                });

                var os_data = $u.getValues('form-data');
                $.each(os_data, function (key, value) {
                    if (value === '') delete os_data[key];
                });
                delete os_data['funcnameSearch'];
                return {OS_DATA: os_data, OT_DATA: gridData};
            }
        });

        $u.buttons.triggerFormTableButtonClick();
    }
});