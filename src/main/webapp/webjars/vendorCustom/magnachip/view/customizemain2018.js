/**
 * @module vendorCustom/magnachip/view/customizemain2018
 */
define(function () {
    return function (initFn) {
        initFn();

        var title = document.querySelector("#formLogin > div.login-title > h2");
        title.innerText="e-Accounting Document System";
        var subtitle = document.querySelector("#formLogin > div.login-title > p")
        subtitle.remove();
        $('.login-title h2').css('font-size','24pt');
        $nst.is_data_nsReturn('ChangePasswordWithEmailValidation', {mode: 'use_password_change_with_email_validation'}, function () {
            $('#change-password-with-email-validation').hide();
        });
    }
});

