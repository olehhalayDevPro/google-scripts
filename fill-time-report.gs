/**
 * @fileOverview Script for auto-fill dev-pro time report from PTR report
 * @author Oleh Halay
 * @version 0.0.1
 */
 
 
 function createTriggrt() {
  ScriptApp.newTrigger('fillTimeReport')
  .timeBased()
  .atHour(12)
  .everyDays(1)
  .create();
}

function fillTimeReport() {  
  var jiraDocumentId = '<ptr_file_id>';
  var name = '<you_name>';
  
  filterReportByName(jiraDocumentId, name);
  
  var reportDetails = getDailyReport(jiraDocumentId);
  updateMyDailyReport(reportDetails.report);
  
  var formatedReport = formatReport(reportDetails.report);
  sendMail(reportDetails.hours, formatedReport);
}

function formatReport(report) {
  var formatedReport = '';
  report.forEach(function (row) {
    row.forEach(function (element) {
         formatedReport += element + '\t'              
    });
    formatedReport += '\n'
  });
  return formatedReport;
}


function updateMyDailyReport(report) {
  if(report.length === 0)
     return;
  
  var currentDoc = SpreadsheetApp.getActive();
  var currentSheet = currentDoc.getSheets()[0];
  
  var lastRow = getLastRowFromDocument(currentSheet);

  currentSheet
    .getRange(lastRow, 1, report.length, report[0].length)
    .setValues(report);
 
  currentSheet.getRange(lastRow + 1, 1, report.length).setNumberFormat('dd-MMM-yyyy');
}

function getLastRowFromDocument(sheet) {
  var table = sheet.getDataRange().getValues();
  
  for(i = 2; i < sheet.getLastRow(); ++i) {
    if(table[i][0] === '') {
      return ++i;
    }
  }
}

function getDailyReport(fromDocumentId){
  var doc = SpreadsheetApp.openById(fromDocumentId);
  var sheet = doc.getSheets()[0];
  
  var lastColumn = sheet.getLastColumn();
  var lastRow = sheet.getLastRow();
  
  var MILLIS_PER_DAY = 1000 * 60 * 60 * 24;
  var now = new Date();
  var from = new Date(now.getTime() - 2*MILLIS_PER_DAY);
  
  var table = sheet.getDataRange().getValues();
  
  var hours = 0;
  var report = [];
   
  while( --lastRow != 0 && table[lastRow][0] && table[lastRow][0] != '') {
    if(table[lastRow][0] instanceof Date && Utilities.formatDate(table[lastRow][0], 'GMT', 'MM/dd/yyyy') === Utilities.formatDate(from, 'GMT', 'MM/dd/yyyy')) {
      report.push(table[lastRow])
      hours += table[lastRow][lastColumn - 1]
    } else if (! (table[lastRow][0] instanceof Date)){
      break;
    }
  }
  
  return { report: report, hours: hours};
}

function filterReportByName(reportId, name) {
  var content = 'Name:'
  var row = getRowForContent(reportId, content)
  
  var column = getColumnForName();
  
  var doc = SpreadsheetApp.openById(reportId);
  
  var sheet = doc.getSheets()[0];
  var range = sheet.getRange(row + 1, column + 1);
  
  range.setValue(name);
}

function getColumnForName() {
  return 2;
}

function getRowForContent(reportId, content) {
  var column = getColumnForName();
  var doc = SpreadsheetApp.openById(reportId);
  var sheet = doc.getSheets()[0];
  var table = sheet.getDataRange().getValues();
  
  for(i = 0; i < sheet.getLastRow(); ++i) {
    if(table[i][column] === content) {
      return ++i;
    }
  }
}

function sendMail(hours, content) {
  MailApp.sendEmail(
    Session.getActiveUser().getEmail(),
    'Bot daily Report ' + hours + 'h ' + Utilities.formatDate(new Date(), 'GMT', 'd-MMM-yyyy'),
     content
  );
}
