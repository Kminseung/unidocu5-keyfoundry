/**
 * UD_0290_001   원클릭 전표 관리
 * @module uni-e-fi/view/UD_0290_001
 */
define(function() {
    return function(){
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        $u.programSetting.appendTemplate('setCheckBarAsRadio', {
            defaultValue: 'false',
            description: '그리드 선택 컬럼 radio mode 로 설정'
        });                                                                                                                                                                                                                                                                                                                                                                                        $u.programSetting.appendTemplate('doSave', {
            defaultValue: 'ZUNIEFI_4033',
            description: '[비용항목 관리] 저장 RFC'
        });
        $u.programSetting.appendTemplate('doDelete', {
            defaultValue: 'ZUNIEFI_4034',
            description: '[비용항목 관리] 삭제 RFC'
        });

        $u.buttons.addHandler({
            "doSave": function() {
                var buttonID = $(this).attr('id');
                $u.buttons.runCustomHandler('UD_0290_001_Handler',buttonID);
            },
            "doDelete": function() {
                gridObj.asserts.rowSelected();
                var buttonID = $(this).attr('id');
                $u.buttons.runCustomHandler('UD_0290_001_Handler',buttonID);
            },
            "doExtract": function() {
                var formId = 'dialog-search-form';
                var $dialog = $u.dialog.dialogLayout001({
                    subGroup:  'extractSearchDialog',
                    dialogTitle: '원클릭 전표 항목 조회',
                    draggable: true,
                    ignoreGrid: false,
                    dialogWidth: 1100,

                    dialogSearchButton: function () {
                        var params = $u.getValues(formId);
                        var $self = $(this);
                        var funcname = $self.data('funcname');
                        $.each(params, function(key){
                            if(/__DIALOG/.test(key)) params[key.replace('__DIALOG', '')] = params[key];
                        });

                        $nst.is_data_ot_data(funcname, params,function (gridData) {
                            $u.gridWrapper.getGrid('dialog-search-grid').setJSONData(gridData);
                            var param = dialogGrid.getChartParams();
                            param['$target'] = dialogGrid;
                            $u.renderChart(param);
                            $u.get('dataGroupKeys').setValue('PROGRAM_ID_TXT,HKONT_TXT,KOSTL_TXT');
                            $u.get('columnGroupKeys').setValue('PROGRAM_ID_TXT,HKONT_TXT,KOSTL_TXT');
                            $('#chart-form-table .button-icon').click();
                            $('#chart-form-table input[type=checkbox]').first().change();
                        });
                    },
                    dialogButtons: [$u.baseDialog.getButton($mls.getByCode('확인'), function () {$dialog.dialog('close');})]
                });
                $u.buttons.triggerFormTableButtonClick('dialog-search-form');
                var dialogGrid = $u.gridWrapper.getGrid('dialog-search-grid');
                dialogGrid.setColumnHide('SELECTED');
                dialogGrid.onCellClick(function(columnKey,rowIndex) {
                    if (columnKey === 'HKONT') {
                        var gl_alias_txt = '';
                        $.each(['PROGRAM_ID_TXT','HKONT_TXT','KOSTL_TXT'],function(index,item) {
                            if (dialogGrid.getJSONDataByRowIndex(rowIndex)[item] !== '') {
                                gl_alias_txt += dialogGrid.getJSONDataByRowIndex(rowIndex)[item] + '_'
                            }
                        });
                        gl_alias_txt = gl_alias_txt.slice(0,-1);
                        gridObj.loopRowIndex(function(rowIndex) {
                            if (gridObj.$V('KEY',rowIndex) === gl_alias_txt) throw '동일한 내용은 등록 불가능합니다.';
                        });

                        var jsonData = $.extend(dialogGrid.getJSONDataByRowIndex(rowIndex),{GL_ALIAS_TXT:gl_alias_txt, KEY:gl_alias_txt});
                        gridObj.addRowByJSONData(jsonData);
                    }
                });
            },
            "doQuery": function() {
                var $self = $(this);
                var funcname = $self.data('funcname');
                $nst.is_data_ot_data(funcname,$u.getValues('search-condition'),function (ot_data) {
                    var gridData = [];
                    $u.page.getPROGRAM_ID() === 'UD_0290_001' ? $.each(ot_data,function(index,item) {if (item['SEQ'] === '01' ) gridData.push(item);}) : gridData = ot_data ;
                    gridObj.setJSONData(gridData);
                    gridObj.loopRowIndex(function (rowIndex) {
                        var jsonData = [];
                        if (gridObj.getGridHeader('SUB_GROUP')) {
                            gridObj.$V('SUB_GROUP', rowIndex) === 'CD' ? gridObj.makeCellEditable('CARDNO', rowIndex) : gridObj.makeCellReadOnly('CARDNO', rowIndex);
                            gridObj.$V('SUB_GROUP', rowIndex) === 'LF' ? gridObj.makeCellEditable('LIFNR', rowIndex) : gridObj.makeCellReadOnly('LIFNR', rowIndex);
                        }
                        if ($u.page.getPROGRAM_ID() === 'UD_0290_001') {
                            var glAlias = gridObj.$V('GL_ALIAS',rowIndex);
                            $.each(ot_data,function(index,item) {
                                if (glAlias === item['GL_ALIAS']) jsonData.push(item);
                            })
                            gridObj.$V('GL_ADD_DATA_JSON',rowIndex,JSON.stringify(jsonData));
                        }
                    });
                });
            },
            "addRow": function () {
                var $u_pernr = $u.get('PERNR').getValue();
                gridObj.addRowByJSONData({PERNR:$u_pernr});
            },
            "deleteRow": function () {
                gridObj.deleteSelectedRows();
            },
            "checkAll": function() {
                gridObj.checkAll();
            },
            "unCheckAll": function() {
                gridObj.unCheckAll();
            }
        });
        $u.buttons.addCustomHandler({
            UD_0290_001_Handler: function(buttonID) {
                var jsonData = gridObj.getSELECTEDJSONData();
                if (buttonID === 'doSave') jsonData = gridObj.getJSONData();
                $nst.it_data_nsReturn($u.programSetting.getValue(buttonID),jsonData, function (nsReturn) {
                    var message = nsReturn.getReturnMessage();
                    unidocuAlert(message,function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            }
        });

        gridObj.onBeforeOpenF4Dialog(function(columnKey,rowIndex) {
            if (columnKey === 'GL_ALIAS') {
                var programId = gridObj.$V('PROGRAM_ID', rowIndex);
                gridObj.setQueryParams(columnKey, {PROGRAM_ID_GRID: programId});
            }
        });
        gridObj.onChangeCell(function(columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if ($u.page.getPROGRAM_ID() === 'UD_0290_002') {
                if (columnKey === 'PROGRAM_ID' && jsonObj && jsonObj['SUB_GROUP']) {
                    jsonObj['SUB_GROUP'] === 'CD' ? gridObj.makeCellEditable('CARDNO',rowIndex) : gridObj.makeCellReadOnly('CARDNO',rowIndex);
                    jsonObj['SUB_GROUP'] === 'LF' ? gridObj.makeCellEditable('LIFNR',rowIndex) : gridObj.makeCellReadOnly('LIFNR',rowIndex);
                }
            }
            if ($u.page.getPROGRAM_ID() === 'UD_0290_001') {
                var columnKeyList = ['PROGRAM_ID','HKONT','KOSTL'];
                if ($u.util.contains(columnKey,columnKeyList)) {
                    if (gridObj.$V('GL_ALIAS',rowIndex) !== '') return;
                    var columnKeyListVal = [gridObj.$V('PROGRAM_ID_TXT',rowIndex),gridObj.$V('HKONT_TXT',rowIndex),gridObj.$V('KOSTL_TXT',rowIndex)];
                    var gl_alias_txt = $u.util.formatString('{0}_{1}_{2}',columnKeyListVal);
                    gridObj.$V('GL_ALIAS_TXT',rowIndex, gl_alias_txt === '__' ? '' : gl_alias_txt);
                }
            }
        });
        gridObj.onCellClick(function(columnKey, rowIndex) {
            if (columnKey === 'GL_ADD_DATA' && !$.isEmptyObject(gridObj.$V('GL_ALIAS',rowIndex))) {
                function dialogGridInit() {return $u.gridWrapper.getGrid('dialog-search-grid');}
                function dilaogLoopFn() {
                    dialogGridInit().loopRowIndex(function(index) {
                        var jsonData = {
                            HKONT: dialogGridInit().$V('HKONT',index),
                            KOSTL: dialogGridInit().$V('KOSTL',index),
                            HKONT_TXT: dialogGridInit().$V('HKONT_TXT',index),
                            KOSTL_TXT: dialogGridInit().$V('KOSTL_TXT',index)
                        }
                        dialogGridInit().$V('SEQ',index) === '01' ? gridObj.setRowDataByJSONObj(rowIndex,jsonData) : '';
                        dialogGridInit().$V('SEQ', index, '0' + Number(index + 1))
                    });
                }
                var $dialog = $u.dialog.dialogLayout001({
                    subGroup: $u.page.getPROGRAM_ID() + '_addDataSearchDialog',
                    dialogTitle: '원클릭 항목 추가',
                    draggable: true,
                    ignoreGrid: false,
                    dialogWidth: 1300,
                    dialogButtons: [
                        $u.baseDialog.getButton('행추가', function () {
                            var addRowJsonData = {
                                GL_ALIAS: gridObj.$V('GL_ALIAS', rowIndex),
                                PROGRAM_ID: gridObj.$V('PROGRAM_ID', rowIndex)
                            }
                            dialogGridInit().addRowByJSONData(addRowJsonData);
                        }),
                        $u.baseDialog.getButton('행삭제', function () {
                            dialogGridInit().deleteSelectedRows('SELECTED');
                        }),
                        $u.baseDialog.getButton($mls.getByCode('확인'), function () {
                            dialogGridInit().validateGridRequired();
                            dilaogLoopFn();
                            gridObj.$V('GL_ADD_DATA_JSON', rowIndex, JSON.stringify(dialogGridInit().getJSONData()));
                            $dialog.dialog('close');
                        })
                    ]
                });
                $('#dialog-search-form').hide();
                var addDataJson = JSON.parse(gridObj.$V('GL_ADD_DATA_JSON', rowIndex));
                dialogGridInit().setJSONData(addDataJson);
            }
        });

        return function () {
            if ($u.programSetting.getValue('setCheckBarAsRadio') === 'true') gridObj.setCheckBarAsRadio('SELECTED');
            $u.buttons.triggerFormTableButtonClick();
        }
    }
});