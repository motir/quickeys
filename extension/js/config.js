function GetFormElementVal(e) {
  // return the value of an element in a form
  // calls the approriate getter based on the element type
  switch (e.attr('type')) {
    case "text":
    case "password":
      return $(e).val();

    case "checkbox":
      return $(e).prop('checked');
  }

  return null;
}

function SetFormElementVal(e, v) {
  // sets an element value in a form
  // calls the appropriate setter based on the element type
  switch (e.attr('type')) {
    case "text":
    case "password":
      $(e).val(v);
      break;

    case "checkbox":
      $(e).prop('checked', v);
      new Switchery(e[0], {size:'small'});
      break;
  }
}

function UpdateModuleElementClassByEnabled(module) {
  e = $('#'+module+' input[name="enabled"]').prop('checked');
  if (e) {
    $('#'+module+' .module-head').removeClass('disabled');
    $('#'+module+' .module-body').removeClass('disabled');
  } else {
    $('#'+module+' .module-head').addClass('disabled');
    $('#'+module+' .module-body').addClass('disabled');
  }
}

// ---------------------------------------------
// METHODS FOR TABULATOR (the table module)
// ---------------------------------------------

var TabulatorModuleEditor = function(cell, onRendered, success, cancel, editorParams){
  //cell - the cell component for the editable cell
  //onRendered - function to call when the editor has been rendered
  //success - function to call to pass the succesfully updated value to Tabulator
  //cancel - function to call to abort the edit and return to a normal cell
  //editorParams - editorParams object set in column defintion

  //create and style editor
  s = "<select>";
  for (var module in config.modules) {
    if (config.modules[module].enabled) {
      s += "<option value='"+module+"'>"+module+"</option>";
    }
  }
  
  var editor = $(s);
  editor.css({
    "padding":"3px",
    "width":"100%",
    "box-sizing":"border-box",
  });

  //Set value of editor to the current value of the cell
  editor.val(cell.getValue());

  //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
  onRendered(function(){
    editor.focus();
  });

  //when the value has been set, trigger the cell to update
  editor.on("change blur", function(e){
    success(editor.val());
  });

  //return the editor element
  return editor;
};


var TabulatorActionEditor = function(cell, onRendered, success, cancel, editorParams){

  module = cell.getRow().row.data.module;

  //create and style editor
  s = "<select>";
  for (var command in modules[module].commands) {
    s += "<option value='"+command+"'>"+command+"</option>";
  }
  
  var editor = $(s);
  editor.css({
    "padding":"3px",
    "width":"100%",
    "box-sizing":"border-box",
  });

  //Set value of editor to the current value of the cell
  editor.val(cell.getValue());

  //set focus on the select box when the editor is selected (timeout allows for editor to be added to DOM)
  onRendered(function(){
    editor.focus();
  });

  //when the value has been set, trigger the cell to update
  editor.on("change blur", function(e){
    success(editor.val());
  });

  //return the editor element
  return editor;
};


var TabulatorDeleteEditor = function(cell, onRendered, success, cancel, editorParams){
  cell.getRow().delete();
  return false;
};


keys_editor_cell = null;

var TabulatorKeysEditor = function(cell, onRendered, success, cancel, editorParams){
  $('#keys_modal').modal({
    fadeDuration: 100
  });

  // record keys
  ResetKeySequence();
  OnSequenceChanged();
  StartKeySequenceRecording(OnSequenceChanged);

  keys_editor_cell = cell;

  return false;
};


var TabulatorCheckboxFormatter = function (cell, formatterParams) {
  if (cell.getValue() == true) {
    e = "<i class='fa fa-check'></i>";
  } else {
    e = "";
  }
  return e;
};


var TabulatorCheckboxClicked = function(e, cell){

  v = cell.getValue();
  if (v==false) {
    v = true;
  } else {
    v = false;
  }

  cell.setValue(v);

  return false;
}



function OnSequenceChanged() {
  // called when a key sequence was updated
  // will update the keys_modal classes according to the sequence
  $('#keys_modal #keys').text(key_sequence);
  if (key_sequence!='') {
    $('#keys_modal #keys').removeClass('empty');
  } else {
    $('#keys_modal #keys').addClass('empty');
    $('#keys_modal #keys').text('Type Keys...');
  }
}

