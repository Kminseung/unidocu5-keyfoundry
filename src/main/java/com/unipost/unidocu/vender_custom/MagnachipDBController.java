package com.unipost.unidocu.vender_custom;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.json.JSONArray;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

@RestController
public class MagnachipDBController {

    private static final Logger logger = LoggerFactory.getLogger(MagnachipController.class);

    @RequestMapping(value = "/magnachip/getDBList" ,produces = "application/text; charset=UTF-8")
    public String getDBList(
            @RequestParam String pernr,
            @RequestParam String fromdate,
            @RequestParam String todate,
            @RequestParam String formid
    ) throws ClassNotFoundException {
        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");

        String connectionUrl =
                "jdbc:sqlserver://MXGW.magnachip.com:63301;"
                        + "database=ezApproval_M000;"
                        + "user=app_itworkplace;"
                        + "password=itworkplace#20210210;";

        DateTimeFormatter dateTimeFormat = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDate _fromDate = LocalDate.parse(fromdate, dateTimeFormat);
        LocalDate _toDate = LocalDate.parse(todate, dateTimeFormat);

        List<Map<String, String>> dbDataList = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(connectionUrl)) {
            // Code here.
            Statement stmt = connection.createStatement();
            ResultSet rs = stmt.executeQuery(
                    "SELECT * FROM " +
                            "VEADocumentList WHERE 1=1 " +
                            "AND aprmemberid = '" + pernr +
                            "'AND FormID = '" + formid +
                            "'AND DraftDate >= '" + _fromDate +
                            "'AND DraftDate <= '" + _toDate +
                            "'ORDER BY DraftDate"
            );

            while (rs.next()) {
                String DocNO = rs.getString("DocNO");
                String FormName = rs.getString("FormName");
                String FormID = rs.getString("FormID");
                String DraftDate = rs.getString("DraftDate");
                String Title = rs.getString("Title");
                String WriterName = rs.getString("WriterName");
                String URL = rs.getString("URL");

                Map<String, String> dbData = new HashMap<>();

                dbData.put("DocNO", DocNO);
                dbData.put("FormName", FormName);
                dbData.put("FormID", FormID);
                dbData.put("DraftDate", DraftDate);
                dbData.put("DOC_TITLE", Title);
                dbData.put("WriterName", WriterName);
                dbData.put("DOC_URL", URL);

                dbDataList.add(dbData);
            }
            rs.close();
            stmt.close();
            JSONArray json_dbDataList = new JSONArray(dbDataList);
            logger.info(String.valueOf(json_dbDataList));
            return json_dbDataList.toString();
        }
        // Handle any errors that may have occurred.
        catch (SQLException e) {
            e.printStackTrace();
            return e.getMessage();
        }
    }
}


