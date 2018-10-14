;(function ( $, window, document, undefined ) {
 	
	var pluginName = 'ik_accordion',
		defaults = { // set default parameters
			autoCollapse: false,
			animationSpeed: 200
		};
	 
	/**
	 * @constructs Plugin
	 * @param {Object} element - Current DOM element from selected collection.
	 * @param {Object} options - Configuration options.
	 * @param {boolean} options.autoCollapse - Automatically collapse inactive panels.
	 * @param {number} options.animationSpeed - Panel toggle speed in milliseconds.
	 */
	function Plugin( element, options ) {
		
		this._name = pluginName;
		this._defaults = defaults;
		this.element = $(element);
		this.options = $.extend( {}, defaults, options) ; // override default parameters if setup object is present
		
		this.init();
	}
	
	/** Initializes plugin. */
	Plugin.prototype.init = function () {
		
		var id, $elem, plugin;
		
		id = 'acc' + $('.ik_accordion').length; // create unique id
		$elem = this.element;
		plugin = this;
		
		$elem.attr({
			'id': id,
			'role': 'region',
			'aria-multiselectable': !this.options.autoCollapse 
		}).addClass('ik_accordion');

		
		this.headers = $elem.children('dt')
		.attr({'role': 'heading'})		
		.each(function(i, el) {
			var $me, $btn;
			
			$me = $(el);

			$btn = $('<div/>').attr({
		  'id': id + '_btn_' + i,
		  'role': 'button',
                'aria-controls': id + '_panel_' + i, // associate button with corresponding panel
                'aria-expanded': false, // toggle expanded state
                'tabindex': 0 //add keyboard focus
		  
        })
        .addClass('button')
		.html($me.html())
		.on('keydown', {'plugin': plugin}, plugin.onKeyDown) // enable keyboard navigation
        .on('click', {'plugin': plugin}, plugin.togglePanel);
        
			$me.empty().append($btn); // wrap content of each header in an element with role button
		});
		
		this.panels = $elem.children('dd').each(function(i, el) {
			var $me = $(this), id = $elem.attr('id') + '_panel_' + i;
			$me.attr({
				'id': id,
				'role': 'region', // add role region to each panel
                'aria-hidden': true, // mark all panels as hidden
                'tabindex': 0 // add panels into the tab order
			});
		}).hide();
		
	};
	/**
     * Handles kedown event on header button.
     *
     * @param {Object} event - Keyboard event.
     * @param {object} event.data - Event data.
     * @param {object} event.data.plugin - Reference to plugin.
     */
    Plugin.prototype.onKeyDown = function (event) {
       
        var $me, $header, plugin, $elem, $current, ind;
       
        $me = $(event.target);
        $header = $me.parent('dt');
        plugin = event.data.plugin;
        $elem = $(plugin.element);
       
        switch (event.keyCode) {
           
            // toggle panel by pressing enter key, or spacebar
            case ik_utils.keys.enter:
            case ik_utils.keys.space:
                event.preventDefault();
                event.stopPropagation();
                plugin.togglePanel(event);
                break;
           
            // use up arrow to jump to the previous header
            case ik_utils.keys.up:
                ind = plugin.headers.index($header);
                if (ind > 0) {
                    plugin.headers.eq(--ind).find('.button').focus();
                }
                console.log(ind);
                break;
           
            // use down arrow to jump to the next header
            case ik_utils.keys.down:
                ind = plugin.headers.index($header);
                if (ind < plugin.headers.length - 1) {
                    plugin.headers.eq(++ind).find('.button').focus();
                }
                break;
        }
    };
	
	/** 
	 * Toggles accordion panel.
	 *
	 * @param {Object} event - Keyboard or mouse event.
	 * @param {object} event.data - Event data.
	 * @param {object} event.data.plugin - Reference to plugin.
	 */
	Plugin.prototype.togglePanel = function (event) {
		
		var plugin, $elem, $panel, $me, isVisible;
		
		plugin = event.data.plugin;
		$elem = $(plugin.element);
		$me = $(event.target);
		$panel = $me.parent('dt').next();
		
		if(plugin.options.autoCollapse) { // expand current panel and collapse the rest
			
			plugin.headers.each(function(i, el) {
				var $hdr, $btn; 
				
				$hdr = $(el);
				$btn = $hdr.find('.button');
				$pnl = $btn.parent('dt').next();
				
				if($btn[0] != $(event.currentTarget)[0]) { 
					$btn.removeClass('expanded');
					$btn.attr('aria-expanded', 'false');
					$pnl.attr('aria-hidden', 'true');
					$hdr.next().slideUp(plugin.options.animationSpeed);
				} else { 
					$btn.addClass('expanded');
					$btn.attr('aria-expanded', 'true');
					$pnl.attr('aria-hidden', 'false');
					$hdr.next().slideDown(plugin.options.animationSpeed);
				}
			});
			
		} else { // toggle current panel depending on the state
		
			isVisible = !!$panel.is(':visible');
			$me.toggleClass('expanded');
				if ($me.hasClass( 'expanded' )) {
					$(this).attr( 'aria-expanded', 'true');
					$($panel).attr( 'aria-hidden', 'false');
					
				}
				else {
					$(this).attr( 'aria-expanded', 'false');
					$($panel).attr( 'aria-hidden', 'true');
				}
		
			$panel.slideToggle({ duration: plugin.options.animationSpeed });
			
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