function SaveScreenToConfig() {
  // save screen to config variable

  // save modules
  for (var module in config.modules) {
    for (var param in modules[module].config) {
      e = $('#'+module+' input[name="'+param+'"]');
      v = GetFormElementVal(e);
      config.modules[module][param] = v;
    }
  }

  // save commands  
  config.commands = $("#commands_div").tabulator("getData");
  
  // mark saved_once so next time user loads the extension options will not be automatically shown
  config.saved_once = true;
}


function LoadScreenFromConfig() {
  // update ui elements based on the config vals

  // update ui elements
  for (var module in config.modules) {

    // update fields
    for (var param in modules[module].config) {
      v = config.modules[module][param];
      
      e = $('#'+module+' input[name="'+param+'"]');
      SetFormElementVal(e, v);
    }

    // update enabled states
    UpdateModuleElementClassByEnabled(module);
  }

  // update commands table
  $("#commands_div").tabulator( {
    columns:[
      {title:"Name", field:"name", sorter:"string", width:180, editor:true},
      {title:"Keys", field:"keys", sorter:"string", width:150, editor:TabulatorKeysEditor},
      {title:"Module", field:"module", sorter:"string", width:150, editor:TabulatorModuleEditor},
      {title:"Action", field:"action", sorter:"string", width:150, editor:TabulatorActionEditor},
      {title:"Parameter", field:"parameter", sorter:"string", width:150, editor:true},
      {title:"Keep Open", field:"keep_open", formatter: TabulatorCheckboxFormatter, cellClick:TabulatorCheckboxClicked},
      {formatter:"buttonCross", width:30, align:"center", editor:TabulatorDeleteEditor},
    ],

    data: config.commands,
    placeholder: "No commands yet..."
  });

}


$(function () {

  // read config
  config = ReadConfig();

  // load into screen
  LoadScreenFromConfig();

  // hooks
  $("#cancel").click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    window.close();
  });

  $("#save").click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    SaveScreenToConfig();
    SaveConfig(config);
    window.close();
  });

  $("#commands #add").click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    $("#commands_div").tabulator("addRow", {});

  });

  // hook enable switches
  $('.js-switch').on('change', function() {
    module = $(this).parents('.module').attr('id');
    e = $(this).prop('checked');

    // update config now - so it's reflected in the modules field in the commands table
    config.modules[module].enabled = e;

    // update ui
    UpdateModuleElementClassByEnabled(module);
  });

  // hook module headers
  $('.module-title').on('click', function () {
    $(this).parent().find('.js-switch').click();
  });

  // load keys popup hooks
  $('#keys_modal #cancel').on('click', function () {
    $.modal.close();
    StopKeySequenceRecording();
  });

  // load keys popup hooks
  $('#keys_modal #done').on('click', function () {
    if (keys_editor_cell!=null) {
      keys_editor_cell.setValue(key_sequence);
      keys_editor_cell = null;
    }
    $.modal.close();
    StopKeySequenceRecording();
  });

  // export
  $('#export').on('click', function () {
    var a = document.createElement("a");
    a.download = "yamaha_remote_controller.json";

    SaveScreenToConfig();
    var js = JSON.stringify(config);
    var blob = new Blob([js], {type: 'text/plain'});
    a.href = URL.createObjectURL(blob);
    a.click();
  });

  // import
  $('#import').on('click', function () {
    // reset the file selection input
    $('#import_modal #files').val('')

    // show modal
    $('#import_modal').modal({
      fadeDuration: 100
    });
  });

  // on load file in the import popup - import json into config
  $('#import_modal #files').on('change', function (evt) {
    var files = evt.target.files;
    if (evt.target.files.length > 0) {
      var file = evt.target.files[0];
      var reader = new FileReader();

      reader.onload = (function(theFile) {
        return function(e) {
          config = JSON.parse(e.target.result);
          SaveConfig(config);
          window.location.reload();
        }
      })(file);
      reader.readAsText(file);
    }
  });

  // update version
  var manifest = chrome.runtime.getManifest();
  $('#version').text(manifest.version);

});
