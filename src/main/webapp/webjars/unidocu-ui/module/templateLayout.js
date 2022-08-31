/**
 * @module unidocu-ui/module/templateLayout
 */
define(function () {
    return function () {
        $u.templateLayout = {};
        $u.templateLayout.unidocu_page_history = {};
        $u.templateLayout.unidocu_hash_change_by_navigate = false;

        $u.templateLayout.bindLocationHashHandler = function () {
            window.onhashchange = function () {
                var hashProgramId = location.hash.replace(/^#/, '');

                if ($u.templateLayout.unidocu_hash_change_by_navigate) {
                    $u.templateLayout.unidocu_hash_change_by_navigate = false;
                    return;
                } else {
                    if (!$u.menu.__menuData.getMenuNodeByProgramId(hashProgramId) && hashProgramId !== $u.menu.defaultPROGRAM_ID) {
                        $u.progressBar.hide();
                        $u.navigateByProgramId($u.menu.defaultPROGRAM_ID);
                        return;
                    }
                }
                var pageCallInfo = $u.templateLayout.unidocu_page_history[location.hash];
                if (!pageCallInfo) pageCallInfo = {programId: hashProgramId};
                $u.navigateByProgramId(pageCallInfo.programId, pageCallInfo.pageParams, null, true);
                $u.templateLayout.unidocu_hash_change_by_navigate = false;
            };
        };
        $u.templateLayout.bindScrollHandler = function () {
            var oldX = window.scrollX;
            var oldY = window.scrollY;
            $(window).scroll(function () {
                if ($('.ui-widget-overlay').length > 0) scrollTo(oldX, oldY);
                oldX = window.scrollX;
                oldY = window.scrollY;
            });
        };
        $u.templateLayout.bindReloadHandler = function () {
            function allowBackspace(target) {
                if ($(target).is('input:radio')) return false;
                if ($(target).is('input:checkbox')) return false;
                if ($(target).is('input')) return true;
                if ($(target).is('textarea')) return true;
                return $(target).closest('.cke_editable').length === 1;

            }

            $(document).on("keydown", function (e) {
                if (e.which === 8) {
                    e.stopPropagation();
                    if (!allowBackspace(e.target)) e.preventDefault();
                }
                if (e.which === 116) e.preventDefault();
                if (e.ctrlKey && e.which === 82) {

                    e.preventDefault();
                    if ($u.progressBar.hasMask()) return;
                    $u.pageReload();
                }
            });
            $(document).on("keyup", function (e) {
                if (e.which === 116) {
                    $u.UniDocuInput.closeDatePicker();
                    if ($u.progressBar.hasMask()) return;
                    $u.progressBar.show();
                    setTimeout(function(){
                        $u.progressBar.hide();
                    }, 100);
                    $u.pageReload();
                }
            });
        };
        $u.templateLayout.bindThemeChange = function () {
            if (staticProperties.serverAliasThemeName !== 'unipost') return;
            var $options = [];
            $.each(staticProperties.themeNames, function (index, theme) {
                $options.push($u.util.formatString('<option value="{0}">{0}</option>', [theme]));
            });
            $('#theme-names-wrapper').css('display', 'inline-block');

            $('#theme-names')
                .append($options)
                .val(staticProperties.themeName)
                .change(function () {
                    var selectedTheme = $(this).val();
                    localStorage.setItem('customThemeName', selectedTheme);
                    location.reload();
                });
            $('body').addClass(staticProperties.themeName);
        };
        $u.templateLayout.bindIsKeyBUKRSHandler = function () {
            var $isKeyBukrs = $('#IS_KEY_BUKRS');
            var params = {
                options: $u.f4Data.getCodeComboOption('BUKRS'),
                defaultValue: staticProperties.user['IS_KEY_BUKRS'],
                useEmptyOption: false
            };
            $isKeyBukrs.append($u.util.getSelectOptions(params));
            if (staticProperties.user['BUKRS_CHK'] === 'X') $isKeyBukrs.prop('disabled', false);
            $isKeyBukrs.change(function () {
                var params = {mode: 'is_key_bukrs', bukrs: $(this).val()};
                $nst.is_data_nsReturn('ChangeUserInfo', params, $u.locationReload);
            });
        };
        $u.templateLayout.bindLayoutElementClick = function () {
            function getUniDocuTablePadding() {
                return Number($('.unidocu-table .unidocu-th').css('padding-top').replace('px', ''));
            }

            function setUniDocuTablePadding(padding) {
                if (padding > 10) return;
                var $unidocuTableElement = $('.unidocu-table .unidocu-th, .unidocu-table .unidocu-td');
                $unidocuTableElement.css('padding-top', padding + 'px');
                $unidocuTableElement.css('padding-bottom', padding + 'px');
                $(window).trigger('resize');
            }

            $('.logoff').click(function () {
                location.href = $u.getUrlFromRoot('/logout.do');
            });
            $('#top-logo').click($u.moveToHome);
            $('#my-page').click($u.moveToHome);
            $('#wider-screen').click(function () {
                setUniDocuTablePadding(getUniDocuTablePadding() + 1);
            });
            $('#narrow-screen').click(function () {
                setUniDocuTablePadding(getUniDocuTablePadding() - 1);
            });
            $('.unidocu-button[data-action=excelDownload]').click($u.excelDownload);
            $('.user-id').click(function () {
                $u.dialog.userInfoDialog.open();
            });
            $('#clear-all-cache').click(function () {
                $u.locationReload();
            });
            $('#unidocu-page').click(function() {
                location.href = $u.getUrlFromRoot('/unidocu/view.do#UD_0703_000');
            });
            $('.guide-user-id').click(function() {
                $u.dialog.jsonDialog.open("Development User : " + staticProperties.user.GNAME + "<br>" + "Unidocu User : " + staticProperties.user.SNAME ,'UserInfo')
            });
            $('#layout-wrapper i').click(function (event) {
                var targetId = $(event.target).attr("id");
                var $layoutWrapper = $('#layout-wrapper');
                $layoutWrapper.find('i').removeClass('selected');
                $layoutWrapper.find('#' + targetId).addClass('selected');

                $u.util.localStorage.set('menu-layout', targetId);
                $u.locationReload();
            });
            $('#change-pw-before-login').click(function(){
                var $destination_alias = $('#DESTINATION_ALIAS');
                var $dialog = $($u.mustache.changePasswordBeforeLoginDialogTemplate());
                var $id = $dialog.find('#dialog-ID');
                var $pw_old = $dialog.find('#dialog-PW_OLD');
                var $pw_new = $dialog.find('#dialog-PW_NEW');
                var $pw_new_confirm = $dialog.find('#dialog-PW_NEW_CONFIRM');
                $id.val(staticProperties.user.ID);
                $dialog.find('input').keypress(function (e) {
                    if (e.which === 13) changePassword();
                });
                $id.val($id.val());
                $id.attr("readonly",true);
                $($pw_old,$pw_new,$pw_new_confirm).attr("autocomplete", "new-password")
                $id.keyup(function () {
                    if (/[a-z]/.test($(this).val())) $(this).val($(this).val().toUpperCase());
                }).focus();
                function changePassword() {
                    var id = $id.val();
                    var pw_old = $pw_old.val();
                    var pw = $pw_new.val();
                    var checkPW = $pw_new_confirm.val();
                    $u.buttons.runCustomHandler('changePasswordByUser', id, pw_old, pw, checkPW, $dialog);
                }
                $u.baseDialog.openModalDialog($dialog, {
                    title: $mls.getByCode('DLT_changeUserPassword'),
                    buttons: [
                        $u.baseDialog.getButton($mls.getByCode('DLB_save'), changePassword, 'unidocu-button blue'),
                        $u.baseDialog.getButton($mls.getByCode('DLB_cancel'), function () {
                            $dialog.dialog('close')
                        })
                    ]
                });
                $u.buttons.addCustomHandler({
                    changePasswordByUser: function (id, pw_old, pw, checkPW, $dialog) {
                        if (!pw_old) throw $mls.getByCode('M_enterPassword');
                        $u.buttons.runCustomHandler('chanePasswordValidation', pw, checkPW);
                        var paramMap = {
                            ID: id,
                            PW2_OLD: $u.thirdParty.sha256(pw_old),
                            PW2_NEW: $u.thirdParty.sha256(pw),
                            __DEST: $destination_alias.val()
                        };
                        $nst.is_data_returnMessage('ZUNIECM_9002', paramMap, function (message) {
                            unidocuAlert(message, function () {
                                $dialog.dialog('close');
                            });
                        });
                    },
                    chanePasswordValidation: function(pw, checkPW){
                        var passReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~!@#$%^&*()\-_=+\[\]{}\\|;:'",.<>\/?]).{9,}$/;

                        if(!pw || !checkPW) throw $mls.getByCode('M_enterPassword');
                        if(pw !== checkPW) throw($mls.getByCode('M_incorrectPassword'));
                        if(!passReg.test(pw) && !passReg.test(checkPW)) throw($mls.getByCode('M_PreCondition_To_Password'));
                    }
                });
            });
        };
        $u.templateLayout.initialize = function () {
            if(!$u.util.localStorage.get('menu-layout')) $u.util.localStorage.set('menu-layout', 'layout-left');

            $u.templateLayout.bindLocationHashHandler();
            $u.templateLayout.bindScrollHandler();
            $u.templateLayout.bindReloadHandler();
            $u.LANGUHandler.initialize();
            $u.templateLayout.bindThemeChange();
            $u.templateLayout.bindIsKeyBUKRSHandler();
            $u.templateLayout.bindLayoutElementClick();
            $('#current-date').append($u.util.date.getCurrentDateAsUserDateFormat());

            // menu layout 설정
            if ($u.util.localStorage.get('menu-layout')) $('#layout-wrapper').find('#' + $u.util.localStorage.get('menu-layout')).addClass('selected');
            else $('#layout-wrapper').find('#layout-left').addClass('selected');
        };
    }
});