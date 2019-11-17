function ReadConfig() {
 
  // read
  var s = localStorage.getItem("config");
  if (s==null) {
    // no config yet
    var j = {};
  } else {
    var j = JSON.parse(s);
  }

  // init if some params do not exist
  if (!('modules' in j)) {
    j.modules = {};
  }

  if (!('saved_once' in j)) {
    j.saved_once = false;
  }

  if (!('commands' in j)) {
    j['commands'] = [{}];
  }

  // go over all params per module
  // if a param isn't found - add it with a default value
  for (var module in modules) {
    if (!(module in j.modules)) {
      j.modules[module] = {}
    }

    for (var param in modules[module].config) {
      if (!(param in j['modules'][module])) {
        j['modules'][module][param] = modules[module].config[param];
      }
    }
  } 

  return j;
}

function SaveConfig(j) {
  // stringify and save
  var js = JSON.stringify(j);
  localStorage.setItem("config", js);
}

function ApplyConfigToModules(config) {
  // apply the config settings to each module
  // basically we just need to copy the params to each module instance
  for (var module in modules) {
    modules[module].config = config.modules[module];
  }
}

// ********************************
// KEY SEQUENCE HANDLING
// ********************************

key_sequence_callback_sequence_changed = null;

function StartKeySequenceRecording(callback_sequence_changed) {
  // callback_sequence_changed called every time we add a key to the sequence
  key_sequence_callback_sequence_changed  = callback_sequence_changed;
  document.onkeydown = keydown;
}


function keydown(e) {

  if (key_sequence_callback_sequence_changed==null) {
    // not recording
    return;
  }

  var IGNORE_CHARS = [16, 17, 18, 27, 13];
  
  // ignore some special characters
  if ($.inArray(e.keyCode, IGNORE_CHARS) > -1) {
    return;
  }

  // make sure we only have one SHIFT / CTRL / ALT   (in cases the user chose multiple keys after a modifier, e.g. SHIFT A B)
  key_sequence = key_sequence.replace("SHIFT ", "").replace("ALT ", "").replace("CTRL ", "");

  // add Shift/Ctrl/Alt prefix to the sequence if they are pressed
  if (e.shiftKey) key_sequence = "SHIFT " + key_sequence;
  if (e.ctrlKey)  key_sequence = "CTRL " + key_sequence;
  if (e.altKey)   key_sequence = "ALT " + key_sequence;

  if (e.keyCode == 8) {
    // backspace
    if (key_sequence!='') {
      key_sequence = key_sequence.substring(0, key_sequence.length-1)
    }
  } else {
    // append key
    key_sequence += e.key;
  }

  // sequence changed
  key_sequence_callback_sequence_changed();
}

function ResetKeySequence() {
  key_sequence = '';
}


function StopKeySequenceRecording(callback_sequence_changed) {
  key_sequence_callback_sequence_changed = null;
}

ResetKeySequence();

function CopyToClipboard(str, mimetype) {
  // from https://stackoverflow.com/questions/3436102/copy-to-clipboard-in-chrome-extension
  document.oncopy = function(event) {
    event.clipboardData.setData(mimetype, str);
    event.preventDefault();
  };
  document.execCommand("Copy", false, null);
}
