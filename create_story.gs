var baseUrl = 'https://xxxxx.atlassian.net';
var token = Utilities.base64Encode('email@hogehoge.com:token');

var spreadsheet = SpreadsheetApp.openById('spreadsheetid');
//storyシートは、送信用チェック、issue_id、summary, others
const storySheet = spreadsheet.getSheetByName('story')
const projectName = "projectname"
const issuetypeOfStory = ""

function test(){
  createStory()
}

/**
 * issueを取得
 */
function getIssue(issueId){
  var requestUrl = baseUrl + '/rest/api/2/issue/' + taskId;
  Logger.log(requestUrl)
  var options = {
    'method' : 'get',
    'headers': {'ContentType': 'application/json',
    'Authorization': 'Basic '+ token },
    'muteHttpExceptions' : false
  }
  ret = UrlFetchApp.fetch(requestUrl, options)
  Logger.log(ret);
  return ret
}

/**
 * * チェックが入っていて、story_idがない行のストーリーを作る
 * @returns なし
 *　story_id欄に作ったストーリーのIDを書き込む
 */
function createStory(){
  data = storySheet.getRange(1,1,storySheet.getLastRow(),4).getValues();
  Logger.log(data[1][0])
  for (var i = 1; i< data.length ; i++){//ヘッダを除く
    Logger.log(data[i])
    if (data[i][0] == true & data[i][1].length == 0){//チェックが入っているかつstory_idの入力がない
      summary = data[i][2]
      json = getStoryIssueJson(summary)
      ret = postStoryIssue(json)
      Logger.log(ret)
      storySheet.getRange(i+1,1).setValue(false)
      storySheet.getRange(i+1,2).setValue(result['key'])
    } 
  }
}

/**
 * * issueを作るAPIを呼び出す
 * @param post_json 
 * @returns return_json
 */
function postStoryIssue(json){
  var requestUrl = baseUrl + '/rest/api/2/issue/';
  Logger.log(requestUrl)
    var options = {
      method: 'post',
      payload: json,
      contentType: 'application/json',
      headers: {'Authorization': ' Basic ' + token}, 
      muteHttpExceptions:true
  }
  response = UrlFetchApp.fetch(requestUrl, options)

  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if(responseCode != 201){
    // issueをPOSTで叩いた場合201以外はエラー扱いとする
    throw new Error('エラーが発生しました(code:' + responseCode + ' responseBody:'+responseBody+')');
  }
  result = JSON.parse(responseBody);
  return result
}

/**
 * issue（ストーリー）のjsonを作成する
 */
function getStoryIssueJson(summary){

  json = {
  "update": {},
  "fields": {
    "summary": summary,
    "project": {
      "key": projectName
    },
    "issuetype": {
      "id": issuetypeOfStory
    }
  }
  }
  return JSON.stringify(json);
}