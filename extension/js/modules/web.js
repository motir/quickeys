modules['WEB'] = new function () {

  // this.config holds the config variables for the module
  // the default values are displayed in the config screen when initially loaded
  this.config = {
    'enabled': true
  }

  // set me
  var me = this;

  this.CmdGetURL = function(parameter) {

    var h = new XMLHttpRequest();
    var url = parameter;

    var prefix = /^((http|https):\/\/)/i;
    if (!prefix.test(url)) {
      url = "http://"+url;
    }

    h.open('GET', url, false);
    h.send('{}');
  }

  this.CmdBrowseURL = function(parameter) {
    window.open(parameter);
  }

  // COMMANDS
  this.commands = {
    "Get URL": this.CmdGetURL,
    "Browse URL": this.CmdBrowseURL
  }

  this.init = function() {
  }

}();
