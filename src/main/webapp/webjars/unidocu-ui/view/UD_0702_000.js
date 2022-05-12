/**
 * UD_0702_000 공지사항
 * @module unidocu-ui/view/UD_0702_000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        var userROLE = staticProperties.user['ROLE'].split(',');

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (columnKey === 'NOTICE_NO' || columnKey === 'TITLE') {
                var jsonData = gridObj.getJSONDataByRowIndex(rowIndex);
                jsonData['mode'] = 'readonly';

                var programId = 'UD_0702_001';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_010') programId = 'UD_0702_011';
                $u.navigateByProgramId(programId, jsonData);
            }
        });
        $u.buttons.addHandler({
            doQuery: function () {
                var namedServiceId = 'ZUNIECM_4000';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_010') namedServiceId = 'ZUNIECM_4010';
                $nst.is_data_ot_data(namedServiceId, $u.getValues('search-condition'), function (ot_data) {
                    gridObj.setJSONData(ot_data);
                });
            },
            createStatement: function () {
                var programId = 'UD_0702_001';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_010') programId = 'UD_0702_011';
                $u.navigateByProgramId(programId);
            },
            editStatement: function () {
                gridObj.asserts.selectedExactOneRow();

                var selectedjsonData = gridObj.getSELECTEDJSONData()[0];
                if ((selectedjsonData['ID'] !== staticProperties.user['ID']) && !$u.util.contains('NOTICE',userROLE)) throw $mls.getByCode('M_UD_0702_000_ownerCanEdit');

                var jsonData = $.extend({}, selectedjsonData, {mode: 'edit'});
                var programId = 'UD_0702_001';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_010') programId = 'UD_0702_011';
                $u.navigateByProgramId(programId, jsonData);
            },
            deleteStatement: function () {
                gridObj.asserts.selectedExactOneRow();

                var selectedjsonData = gridObj.getSELECTEDJSONData()[0];
                if ((selectedjsonData['ID'] !== staticProperties.user['ID']) && !$u.util.contains('NOTICE',userROLE)) throw $mls.getByCode('M_UD_0702_000_ownerCanDelete');

                unidocuConfirm($mls.getByCode('M_deleteConfirm'), function () {
                    var namedServiceId = 'ZUNIECM_4004';

                    if ($u.page.getPROGRAM_ID() === 'UD_0702_010') namedServiceId = 'ZUNIECM_4014';

                    if($u.page.getPROGRAM_ID() === 'UD_0702_000') {
                        $nst.is_data_nsReturn(namedServiceId, selectedjsonData, function(nsReturn) {
                            unidocuAlert(nsReturn.getReturnMessage(), function() {
                                var o_notice_key = nsReturn.getStringReturns()['O_NOTICE_KEY'];
                                var webData = $u.webData.selectList({SCOPE:'popupSetting', WEB_DATA_ID: 'noticePopups'});
                                var popupDataList =[];
                                if(webData.length > 0) popupDataList = JSON.parse(webData[0]['DATA'])['OT_DATA'];
                                popupDataList = popupDataList.filter(function(data) {return o_notice_key !== data['noticeKey']});
                                $u.webData.createOrModifySingle('popupSetting', 'noticePopups', {OT_DATA: popupDataList});
                                $u.buttons.triggerFormTableButtonClick();
                            });
                        });
                    } else if($u.page.getPROGRAM_ID() === 'UD_0702_010') {
                        $nst.is_data_returnMessage(namedServiceId, selectedjsonData, function (message) {
                            unidocuAlert(message, function () {
                                $u.buttons.triggerFormTableButtonClick();
                            });
                        });
                    }
                });
            }
        });

        return function () {
            gridObj.fitToWindowSize();
            gridObj.setCheckBarAsRadio('SELECTED');
            $u.buttons.triggerFormTableButtonClick();
        }
    }
});