/**
 * @module unidocu-ui/view/PROGRAM_HELP
 */
define(function () {
    return function () {
        $u.unidocuUI();

        var SCOPE = 'help';
        var $contentArea = $('#readonly-content');
        var $editorArea = $('#search-condition');
        var $modify = $('#MODIFY');
        var $preview = $('#PREVIEW');
        var $save = $('#SAVE');

        $u.buttons.addHandler({
            'MODIFY': function () {
                if (!$u.buttons.runCustomHandler('hasAuthority')) throw '수정 권한이 없습니다.';
                $u.ckeditorHandler.setContents($('#readonly-content').html());
                $u.buttons.runCustomHandler('toggleButtonsVisibility', 'modify');
                $contentArea.hide();
                $editorArea.show();
            },
            'PREVIEW': function () {
                $contentArea.html($u.ckeditorHandler.getContents());
                $u.buttons.runCustomHandler('toggleButtonsVisibility', 'preview');
                $editorArea.hide();
                $contentArea.show();
            },
            'SAVE': function () {
                if (!$u.buttons.runCustomHandler('hasAuthority')) throw '수정 권한이 없습니다.';
                $u.webData.createOrModifySingle(SCOPE, $u.buttons.runCustomHandler('createHelpWebDataID'),
                    {'content': $u.ckeditorHandler.getContents()},
                    function () { $u.buttons.runHandler('PREVIEW'); }
                );
            }
        });

        $u.buttons.addCustomHandler({
            'createHelpWebDataID': function() {
                return $u.page.getPageParams()['targetProgramID'] + '@PROGRAM_HELP';
            },
            'createPageTitle': function() {
                return $u.page.getPageParams()['targetProgramTitle'] + ' 화면 도움말';
            },
            'hasAuthority': function() {
                return staticProperties['user']['ADMIN'] === 'X';
            },
            'getHelp': function() {
                return $u.webData.selectOne(SCOPE, $u.buttons.runCustomHandler('createHelpWebDataID'))['content'];
            },
            'toggleButtonsVisibility': function(mode) {
                if (mode === 'modify') {
                    $modify.hide();
                    $preview.show();
                    $save.show();
                } else if (mode === 'preview') {
                    $modify.show();
                    $preview.hide();
                    $save.hide();
                }
            }
        });

        return function () {
            $u.setPageTitle($u.buttons.runCustomHandler('createPageTitle'));
            $('#unidocu-th-CONTENT').hide();
            $u.buttons.runCustomHandler('toggleButtonsVisibility', 'preview');
            if ($u.buttons.runCustomHandler('hasAuthority')) $('#uni-buttons-top').show();
            var help = $u.buttons.runCustomHandler('getHelp');
            $contentArea.html(help);
            if (!help) unidocuAlert('도움말이 등록되지 않았습니다.');
        }
    }
});