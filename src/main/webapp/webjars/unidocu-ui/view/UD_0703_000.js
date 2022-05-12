/**
 * @module unidocu-ui/view/UD_0703_000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('countBoxInfo', {
            description: '현황판 정보',
            type: 'json',
            defaultValue: [
                {
                    "title": "<span style=\"color: #E67C8D\">결재진행 현황</span>",
                    "items": [
                        {
                            "fieldId": "APPR_0",
                            "title": "미처리",
                            "navigateInfo": {"programId": "UFL_0401_010", "params": {"DISPLAY_GB": "A"}}
                        },
                        {
                            "fieldId": "APPR_1",
                            "title": "진행중",
                            "navigateInfo": {"programId": "UFL_0401_020", "params": {"DISPLAY_GB": "D"}}
                        },
                        {
                            "fieldId": "APPR_2",
                            "title": "반려/회수",
                            "navigateInfo": {"programId": "UFL_0401_030", "params": {"DISPLAY_GB": "C"}}
                        },
                        {
                            "fieldId": "APPR_3",
                            "title": "승인",
                            "navigateInfo": {"programId": "UFL_0401_040", "params": {"DISPLAY_GB": "B"}}
                        }
                    ]
                },
                {
                    "title": "<span style=\"color: #F0AE65\">미처리 증빙</span>현황",
                    "items": [
                        {
                            "fieldId": "CRD_CNT",
                            "title": "법인카드",
                            "navigateInfo": {"programId": "UD_0201_000", "params": {"dummy": "dummy"}}
                        },
                        {
                            "fieldId": "INV_CNT",
                            "title": "세금계산서",
                            "navigateInfo": {"programId": "UD_0201_010", "params": {"dummy": "dummy"}}
                        }
                    ]
                },
                {
                    "title": "<span style=\"color: #B0E0D4\">상신자 전표</span>현황",
                    "items": [
                        {
                            "fieldId": "DOC_1",
                            "title": "미상신",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "", "BSTAT": "V"}}
                        },
                        {
                            "fieldId": "DOC_2",
                            "title": "진행중",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "2", "BSTAT": "*"}}
                        },
                        {
                            "fieldId": "DOC_R",
                            "title": "반려",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "R", "BSTAT": "*"}}
                        },
                        {
                            "fieldId": "DOC_PR",
                            "title": "부분반려",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "H", "BSTAT": "*"}}
                        },
                        {
                            "fieldId": "DOC_C",
                            "title": "회수",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "C", "BSTAT": "*"}}
                        },
                        {
                            "fieldId": "DOC_3",
                            "title": "승인",
                            "navigateInfo": {"programId": "UD_0302_000", "params": {"STATS": "4", "BSTAT": "*"}}
                        }
                    ]
                }
            ]
        });
        $u.programSetting.appendTemplate('useBudgetGrid', {
            defaultValue: 'false',
            description: '예산현황 그리드 사용 여부'
        });
        $u.programSetting.appendTemplate('useBackgroundImage', {
            defaultValue: 'false',
            description: '배경 이미지 사용 여부(그리드와 중복사용 안됨)'
        });
        $u.programSetting.appendTemplate('postingId', {
            description: '공지사항 ID.'
        });
        $u.programSetting.appendTemplate('postingLimit', {
            defaultValue: '',
            type: 'date',
            description: '공지 게시 기한'
        });
        $u.programSetting.appendTemplate('postingContents', {
            defaultValue: '',
            type: 'html',
            description: '공지 게시 내용'
        });
        $u.programSetting.appendTemplate('postingWidth', {
            defaultValue: '800',
            description: '공지 게시 넓이'
        });
        $u.programSetting.appendTemplate('postingBUKRS', {
            defaultValue: staticProperties.user['BUKRS'],
            description: '회사 코드'
        });
        $u.buttons.addHandler({
            "moreNotice": function () {
                $u.navigateByProgramId('UD_0702_000');
            },
            "moreFAQ": function () {
                $u.navigateByProgramId('UD_0702_010');
            }
        });

        $u.buttons.addCustomHandler({
            handlePostingNotice: function () {
                var postingLimit = $u.programSetting.getValue('postingLimit');
                var postingContents = $u.programSetting.getValue('postingContents');
                var postingId = $u.programSetting.getValue('postingId');
                var cookieIgnoreNoticeDate = $u.util.localStorage.get('ignoreNoticeDate');
                var cookiePostingId = $u.util.localStorage.get('postingId');
                var currentDateAsDataFormat = $u.util.date.getCurrentDateAsDataFormat();

                if (currentDateAsDataFormat === cookieIgnoreNoticeDate && cookiePostingId === postingId) return;

                if (!postingLimit) return;
                if (!postingContents) return;
                if (Number(currentDateAsDataFormat) <= Number(postingLimit)) {
                    $u.dialog.noticeDialog.open(postingContents, $u.programSetting.getValue('postingWidth'));
                }
            },
            handlePopupNotice: function () {
                var webData = $u.webData.selectList({SCOPE:'popupSetting', WEB_DATA_ID: 'noticePopups'});
                if(!webData.length) return;
                var data = JSON.parse(webData[0]['DATA'])['OT_DATA'];
                var popupCurrentDateAsDataFormat = $u.util.date.getCurrentDateAsDataFormat();
                var cookiePopupIgnoreNoticeDate = $u.util.localStorage.get('popupIgnoreNoticeDate');

                data = data.filter(function (value) {
                    return staticProperties.user.BUKRS === value['postingBUKRS']
                }).filter(function(item) {
                    return item['postingLimit'] && item['postingData'] && parseInt(popupCurrentDateAsDataFormat) <= parseInt(item['postingLimit']);
                });

                if(cookiePopupIgnoreNoticeDate) {
                    data = data.filter(function(item) {
                        return cookiePopupIgnoreNoticeDate.filter(function (data) {
                            return data['key'] === item['noticeKey'] && data['date'] === popupCurrentDateAsDataFormat;
                        }).length === 0;
                    });
                }
                $.each(data, function (index, item) {
                    $u.dialog.noticeDialog.open(item['postingData'], item['postingWidth'], item['noticeKey'], true);
                });
            },
            handleUseBudgetGrid: function () {
                var useBudgetGrid = $u.programSetting.getValue('useBudgetGrid');
                var useBackgroundImage = $u.programSetting.getValue('useBackgroundImage');

                if (useBudgetGrid === 'false') {
                    if ($u.programSetting.getValue('useBackgroundImage') === 'true') $('#unidocu-grid-panel').hide();
                } else {
                    $(gridObj).show();
                }

                if (useBudgetGrid === 'true' || useBackgroundImage === 'false') {
                    $('#unipost-unidocu.UD_0703_000').find('#sub_content').css('background-image', 'none');
                }
            },
            renderDashboardData: function () {
                var tableReturns_8000 = $nst.is_data_tableReturns('ZUNIECM_8000');
                var ot_data_4000 = $nst.is_data_ot_data('ZUNIECM_4000');
                var ot_data_4010 = $nst.is_data_ot_data('ZUNIECM_4010');

                var countByFieldId = {};
                $.each(tableReturns_8000['OT_DATA'], function (index, item) {
                    countByFieldId[item['KEY']] = item['VALUE'];
                });

                var countBoxInfo = $u.programSetting.getValue('countBoxInfo');
                var navigateInfoByFieldId = {};
                $.each(countBoxInfo, function (index, item) {
                    $.each(item.items, function (index, item) {
                        navigateInfoByFieldId[item['fieldId']] = item['navigateInfo'];
                        item['count'] = countByFieldId[item['fieldId']];
                    });
                });

                var ud0703000CountBoxTemplate = $u.mustache.UD_0703_000_countBoxTemplate({countBoxInfo: countBoxInfo});
                $('.section-a tr').append(ud0703000CountBoxTemplate).on('click', '.count-line', function () {
                    var navigateInfo = navigateInfoByFieldId[$(this).data('fieldId')];
                    $u.navigateByProgramId(navigateInfo.programId, $.extend({}, navigateInfo.params, {mode: 'readonly'}));
                }).find('.count-box-wrapper').width((100 / countBoxInfo.length) + '%');

                $u.buttons.runCustomHandler('setBoardItems', ot_data_4000, $('.board-list.notice'));
                $u.buttons.runCustomHandler('setBoardItems', ot_data_4010, $('.board-list.faq'));

                var $sectionB = $('.section-b');
                $sectionB.show();
                $(window).resize(function () {
                    var $title = $('.board-list .title');
                    $title.css('max-width', $sectionB.width() / 3 - 120);
                    $title.width($sectionB.width() / 3 - 120);
                });
            },
            setBoardItems: function (ot_data, $el) {
                var maxBoardCount = 5;
                var bulletinTemplate = '<tr><td class="title ellipsis"><span>{{TITLE}}</span></td><td class="date">{{ERDAT}}</td></tr>';
                $u.thirdParty.mustache.parse(bulletinTemplate);
                var items = [];

                $.each(ot_data, function (index, item) {
                    if (index === maxBoardCount) return false;
                    var $item = $($u.thirdParty.mustache.render(bulletinTemplate, item));
                    if (item['NOTICE_KB'] === 'X') {
                        $item.addClass('NGB');
                        $item.find('.title span').prepend($mls.getByCode('M_UD_0703_000_noticePrefix'));
                    }
                    $item.data(item);
                    items.push($item);
                });
                $el.append(items).closest('.board-box').find('span:first').append($u.util.formatString(' {0}', [ot_data.length]));
            }
        });

        $('.tax-list').on('click', 'li', function () {
            var url = $(this).data('url');
            $u.popup.openPopup(url, url, 1280, 800);
        });

        $('.board-box').on('click', 'tr', function () {
            var nextProgramId = 'UD_0702_001';
            if ($(this).closest('.board-list').hasClass('faq')) nextProgramId = 'UD_0702_011';
            $u.navigateByProgramId(nextProgramId, $.extend({}, $(this).data(), {mode: 'readonly'}));
        });

        return function () {
            $u.buttons.runCustomHandler('handlePostingNotice');
            $u.buttons.runCustomHandler('handlePopupNotice');
            $u.buttons.runCustomHandler('handleUseBudgetGrid');
            $u.buttons.runCustomHandler('renderDashboardData');
        }
    }
});