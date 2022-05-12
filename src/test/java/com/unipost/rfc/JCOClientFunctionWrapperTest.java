package com.unipost.rfc;

import com.sap.conn.jco.ext.DestinationDataProvider;
import com.unipost.ImportParam;
import com.unipost.NSParam;
import com.unipost.NSReturn;
import com.unipost.unidocu.module.named_service.JCOManagerWrapper;
import com.unipost.unidocu.module.named_service.JCOManagerWrapperFactory;
import com.unipost.unidocu.module.property.RfcDestinationProperty;
import com.unipost.unidocu.module.property.ServerProperty;
import org.apache.commons.lang3.SystemUtils;
import org.junit.BeforeClass;
import org.junit.Test;

import java.io.File;
import java.util.HashMap;

/**
 * Created by solarb on 2015-04-30.
 */
public class JCOClientFunctionWrapperTest {
	public static final String TEST_DESTINATION_NAME = "TEST_DESTINATION_NAME";

	@BeforeClass
	public static void beforeClass(){
		String sapjcoPath = ServerProperty.getSapjcoPath();
		String javaVmName = SystemUtils.JAVA_VM_NAME;
		String pathSeparator = File.pathSeparator;
		if(javaVmName.contains("64-Bit") && new File(sapjcoPath, "/x64").isDirectory()) sapjcoPath =  sapjcoPath + "/x64";
		System.setProperty("java.library.path", System.getProperty("java.library.path") + pathSeparator + sapjcoPath);

		createTestDestination(TEST_DESTINATION_NAME);
	}

	public static void createTestDestination(String destinationAlias) {
		HashMap<String, String> destinationPropertyMap = new HashMap<>();
		destinationPropertyMap.put(DestinationDataProvider.JCO_ASHOST, "211.48.245.138");
		destinationPropertyMap.put(DestinationDataProvider.JCO_SYSNR, "00");
		destinationPropertyMap.put(DestinationDataProvider.JCO_CLIENT, "800");
		destinationPropertyMap.put(DestinationDataProvider.JCO_USER, "IF_UNIDOCU");
		destinationPropertyMap.put(DestinationDataProvider.JCO_PASSWD, "a123123!");
		destinationPropertyMap.put(DestinationDataProvider.JCO_LANG, "en");

		CustomDestinationDataProvider.setDestination(destinationAlias, destinationPropertyMap);
	}
	private ImportParam getImportParam() {
		ImportParam importParam = new ImportParam();
		importParam.put("RFCHEX3", "RFCHEX3");
		importParam.put("RFCFLOAT", "0.1");
		importParam.put("RFCINT4", "123");
		importParam.put("RFCCHAR4", "RFCCHAR4");
		importParam.put("RFCINT1", "1");
		importParam.put("RFCTIME", "123456");
		importParam.put("RFCINT2", "100");
		importParam.put("RFCCHAR2", "RFCCHAR2");
		importParam.put("RFCCHAR1", "RFCCHAR1");
		importParam.put("RFCDATA1", "RFCDATA1");
		importParam.put("RFCDATE", "99991231");
		return importParam;
	}

	@Test
	public void testCall_NSParam() {
		ImportParam importParam = getImportParam();
		NSReturn nsReturn = new JCOManagerWrapper("RFC_WALK_THRU_TEST", new NSParam(importParam), TEST_DESTINATION_NAME).call();
		System.out.println(nsReturn.getExportMap("TEST_OUT"));
		System.out.println(nsReturn.getTableReturns());
	}

	@Test
	public void testCall_DestinationAliases() {
		JCOManagerWrapperFactory.clearDestinationRepository();
		for (String destinationAlias : RfcDestinationProperty.getDestinationAliases()) {
			ImportParam importParam = getImportParam();
			NSReturn nsReturn = new JCOManagerWrapper("RFC_WALK_THRU_TEST", new NSParam(importParam), destinationAlias).call();
			System.out.println(destinationAlias);
			System.out.println(nsReturn.getExportMap("TEST_OUT"));
			System.out.println(nsReturn.getTableReturns());
		}
	}


	@Test
	public void testClearDestinationRepository() {
		JCOManagerWrapper.clearDestinationRepository(TEST_DESTINATION_NAME);
	}
}