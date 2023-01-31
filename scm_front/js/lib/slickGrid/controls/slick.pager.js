(function ($) {
  function SlickGridPager(dataView, grid, $container, options) {
    var $status;
    var _options;
    var _defaults = {
      showAllText: "Showing all {rowCount} rows",
      showPageText: "Showing page {pageNum} of {pageCount}",
      showCountText: "From {countBegin} to {countEnd} of {rowCount} rows",
      showCount: false,
      pagingOptions:[
        {
          data: 0,
          name: "All"
        },
        {
          data: -1,
          name: "Auto"
        },
        {
          data: 25,
          name: "25"
        },
        {
          data: 50,
          name: "50"
        },
        {
          data: 100,
          name: "100"
        }
      ],
      showPageSizes: false
    };

    function init() {
      _options = $.extend(true, {}, _defaults, options);

      dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
        updatePager(pagingInfo);
      });

      constructPagerUI();
      updatePager(dataView.getPagingInfo());
    }

    function getNavState() {
      var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
      var pagingInfo = dataView.getPagingInfo();
      var lastPage = pagingInfo.totalPages - 1;

      return {
        canGotoFirst: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoLast: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum !== lastPage,
        canGotoPrev: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoNext: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum < lastPage,
        pagingInfo: pagingInfo
      };
    }

    function setPageSize(n) {
      dataView.setRefreshHints({
        isFilterUnchanged: true
      });
      dataView.setPagingOptions({pageSize: n});
    }

    function gotoFirst() {
      if (getNavState().canGotoFirst) {
        dataView.setPagingOptions({pageNum: 0});
      }
    }

    function gotoLast() {
      var state = getNavState();
      if (state.canGotoLast) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
      }
    }

    function gotoPrev() {
      var state = getNavState();
      if (state.canGotoPrev) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
      }
    }

    function gotoNext() {
      var state = getNavState();
      if (state.canGotoNext) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
      }
    }

    function constructPagerUI() {
      $container.empty();

      var $nav = $("<span class='slick-pager-nav' />").appendTo($container);
      var $settings = $("<span class='slick-pager-settings' />").appendTo($container);
      $status = $("<span class='slick-pager-status' />").appendTo($container);

      var pagingOptions = '';

      for (var o = 0; o < _options.pagingOptions.length; o++)
      {
        var p = _options.pagingOptions[o];

        pagingOptions += "<a data=" +p.data + ">" + p.name + "</a>";
      }

      pagingOptions = $("<span class='slick-pager-settings-expanded'>Show: " + pagingOptions + "</span>");

      if (_options.showPageSizes)
      {
        pagingOptions.show();
      }
      else
      {
        pagingOptions.hide();
      }

      $settings
          .append(pagingOptions);

      $settings.find("a[data]").click(function (e) {
        var pagesize = $(e.target).attr("data");
        if (pagesize !== undefined) {
          if (pagesize == -1) {
            var vp = grid.getViewport();
            setPageSize(vp.bottom - vp.top);
          } else {
            setPageSize(parseInt(pagesize));
          }
        }
      });

      var icon_prefix = "<span class='ui-state-default ui-corner-all ui-icon-container'><span class='ui-icon ";
      var icon_suffix = "' /></span>";

      $(icon_prefix + "ui-icon-lightbulb slick-icon-lightbulb" + icon_suffix)
          .click(function () {
            $(".slick-pager-settings-expanded").toggle();
          })
          .appendTo($settings);

      $(icon_prefix + "ui-icon-seek-first slick-icon-seek-first" + icon_suffix)
          .click(gotoFirst)
          .appendTo($nav);

      $(icon_prefix + "ui-icon-seek-prev slick-icon-seek-prev" + icon_suffix)
          .click(gotoPrev)
          .appendTo($nav);

      $(icon_prefix + "ui-icon-seek-next slick-icon-seek-next" + icon_suffix)
          .click(gotoNext)
          .appendTo($nav);

      $(icon_prefix + "ui-icon-seek-end slick-icon-seek-end" + icon_suffix)
          .click(gotoLast)
          .appendTo($nav);

      $container.find(".ui-icon-container")
          .hover(function () {
            $(this).toggleClass("ui-state-hover");
          });

      $container.children().wrapAll("<div class='slick-pager' />");
    }


    function updatePager(pagingInfo) {
      var state = getNavState();

      $container.find(".slick-pager-nav span").removeClass("ui-state-disabled");
      $container.find(".slick-pager-nav span").removeClass("slick-icon-state-disabled");
      if (!state.canGotoFirst) {
        $container.find(".ui-icon-seek-first").addClass("ui-state-disabled");
        $container.find(".slick-icon-seek-first").addClass("slick-icon-state-disabled");
      }
      if (!state.canGotoLast) {
        $container.find(".ui-icon-seek-end").addClass("ui-state-disabled");
        $container.find(".slick-icon-seek-end").addClass("slick-icon-state-disabled");
      }
      if (!state.canGotoNext) {
        $container.find(".ui-icon-seek-next").addClass("ui-state-disabled");
        $container.find(".slick-icon-seek-next").addClass("slick-icon-state-disabled");
      }
      if (!state.canGotoPrev) {
        $container.find(".ui-icon-seek-prev").addClass("ui-state-disabled");
        $container.find(".slick-icon-seek-prev").addClass("slick-icon-state-disabled");
      }

      if (pagingInfo.pageSize === 0) {
        $status.text(_options.showAllText.replace('{rowCount}', pagingInfo.totalRows + "").replace('{pageCount}', pagingInfo.totalPages + ""));
      } else {
        $status.text(_options.showPageText.replace('{pageNum}', pagingInfo.pageNum + 1 + "").replace('{pageCount}', pagingInfo.totalPages + ""));
      }

      if (_options.showCount && pagingInfo.pageSize!==0)
      {
        var pageBegin = pagingInfo.pageNum * pagingInfo.pageSize;
        var currentText = $status.text();

        if (currentText)
        {
          currentText += " - ";
        }

        $status.text(
            currentText +
            _options.showCountText
                .replace('{rowCount}', pagingInfo.totalRows + "")
                .replace("{countBegin}", pageBegin + 1)
                .replace("{countEnd}", Math.min(pageBegin + pagingInfo.pageSize, pagingInfo.totalRows))
        );
      }
    }

    init();
  }

  // Slick.Controls.Pager
  $.extend(true, window, { Slick:{ Controls:{ Pager:SlickGridPager }}});
})(jQuery);
