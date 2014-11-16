/*
	jQuery SuperLightBox version 1.0 (a generic draggable lightbox overlay library)
	Author: Stayko Chalakov
	Date created: 13 September 2011
	
*/

(function($){

	jQuery.fn.superLightBox = function (options) {
		
		//set the default options
		var defaults = {
			height: '500',
			width: '500',
			position: 'center',
			effect: 'dark',
			onClose : function(){} //callback 
		};
		
		var opts = jQuery.extend(defaults, options);
		
		
		return this.each (function () {
			
			var lightbox = $(this); 
			
			//drop shadow color depening on overlay 
			var ds_color; 
			
			//padding for lightbox container
			var paddingTopBottom = 38;
			var paddingLeftRight = 20;
			
			//construct the lightbox 
			$(this).addClass('slb_container');
			$(this).css("height", opts.height-paddingTopBottom+'px')
				   .css("width", opts.width-paddingLeftRight+'px')
				   .css("padding", "28px 10px 10px 10px"); 

			
			//check how the position is passed
			if(opts.position == 'center' || opts.position == 'centre'){
				
				var viewport = getViewportResolution(); 
				var centerX = (viewport.width / 2) - (opts.width / 2); 
				var centerY = (viewport.height / 2) - (opts.height / 2); 
				
				$(this).css("left", centerX + "px")
					   .css("top", centerY + "px"); 
			
			//if passed as object
			} else if(typeof opts.position == "object"){
				
				if(typeof opts.position.left == "undefined" || typeof opts.position.top == "undefined"){
				
					jQuery.error("The 'top' and 'left' variables in the 'position' object parameter must be defined."); 
					
				} else {
					$(this).css("left", opts.position.left + "px")
						   .css("top", opts.position.top + "px"); 
				}
			} else {
				//error handling 
				jQuery.error("The 'position' parameter only permits value 'center' (or 'centre') or object {left: n, top: n}."); 
			}
			
			//check if 'message' parameter is defined 
			if(typeof opts.message == "undefined"){
				jQuery.error("The 'message' parameter must be defined."); 
			} else {
				$(this).text(opts.message); 
			}
			
			
			//check what the effect is set to 
			if(opts.effect == 'dark'){
				$(this).before('<div class="slb_overlay slb_darkOverlay"></div>');
				ds_color = "0F0F0F"; 
			} else if(opts.effect == 'light'){
				$(this).before('<div class="slb_overlay slb_lightOverlay"></div>'); 
				ds_color = "969696"; 
			} else {
				jQuery.error("The 'effect' parameter must be set as either 'light' or 'dark'."); 
			}
			
			//add dropshadow
			$(this).css("-moz-box-shadow", "2px 2px 4px #"+ds_color);
			$(this).css("-webkit-box-shadow",  "2px 2px 4px #"+ds_color);
			$(this).css("filter", 'progid:DXImageTransform.Microsoft.Shadow(color="#'+ds_color+'", Direction=135, Strength=4)');
			
			//add the close button
			$(this).append('<a href="#" title="Close" class="slb_close_btn"></a>');
			$(this).append('<div class="slb_draggable"></div>');
			$('.slb_draggable').width((opts.width-67)+'px'); 
			
			//event listener for the close button
			$(this).children('.slb_close_btn').click(function () {
			
				$('.slb_overlay').remove();
				lightbox.children('.slb_close_btn').remove();
				lightbox.children('.slb_draggable').remove();
				lightbox.removeClass('slb_container'); 
				lightbox.removeAttr('style'); 
				lightbox.text(''); 
				
				//call the callback function
				opts.onClose.call(this);
			}); 
			
			dragMe($('.slb_draggable')); 
			
		});
	}
	
	
	// get the width and height of the browser viewport 
	function getViewportResolution() {
	
		var viewportheight;
		var viewportwidth;
		 
		 // Mozilla, Netscape, Opera, IE7
		 if (typeof window.innerWidth != 'undefined'){
			  viewportheight = window.innerHeight;
			  viewportwidth = window.innerWidth; 
		 }
		// IE6 in standards compliant mode
		 else if (typeof document.documentElement != 'undefined'
				  && typeof document.documentElement.clientWidth !='undefined' 
				  && document.documentElement.clientWidth != 0){
				  
			   viewportheight = document.documentElement.clientHeight;
			   viewportwidth = document.documentElement.clientWidth; 
		 }
		 // older versions of IE
		 else {
			   viewportheight = document.getElementsByTagName('body')[0].clientHeight;
			   viewportwidth = document.getElementsByTagName('body')[0].clientWidth; 
		 }
		 
		 return  {width : viewportwidth, height : viewportheight};
		 
	};
	
	
	//used for dragging
	function dragMe(dragger)
	{
		
		// drag active
		var drag_active = false; 
		
		// document jQuery
		doc = $(document); 
		
		// the draggable element
		draggable_element = dragger; 
		
		//get the lightbox container
		container = dragger.parent(".slb_container"); 
		
		// current cursor
		cursor = draggable_element.css('cursor'); 
		
		// clicked point
		point = [null,null];
		
		// current mouseDown event
		m = null;
	
		
		// blocks an event (to prevent selecting text)
		block = function(draggable_element) {
					
					// will fail with IE & timeout
					try { 
							draggable_element.stopPropagation();
							draggable_element.preventDefault();
					} catch (draggable_element) {}; // but will still remain usable
			},
			
		// on mousedown	
		mouse_down = function(e_md) {
				// text selection would occur if not blocked here
				block(e_md); 
				
				if (drag_active) { // drag active
					draggable_element.css('cursor', 'move'); 
					doc.bind('mousemove', mouse_move);
					point = [e_md.clientX - container.position().left, e_md.clientY - container.position().top];
					draggable_element.trigger('dragstart');
					
				} else { // wait
					m = e_md;
					drag_active = true;
					if (m) mouse_down(m);
				}
		},
		
		// on mouseup
		mouse_up = function(e_mu) { 
				if (drag_active) { 
					block(e_mu);
					doc.unbind('mousemove', mouse_move);
					draggable_element.css('cursor', cursor)
								     .trigger('dragend');
				} 
			drag_active = false;
		},
		
		// on mousemove
		mouse_move = function(e_mm) { 
			block(e_mm);
			container.css('left', (e_mm.clientX - point[0]) + 'px')
					 .css('top', (e_mm.clientY - point[1]) + 'px');
		},
		
		
		draggable_element.bind('mousedown', mouse_down).bind('mouseup', mouse_up);
		return draggable_element;
		
	}
	
})(jQuery);

	