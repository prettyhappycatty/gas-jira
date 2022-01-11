var baseUrl = 'https://xxxxx.atlassian.net';
var token = Utilities.base64Encode('email@hogehoge.com:token');

var spreadsheet = SpreadsheetApp.openById('spreadsheetid');

//userシートは、送信用チェック、email、display_name, user_idの並び
const userSheet = spreadsheet.getSheetByName('user')

/**
 * * チェックが入っていて、user_idがない行のユーザを作る
 * @returns なし
 *　user_id欄に作ったユーザのIDを書き込む
 */
function createUser(){
  data = userSheet.getRange(1,1,userSheet.getLastRow(),4).getValues();
  Logger.log(data[1][0])
  for (var i = 1; i< data.length ; i++){//ヘッダを除く
    Logger.log(data[i])
    if (data[i][0] == true & data[i][3].length == 0){//チェックが入っているかつuser_idの入力がない
      email = data[i][1]
      display_name = data[i][2]
      json = makeJsonUser(email, display_name)
      ret = postUser(json)
      Logger.log(ret)
      userSheet.getRange(i+1,1).setValue(false)
      userSheet.getRange(i+1,4).setValue(ret['accountId'])
    } 
  }
}

/**
 * * ユーザを作るAPIを呼び出す
 * @param post_json 
 * @returns return_json
 */
function postUser(json){
  var requestUrl = baseUrl + '/rest/api/2/user/';
  Logger.log(requestUrl)
    var options = {
      method: 'post',
      payload: json,
      contentType: 'application/json',
      headers: {'Authorization': ' Basic ' + token}, 
      muteHttpExceptions:true
  }
  Logger.log(options)
  //Logger.log(json)
  response = UrlFetchApp.fetch(requestUrl, options)

  const responseCode = response.getResponseCode();
  const responseBody = response.getContentText();

  if(responseCode != 201){
    // issueをPOSTで叩いた場合201以外はエラー扱いとする
    throw new Error('エラーが発生しました(code:' + responseCode + ' responseBody:'+responseBody+')');
  }


  const result = JSON.parse(responseBody);

  Logger.log(result['id']);   // '10000'
  Logger.log(result['key']);  // 'TST-24'
  Logger.log(result['self']); // '{JiraAPIのベースURL}/issue/10000'
  return result
}

/**
 * * JSON.stringfyしたユーザデータを作成する
 * @param em emailAddress
 * @param  dn displayName
 * @returns 
 */
function makeJsonUser(em, dn){
  payload = {
    emailAddress: em,
    displayName: dn
  }
  return JSON.stringify(payload)
}