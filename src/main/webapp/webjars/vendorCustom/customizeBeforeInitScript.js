/**
 * for vendor customize
 * @module vendorCustom/customizeBeforeInitScript
 */
define(function () {
    // realgrid license, etc.
    window.realGridJsLic = {
        "192.168.218.113": 'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/taU4bFd+X497RuKBmWbTQ0tryCjhN0jFJm79yHT0KSfO5Kr0ase8v3kn/JIEkiRbk=',
        "10.100.22.234": 'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/s0LJn5GpMH3PcfqPwSrWcj88Su/d3HELcfE9vkcHz55xWJVz4BABQVdAeQQV4lYgQ=',
        "10.100.22.149":'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/s0LJn5GpMH3PcfqPwSrWcjrSUX6oTmbQ8fE9vkcHz55xWJVz4BABQVdAeQQV4lYgQ=',
        "accounting.magnachip.com": 'upVcPE+wPOksRHztag2HLtau1G7NGLZh+p2VI6Q9GDMWz7UeHFI6ngdxc4m7NlDLKLrRUzo+t5eAldfDaUOtWw7n7/ElITcukwoPpbstHN6Sf8kgSSJFuQ==',
        "localhost": 'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/sTXJR8Yw8Y0adoq8hudFeXNTakk0yR9UeTQKGdzTNPAlauUGhjeun/0F/9996uLI0='
    }[location.hostname];
    window.isLegalLicense = {
        "accounting.magnachip.com" : true,
    }[location.hostname];
    $customize.specPathes = $customize.specPathes.concat([
        'test/jasmine/viewSpec',
        'test/jasmine/efiSpec',
        'test/jasmine/ewfSpec'
    ]);
});