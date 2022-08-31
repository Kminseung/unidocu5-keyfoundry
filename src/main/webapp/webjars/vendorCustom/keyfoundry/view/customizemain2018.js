/**
 * @module vendorCustom/keyfoundry/view/customizemain2018
 */
define(function () {
    return function (initFn) {
        initFn();

        $('#formLogin .login-title h2').text('e-Accounting');
        $('#formLogin .login-title p').text('비용처리 시스템');
        var style =
            '.login-box-in::before { background-color: #219DCB; background-image: url(/webjars/vendorCustom/keyfoundry/images/login_logo.png); background-repeat: no-repeat; background-position: center;}'
            + '.login-box-in::after { content: ""; }';
        $('.login-box-in').append($('<style></style>').append(style));

        $u.buttons.addCustomHandler({
            chanePasswordValidation: function(pw, checkPW) {
                var passReg = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[`~!@#$%^&*()\-_=+\[\]{}\\|;:'",.<>\/?]).{9,}$/;

                if(!pw || !checkPW) throw $mls.getByCode('M_enterPassword');
                if(pw !== checkPW) throw($mls.getByCode('M_incorrectPassword'));
                if(!passReg.test(pw) && !passReg.test(checkPW)) throw($mls.getByCode('M_PreCondition_To_Password'));
            }
        });
    }
});