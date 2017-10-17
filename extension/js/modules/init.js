modules = {};

function InitModules() {
  // when called, init() will be called for each module
  for (var module in config.modules) {
    if (config.modules[module].enabled) {
      modules[module].init();
    }
  }
}
