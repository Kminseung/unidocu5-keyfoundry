package com.unipost.unidocu.vender_custom;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.xml.XmlMapper;
import com.unipost.ExportMap;
import com.unipost.ImportParam;
import com.unipost.NSReturn;
import com.unipost.unidocu.module.property.RfcDestinationProperty;
import com.unipost.unidocu.service.NamedService;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
public class MagnachipController {
    private final NamedService namedService;

    private static final Logger logger = LoggerFactory.getLogger(MagnachipController.class);

    public MagnachipController(NamedService namedService) {
        this.namedService = namedService;
    }

    @RequestMapping(value = "/magnachip/getValidationData", produces = MediaType.APPLICATION_JSON_VALUE)
    public Object getValidationData(@RequestParam String importParams,
                                    @RequestParam String tableParamsitdata1,
                                    @RequestParam String tableParamsitdata2,
                                    @RequestParam String beltotal,
                                    @RequestParam String belparams) {
        try {
            String Destination = RfcDestinationProperty.getDestinationAlias();
            String url = null;
            String apiUrl = null;
            if(Objects.equals(Destination, "QAS_101")){
                url = "http://devmw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwApprovalDraft";  // 개발
                apiUrl = "http://10.100.22.234/magnachipGw/interfaceGetStatus/";
            }else if(Objects.equals(Destination, "PRD_100")){
                url = "https://mw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwApprovalDraft";  // 운영
                apiUrl="https://accounting.magnachip.com/magnachipGw/interfaceGetStatus/";
            }
            List<Map<String, String>> docInfoList = new ArrayList<>();
            List<Map<String, String>> contentsList = new ArrayList<>();
            List<Map<String, String>> arraycontentsList = new ArrayList<>();
            List<Map<String, String>> circularList = new ArrayList<>();


            JSONObject jsonimportParams = new JSONObject(importParams);            //docinfo
            JSONArray jsontableParamsitdata1 = new JSONArray(tableParamsitdata1);  //aprline
            JSONArray jsonbelparams = new JSONArray(belparams);                    //content
            JSONArray jsontableParamsitdata2 = new JSONArray(tableParamsitdata2);  //circular


            Map<String, String> docInfo = new HashMap<>();
            docInfo.put("title", jsonimportParams.getString("WF_TITLE"));
            docInfo.put("public", "Y");
            docInfo.put("period", "5");
            docInfo.put("template", "Y");
            docInfo.put("formid", "2021000042");

            docInfoList.add(docInfo);

            //전표 content
            Map<String, String> contentlinelist = new HashMap<>();
            for (int i = 0; i < jsonbelparams.length(); i++) {
                JSONObject JSONObject = jsonbelparams.getJSONObject(i);
                contentsList.add(new ObjectMapper().readValue(JSONObject.toString(), Map.class));
            }
            int z = 1;
            for (Map<String, String> stringMap : contentsList) {
                Map<String, String> contentline;
                contentline = stringMap;
                contentline.values().removeAll(Collections.singleton(""));
                String[] c_array = {"WRBTR_TXT","URL", "GRONO", "BUDAT", "BANKS_TXT", "ZUONR_TXT", " EVKEY", "KOINH", "ID", "SIGN", "ZLSCH", "KUNNR", "BKTXT", "EVIKB_TXT", "BUKRS_TXT", "ZFBDT", "KURSF", "KUNNR_TXT", "LIFNR", "EVI_CNT", "GJAHR", "DMBTR_S_TXT", "FLAG", "SEQ", "BUKRS", "ID_TXT", "BANKL", "BANKN", "WRBTR", "WAERS", "BANKS", "KOSTL_TXT", "WRBTR_H_TXT", "BVTYP", "KOSTL", "DMBTR_TXT", "LWAERS", "HKONT", "BANKL_TXT", "DMBTR_H_TXT", "DUMMY", "DMBTR", "WRBTR_S_TXT", "EVIKB", "BLART"};
                for (int j = 0; j < Arrays.stream(c_array).count(); j++) {
                    contentline.remove(c_array[j]);
                }
                String num = String.format("%02d", z);
                contentline.put("EADocType" + num, "전표유형");//전표유형
                contentline.put("EADocNum" + num, contentline.remove("BELNR"));//전표번호
                contentline.put("EADocDate" + num, contentline.remove("BLDAT"));//증빙일
                contentline.put("EASubjectName" + num, contentline.remove("HKONT_TXT"));//계정과목명
                contentline.put("EABuyerName" + num, contentline.remove("LIFNR_TXT"));//구매처명
                contentline.put("EAPrice" + num, contentline.remove("CHARGE_TXT"));//공급가액
                contentline.put("EAVat" + num, contentline.remove("TAX_TXT"));//세액
                contentline.put("EABrief" + num, contentline.remove("SGTXT"));//적요
                z++;
                contentlinelist.putAll(contentline);
                contentlinelist.put("EATotal01", beltotal);
            }

            arraycontentsList.add(contentlinelist);

            //결재자 loop
            //기안자 고정 sap 에서 넘겨줄 예정
            Map<String, String> aprLine1 = new HashMap<>();
            ArrayList<Map<String, String>> apprlinelist = new ArrayList<>();
            String id = jsonimportParams.getString("ID");

            aprLine1.put("sn", "1"); // 기안자가 무조건 1번이여야함, 0번 안됨
            aprLine1.put("aprtype", "1");    //1 - 결재(기안), 8 - 협조, 9 -  합의
            aprLine1.put("userid", id); //jsonimportParams.getString("PERNR")
            aprLine1.put("deptid", jsonimportParams.getString("DEPT_CD"));   //추후 맵핑
            aprLine1.put("ProcessingDept", ""); // 없음
            aprLine1.put("edit", "Y");
            aprLine1.put("appr_view", "");
            aprLine1.put("apiid", jsonimportParams.getString("GRONO"));     //문서번호? jsonimportParams.getString("GRONO")
            aprLine1.put("appr_api", apiUrl + jsonimportParams.getString("PERNR") + "/" + "B" + "/" + jsonimportParams.getString("GRONO"));
            aprLine1.put("reject_api", apiUrl + jsonimportParams.getString("PERNR") + "/" + "D" + "/" + jsonimportParams.getString("GRONO"));

            for (int i = 0; i < jsontableParamsitdata1.length(); i++) {
                JSONObject JSONObject1 = jsontableParamsitdata1.getJSONObject(i);
                apprlinelist.add(new ObjectMapper().readValue(JSONObject1.toString(), Map.class));
            }
            for (int i = 0; i < apprlinelist.size(); i++) {
                Map<String, String> aprLine;
                aprLine = apprlinelist.get(i);
                aprLine.values().removeAll(Collections.singleton(""));
                String[] s_array = {"WF_USER", "WF_LINE_LEV", "NODE_KEY", "WF_FINAN", "WF_ID_TXT", "JOB_KEY", "JOB_KEY_TXT", "BUKRS", "SELECTED", "POS_KEY_TXT", "DISPLAY_TEXT", "WF_SEQ", "NODE_KEY_TXT", "POS_KEY"};
                for (int j = 0; j < Arrays.stream(s_array).count(); j++) {
                    aprLine.remove(s_array[j]);
                }
                aprLine.put("userid", aprLine.get("WF_ID"));// aprLine.remove("WF_ID")
                aprLine.put("sn", (Integer.toString(i + 2)));//aprLine.remove("WF_LINE_LEV")
                aprLine.put("aprtype", "1");
                aprLine.put("deptid", aprLine.remove("DEPT_CD"));//aprLine.remove("DEPT_CD")
                aprLine.put("edit", "Y");
                aprLine.put("appr_view", "");
                aprLine.put("ProcessingDept", "");
                aprLine.put("apiid", jsonimportParams.getString("GRONO"));     //문서번호? jsonimportParams.getString("GRONO")
                aprLine.put("appr_api", apiUrl + aprLine.get("WF_ID") + "/" + "B" + "/" + jsonimportParams.getString("GRONO"));
                aprLine.put("reject_api", apiUrl + aprLine.remove("WF_ID") + "/" + "D" + "/" + jsonimportParams.getString("GRONO"));

          }
            apprlinelist.add(aprLine1); //기안자

            //circulra 참조자
            for (int i = 0; i < jsontableParamsitdata2.length(); i++) {
                JSONObject JSONObject = jsontableParamsitdata2.getJSONObject(i);
                circularList.add(new ObjectMapper().readValue(JSONObject.toString(), Map.class));
            }
            for (Map<String, String> stringStringMap : circularList) {
                Map<String, String> circularline;
                circularline = stringStringMap;
                circularline.values().removeAll(Collections.singleton(""));
                circularline.values().removeAll(Collections.singleton("0"));
                circularline.values().removeAll(Collections.singleton("1"));
                String[] cu_array = {"POS_KEY_TXT", "WF_ID_TXT", "DISPLAY_TEXT", "NODE_KEY_TXT", "NODE_KEY", "POS_KEY", "BUKRS", "WF_LINE_LEV", "NODE KEY TXT", "POS_KEY", "BUKRS", "JOB_KEY_TXT", "WF_SEQ", "JOB_KEY"};
                for (int j = 0; j < Arrays.stream(cu_array).count(); j++) {
                    circularline.remove(cu_array[j]);
                }
                circularline.put("userid", circularline.remove("WF_ID"));
                circularline.put("deptid", circularline.remove("DEPT_CD"));
            }
            // docInfo json string
            Map<String, Object> requestMap = new HashMap<>();

            // 문서정보 - N건 json string
            requestMap.put("docinfo", docInfoList);
            // 결재선정보 - N건 json string
            requestMap.put("aprline", apprlinelist);
            // 본문정보 - N건 json string
            requestMap.put("contents", arraycontentsList);
            // ?? - N건 json string
            requestMap.put("circular", circularList);
            // ?? - string
            requestMap.put("opinion", "");
            logger.info(String.valueOf(requestMap));
            // 결재연동 API PPT: 결재승인요청 샘플데이터
            return getObject(url, requestMap);
        } catch (Exception e) {
            return e;
        }
    }

