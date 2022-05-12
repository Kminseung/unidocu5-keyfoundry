/**
 * UD_9040_020 inputTest
 * @module unidocu-ui/view/UD_9040_020
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.buttons.addHandler({
            setValues: function () {
                $u.setValues({
                    "Uni_Text": "setValue1",
                    "Uni_Radio": "b",
                    "Uni_Radio2": "c",
                    "Uni_Radio3": "a",
                    "Uni_InputAmount": 23456,
                    "Uni_InputAmount2": 789012,
                    "Uni_InputAmount3": 345678,
                    "Uni_Combo": "a",
                    "Uni_Combo2": "b",
                    "Uni_CodePopup": "code1",
                    "Uni_CodePopup_TXT": "text1",
                    "Uni_CustomCodePopup": "code6",
                    "Uni_CustomCodePopup_TXT": "text6",
                    "Uni_CodePopup2": "code2",
                    "Uni_CodePopup2_TXT": "text2",
                    "Uni_CodeCombo": "KR01",
                    "Uni_CodeCombo2": "KR01",
                    "Uni_InputText": "1234",
                    "Uni_InputText2": "test",
                    "Uni_DatePicker": "20121212",
                    "Uni_DatePicker2": "20131212",
                    "Uni_DatePickerFromToFrom": "22220202",
                    "Uni_DatePickerFromToTo": "99990202",
                    "Uni_CheckBox": "a,b",
                    "Uni_TextArea": "text area setValue1",
                    "Uni_MonthOnlyFromTo_FROM": "05",
                    "Uni_MonthOnlyFromTo_TO": "06",
                    "Uni_SelectYearMonthFromToFrom": "201502",
                    "Uni_SelectYearMonthFromToTo": "201703",
                    "Uni_SelectYearMonth": "201703",
                    "Uni_InputPassword": "password",
                    "Uni_TimeCombo": "1201",
                    "Uni_TextEditor": "<!DOCTYPE html>\n<html>\n<head>\n</head>\n<body>\n\n</body>\n</html>"
                });
            },
            setValues2: function () {
                $u.setValues({
                    "Uni_Text": "setValue2",
                    "Uni_Radio": "c",
                    "Uni_Radio2": "a",
                    "Uni_Radio3": "b",
                    "Uni_InputAmount": '345678',
                    "Uni_InputAmount2": '23456',
                    "Uni_InputAmount3": '789012',
                    "Uni_Combo": "c",
                    "Uni_Combo2": "a",
                    "Uni_CodePopup": "code3",
                    "Uni_CodePopup_TXT": "text3",
                    "Uni_CustomCodePopup": "code5",
                    "Uni_CustomCodePopup_TXT": "text5",
                    "Uni_CodePopup2": "code4",
                    "Uni_CodePopup2_TXT": "text4",
                    "Uni_CodeCombo": "KR01",
                    "Uni_CodeCombo2": "KR01",
                    "Uni_InputText": "test",
                    "Uni_InputText2": "1234",
                    "Uni_DatePicker": "88881230",
                    "Uni_DatePicker2": "88881230",
                    "Uni_DatePickerFromToFrom": "11111231",
                    "Uni_DatePickerFromToTo": "88881230",
                    "Uni_CheckBox": "c",
                    "Uni_TextArea": "text area setValue2",
                    "Uni_MonthOnlyFromTo_FROM": "07",
                    "Uni_MonthOnlyFromTo_TO": "08",
                    "Uni_SelectYearMonthFromToFrom": "201401",
                    "Uni_SelectYearMonthFromToTo": "201603",
                    "Uni_SelectYearMonth": "201602",
                    "Uni_InputPassword": "password",
                    "Uni_TimeCombo": "1201"
                });
            },
            setReadOnlyTrue: function () {
                var inputNames = $u.getNames();
                for (var i = 0, len = inputNames.length; i < len; i++) $u.get(inputNames[i]).setReadOnly(true);
            },
            setReadOnlyFalse: function () {
                var inputNames = $u.getNames();
                for (var i = 0, len = inputNames.length; i < len; i++) $u.get(inputNames[i]).setReadOnly(false);
            },
            setRequiredTrue: function () {
                var inputNames = $u.getNames();
                for (var i = 0, len = inputNames.length; i < len; i++) $u.get(inputNames[i]).setRequired(true);
            },
            setRequiredFalse: function () {
                var inputNames = $u.getNames();
                for (var i = 0, len = inputNames.length; i < len; i++) $u.get(inputNames[i]).setRequired(false);
            },
            getValues: function () {
                unidocuAlert(JSON.stringify($u.getValues('input-test-table'), null, 2));
            }
        });

        return function () {

        }
    }
});