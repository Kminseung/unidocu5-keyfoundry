/**
 * for vendor customize
 * @module vendorCustom/customizeBeforeInitScript
 */
define(function () {
    // realgrid license, etc.
    var DEV_LIC = 'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/sTXJR8Yw8Y0WXyjOMqbrgvUTr6y7OTHzvLc6BWrTbYWDUL+XkbV6KqJaBli1MPTkkO5+/xJSE3LmEo6fF+v+vc0QeIbtyyIEGTFVqWmNPdyQ==';
    var TEST_LIC = 'upVcPE+wPOksRHztag2HLt+UVTCvO3is+83EYTz6U/sWz7UeHFI6ngdxc4m7NlDL9uPIqFJIFyK7d3oxIZoOWQXzJqbe4TSi0xKs6vY/QeCULHBy8OMcbTaaq0V9yFqW';
    var PRD_LIC = 'upVcPE+wPOksRHztag2HLtau1G7NGLZh+p2VI6Q9GDMWz7UeHFI6ngdxc4m7NlDLgty7g+cH2lUuCFud19zffm1PEUVQYiXYq3K3oLe0yw+QkuWbBZgqW32wtAhsIlytDufv8SUhNy6M4CHlSETefpJ/ySBJIkW5';

    window.realGridJsLic = {
        "192.168.180.42": DEV_LIC,                  // Remote PC
        "localhost": DEV_LIC,

        "192.168.139.112": DEV_LIC,                 // DEV Server
        "accountingtest.key-foundry.com": TEST_LIC,       // DEV Server

        "accounting.key-foundry.com": PRD_LIC,       // PRD Domain

    }[location.hostname];
    window.isLegalLicense = {
        "accounting.key-foundry.com": true,
        "accountingnew.key-foundry.com": true
    }[location.hostname];
    $customize.specPathes = $customize.specPathes.concat([
        'test/jasmine/viewSpec',
        'test/jasmine/efiSpec',
        'test/jasmine/ewfSpec'
    ]);
});