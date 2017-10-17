modules['HomeAssistant'] = new function () {

  this.config = {
    'enabled': false                  ,
    'ip': '<homeassistant ip address>',
    'port': '8123'                    ,
    'api_pw': ''
  }

  // init variables
  this.services = [];

  // set me
  var me = this;

  this.CallHass = function(cmd, do_get_and_call_me) {
    var h = new XMLHttpRequest();
    var url = "http://"+this.config.ip+":"+this.config.port+"/api/"+cmd;
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
    h.setRequestHeader("x-ha-access", this.config.api_pw);
    h.send('{}');
  }    


  this.CmdRunScript = function(parameter) {
    var cmd = "services/script/"+parameter;
    me.CallHass(cmd);
  }

  // COMMANDS
  this.commands = {
    "Run Script": this.CmdRunScript,
  }

  this.init = function() {
    // // read services
    // $.ajax({
    //   type: "GET",
    //   url: "http://"+this.config.ip+":"+this.config.port+"/api/services?api_password="+this.config.api_pw,
    //   success: function(data) {
    //     me.services = data;
    //   }
    // });  
  }

}();





