package com.unipost.util;

import org.junit.Test;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ConvertUtilTest
 */
public class ConvertUtilTest {
	@Test
    public void testToGridData_JcoTable() throws Exception {
        List<Map<String, String>> maps = new ArrayList<Map<String, String>>();
        HashMap<String, String> map = new HashMap<String, String>();
        map.put("textColumn", "value");
        map.put("checkboxColumn", "value");
        map.put("comboColumn", "value1");
        map.put("dateColumn", "value");
        map.put("imagetextColumn", "value");
        map.put("numberColumn", "value");
        maps.add(map);
    }

}
