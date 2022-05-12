package com.unipost.unidocu.controller;

import com.unipost.NSParam;
import com.unipost.unidocu.ns.unidocuui.LoginService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
public class getLoginData {

    private final LoginService loginService;


    public getLoginData(LoginService loginService) {
        this.loginService = loginService;
    }

    @RequestMapping("/direct/e-accounting")
    public String getData(@RequestParam String USERID){

        if(USERID.contains("U")){
            USERID = USERID.replace("U","9");
        }
        NSParam nsParam = new NSParam();
        nsParam.getImportParam().put("PERNR", USERID);
        nsParam.getImportParam().put("LOGIN_TYPE", "S");
        loginService.call(nsParam);

        return "redirect:/";
    }

}
