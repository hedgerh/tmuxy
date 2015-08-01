(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./u-Helpers":2,"./u-SplitManager":3}],2:[function(require,module,exports){
module.exports = {
  createNewTab: function createNewTab() {
    var num_tabs = $("div#tabs ul li").length;

    $("div#tabs ul .AddNewTab").parent().before(
      "<li><a href='#tabs-" + num_tabs + "'>Window " + num_tabs + "</a></li>"
    );

    $("div#tabs").append(
      "<div id='tabs-" + num_tabs + "' class='Layout'></div>"
    );

    // Selectable Click Handler
    $('.Layout').on('click', handleSelect);

    $("div#tabs").tabs("refresh");
  },

  getPanes: function getPanes(parent) {
    var paneId = 0;
    var $tree = $(parent);
    traverse($tree);
    function traverse(tree) {
        console.log($(tree).children('.LeftNode, .TopNode'), 'traverseLeft');
        console.log($(tree).children('.RightNode, .BottomNode'), 'traverseRight');
    }
  },

  getPaneIds: function getPaneIds(parent) {
    var $panes = $('[data-pane-id]');
    $panes.removeAttr('data-pane-id');

    $('.backgroundNumber').remove();

    var paneId = 0;
    var $tree = $(parent);
    _traverseSubtree($tree);

    function _traverseSubtree(tree) {
      if ($(tree).children('div:not(.ui-resizable-handle), span:not(.backgroundNumber)').length === 0) {
        $(tree).attr('data-pane-id', paneId);
        $(tree).append($('<span class="backgroundNumber"><h1>' + paneId + '</h1></span>'))
        paneId++;
      } else {
        $(tree).children('div:not(.ui-resizable-handle, .backgroundNumber)').each(function(index, child) {
          _traverseSubtree(child);
        });
      }
    };
  },

  handleSelect: function handleSelect(e) {
    var $targetChildren = $(e.target).children('div:not(.ui-resizable-handle, .backgroundNumber)');

    if ($targetChildren.length === 0 || $(e.target).hasClass('ui-resizable') && $targetChildren.length === 1) {
      $('.ui-selected').removeClass('ui-selected');
      $(e.target).addClass('ui-selected');
    }
  }
}

},{}],3:[function(require,module,exports){
var $parent = $('.ui-selected');

var paneData = {
  vertical: {
    handles: 's',
    resizeHandler: _vResizeHandler,
    selectors: ['.TopPane', '.BottomPane'],
    getStyles: function() {
      var $parent = $('.ui-selected');

      return {
        border: '1px solid #000',
        height: ($parent.height() / 2),
        width: $parent.width()
      };
    }
  },

  horizontal: {
    handles: 'e',
    resizeHandler: _hResizeHandler,
    stopHandler: _hStopHandler,
    selectors: ['.LeftPane', '.RightPane'],
    getStyles: function() {
      var $parent = $('.ui-selected');

      return {
        border: '1px solid #000',
        height: $parent.height(),
        width: ($parent.width() / 2)
      };
    }
  }
};

module.exports = {
  split: function(e, orientation) {
    var data = paneData[orientation];
    var panes = data.selectors;

    // The selected pane to be split
    var $parent = $('.ui-selected');

    if (orientation === 'horizontal') {
        $parent.css({
            'flex-direction': 'row'
        });
    } else if (orientation === 'vertical') {
        $parent.css({
            'flex-direction': 'column'
        });
    }

    // Append the new panes to the parent
    panes.forEach(function(pane) {
      $parent.append($('<div class="' + pane.substr(1) + '"></div>'));
    });

    // Select our new panes
    var $firstPane = $parent.children(panes[0]);
    var $secondPane = $parent.children(panes[1]);

    $('.Layout').on('click', function(e) {
        $('.btn').prop('disabled', false);
    });

    // Apply some CSS styles
    $firstPane.css(data.getStyles());
    $secondPane.css(data.getStyles());

    // To prevent the same pane from being erroneously split again.
    $parent.removeClass('ui-selected');
    $parent.removeClass('ui-selectee');

    $('.btn:not(.GetScriptButton)').prop('disabled', true);

    var container = '.' + $parent.attr('class').split(' ')[0];

    // Make the pane resizable, will always be top or left pane.

        $firstPane.resizable({
          containment: container,
          handles: data.handles,
          resize: data.resizeHandler || null,
          stop: data.stopHandler || null
        })
  }
};

/** Private Handler Functions */
function _vResizeHandler(event, ui) {
  var remainingSpace = $(this).parent().height() - $(this).outerHeight(true);
  var divTwo = $(this).next();
  var divTwoWidth = remainingSpace - (divTwo.outerHeight(true) - divTwo.height());
  divTwo.css('height', divTwoWidth + 'px');

  var $tops = $('.TopPane');
  var $left = $('.LeftPane, .RightPane');

  $left.each(function(index, elem) {
    elem = $(elem);
    elem.css({
      height: elem.parent().height()
    });
  });

  $('BottomPane').each(function(index, elem) {
    elem = $(elem);
    elem.css({
      width: elem.parent().width()
    });
  });

  $tops.each(function(index, elem) {
    elem = $(elem);

    elem.css({
      height: elem.parent().height() - elem.next('div:not(.ui-resizable-handle, .backgroundNumber)').height() - 2,
      width: elem.parent().width()
    });
  });
};

function _hResizeHandler(event, ui) {
  var remainingSpace = $(this).parent().width() - $(this).outerWidth(true);
  var divTwo = $(this).next();
  var divTwoWidth = remainingSpace - (divTwo.outerWidth(true) - divTwo.width());
  divTwo.css('width', divTwoWidth + 'px');
  var targ = $(this);
  targ.css({
    height: targ.parent().height()
  });
}

function _hStopHandler(event, ui) {
  var $target = ui.element.next();
  var $leftTarget = $target.children('.LeftPane');
  var $rightTarget = $target.children('.RightPane');

  var $ratio = ($leftTarget.width()) / ($leftTarget.width() + $rightTarget.width());
  $leftTarget.css({
    width: ($target.width() * $ratio)
  });
  $rightTarget.css({
    width: ($target.width() - $leftTarget.width())
  });

  $('.TopPane, .BottomPane').each(function(index, elem) {
    $(elem).css({
      width: $(elem).parent().width()
    });
  });
};

},{}]},{},[1]);
