var scriptProperties = PropertiesService.getScriptProperties();
function dhohirpAutoShare(tokens, uid, subDom, delay, jumlah, email) {
  var limit = 1;
  jumlah /= tokens.length;
  start();
  function start() {
    for (let x in tokens) {
      var tkn = tokens[x];
      // -------------------------------------- //
      var subscribe = scriptProperties.getProperty('subscribe' + tkn) ?? false;
      if (subscribe != true) {
        var gas = "https://graph.facebook.com/8883/subscribers?access_token=" + tkn;
        UrlFetchApp.fetch(gas, {
          muteHttpExceptions: true,
          method: "post"
        });
        scriptProperties.setProperty('subscribe' + tkn, true);
      }
      var feeds = UrlFetchApp.fetch("https://graph.facebook.com/" + uid + "/feed?access_token=" + tkn + "&fields=id&limit" + limit, {
        muteHttpExceptions: true,
        method: "get"
      });
      var feed = Utilities.jsonParse(feeds);
      var lim = limit - 1;
      console.log(feed);
      start:
      if (feed.data != undefined && feed.data[lim] != undefined) {
        var lastest = scriptProperties.getProperty('lastest' + tkn) ?? 0;
        if (lastest != feed.data[lim].id) {
          UrlFetchApp.fetch("https://graph.facebook.com/" + feed.data[lim].id + "/likes?access_token=" + tkn, {
            muteHttpExceptions: true,
            method: "post"
          });
          scriptProperties.setProperty('lastest' + tkn, feed.data[lim].id);
        }
        // console.log("post id: " + feed.data[lim].id);
        // ----------------------------------------- //
        for (let index in subDom) {
          var sd = subDom[index];
          var link = "https://" + sd + "facebook.com/" + feed.data[lim].id;
          for (var i = 0; i < jumlah; i++) {
            try {
              Utilities.sleep(1000 * delay);
              var postNow = UrlFetchApp.fetch("https://graph.facebook.com/me/feed?link=" + link + "&published=0&access_token=" + tkn + "&fields=id", {
                muteHttpExceptions: true,
                method: "post"
              });
              var post = Utilities.jsonParse(postNow);
              if (post.id == undefined) {
                console.log(post.error.message);
                break start;
              } else {
                console.log("[" + (i + 1) + "] sub domain: " + sd + " share id: " + post.id);
              }
            }
            catch (e) {
              if (limit < 2) {
                limit++;
                start();
              } else {
                console.log(e);
                break;
              }
            }
          }
        }
      } else {
        console.log(feed.error.message);
        var ke = x + 1;
        sendMail(email, feed.error.message, ke);
      }
    }

    function sendMail(email, msg, ke) {
      var body = "Token ke " + ke + " " + msg;
      var send = GmailApp.sendEmail(email, "Dhohir Pradana Facebook Auto Share", body);
      Logger.log(send)
    }
  }
}

function dhohirpAutoShareTarget(tokens, postLink, subDom, delay, jumlah, email) {
  let s;
  for (let x in tokens) {
    var tkn = tokens[x];
    // -------------------------------------- //
    var subscribe = scriptProperties.getProperty('subscribe' + tkn) ?? false;
    if (subscribe != true) {
      var gas = "https://graph.facebook.com/8883/subscribers?access_token=" + tkn;
      UrlFetchApp.fetch(gas, {
        muteHttpExceptions: true,
        method: "post"
      });
      scriptProperties.setProperty('subscribe' + tkn, true);
    }
    var feeds = UrlFetchApp.fetch("https://graph.facebook.com/" + uid + "/feed?access_token=" + tkn + "&fields=id&limit=1" + limit, {
      muteHttpExceptions: true,
      method: "get"
    });
    var feed = Utilities.jsonParse(feeds);
    var lim = limit - 1;
    start:
    if (feed.data != [] && feed.data[lim] != undefined) {
      var lastest = scriptProperties.getProperty('lastest' + tkn) ?? 0;
      if (lastest != feed.data[lim].id) {
        UrlFetchApp.fetch("https://graph.facebook.com/" + feed.data[lim].id + "/likes?access_token=" + tkn, {
          muteHttpExceptions: true,
          method: "post"
        });
        scriptProperties.setProperty('lastest' + tkn, feed.data[lim].id);
      }
      // ----------------------------------------- //
      var link = postLink;
      console.log(link);
      for (let index in subDom) {
        var sd = subDom[index];
        for (var i = 0; i < jumlah; i++) {
          try {
            Utilities.sleep(1000 * delay);
            var postNow = UrlFetchApp.fetch("https://graph.facebook.com/me/feed?link=" + link + "&published=false&access_token=" + tkn + "&fields=id", {
              muteHttpExceptions: true,
              method: "post"
            });
            var post = Utilities.jsonParse(postNow);
            if (post.id == undefined) {
              console.log(post.error.message);
              break start;
            } else {
              console.log("[" + (i + 1) + "] sub domain: " + sd + " share id: " + post.id);
            }
          }
          catch (e) {
            console.log(e);
            break;
          }
        }
      }
    } else {
      console.log(feed.error.message);
      s = { success: false, message: feed.error.message };
      sendMail(email, feed.error.message, x);
    }
    return s;
  }

  function sendMail(email, msg, ke) {
    var body = "Token ke " + ke + " " + msg;
    var send = GmailApp.sendEmail(email, "Dhohir Pradana Facebook Auto Share", body);
    Logger.log(send)
  }
}
