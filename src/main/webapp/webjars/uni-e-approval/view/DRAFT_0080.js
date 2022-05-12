/**
 * @module uni-e-approval/view/DRAFT_0080
 *
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름', {defaultValue: ''});
        $u.programSetting.appendTemplate('useFileSearchDialog', {
            defaultValue: 'false',
            description: '모바일 첨부파일 추가 기능'
        });

        var namedServiceId = 'ZUNIEFI_6500';
        var gridObj = $u.gridWrapper.getGrid();
        var $u_CAR_NUM = $u.get('CAR_NUM');
        var $u_USEDT = $u.get('USEDT');
        var readOnly = false;
        var beforePastedGridData;
        var pasteProcessFlag = false;

        if($u.get('CAR_MILE')) $u.get('CAR_MILE').setPrecision(1);
        if($u.get('BASE_MILE')) $u.get('BASE_MILE').setPrecision(1);

        if($u_USEDT) $u_USEDT.setValue(getDefaultUseDate());
        if($u_CAR_NUM) $u_CAR_NUM.$el.change(doQuery);

        gridObj.fitToWindowSize();
        gridObj.setHeaderCheckBox('SELECTED', true);
        gridObj.setNumberNegative('BF_KM', false);
        gridObj.setNumberNegative('AF_KM', false);
        gridObj.setNumberNegative('USEKM3', false);
        gridObj._rg.gridView.setPasteOptions({eventEachRow:true});
        var gridView = gridObj._rg.gridView;

        $.each(['MILEAGE', 'USEKM2'], function(_, columnKey) {
            gridView.setColumnProperty(
                gridView.columnByField(columnKey),
                "dynamicStyles", [{
                    criteria: "(value < 0)",
                    styles: "foreground=#ff0000"
                }]
            )
        });

        $.each(gridObj.getColumnKeys(), function (_, columnKey) {
            var splitHeaderText = gridObj.getColumnHeaderText(columnKey).split(/\\n/);
            var headerText = splitHeaderText[0];
            var subText = splitHeaderText.length > 1 ? splitHeaderText[1] : null;

            if (subText) {
                gridObj.setColumnHeaderText(columnKey, headerText);
                gridObj.rg.style._setColumnHeaderSubText(columnKey, subText);
            }
        });
        gridObj.rg.style._setColumnHeaderHeight(34);

        var pageParams =  $u.page.getPageParams();
        if(pageParams['mode'] === 'edit') {
            $u.get('REQNO').setValue(pageParams['REQNO']);
            $u.get('CAR_NUM').setValue(pageParams['CAR_NUM']);
            $u.get('CAR_NUM').triggerChange();
            $u.get('CAR_NUM').setReadOnly(true);
        }

        gridObj._rg.gridView.setPasteOptions({
            'enabled': false
        });

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (/^BF_FILE_$/.test(columnKey)) {
                var bf_file = gridObj.$V('BF_FILE', rowIndex);
                var $dialog = $u.dialog.fineUploaderDialog.open(bf_file, false, true);
                $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                    var fileGroupId = $dialog.data('fineUploader').getFileGroupId();
                    handlerEvidenceInfo(columnKey, rowIndex, fileGroupId, fileCount);
                });
            }
            if (/^AF_FILE_$/.test(columnKey)) {
                var af_file = gridObj.$V('AF_FILE', rowIndex);
                $dialog = $u.dialog.fineUploaderDialog.open(af_file, false, true);
                $dialog.find('#file-attach-content').on('fileCountChange', function (event, fileCount) {
                    var fileGroupId = $dialog.data('fineUploader').getFileGroupId();
                    handlerEvidenceInfo(columnKey, rowIndex, fileGroupId, fileCount);
                });
            }
        });

        gridObj.onChangeCell(function(columnKey, rowIndex, oldValue, newValue) {
            function whereIs(target, container) {
                function isEqual(target, source) {
                    return Object.keys(target).filter(function(key) {
                        return target[key] !== source[key];
                    }).length === 0;
                }
                function findIndex(target, container, index) {
                    if (index >= container.length) return -1;
                    if (isEqual(target, container[index])) return index;
                    return findIndex(target, container, ++index);
                }
                return findIndex(target, container, 0);
            }

            $u.util.tryCatchCall(function() {
                if (columnKey === 'USEDT' && newValue !== undefined && gridObj.$F(gridObj.$V('USEDT', rowIndex), 'USEDT').length > 1) {
                    throw $mls.getByCode('사용일자가 중복되었습니다. 다른 날짜를 선택하세요.');
                }
                if (columnKey === 'USEDT') {
                    var daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
                    gridObj.$V('USEDTT_TXT', rowIndex, newValue === undefined ? '' : daysOfWeek[newValue.getDay()]);
                }
                if (columnKey === 'USEDT') {
                    var sorted = gridObj.getJSONData().sort(function(a, b) {
                        if (a['USEDT'] === b['USEDT']) return a['AF_KM'] - b['AF_KM'];
                        if (a['USEDT'] === '') return 1;
                        if (b['USEDT'] === '') return -1;
                        return a['USEDT'] - b['USEDT'];
                    });
                    var fromIndex = rowIndex;
                    var toIndex = whereIs(gridObj.getJSONDataByRowIndex(rowIndex), sorted);
                    if (fromIndex !== toIndex) {
                        rowIndex = toIndex;
                        if (rowIndex === 0) {
                            sorted[rowIndex]['AF_KM'] = sorted[rowIndex + 1]['BF_KM'];
                            sorted[rowIndex]['BF_KM'] = sorted[rowIndex]['AF_KM'];
                        } else if (rowIndex === sorted.length - 1) {
                            sorted[rowIndex]['BF_KM'] = sorted[rowIndex - 1]['AF_KM'];
                            sorted[rowIndex]['AF_KM'] = sorted[rowIndex]['BF_KM'];
                        } else {
                            sorted[rowIndex]['BF_KM'] = sorted[rowIndex - 1]['AF_KM'];
                            sorted[rowIndex]['AF_KM'] = sorted[rowIndex + 1]['BF_KM'];
                        }

                        if (fromIndex > toIndex && fromIndex < sorted.length - 1) {
                            sorted[fromIndex + 1]['BF_KM'] = sorted[fromIndex]['AF_KM'];
                        } else if (fromIndex < toIndex && fromIndex > 0) {
                            sorted[fromIndex]['BF_KM'] = sorted[fromIndex - 1]['AF_KM'];
                        }

                        sorted.forEach(calculateAndFillMileages);
                        gridObj.setJSONData(sorted);
                        gridObj.makeCellEditable('BF_KM', 0);
                        gridObj.setActiveRowIndex(rowIndex);
                    }
                }

                if ($u.util.contains(columnKey, ['WONOFF', 'BF_KM', 'AF_KM', 'USEKM3'])) {
                    var currentRowData = gridObj.getJSONDataByRowIndex(rowIndex);
                    calculateAndFillMileages(currentRowData);

                    gridObj.$V('MILEAGE', rowIndex, currentRowData['MILEAGE']);
                    gridObj.$V('USEKM1', rowIndex, currentRowData['USEKM1']);
                    gridObj.$V('USEKM2', rowIndex, currentRowData['USEKM2']);
                }
                if (columnKey === 'AF_KM' && rowIndex < gridObj.getRowCount() - 1) {
                    var nextRowBF_KM = gridObj.$V('BF_KM', rowIndex + 1);
                    gridObj.$V('BF_KM', rowIndex + 1, newValue);
                    gridObj.triggerChangeCell('BF_KM', rowIndex + 1, nextRowBF_KM, newValue);
                }
            }, function(){
                if(pasteProcessFlag){
                    gridObj.setJSONData(beforePastedGridData);
                } else {
                    gridObj.$V(columnKey, rowIndex, oldValue);
                }
            });
        });

        $u.buttons.addHandler({
            "is_data_ot_data": function () {
                doQuery();
            },
            "addRow": function() {
                $u.validateRequired();
                var defaultDrivingHisData = getDefaultDrivingHisData();
                gridObj.addRow();
                gridObj.setRowDataByJSONObj(gridObj.getActiveRowIndex(), $.extend(defaultDrivingHisData, {BF_FILE_: '증빙없음', AF_FILE_: '증빙없음'}));
                if(gridObj.getRowCount() === 1) gridObj.makeCellEditable('BF_KM', 0);
            },
            "deleteRow": function() {
                gridObj.asserts.rowSelected();
                gridObj.deleteSelectedRows();
                var gridData = gridObj.getJSONData();
                $.each(gridData, function(index, rowData) {
                    if (index === 0) return true;
                    rowData['BF_KM'] = gridData[index - 1]['AF_KM'];
                    calculateAndFillMileages(rowData);
                })
                gridObj.setJSONData(gridData);
                gridObj.makeCellEditable('BF_KM', 0);
            },
            "saveDrivingHis": function(){
                gridObj.validateGridRequired();
                var it_data = gridObj.getJSONData();
                var isValid = isGridInputsAreValid(it_data);
                if(!isValid) throw $mls.getByCode('주행거리, 또는 업무용거리는 음수값일 수 없습니다.');
                $nst.is_data_it_data_nsReturn(namedServiceId, $.extend({MODE: 'I', EVI_SEQ: $u.page.getPageParams()['EVI_SEQ']}, $u.getValues('header-vehicleUsageInfo-content')), it_data, function(nsReturn){
                    $u.get('REQNO').setValue(nsReturn.getExportMap('OS_DATA')['REQNO']);
                });
            },
            "deleteDrivingHis": function(){
                gridObj.asserts.rowSelected();
                var it_data = gridObj.getSELECTEDJSONData();
                $nst.is_data_it_data_nsReturn(namedServiceId, {MODE: 'D', CAR_NUM: $u.get('CAR_NUM').getValue()}, it_data, doQuery);
            },
            "openDrivingHis": function(){
                $u.validateRequired();
                if($u.page.getPROGRAM_ID() === "DRAFT_0080_01")$u.popup.openPopup('https://unidocu.unipost.co.kr/redmine/issues/12145', 'drivingHisStatement', 1000, 1000);
                else $u.popup.openPopup('https://unidocu.unipost.co.kr/redmine/issues/9122', 'drivingHis', 1000, 1000);
            },
            "attachedEvidence": function(){
                var fileGroupId = $u.page.getPageParams()['EVI_SEQ'];
                var $dialog = $u.dialog.fineUploaderDialog.open(fileGroupId, readOnly, true);
                $dialog.find('#file-attach-content').on('fileCountChange', function () {
                    var fileGroupId = $dialog.data('fineUploader').getFileGroupId();
                    $.extend($u.page.getPageParams(), {EVI_SEQ: fileGroupId});
                });
            },
            "createStatement": function(){
                $u.validateRequired();
                gridObj.validateGridRequired();
                var is_data = $u.getValues('header-vehicleUsageInfo-content');
                var it_data = gridObj.getJSONData();
                var isValid = isGridInputsAreValid(it_data);
                if(!isValid) throw $mls.getByCode('주행거리, 또는 업무용거리는 음수값일 수 없습니다.');
                $nst.is_data_tableParams_os_docno('ZUNIEFI_TM_011', is_data, {IT_DATA: it_data}, function() {
                    unidocuAlert('todo 결재 요청 화면 이동')
                });
            }
        });

        function doQuery(){
            var formData = $u.getValues('header-vehicleUsageInfo-content');
            var importParam;
            if($u.page.getPROGRAM_ID() === 'DRAFT_0080_01'){
                namedServiceId = "ZUNIEFI_6511";
                importParam = $.extend({}, formData);
            } else {
                importParam = $.extend({}, formData, {MODE: 'S'});
            }
            $u.fileUI.setFileAttachKeyParam(importParam);
            $nst.is_data_it_data_nsReturn(namedServiceId, importParam, [], function(nsReturn){
                var os_data = nsReturn.getExportMap('OS_DATA');
                var ot_data = nsReturn.getTableReturn('OT_DATA');

                if(os_data['EVI_SEQ']) $.extend($u.page.getPageParams(), {EVI_SEQ: os_data['EVI_SEQ']});
                $u.setValues('header-vehicleUsageInfo-content', $.extend(os_data, {CAR_NUM_TXT: os_data['CAR_TYPE_TXT']}));
                $.each(ot_data, function(index, item){
                    item['BF_FILE_'] = item['BF_FILE'] === '' ? '증빙없음' : '증빙첨부';
                    item['AF_FILE_'] = item['AF_FILE'] === '' ? '증빙없음' : '증빙첨부';
                    item['MILEAGE']  = parseInt(item['AF_KM']) - parseInt(item['BF_KM']);
                    item['KOSTL_TXT'] = os_data['KOSTL_TXT'];
                });
                gridObj.setJSONData(ot_data);
                if(os_data['FLAG'] === 'X'){
                    readOnly = true;
                    $('.btn_area.uni-form-table-button-area button').hide();
                    $('#attachedEvidence').show();
                    $.each($u.getNames('header-vehicleUsageInfo-content'), function(index, name){
                        $u.get(name).setReadOnly(true);
                    });
                    $.each(gridObj.getGridHeaders(), function (index, header) {
                        gridObj.makeColumnReadOnly(header.key);
                    });
                } else {
                    if($u.page.getPROGRAM_ID() === 'DRAFT_0080') gridObj.makeCellEditable('BF_KM', 0);
                }
            }, gridObj.clearGridData);

        }

        function getDefaultUseDate(){
            var os_data = $nst.is_data_os_data('ZUNIECM_7010');
            return {fromDate: os_data['DATAB'], toDate: os_data['DATBI']};
        }

        function getDefaultDrivingHisData(){
            var usedt, bf_km, af_km, mileage,
                 usekm1, usekm2, usekm3;
            var usageInfo =$u.getValues('header-vehicleUsageInfo-content');
            var distance = usageInfo['DISTANCE'];
            if(gridObj.getRowCount() !== 0) {
                usedt = '';
                bf_km = parseInt(gridObj.$V('AF_KM', gridObj.getRowCount() - 1));
            } else {
                usedt = usageInfo['USEDT_FR'];
                bf_km = 0;
            }

            usekm1 = distance * 2;
            usekm2  = 0;
            usekm3  = 0;
            af_km = bf_km + usekm1;
            mileage = af_km - bf_km;

            return {
                CAR_NUM: usageInfo['CAR_NUM'],
                USEDT: usedt,
                BF_KM: bf_km,
                AF_KM: af_km,
                MILEAGE: mileage,
                WONOFF: 'A',
                USEKM1: usekm1,
                USEKM2: usekm2,
                USEKM3: usekm3
            };
        }

        function handlerEvidenceInfo(columnKey, rowIndex, fileGroupId, fileCount){
            var evidenceColumnKey = columnKey.replace(/\^*_$/, '');
            if(fileCount > 0) gridObj.$V(columnKey, rowIndex, '증빙첨부');
            if(fileCount === 0) {
                gridObj.$V(columnKey, rowIndex, '증빙없음');
                fileGroupId = '';
            }
            gridObj.$V(evidenceColumnKey, rowIndex, fileGroupId);
        }

        function isGridInputsAreValid(gridData) {
            var valid = true;
            $.each(gridData, function(index, item){
                if (parseInt(item['MILEAGE']) < 0 || parseInt(item['USEKM2']) < 0) {
                    valid = false;
                    return false;
                }
            });
            return valid;
        }

        function calculateAndFillMileages(rowData) {
            var mileage = parseInt(rowData['AF_KM']) - parseInt(rowData['BF_KM']);
            var commutingMileage = 0;
            if (/^[ABC]$/.test(rowData['WONOFF'])) {
                var distance = parseInt($u.get('DISTANCE').getValue());
                commutingMileage = rowData['WONOFF'] === 'A'
                    ? distance * 2
                    : distance
            }
            var transactionalMileage = mileage - commutingMileage - parseInt(rowData['USEKM3']);

            rowData['MILEAGE'] = mileage;
            rowData['USEKM1'] = commutingMileage;
            rowData['USEKM2'] = transactionalMileage;
        }

        return function() {
            var useAttachSetting = $u.programSetting.getValue('첨부파일 사용(yes/no) 빈값은 경우 ATTACH 설정 따름');
            var $fileAttachWrapper = $('#file-attach-wrapper');
            if(useAttachSetting === 'yes') $fileAttachWrapper.show();
            else if(useAttachSetting === 'no') $fileAttachWrapper.hide();

            if ($u.programSetting.getValue('useFileSearchDialog') === 'true') $u.fileUI.getFineUploader().useSearchButton();
            if ($u.page.getPROGRAM_ID() === 'DRAFT_0080_01') $('#uni-grid-buttons').hide();

            gridObj.setSortEnable(false);
        }
    }
});