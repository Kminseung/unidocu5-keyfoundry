/**
 * UD_0220_111   출장비신청
 * UD_0220_121   국내출장비신청
 * UD_0220_131   해외출장비신청
 *
 * @module uni-e-fi/view/UD_0220_121
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var formFineUploader, jsonData, pernr, isValid;
        $efi.createStatementCommon.init();

        $u.programSetting.appendTemplate('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름', {defaultValue: ''});
        $u.programSetting.appendTemplate('setSaveFunction', {
            defaultValue: 'ZUNIEWF_6711',
            description: '저장 RFC 정의'
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
            defaultValue: 'UD_0220_121',
            description: '품의 삭제후 이동할 화면'
        });
        $u.programSetting.appendTemplate('CalculateFunction', {
            defaultValue: 'ZUNIEWF_6710',
            description: '비용 계산시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('ReadOnlyTarget', {
            defaultValue: ['ROOM_EXP', 'DAY_EXP', 'ETC_EXP', 'TRAN_EXP'],
            type: 'json',
            description: '해당 컬럼 활성화'
        });

        var useAttachSetting = $u.programSetting.getValue('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름');

        var $fileAttachWrapper = $('#file-attach-wrapper');
        if(useAttachSetting === 'yes') $fileAttachWrapper.show();
        else if(useAttachSetting === 'no') $fileAttachWrapper.hide();

        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();
        gridObj.setCheckBarAsRadio('SELECTED', true);

        var readOnlyTarget = $u.programSetting.getValue('ReadOnlyTarget');
        if(readOnlyTarget) {
            $.each(readOnlyTarget, function (_, item) {
                gridObj.makeColumnEditable(item);
            });
        }

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            if (/DATE$/.test(columnKey) && gridObj.getGridHeader('TR_DAY')) {
                $u.buttons.runCustomHandler('calculateDate', rowIndex);
            }
            if (/CITY/.test(columnKey) && jsonObj) {
                jsonData = gridObj.getJSONData();
                pernr = gridObj.$V('PERNR', rowIndex);
                var city = gridObj.$V('CITY', rowIndex);
                isValid = jsonData.filter(function (data) {
                    return data['PERNR'] === pernr && data['CITY'] === city;
                }).length <= 1;
                if (!isValid) {
                    gridObj.$V('CITY', rowIndex, '');
                    gridObj.$V('CITY_TXT', rowIndex, '');
                    unidocuAlert($mls.getByCode('M_UD_0220_122_alreadyExistsCity'));
                }
                if (gridObj.$V('TR_DAY', rowIndex)) {
                    $u.buttons.runCustomHandler('calculateDate', rowIndex);
                }
            }
            if (/LAND1/.test(columnKey) && jsonObj) {
                jsonObj ? gridObj.$V('D_GRADE',rowIndex,jsonObj['D_GRADE']) : gridObj.$V('D_GRADE',rowIndex,'');
                jsonObj ? gridObj.$V('WAERS',rowIndex,jsonObj['WAERS']) : gridObj.$V('WAERS',rowIndex,'');
                jsonObj ? gridObj.$V('WAERSF',rowIndex,jsonObj['WAERSF']) : gridObj.$V('WAERSF',rowIndex,'');
                jsonData = gridObj.getJSONData();
                pernr = gridObj.$V('PERNR', rowIndex);
                var land1 = gridObj.$V('LAND1', rowIndex);
                isValid = jsonData.filter(function (data) {
                    return data['PERNR'] === pernr && data['LAND1'] === land1;
                }).length <= 1;
                if (!isValid) {
                    gridObj.$V('LAND1', rowIndex, '');
                    gridObj.$V('LAND1_TXT', rowIndex, '');
                    unidocuAlert($mls.getByCode('M_UD_0220_122_alreadyExistsCity'));
                }
                if (gridObj.$V('TR_DAY', rowIndex)) {
                    $u.buttons.runCustomHandler('calculateDate', rowIndex);
                }
            }
            if(/^ROOM_EXP$|^DAY_EXP$|^ETC_EXP$|^TRAN_EXP$/.test(columnKey)) {
                var total = Number(gridObj.$V('ROOM_EXP', rowIndex)) + Number(gridObj.$V('DAY_EXP', rowIndex)) + Number(gridObj.$V('ETC_EXP', rowIndex)) + Number(gridObj.$V('TRAN_EXP', rowIndex));
                gridObj.$V('SUM_EXP',rowIndex,total);
            }
            gridObj.$V('SELECTED', rowIndex, '1');
        });
        
        gridObj.onBlockPaste(function(startColumnKey, startRowIndex, endColumnKey, endRowIndex) {
            var i, len;
            for (i = startRowIndex, len = endRowIndex; i <= len; i++) {
                gridObj.triggerChangeCell('FDATE', i);
            }
        });

        $u.buttons.addHandler({
            'SAVE': function() {
                $u.validateRequired('header-invoicer-content');
                gridObj.validateSELECTEDGridRequired();
                $u.buttons.runCustomHandler('saveDocument', $u.buttons.runCustomHandler('getDocument'));
            },
            'DELETE': function() {
                $nst.is_data_returnMessage($u.programSetting.getValue('DeleteFunction'), $u.getValues(), function(msg) {
                    unidocuAlert(msg, function() {
                        $u.navigateByProgramId($u.programSetting.getValue('AfterWhenConsultationIsDeleted'));
                    });
                });
            },
            "addEmployee": function () {
                $u.dialog.f4CodeDialog.open({
                    popupKey: 'PERNR',
                    codePopupCallBack: function (code) {
                        $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: code}, function (os_data) {
                            gridObj.addRowByJSONData($.extend(os_data, {PERNR_TXT: os_data['SNAME']}));
                        });
                    }
                });
            },
            "deleteEmployee": function () {
                gridObj.asserts.rowSelected();
                gridObj.deleteSelectedRows();
            }
        });
        
        $u.buttons.addCustomHandler({
            "total_calculateDate": function(rowIndex, ot_head) {
                if ($u.page.getPROGRAM_ID() === 'UD_0220_121') {
                    var total = Number(ot_head[0]['ROOM_EXP']) + Number(ot_head[0]['DAY_EXP']) + Number(ot_head[0]['ETC_EXP']) + Number(ot_head[0]['TRAN_EXP']);
                    gridObj.$V('SUM_EXP',rowIndex,total);
                } else if ($u.page.getPROGRAM_ID() === 'UD_0220_131') {
                    var total_f = Number(ot_head[0]['ROOM_EXP_F']) + Number(ot_head[0]['DAY_EXP_F']) + Number(ot_head[0]['ETC_EXP_F']) + Number(ot_head[0]['TRAN_EXP_F']);
                    gridObj.$V('SUM_EXP_F',rowIndex,total_f);
                    var room_exp = Number(gridObj.$V('ROOM_EXP', rowIndex)).toLocaleString();
                    var room_exp_f = Number(gridObj.$V('ROOM_EXP_F', rowIndex)).toLocaleString();
                    var day_exp = Number(gridObj.$V('DAY_EXP', rowIndex)).toLocaleString();
                    var day_exp_f = Number(gridObj.$V('DAY_EXP_F', rowIndex)).toLocaleString();
                    var etc_exp = Number(gridObj.$V('ETC_EXP', rowIndex)).toLocaleString();
                    var etc_exp_f = Number(gridObj.$V('ETC_EXP_F', rowIndex)).toLocaleString();
                    var tran_exp = Number(gridObj.$V('TRAN_EXP', rowIndex)).toLocaleString();
                    var tran_exp_f = Number(gridObj.$V('TRAN_EXP_F', rowIndex)).toLocaleString();
                    var sum_exp = Number(gridObj.$V('SUM_EXP', rowIndex)).toLocaleString();
                    var sum_exp_f = Number(gridObj.$V('SUM_EXP_F', rowIndex)).toLocaleString();
                    var sign = '';
                    if(gridObj.$V('WAERSF',rowIndex) === 'USD') sign = '$ ';
                    else if(gridObj.$V('WAERSF',rowIndex) === 'EUR') sign = '€ ';
                    else if(gridObj.$V('WAERSF',rowIndex) === 'JPY') sign = '¥ ';
                    gridObj.$V('ROOM_EXP_T',rowIndex,'₩ '+room_exp+'\n'+sign+room_exp_f);
                    gridObj.$V('DAY_EXP_T',rowIndex,'₩ '+day_exp+'\n'+sign+day_exp_f);
                    gridObj.$V('ETC_EXP_T',rowIndex,'₩ '+etc_exp+'\n'+sign+etc_exp_f);
                    gridObj.$V('TRAN_EXP_T',rowIndex,'₩ '+tran_exp+'\n'+sign+tran_exp_f);
                    gridObj.$V('SUM_EXP_T',rowIndex,'₩ '+sum_exp+'\n'+sign+sum_exp_f);
                }
            },
            "calculateDate": function(rowIndex) {
                function stringToDate(strDate) {
                    return new Date(strDate.substring(0, 4) + '-' + strDate.substring(4, 6) + '-' + strDate.substring(6));
                }
                var fdate = gridObj.$V('FDATE', rowIndex);
                var tdate = gridObj.$V('TDATE', rowIndex);
                if (!fdate || !tdate) {
                    $u.buttons.runCustomHandler('setEmptyTargets', rowIndex);
                    return;
                }
                var nights = Math.floor((stringToDate(tdate) - stringToDate(fdate)) / (60 * 60 * 24 * 1000));
                if (fdate > tdate) {
                    gridObj.$V('TDATE', rowIndex, gridObj.$V('FDATE', rowIndex));
                    nights = 0;
                }
                if(nights >= 0) {
                    gridObj.$V('TR_DAY', rowIndex, nights + 1);
                    gridObj.$V('TR_NIGHT', rowIndex, nights);
                    if($u.page.getPROGRAM_ID() === 'UD_0220_111') return;
                    var activeRowJsonData = gridObj.getJSONData()[rowIndex];
                    $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('CalculateFunction'), {},{IT_HEAD: [activeRowJsonData]}, function (nsReturn) {
                        var ot_head = nsReturn.getTableReturn('OT_HEAD');
                        var jsonData = gridObj.getJSONData();
                        jsonData[rowIndex] = $.extend(activeRowJsonData, ot_head[0]);
                        gridObj.setJSONData(jsonData);
                        $u.buttons.runCustomHandler('total_calculateDate', rowIndex, ot_head);
                    });
                } else {
                    $u.buttons.runCustomHandler('setEmptyTargets', rowIndex);
                }
            },
            "setEmptyTargets": function(rowIndex) {
                var emptyTargets = ['TR_DAY','TR_NIGHT','ROOM_EXP','DAY_EXP','ETC_EXP','TRAN_EXP','SUM_EXP'];
                $.each(emptyTargets, function (_, item) {
                    gridObj.$V(item, rowIndex, '');
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
            },
            'getDocument': function() {
                var is_data = $u.getValues();
                is_data['EVI_SEQ'] = formFineUploader.getFileGroupId();
                return {
                    'EVI_SEQ': is_data['EVI_SEQ'],
                    'formData': is_data,
                    'gridData': {OT_DATA: [], OT_HEAD: gridObj.getJSONData()}
                }
            },
            'setGridData': function (gridData, useDelete) {
                if(!useDelete) {
                    gridObj.setJSONData(gridData['OT_HEAD']);
                }
            },
            'convertNSReturnToDocument': function(nsReturn) {
                var os_data = nsReturn.getExportMap('OS_DATA');
                var ot_data = nsReturn.getTableReturn('OT_DATA');
                var ot_head = nsReturn.getTableReturn('OT_HEAD');
                return {
                    'EVI_SEQ': os_data['EVI_SEQ'],
                    'formData': $.extend(true, {}, os_data, nsReturn.getExportMap('OS_TEXT')),
                    'gridData': {OT_DATA: ot_data, OT_HEAD: ot_head}
                }
            },
            'disableEditingStatement': function() {
                $('#uni-grid_buttons').find('button').hide();
            },
            'saveDocument': function(doc) {
                $nst.is_data_tableParams_nsReturn($u.programSetting.getValue('setSaveFunction'), doc['formData'], {IT_HEAD: doc['gridData']['OT_HEAD'], IT_DATA: doc['gridData']['OT_DATA']}, function (nsReturn) {
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
                            });
                        }
                    });
                });
            }
        });

        return function () {
            $ewf.UD_0220_002.fileAttachableInGrid = true;
            var pageParams = $u.page.getPageParams();
            var grid2ColumnList = ['ROOM_EXP_T','DAY_EXP_T','ETC_EXP_T','TRAN_EXP_T','SUM_EXP_T'];
            formFineUploader = $u.fileUI.getFineUploader();
            $.each(grid2ColumnList, function (_, item) {
                gridObj._rg.setColumnProperty(item, "styles", {textWrap:'explicit'});
            });
            if (pageParams['REQNO'] || pageParams['REQNO_A']) {
                $u.setValues(pageParams);
                if (pageParams['OT_DATA']) $u.buttons.runCustomHandler('setGridData', pageParams);
            }
            $u.fileUI.load(pageParams['EVI_SEQ'], false);
            if (pageParams['GRONO']) {
                $u.makeReadOnlyForm('header-invoicer-content');
                $u.fileUI.getFineUploader().setReadOnly(true);
                $('#uni-buttons, #uni-buttons2').hide();
                $('#uni-grid_buttons').hide();
                gridObj.makeReadOnlyGrid();
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