    @RequestMapping(value = "/magnachip/updateStatus", produces = MediaType.APPLICATION_JSON_VALUE)
    public Object updateStatus(@RequestParam String importparam, @RequestParam String docinfo) {
        try {
            String Destination = RfcDestinationProperty.getDestinationAlias();
            String url = null;
            if(Objects.equals(Destination, "QAS_101")){
                 url = "http://devmw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwUpdateStatus";  // 개발
            }else if(Objects.equals(Destination, "PRD_100")){
                 url = "https://mw.magnachip.com/myoffice/ezGateWayM/ezApproval.asmx/mwUpdateStatus";  // 운영
            }

            List<Map<String, String>> docInfoList = new ArrayList<>();
            Map<String, String> docInfo = new HashMap<>();
            //docinfo
            JSONObject jsonimportParams = new JSONObject(importparam);
            docInfo.put("docid", docinfo);
            docInfo.put("sn", (String) jsonimportParams.get("sn"));
            docInfo.put("userid", jsonimportParams.getString("ID"));
            String stat = "";
            if (jsonimportParams.getString("APPR_STAT").equals("B")) {
                stat = "1";
            } else if (jsonimportParams.getString("APPR_STAT").equals("D")) {
                stat = "4";
            } else if (jsonimportParams.getString("APPR_STAT").equals("E")) {
                stat = "3";
            }
            docInfo.put("aprStatus", stat);//: 1 - 결재, 3 - 기안자취소, 4 - 반려
            docInfoList.add(docInfo);
            Map<String, Object> requestMap = new HashMap<>();
            requestMap.put("docinfo", docInfoList);
            requestMap.put("opinion", jsonimportParams.getString("APPR_TEXT"));
            return getObject(url, requestMap);
        } catch (Exception e) {
            return e;
        }
    }
    //GW 승인 반려 url호출부
    @PostMapping("/magnachipGw/interfaceGetStatus/{userid}/{appr_stat}/{grono}")
    @ResponseBody
    public Object magnachipGwinterfaceGetStatus(
            @PathVariable("userid") String WF_ID,
            @PathVariable("appr_stat") String APPR_STAT,
            @PathVariable("grono") String GRONO,
            HttpServletRequest request
    ) throws RuntimeException {
        String WF_MOBILE = "X";
        try {
            if(WF_ID.charAt(0) == 'U'){
                WF_ID = WF_ID.replaceFirst("U", "9");
            }
            ImportParam importParam = new ImportParam();
            Map<String, String> requestMap = new HashMap<>();
            ExportMap returndata = new ExportMap(requestMap);
            importParam.put("APPR_STAT", APPR_STAT);
            importParam.put("GRONO", GRONO);
            importParam.put("WF_MOBILE", WF_MOBILE);
            importParam.put("WF_ID", WF_ID);
            NSReturn nsReturn = namedService.call("ZUNIEWF_4320", importParam);
            ExportMap result = nsReturn.getExportMap("OS_RETURN");
            if (result.get("TYPE").equals("S")) {
                returndata.put("error_code", "000");
                returndata.put("message", "success");
                logger.info(String.valueOf(returndata));
                return strValueToJson(returndata);
            } else {
                return false;
            }
        } catch (Exception e) {
            logger.error(e.getMessage());
            return e.getMessage();
        }
    }
    private Object getObject(String url, Map<String, Object> requestMap) throws JsonProcessingException {
        String result;
        MultiValueMap<String, Object> requestParam = new LinkedMultiValueMap<>();
        requestParam.add("docInfo", new ObjectMapper().writeValueAsString(requestMap));
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getMessageConverters().add(0, new StringHttpMessageConverter(StandardCharsets.UTF_8));
        result = restTemplate.postForObject(url, new HttpEntity<>(requestParam, httpHeaders), String.class);
        try
        {
            // Create a new XmlMapper to read XML tags
            XmlMapper xmlMapper = new XmlMapper();

            //Reading the XML
            JsonNode jsonNode = xmlMapper.readTree(result.getBytes());

            //Create a new ObjectMapper
            ObjectMapper objectMapper = new ObjectMapper();

            //Get JSON as a string
            String value = objectMapper.writeValueAsString(jsonNode);

            logger.info(value);
            return value;

        } catch (IOException e)
        {
            e.printStackTrace();
            return "fail";
        }
    }




    public static String strValueToJson(ExportMap strValue) {
        JSONObject jsonobject = new JSONObject(strValue);
        try {
            return jsonobject.toString(strValue.size());
        } catch (JSONException e) {
            e.printStackTrace();
            return jsonobject.toString();
        }
    }

}