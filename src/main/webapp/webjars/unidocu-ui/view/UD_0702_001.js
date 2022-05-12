/**
 * UD_0702_001 공지사항 상세
 * @module unidocu-ui/view/UD_0702_001
 */
define(function () {
    return function () {
        $u.unidocuUI();

        var queryData = {};
        var notice;
        var postingLimit;
        var postingWidth;
        var readOnlyData;
        var postingBUKRS;
        var postingPOPUP;
        var postingData;
        var userROLE = staticProperties.user['ROLE'].split(',');
        $u.buttons.addHandler({
            "doSave": function () {
                var deferred = $.Deferred();
                notice = $u.buttons.runCustomHandler('noticeSave');
                deferred.resolve();
                deferred.done(function() {
                    if($u.page.getPROGRAM_ID() === 'UD_0702_001') {
                        postingLimit = $u.get('LIMIT').getValue();
                        postingWidth = $u.get('WIDTH').getValue();
                        postingBUKRS = $u.get('ZBUKRS').getValue();
                        postingPOPUP = $u.get('POPUP').getValue();
                        postingData = $u.get('DATA').getValue();
                        $nst.is_data_nsReturn(notice['namedServiceId'], notice['paramMap'], function(nsReturn) {
                            unidocuAlert(nsReturn.getReturnMessage(), function() {
                                var o_notice_key = nsReturn.getStringReturns()['O_NOTICE_KEY'];
                                if($u.page.getPageParams()['mode'] === 'edit') {
                                    if($u.get('POPUP').getValue() === '') {
                                        var webData = $u.webData.selectList({SCOPE:'popupSetting', WEB_DATA_ID: 'noticePopups'});
                                        var popupDataList = JSON.parse(webData[0]['DATA'])['OT_DATA'];
                                        popupDataList = popupDataList.filter(function(data) {return o_notice_key !== data['noticeKey']});
                                        $u.webData.createOrModifySingle('popupSetting', 'noticePopups', {OT_DATA: popupDataList});
                                        $u.navigateByProgramId('UD_0702_000');
                                    } else {
                                        $u.buttons.runCustomHandler('popupData', o_notice_key);
                                    }
                                } else {
                                    if($u.get('POPUP').getValue() === '') {
                                        moveToList();
                                    } else {
                                        $u.buttons.runCustomHandler('popupData', o_notice_key);
                                    }
                                }
                            });
                        });
                    } else if($u.page.getPROGRAM_ID() === 'UD_0702_011') {
                        $nst.is_data_returnMessage(notice['namedServiceId'], notice['paramMap'], function (message) {
                            unidocuAlert(message, function () {
                                moveToList();
                            });
                        });
                    }
                });
            },
            "doSearch": function () {
                moveToList();
            },
            "editStatement": function () {
                var jsonData = $.extend({}, $u.page.getPageParams(), {mode: 'edit'});
                var programId = 'UD_0702_001';
                var prevProgramId = 'UD_0702_000';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_011') {
                    programId = 'UD_0702_011';
                    prevProgramId = 'UD_0702_010';
                }
                $u.navigateByProgramId(programId, jsonData, prevProgramId);
            }
        });

        $u.buttons.addCustomHandler({
            noticeSave: function() {
                $u.validateRequired('form-table1');
                var paramMap = $u.getValues('form-table1');
                var mode = $u.page.getPageParams()['mode'];
                paramMap['NOTICE_KEY'] = $u.page.getPageParams()['NOTICE_KEY'];

                $u.fileUI.setFileAttachKeyParam(paramMap);

                paramMap = $.extend({}, queryData, paramMap);
                var namedServiceId = 'ZUNIECM_4001';
                if (mode === 'edit') namedServiceId = 'ZUNIECM_4002';

                if ($u.page.getPROGRAM_ID() === 'UD_0702_011') {
                    namedServiceId = 'ZUNIECM_4011';
                    if (mode === 'edit') namedServiceId = 'ZUNIECM_4012';
                }
                return {namedServiceId : namedServiceId, paramMap: paramMap}
            },
            popupData: function(o_notice_key) {
                var webData = $u.webData.selectList({SCOPE:'popupSetting', WEB_DATA_ID: 'noticePopups'});
                var popupDataList =[];
                if(webData.length > 0) popupDataList = JSON.parse(webData[0]['DATA'])['OT_DATA'];

                if($u.page.getPageParams()['mode'] === 'edit') {
                    $.each(popupDataList, function(index, item) {
                        if($u.page.getPageParams()['NOTICE_KEY'] === item['noticeKey']) {
                            item['postingLimit'] = $u.get('LIMIT').getValue();
                            item['postingWidth'] = $u.get('WIDTH').getValue();
                            item['postingBUKRS'] = $u.get('ZBUKRS').getValue();
                            item['postingPOPUP'] = $u.get('POPUP').getValue();
                            item['postingData'] = $u.get('DATA').getValue();
                        }
                    });

                    var found = false;
                    $.each(popupDataList, function(_, data) {
                        if (data['noticeKey'] === o_notice_key) {
                            found = true;
                            return false;
                        };
                    });
                    if (!found) {
                        popupDataList.push({postingData : postingData, postingLimit : postingLimit, postingWidth : postingWidth, postingBUKRS : postingBUKRS, postingPOPUP: postingPOPUP, noticeKey: o_notice_key});
                    }
                } else {
                    popupDataList.push({postingData : postingData, postingLimit : postingLimit, postingWidth : postingWidth, postingBUKRS : postingBUKRS, postingPOPUP: postingPOPUP, noticeKey: o_notice_key});
                }
                $u.webData.createOrModifySingle('popupSetting', 'noticePopups', {OT_DATA: popupDataList});
                $u.navigateByProgramId('UD_0702_000');
            }
        });

        function moveToList() {
            var listProgramId = 'UD_0702_000';
            if ($u.page.getPROGRAM_ID() === 'UD_0702_011') listProgramId = 'UD_0702_010';
            $u.navigateByProgramId(listProgramId);
        }

        return function () {
            $('#file-attach-wrapper').show();
            var readOnly = false;
            if ($u.page.getPageParams()['mode'] === 'readonly') readOnly = true;

            if (readOnly) {
                $u.get('NOTICE_KB').setReadOnly(true);
                $u.get('TITLE').setReadOnly(true);
                $('#doSave').hide();
            } else {
                $('#editStatement').hide();
            }

            if ($u.page.getPageParams()['mode']) {
                var namedServiceId = 'ZUNIECM_4000';
                if ($u.page.getPROGRAM_ID() === 'UD_0702_011') namedServiceId = 'ZUNIECM_4010';

                $nst.is_data_os_data(namedServiceId, {KEY: $u.page.getPageParams()['NOTICE_KEY']}, function (os_data) {
                    if (!os_data['ERDAT']) os_data['ERDAT'] = '';
                    if (!os_data['ERZET']) os_data['ERZET'] = '';

                    os_data['ERDAT_ERZET'] = os_data['ERDAT'] + ' ' + os_data['ERZET'];

                    if (readOnly && (staticProperties.user['ID'] === os_data['ID'] || $u.util.contains('NOTICE',userROLE))) $('#editStatement').show();
                    else $('#editStatement').hide();

                    queryData = os_data;
                    os_data['DATA'] = os_data['DATA'].replace(/<script.*\/script>/ig, '');
                    $u.setValues('form-table1', os_data);
                    if (readOnly) {
                        var $dataTD = $u.get('DATA').$el.parent();
                        $dataTD.children().hide();
                        $dataTD.append(os_data['DATA']);

                    } else {
                        $u.ckeditorHandler.setContents(os_data['DATA']);
                    }
                    $u.fileUI.load(os_data['EVI_SEQ'], readOnly);
                });
            }
            if($u.page.getPROGRAM_ID() === 'UD_0702_001') {
                if(readOnly) {
                    $u.get('ZBUKRS').setReadOnly(true);
                    $u.get('POPUP').setReadOnly(true);
                    $u.get('LIMIT').setReadOnly(true);
                    $u.get('WIDTH').setReadOnly(true);
                }
                var previewBtn_template = '<button class="unidocu-button" id="previewBtn" style="margin-bottom: 3px;">미리보기</button>';
                $u.get('POPUP').$el.find('input').css('width', '250px');
                $u.get("POPUP").$el.find('.input-box').append(previewBtn_template);
                $u.get('POPUP').$el.change(function () {
                    if($u.get('POPUP').getValue() === '') $('#previewBtn').hide();
                    else $('#previewBtn').show();
                }).change();
                $('#previewBtn').click(function () {
                    readOnlyData = $u.get('DATA').$el.parent().clone();
                    readOnlyData.children().remove('div');
                    if ($u.page.getPageParams()['mode'] === 'readonly') $u.dialog.noticeDialog.open(readOnlyData.html(), $u.get('WIDTH').getValue());
                    else $u.dialog.noticeDialog.open($u.get('DATA').getValue(), $u.get('WIDTH').getValue());
                });
            }
        }
    }
});