package com.unipost.unidocu.vender_custom.external_interface;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RunWith(SpringRunner.class)
public class MagnachipTest {

    @SuppressWarnings("NonAsciiCharacters")
    @Test
    public void 매그나칩_전자결재_API_테스트 () throws JsonProcessingException {
        String url = "http://devmw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwApprovalDraft";  // 개발
//        String url = "https://mw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwApprovalDraft";  // 운영

        List<Map<String, String>> docInfoList = new ArrayList<>();
        List<Map<String, String>> aprLineList = new ArrayList<>();
        List<Map<String, String>> contentsList = new ArrayList<>();
        List<Map<String, String>> circularList = new ArrayList<>();

        Map<String, String> docInfo = new HashMap<>();
        Map<String, String> aprLine1 = new HashMap<>();
        Map<String, String> aprLine2 = new HashMap<>();
        Map<String, String> aprLine3 = new HashMap<>();
        Map<String, String> contents = new HashMap<>();
        Map<String, String> circular1 = new HashMap<>();
        Map<String, String> circular2 = new HashMap<>();

        docInfo.put("title", "기안test");
        docInfo.put("public", "Y");
        docInfo.put("period", "5");
        docInfo.put("template", "N");
        docInfo.put("formid", "2020000001");

        aprLine1.put("sn", "1");
        aprLine1.put("aprtype", "1");
        aprLine1.put("userid", "U10886");
        aprLine1.put("deptid", "xx00");
        aprLine1.put("ProcessingDept", "");
        aprLine1.put("edit", "Y");
        aprLine1.put("appr_view", "");
        aprLine1.put("apiid", "00000");
        aprLine1.put("appr_api", "http://10.100.22.234/magnachipGw/interface");
        aprLine1.put("reject_api", "http://10.100.22.234/magnachipGw/interface");

        aprLine2.put("sn", "2");
        aprLine2.put("aprtype", "1");
        aprLine2.put("userid", "U10885");
        aprLine2.put("deptid", "xx00");
        aprLine2.put("ProcessingDept", "");
        aprLine2.put("edit", "y");
        aprLine2.put("appr_view", "");
        aprLine2.put("apiid", "00000");
        aprLine2.put("appr_api", "http://10.100.22.234/magnachipGw/interface");
        aprLine2.put("reject_api", "http://10.100.22.234/magnachipGw/interface");

        aprLine3.put("sn", "3");
        aprLine3.put("aprtype", "8");
        aprLine3.put("userid", "U10887");
        aprLine3.put("deptid", "xx00");
        aprLine3.put("ProcessingDept", "it team");
        aprLine3.put("edit", "y");
        aprLine3.put("appr_view", "");
        aprLine3.put("apiid", "00000");
        aprLine3.put("appr_api", "http://10.100.22.234/magnachipGw/interface");
        aprLine3.put("reject_api", "http://10.100.22.234/magnachipGw/interface");

        contents.put("test1", "1번값");
        contents.put("test2", "2번값");
        contents.put("test3", "3번값");
        contents.put("test4", "4번값");
        contents.put("test5", "5번값");
        contents.put("test6", "6번값");

        circular1.put("userid", "U10887");
        circular1.put("deptid", "xx00");

        circular2.put("userid", "U10886");
        circular2.put("deptid", "xx00");

        docInfoList.add(docInfo);
        aprLineList.add(aprLine1);
        aprLineList.add(aprLine2);
        aprLineList.add(aprLine3);
        contentsList.add(contents);
        circularList.add(circular1);
        circularList.add(circular2);

        // docInfo json string
        Map<String, Object> requestMap = new HashMap<>();

        // 문서정보 - N건 json string
        requestMap.put("docinfo", docInfoList);
        // 결재선정보 - N건 json string
        requestMap.put("aprline", aprLineList);
        // 본문정보 - N건 json string
        requestMap.put("contents", contentsList);
        // ?? - N건 json string
        requestMap.put("circular", circularList);
        // ?? - string
        requestMap.put("opinion", "");
        System.out.println("requestmap===>"+requestMap);

        // 결재연동 API PPT: 결재승인요청 샘플데이터
        MultiValueMap<String, Object> requestParam = new LinkedMultiValueMap<>();
        requestParam.add("docInfo", new ObjectMapper().writeValueAsString(requestMap));

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        RestTemplate restTemplate = new RestTemplate();
        System.out.println("====>"+requestParam);
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        String result = restTemplate.postForObject(url, new HttpEntity<>(requestParam, httpHeaders), String.class);
        System.out.println("result: " + result);
    }
}