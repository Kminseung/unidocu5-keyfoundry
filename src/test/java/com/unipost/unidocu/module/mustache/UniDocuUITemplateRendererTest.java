package com.unipost.unidocu.module.mustache;

import com.unipost.unidocu.module.email.UniPostMailSender;
import org.hamcrest.core.Is;
import org.junit.Test;

import java.io.IOException;
import java.util.*;

import static org.junit.Assert.*;

/**
 * Created by Administrator on 2016-11-01.
 */
public class UniDocuUITemplateRendererTest {

    @Test
    public void testGetUniDocuEApprovalTemplate() {

        Map<String, String> map = new HashMap<>();
        map.put("APPR_DATE", "0000-00-00");
        map.put("APPR_ID", "WF_002");
        map.put("BUKRS", "KR01");
        map.put("JOB_KEY", "0000000013");
        map.put("JOB_KEY_TXT", "팀장");
        map.put("NODE_KEY", "0000000022");
        map.put("NODE_KEY_TXT", "유진투자증권");
        map.put("POS_KEY", "0000000013");
        map.put("POS_KEY_TXT", "부장");
        map.put("SMTP_ADDR", "");
        map.put("WF_DATE", "2015-08-12");
        map.put("WF_DEPT", "0000000022");
        map.put("WF_ID", "TEST_USER");
        map.put("WF_ID_TXT", "정현주");
        map.put("WF_KEY_TEXT", "MICS-비용전표-2015-0000000056");
        map.put("WF_LINE_GB", "1");
        map.put("WF_LINE_LEV", "002");
        map.put("WF_MAIL_TITLE", "(결재요청)정현주");
        map.put("WF_SEQ", "002");
        map.put("WF_TYPE", "A");
        map.put("PERNR", "9");
        map.put("WF_KEY", "KR011020150000000160");
        String redirectUrl = "/unidocu/view.do?programId=DRAFT_0011&ID={APPR_ID}&PERNR={PERNR}&BUKRS={BUKRS}&WF_KEY={WF_KEY}&showAsPopup=true";
        map = new HashMap<>(map);
        map.put("SMTP_ADDR", "solarb0526@gmail.com");
        map.put("redirectUrl", redirectUrl);
        String contents = UniDocuUITemplateRenderer.getUniDocuEApprovalTemplate(map);
        System.out.println(contents);
        String result = "<table style=\"text-align: left; border-collapse: collapse; font-size: small; width: 700px;\" border=\"1\"><tr><th style=\"background-color: #ddd; width: 100px; font-weight: normal;padding-left: 10px;\">상신자</th><td style=\"padding-left:  10px;\">정현주</td></tr><tr><th style=\"background-color: #ddd; width: 100px; font-weight: normal;padding-left: 10px;\">상신일자</th><td style=\"padding-left:  10px;\">2015-08-12</td></tr><tr><th style=\"background-color: #ddd; width: 100px; font-weight: normal;padding-left: 10px;\">문서번호</th><td style=\"padding-left:  10px;\">MICS-비용전표-2015-0000000056</a></td></tr></table><a style=\"margin-top: 10px;\" href=\"/unidocu/view.do?programId=DRAFT_0011&amp;ID={APPR_ID}&amp;PERNR={PERNR}&amp;BUKRS={BUKRS}&amp;WF_KEY={WF_KEY}&amp;showAsPopup=true\" target=\"_blank\">결재문서 확인</a>";
        assertThat(result, Is.is(contents.replaceAll("\r\n", "").replaceAll("\\s{4}", "")));
    }

    @Test
    public void password_change_email() {
        Map<String, String> map = new HashMap<>();
        map.put("link", "http://unipost.co.kr");
        String actual = UniDocuUITemplateRenderer.getTemplateByClassPathResource("/mustache/password_change_email.mustache", map);
        System.out.println(actual);

        UniPostMailSender.sendHtmlMail("[UniDocu] 비밀번호 초기화", actual, Collections.singletonList("solarb0526@gmail.com"));
    }

    @Test
    public void getTemplateByClassPathResourceWithComplexScope() throws IOException {
        Map<String, Object> map = new HashMap<>();
        List<Map<String, String>> list = new ArrayList<>();
        Map<String, String> e = new HashMap<>();
        e.put("a", "aa");
        e.put("b", "bb");
        e.put("c", "cc");
        list.add(e);
        list.add(e);
        list.add(e);
        list.add(e);
        list.add(e);
        map.put("list", list);
        String actual = UniDocuUITemplateRenderer.getTemplateByClassPathResourceWithComplexScope("/mustache/complexTestTemplate.mustache", map);
        System.out.println(actual);
    }
}