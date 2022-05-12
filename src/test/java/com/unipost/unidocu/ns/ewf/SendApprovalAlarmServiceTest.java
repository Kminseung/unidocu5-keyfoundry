package com.unipost.unidocu.ns.ewf;

import com.unipost.NSParam;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.service.NamedService;
import com.unipost.unidocu.spring_config.MvcConfiguration;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@ContextConfiguration(classes = {MvcConfiguration.class})
@WebMvcTest
public class SendApprovalAlarmServiceTest {

    @Autowired
    private NamedService namedService;

    @Test
    @Ignore
    public void call() throws InterruptedException {
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
        for (Map.Entry<String, String> entry : map.entrySet()) {
            redirectUrl = redirectUrl.replace(String.format("{%s}", entry.getKey()), entry.getValue());
        }
        ArrayList<Map<String, String>> maps = new ArrayList<>();
        maps.add(map);
        map = new HashMap<>(map);
        map.put("SMTP_ADDR", "solarb0526@gmail.com");
        maps.add(map);
        map.put("redirectUrl", redirectUrl);

        NSParam nsParam = new NSParam();
        nsParam.setTableParam("IT_DATA", new TableParam(maps));
        namedService.call("SendApprovalAlarm", nsParam);

        for (Thread t : Thread.getAllStackTraces().keySet()) {
            if(t.getName().equals("SendApprovalMailThread")) {
                while(t.isAlive()) {
                    Thread.sleep(100);
                }
            }
        }
    }
}