;(function ( $, window, document, undefined ) {
 
	var pluginName = 'ik_menu',
		defaults = {
			'instructions': 'Use arrow keys to navigate between menuitems, spacebar to expand submenus, escape key to close submenus, enter to activate menuitems.'
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} [options] - Configuration options.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ;
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		plugin = this;
		id = 'menu' + $('.ik_menu').length; // generate unique id
		$elem = plugin.element;
		
		$elem.addClass('ik_menu')
			.attr({
				'id': id
			});
		
		$('<div/>') // add div element to be used with aria-described attribute of the menu
			.text(plugin.options.instructions) // get instruction text from plugin options
			.addClass('ik_readersonly') // hide element from visual display
			.attr({
				'id': id + '_instructions',
				'aria-hidden': 'true'  // hide element from screen readers to prevent it from being read twice
			})
			.appendTo(this.element);
			
		$elem.find('ul:eq(0)')
			.attr({
				'id': id,
				'role': 'menubar', // assign menubar role to the topmost ul element
				'tabindex': 0,
				'aria-labelledby': id + '_instructions'
			});

			$elem.find('li>ul').attr({
				'role': 'menu',
				'aria-hidden': true // hide submenus from screen reader
			});

		plugin.menuitems = $elem.find('li') // setup menuitems
			.css({ 'list-style': 'none' })
			.each(function(i, el) {
				
				var $me, $link;
				
				$me = $(this);
				// $link = $me.find('>a');
				
				// $me.has('ul').addClass('expandable');
				$link = $me.find('>a').attr({ // disable links
					'tabindex': -1,
					'aria-hidden': true
				});
 				$me.attr({
					'role': 'menuitem', // assign menuitem rols
					'tabindex': -1,  // remove from tab order
					'aria-label': $link.text() // label with link text
				});
				
				$me.has('ul').attr({ // setup submenus
					'aria-haspopup': true,
					'aria-expanded': false
					}).addClass('expandable');
			
			});
		
		plugin.selected = plugin.menuitems // setup selected menuitem
			.find('.selected')
			.attr({
				'tabindex': 0,
				'aria-selected': true
			})
		
		if (!plugin.selected.length) {
			
			plugin.menuitems
				.eq(0)
				.attr({
					'tabindex': 0
				})		
			
		} else {
			
			plugin.selected
				.parentsUntil('nav', 'li')
				.attr({
					'tabindex': 0
					})
			
		}
		
		plugin.menuitems // setup event handlers
			.on('mouseenter', plugin.showSubmenu)
			.on('mouseleave', plugin.hideSubmenu)
			.on('click', {'plugin': plugin}, plugin.activateMenuItem)
			.on("keydown", {'plugin': plugin}, plugin.onKeyDown);
			
		$(window).on('resize', function(){ plugin.collapseAll(plugin); } ); // collapse all submenues when window is resized
		
	};
	
	/** 
	 * Shows submenu.
	 * 
	 * @param {object} event - Mouse event.
	 */
	Plugin.prototype.showSubmenu = function(event) {
		
		var $elem, $submenu;
		
		$elem = $(event.currentTarget);
		$submenu = $elem.children('ul');
		
		if ($submenu.length) {
			$elem.addClass('expanded')
			.attr({
				'aria-expanded': true,
				'tabindex': -1
			})
			;
			$submenu
        .attr({
            'aria-hidden': false
        });
		}
	};
	
	/** 
	 * Hides submenu.
	 * 
	 * @param {object} event - Mouse event.
	 */
	Plugin.prototype.hideSubmenu = function(event) {
		
		var $elem, $submenu;
		
		$elem = $(event.currentTarget);
		$submenu = $elem.children('ul');
		
		if ($submenu.length) {
			$elem.removeClass('expanded')
			.attr({'aria-expanded': false});

			$submenu.attr({'aria-hidden': true});
			$submenu.children('li').attr({'tabindex': -1});

		}
	}
	
	/** 
	 * Collapses all submenus. Whem element is specified collapses all sumbenus inside that element.
	 * 
	 * @param {object} plugin - Reference to plugin.
	 * @param {object} [$elem] - jQuery object containing element (optional).
	 */
	Plugin.prototype.collapseAll = function(plugin, $elem) {
		
		$elem = $elem || plugin.element;
		$elem.find('[aria-hidden=false]').attr({'aria-hidden': true});
		$elem.find('.expanded').removeClass('expanded').attr({'aria-expanded': false});
		$elem.find('li').attr({'tabindex': -1}).eq(0).attr({'tabindex': 0});
	};
	
	/**
 * Selects specified tab.
 *
 * @param {Object} event - Keyboard event.
 * @param {object} event.data - Event data.
 * @param {object} event.data.plugin - Reference to plugin.
 * @param {object} event.data.index - Index of a tab to be selected.
 */
 
 
Plugin.prototype.onKeyDown = function (event) {
   
    var plugin, $elem, $current, $next, $parent, $submenu, $selected;
   
    plugin = event.data.plugin;
    $elem = $(plugin.element);
    $current = $(plugin.element).find(':focus');
    $submenu = $current.children('ul');
    $parentmenu = $($current.parent('ul'));
    $parentitem = $parentmenu.parent('li');
       
    switch (event.keyCode) {
       
        case ik_utils.keys.right:
           
            event.preventDefault();
           
            if ($current.parents('ul').length == 1) {
                $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
            }
           
            break;
       
        case ik_utils.keys.left:
           
            event.preventDefault();
           
            if ($current.parents('ul').length == 1) {
                $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
            }
           
            break;
           
        case ik_utils.keys.up:
           
            event.preventDefault();
            event.stopPropagation();
           
            if ($current.parents('ul').length > 1) {
                $current.attr({'tabindex': -1}).prev('li').attr({'tabindex': 0}).focus();
            }
           
            break;
       
        case ik_utils.keys.down:
           
            event.preventDefault();
            event.stopPropagation();
           
            if($current.parents('ul').length > 1) {
                $current.attr({'tabindex': -1}).next('li').attr({'tabindex': 0}).focus();
            }
           
            break;
           
        case ik_utils.keys.space:
           
            event.preventDefault();
            event.stopPropagation();
           
            if($submenu.length) {
                plugin.showSubmenu(event);
                $submenu.children('li:eq(0)').attr({'tabindex': 0}).focus();
            }
            break;
       
        case ik_utils.keys.esc:
           
            event.stopPropagation();
           
            if ($parentitem.hasClass('expandable')) {
               
                $parentitem.removeClass('expanded').attr({
                    'tabindex': 0,
                    'aria-expanded': false
                }).focus();
                plugin.collapseAll(plugin, $parentitem);
            }
            break;
       
        case ik_utils.keys.enter:
           
            plugin.activateMenuItem(event);
           
            break;
       
        case ik_utils.keys.tab:
           
            plugin.collapseAll(plugin);
           
            break;
    }
}
	/** 
	 * Activates menu selected menuitem.
	 * 
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.activateMenuItem = function(event) {
		
		var plugin, $elem;
		
		event.stopPropagation();
		
		plugin = event.data.plugin;
		$elem = $(event.currentTarget);
		
		plugin.collapseAll(plugin);
	
		if ($elem.has('a').length) {
			alert('Menu item ' + $elem.find('>a').text() + ' selected');
		}
		
	};
	
	
	$.fn[pluginName] = function ( options ) {
		
		return this.each(function () {
			
			if ( !$.data(this, pluginName )) {
				$.data( this, pluginName,
				new Plugin( this, options ));
			}
			
		});
		
	}
 
})( jQuery, window, document );