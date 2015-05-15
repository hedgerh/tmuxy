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
