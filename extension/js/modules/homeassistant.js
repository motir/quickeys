modules['HomeAssistant'] = new function () {

  // this.config holds the config variables for the module
  // the default values are displayed in the config screen when initially loaded
  this.config = {
    'enabled': false                  ,
    'ip': '<homeassistant ip address>',
    'port': '8123'                    ,
    'long_lived_token': ''
  }

  // set me
  var me = this;

  this.CallHass = function(cmd, do_get_and_call_me) {
    var h = new XMLHttpRequest();
    var url = this.config.ip+":"+this.config.port+"/api/"+cmd;

    var prefix = /^((http|https):\/\/)/i;
    if (!prefix.test(url)) {
      url = "http://"+url;
    }

    if (typeof(do_get_and_call_me)!='undefined') {
      var method = "GET";

      h.onreadystatechange = function() {
        if (h.readyState === 4) {
          do_get_and_call_me(xhr.response);
        }
      }
    } else {
      var method = "POST";
    }

    h.open(method, url, true);
    h.setRequestHeader("Content-Type", "application/json");
    h.setRequestHeader("Authorization", "Bearer "+this.config.long_lived_token);
    h.send('{}');
  }    


  this.CmdRunScript = function(parameter) {
    me.CallHass("services/script/"+parameter);
  }

  this.CmdShellCommand = function(parameter) {
    me.CallHass("services/shell_command/"+parameter);
  }

  this.CmdBrowser = function(parameter) {
    window.open("http://"+me.config.ip+":"+me.config.port);
  }

  // COMMANDS
  this.commands = {
    "Run Script": this.CmdRunScript,
    "Shell Command": this.CmdShellCommand,
    "Open HomeAssistant Tab": this.CmdBrowser,
  }

  this.init = function() {
  }

}();





