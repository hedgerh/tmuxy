var splitManager = require('./u-SplitManager'),
    Helpers      = require('./u-Helpers'),
    createNewTab = Helpers.createNewTab,
    handleSelect = Helpers.handleSelect,
    getPaneIds   = Helpers.getPaneIds;

/**
 * tmux configuration editor.
 * generate a quick tmux workflow without all of the headache.
 * Harry Hedger
 */
$(document).ready(function() {
  var stack = [];
  var scriptStack = [];

  // Bootstrap the tabs
  $('.TabContainer').tabs();

  // Add a new tab to the tab panel.
  $('.AddNewTab').on('click', createNewTab);

  // Selectable Click Handler
  $('.Layout').on('click', handleSelect);

  // This generates a horizontal split in a pane.
  $('.SplitHorizontalButton').on('click', function(e) {
    _handleSplit(e, 'horizontal');
  });

  $('.SplitVerticalButton').on('click', function(e) {
    _handleSplit(e, 'vertical');
  });

  $('.GetScriptButton').on('click', function(e) {
    var size;
    var currentTarget = 0;

    stack.forEach(function(step) {
      if (parseInt(step.target) !== currentTarget) {
        currentTarget = parseInt(step.target);
        scriptStack.push('tmux select-pane -t ' + currentTarget);
      }

      if (step.command === 'split') {
        var command = 'tmux splitw -';
        if (step.orientation === 'vertical') {
          size = Math.round((step.element.height() / step.element.parent().height()) * 100);
          command += 'vd -t ' + step.target + ' -p ' + size;
        } else {
          size = Math.round((step.element.width() / step.element.parent().width()) * 100);
          command += 'hd -t ' + step.target + ' -p ' + size;
        }
      }
      scriptStack.push(command);
    });

    $('.ShellScriptOutput').empty();

    scriptStack.forEach(function(comm) {
      $('.ShellScriptOutput').text($(comm));
    });

    console.log(scriptStack.join('\n'));

    scriptStack = [];

  });

  function _handleSplit(e, orientation) {
    var $parent = $('.ui-selected');

    getPaneIds('.Layout');

    splitManager.split(e, orientation);

    var targetClass = (orientation === 'horizontal') ? '.RightPane' : '.BottomPane';

    stack.push({
      command: 'split',
      target: $parent.attr('data-pane-id'),
      element: $parent.children(targetClass),
      orientation: orientation
    });

    getPaneIds('.Layout');
  }
});
