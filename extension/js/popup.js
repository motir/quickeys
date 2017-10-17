// read config
config = ReadConfig();
ApplyConfigToModules(config);

// init modules
InitModules();

if (!config.saved_once) {
  // never saved config - show options screen so user can config extension
  window.close();
  chrome.runtime.openOptionsPage();
}

clean_key_sequence_function_id = null;

function RunCommand(module, command, parameter) {
  // execute a command
  if (module in modules) {
    f = modules[module].commands[command];
    f(parameter);
  }
}


clear_update_display_function_id = null;

function UpdateDisplay(msg) {
  // called to update the popup display


  // if msg==null or empty --> show key sequence info
  if (typeof(msg)!='undefined' && msg!=null && msg!='') {
    $("#keys").text(msg);
    $('#keys').attr("class", "keys_message");

    if (clear_update_display_function_id != null) clearTimeout(clear_update_display_function_id);
    clear_update_display_function_id = setTimeout(UpdateDisplay, 1000);    // to remove the text
  } else {

    // no msg, got a sequence?
    if (key_sequence == '') {
      // no, so dispaly general help msg
      $('#keys').text("Type keys");
      $('#keys').attr("class", "keys_empty");
    } else {
      // got a sequence
      $('#keys').text(key_sequence);
      $('#keys').attr("class", "keys_sequence");
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // when finished loading the popup:

  // start the key hook
  StartKeySequenceRecording(OnSequenceChanged);
  
  // update display (will show "type keys" msg)
  UpdateDisplay();
});


function OnSequenceChanged() {
  // called when the key sequence was updated (user pressed a key)

  // if question mark --> send to config screen
  if (key_sequence == '?') {
    window.close();
    chrome.runtime.openOptionsPage();
    return;
  }

  // got a match?
  for (var i=0; i<config.commands.length; i++) {
    command = config.commands[i];

    if ('keys' in command && command.keys.length > 0) {
      if (key_sequence == command.keys) {
        // match!
        RunCommand(command.module, command.action, command.parameter);
        ResetKeySequence();

        // cancel clean sequence
        if (clean_key_sequence_function_id!=null) clearTimeout(clean_key_sequence_function_id);

        // update display
        UpdateDisplay(command.name);

        // close popup?
        if (!command.keep_open) {
          // yes, close popup in 0.5 sec
          setTimeout(function() {window.close();}, 500);
        }

        // don't execute anymore
        return;
      }
    }
  }

  // still got a sequence?
  if (key_sequence != '') {
    // yes, so didn't find match
    // cancel clean_sequence and reload it for 2 seconds from now
    if (clean_key_sequence_function_id!=null) clearTimeout(clean_key_sequence_function_id);
    clean_key_sequence_function_id = setTimeout(function() {ResetKeySequence(); UpdateDisplay();}, 2000);
  }

  // and update display with new sequence
  UpdateDisplay();
}
