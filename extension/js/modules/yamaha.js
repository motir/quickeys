modules['Yamaha'] = new function () {

  // this.config holds the config variables for the module
  // the default values are displayed in the config screen when initially loaded
  this.config = {
    'enabled': false,
    'ip': '<yamaha receiver ip address>'
  }    

  // 1. init local vars
  this.yamaha_status = {};

  // 2. set me
  var me = this;

  // 3. declare command functions
  // make sure to use this and me appropriately
  this.CmdPower = function(parameter) {
    if (me.yamaha_status['power']) {
      var state = 'Standby';
    } else {
      var state = 'On';
    }

    cmd = '<YAMAHA_AV cmd="PUT"><Main_Zone><Power_Control><Power>'+state+'</Power></Power_Control></Main_Zone></YAMAHA_AV>';
    me.SendCmd(cmd, me.UpdateStatus);
  }

  this.CmdMute = function(parameter) {
    if (me.yamaha_status['mute']) {
      var state = 'Off';
    } else {
      var state = 'On';
    }

    cmd = '<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Mute>'+state+'</Mute></Volume></Main_Zone></YAMAHA_AV>';
    me.SendCmd(cmd, me.UpdateStatus);
  }

  this.CmdVolumeUp = function(parameter) {
    var v = me.yamaha_status['volume'];
    v += 10;
    me.cmdSetYamahaVolume(v);
  }

  this.CmdVolumeDown = function(parameter) {
    var v = me.yamaha_status['volume'];
    v -= 10;
    me.cmdSetYamahaVolume(v);
  }

  this.CmdSetInput = function(parameter) {
    cmd = '<YAMAHA_AV cmd="PUT"><Main_Zone><Input><Input_Sel>'+parameter+'</Input_Sel></Input></Main_Zone></YAMAHA_AV>';
    me.SendCmd(cmd, me.UpdateStatus);
  }

  this.SendCmd = function(cmd, callback_method) {
    var h = new XMLHttpRequest();
    var url = "http://"+this.config.ip+":80/YamahaRemoteControl/ctrl";
    h.open("POST", url, true);
    h.setRequestHeader("Content-Type", "application/xml");

    if (typeof(callback_method)!='undefined') {
      h.onreadystatechange = function() {
        if (h.readyState == 4) {
          callback_method(h.responseXML);
        }
      }
    }
    h.send(cmd);
  }

  this.UpdateStatus = function() {
    var cmd = '<YAMAHA_AV cmd="GET"><Main_Zone><Basic_Status>GetParam</Basic_Status></Main_Zone></YAMAHA_AV>';
    me.SendCmd(cmd, me.onStatus);
  }

  this.onStatus = function(xml) {
    me.yamaha_status['power']      = xml.getElementsByTagName('Power')[0].childNodes[0].nodeValue == 'On';
    me.yamaha_status['volume']     = parseInt(xml.getElementsByTagName('Volume')[0].getElementsByTagName('Lvl')[0].getElementsByTagName('Val')[0].childNodes[0].nodeValue);
    me.yamaha_status['mute']       = xml.getElementsByTagName('Mute')[0].childNodes[0].nodeValue == 'On';
    me.yamaha_status['input_name'] = xml.getElementsByTagName('Input_Sel_Item_Info')[0].getElementsByTagName('Title')[0].childNodes[0].nodeValue;

    if (me.yamaha_status['mute']) {
      var vol = 'MUTE';
    } else {
      var vol = me.yamaha_status['volume'];
    }
  }

  this.cmdSetYamahaVolume = function(volume) {
    var cmd = '<YAMAHA_AV cmd="PUT"><Main_Zone><Volume><Lvl><Val>' + volume + '</Val><Exp>1</Exp><Unit>dB</Unit></Lvl></Volume></Main_Zone></YAMAHA_AV>';
    me.SendCmd(cmd, me.UpdateStatus);
  }

  // this.GetYamahaConfig = function() {
  //   var cmd = '<YAMAHA_AV cmd="GET"><System><Config>GetParam</Config></System></YAMAHA_AV>';
  //   this.SendCmd(cmd, this.onYamahaConfig);
  // }

  // this.onYamahaConfig = function(xml) {
  //   this.yamaha_status['inputs'] = [];

  //   var inputs = xml.getElementsByTagName('Input')[0].childNodes;
  //   for ($i=0; $i<inputs.length; $i++) {
  //     var v = inputs[$i].childNodes[0].nodeValue;
  //     this.yamaha_status['inputs'].push(v);
  //   }
  // }


  // 4. declare commands
  this.commands = {
    "Toggle Power": this.CmdPower,
    "Mute": this.CmdMute,
    "Volume Up": this.CmdVolumeUp,
    "Volume Down": this.CmdVolumeDown,
    "Set Input": this.CmdSetInput
  } 

  // set init function --> will be called only when the popup is shown
  // (not called in the config screen)
  this.init = function() {
    this.UpdateStatus();
  }
  
}();
