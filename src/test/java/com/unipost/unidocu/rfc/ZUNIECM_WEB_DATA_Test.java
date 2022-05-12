package com.unipost.unidocu.rfc;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.unipost.*;
import com.unipost.rfc.TableParam;
import com.unipost.unidocu.module.named_service.JCOManagerWrapperFactory;
import org.junit.Test;

import java.util.Collections;
import static org.hamcrest.core.Is.is;
import static org.junit.Assert.assertThat;

/**
 * Created by solarb on 2016-02-03.
 */
public class ZUNIECM_WEB_DATA_Test {
    @Test
    public void testZUNIECM_WEB_DATA() throws Exception {
        callDelete("unitTest01", "unitTest02", "unitTest03", "unitTest04");
        ImportParam createParam1 = getImportParam(null, "unitTest01", objectToJSONString(getImportParam(null, "unitTest01", "")));
        callCreateOrModify(createParam1);

        ImportParam createParam2 = getImportParam(null, "unitTest02", objectToJSONString(getImportParam(null, "unitTest02", "")));
        ImportParam createParam3 = getImportParam(null, "unitTest03", objectToJSONString(callSelectList()));
        callCreateOrModify(createParam2, createParam3);

        ImportParam createParam4 = getImportParam(null, "unitTest04", objectToJSONString(callSelectOne("unitTest03")));
        callCreateOrModify(createParam4);


        ExportMap unitTest01 = callSelectOne("unitTest01");
        assertThat(unitTest01.get("DATA"), is("{\"SCOPE\":\"unitTest\",\"MODE\":null,\"WEB_DATA_ID\":\"unitTest01\",\"DATA\":\"\",\"DESCRIPTION\":\"DESCRIPTION\"}"));
        assertThat(callSelectOne("unitTest02").get("DATA").length(), is(97));
        assertThat(callSelectOne("unitTest03").get("DATA").length(), is(568));
        assertThat(callSelectOne("unitTest04").get("DATA").length(), is(861));
        callDelete("unitTest01", "unitTest02", "unitTest03", "unitTest04");
    }

    @Test
    public void testZUNIECM_WEB_DATA_selectList() {
        callDelete("unitTest01", "unitTest02", "unitTest03", "unitTest04");
        ImportParam importParam = getImportParam("selectList", "", "");
        importParam.put("WEB_DATA_ID", "");
        NSReturn nsReturn = JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(importParam));
        assertThat(nsReturn.getTableReturn("OT_DATA").size() > 0, is(true));

    }


    private ImportParam getImportParam(String mode, String web_data_id, String data) {
        ImportParam importParam = new ImportParam();
        importParam.put("SCOPE", "unitTest");
        importParam.put("MODE", mode);
        importParam.put("WEB_DATA_ID", web_data_id);
        importParam.put("DATA", data);
        importParam.put("DESCRIPTION", "DESCRIPTION");
        return importParam;
    }

    private String objectToJSONString(Object o) throws JsonProcessingException {
        return new ObjectMapper().writeValueAsString(o);
    }

    private ExportMap callSelectOne(String web_data_id) {
        return JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(getImportParam("selectOne", web_data_id, null))).getExportMap("OS_DATA");
    }

    private TableReturn callSelectList() {
        return JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(getImportParam("selectList", null, null))).getTableReturn("OT_DATA");
    }

    private void callCreateOrModify(ImportParam... importParams) {
        TableParam maps = new TableParam();
        Collections.addAll(maps, importParams);
        JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(getImportParam("createOrModify", null, null)).setTableParam("IT_DATA", maps));
    }

    private void callDelete(String... web_data_ids) {
        TableParam maps = new TableParam();
        for (String web_data_id : web_data_ids) maps.add(getImportParam(null, web_data_id, null));
        JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(getImportParam("delete", null, null)).setTableParam("IT_DATA", maps));
    }
}
