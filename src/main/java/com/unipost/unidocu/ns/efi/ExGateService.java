package com.unipost.unidocu.ns.efi;

import com.unipost.*; // NOPMD
import com.unipost.unidocu.module.property.ServerProperty;
import com.unipost.unidocu.service.AbstractJAVAService;
import com.unipost.unidocu.util.UniDocuUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ExGateService extends AbstractJAVAService {
    @Override
    public NSReturn call(NSParam nsParam) {
        ImportParam importParam = nsParam.getImportParam();
        String mode = importParam.get("mode");
        String bizNo = importParam.get("bizNo");

        if(!StringUtils.equals(mode, "getClosedVendor")) throw new NSLogicalException("Unknown mode. mode: " + mode, this.getClass().getSimpleName());

        String url = ServerProperty.getInstance().getString("ExGate.closedVandorQueryUrl");
        if (url == null) throw new NSLogicalException("ExGate.closedVandorQueryUrl server property missing.", this.getClass().getSimpleName());

        HashMap<String, String> headers = new HashMap<>();
        headers.put("X-ExGate-Key", "756e69706f7374");
        Map<String, String> params = new HashMap<>();
        params.put("orgCd", "hometax");
        params.put("svcCd", "Z0001");
        params.put("bizNo", bizNo);

        NSReturn nsReturn = new NSReturn();
        nsReturn.put("res", UniDocuUtil.getContentsByPostRequest(url, headers, params));
        return nsReturn;
    }
}
