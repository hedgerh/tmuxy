var splitManager = require('./u-SplitManager'),
    Helpers      = require('./u-Helpers'),
    createNewTab = Helpers.createNewTab,
    handleSelect = Helpers.handleSelect,
    getPaneIds   = Helpers.getPaneIds,
    getPanes     = Helpers.getPanes;

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

  $('.DeletePaneButton').on('click', function(e) {
    _deletePane(e);
  })

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

  function _deletePane(e) {
    var $target = $('.ui-selected');
    var $targets = $('.ui-selected').siblings('div:not(.ui-resizable-handle, .backgroundNumber)');
    var $parent = $target.parent();

    var heightRatio = $targets.children('.LeftPane, .TopPane').height() / ($targets.children('.LeftPane, .TopPane').height() + $targets.children('.RightPane, .BottomPane').height());
    var widthRatio = $targets.children('.LeftPane, .TopPane').width() / ($targets.children('.LeftPane, .TopPane').width() + $targets.children('.RightPane, .BottomPane').width());

    $parent.append($targets.children());
    var temp = [];
    var id = -1;
    var daindex = -1;

    stack.forEach(function(item, i) {
        if (item.element[0] !== $target[0] && item.element[0] !== $targets[0]) {
            temp.push(item);
        } else {
            id = item.target;
            daindex = i;
        }
    });

    stack = temp;

    if (id !== -1) {
        stack = stack.map(function(item, i) {
            if (item.target > id && i >= index) {
                item.target--;
            }

            return item;
        });
    }
    $target.remove();
    $targets.remove();

    if ($parent.children('.LeftPane, .RightPane').length !== 0) {
        $parent.css({
            'flex-direction': 'row'
        });

        $parent.children('.LeftPane').css({
            height: $parent.height(),
            width: $parent.width() * widthRatio
        })

        $parent.children('.RightPane').css({
            height: $parent.height(),
            width: $parent.width() * (1 - widthRatio)
        })

    } else {
        $parent.css({
            'flex-direction': 'column'
        });

        $parent.children('.TopPane').css({
            height: $parent.height() * heightRatio,
            width: $parent.width()
        });

        $parent.children('.BottomPane').css({
            height: $parent.height() * (1 - heightRatio),
            width: $parent.width()
        })
    }

    getPaneIds('.Layout');
  }
});
