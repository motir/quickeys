modules['Node-RED'] = new function () {

  // this.config holds the config variables for the module
  // the default values are displayed in the config screen when initially loaded
  this.config = {
    'enabled': false,
    'ip': '<node-red ip address>',
    'port': '1880',
    'dashboard_path': '/ui'
  }

  var me = this;
  var base_url = '';    // will be set in init

  this.CmdShowDashboard = function(parameter) {
    window.open(me.base_url+me.config.dashboard_path);
  }

  this.CmdShowEditor = function(parameter) {
    window.open(me.base_url);
  }

  // COMMANDS
  this.commands = {
    "Show Dashboard": this.CmdShowDashboard,
    "Show Editor": this.CmdShowEditor
  }

  this.init = function() {
    var url = this.config.ip+":"+this.config.port;

    var prefix = /^((http|https):\/\/)/i;
    if (!prefix.test(url)) {
      url = "http://"+url;
    }

    me.base_url = url;
  }

}();
