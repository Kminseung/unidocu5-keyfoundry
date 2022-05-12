package com.unipost.unidocu.rfc;

import com.unipost.ImportParam;
import com.unipost.NSParam;
import com.unipost.unidocu.module.named_service.JCOManagerWrapperFactory;
import org.junit.Test;

/**
 * Created by solarb on 2015-04-30.
 */
public class JCOClientFunctionWrapperFactoryTest {
    @Test
    public void testName() throws Exception {
        final ImportParam importParam = new ImportParam();
        importParam.put("MODE", "selectList");
        importParam.put("WEB_DATA_ID", "UD_0201_000");
        JCOManagerWrapperFactory.call("ZUNIECM_WEB_DATA", new NSParam(importParam));
    }

    @Test
    public void testCacheKey() {
        ImportParam importParam = new ImportParam();
        importParam.put("key_test", "key");
        System.out.println(importParam.toString());
    }
}