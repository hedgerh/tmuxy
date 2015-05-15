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
