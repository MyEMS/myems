var module = angular.module("hjc.directives.dragdrop", ['hjc.services']);

module.directive('hjcDraggable', ['$rootScope', 'uuid', function($rootScope, uuid) {
	return {
		restrict: 'A',
		link: function(scope, el, attrs, controller) {
			var id = angular.element(el).attr("id");
			if (!id) {
				id = uuid.new()
				angular.element(el).attr("id", id);
			}
			
			var dragStartHandler = function(e) {
				e.dataTransfer.setData('text', id);
				$rootScope.$emit("HJC-DRAG-START");
			};
			
			var dragEndHandler = function(e) {
				$rootScope.$emit("HJC-DRAG-END");
			};
			
			// Function to update draggable state
			var updateDraggable = function(value) {
				// Remove existing handlers
				el.unbind("dragstart", dragStartHandler);
				el.unbind("dragend", dragEndHandler);
				
				// Check if draggable should be enabled
				// Only enable when attribute value is explicitly 'true'
				// For backward compatibility: if attribute is not present (undefined) or is empty string, enable by default
				if (value !== undefined && value !== '' && value !== 'true') {
					angular.element(el).attr("draggable", "false");
				} else {
					// Enable draggable: either 'true' explicitly, or undefined/empty for backward compatibility
					angular.element(el).attr("draggable", "true");
					el.bind("dragstart", dragStartHandler);
					el.bind("dragend", dragEndHandler);
				}
			};
			
			// Observe attribute changes
			attrs.$observe('hjcDraggable', function(value) {
				updateDraggable(value);
			});
			
			// Initialize with current value
			updateDraggable(attrs.hjcDraggable);
		}
	}
}]);

module.directive('hjcDropTarget', ['$rootScope', 'uuid', function($rootScope, uuid) {
	return {
		restrict: 'A',
		scope: {
			onDrop: '&'
		},
		link: function(scope, el, attrs, controller) {
			var id = angular.element(el).attr("id");
			if (!id) {
				id = uuid.new()
				angular.element(el).attr("id", id);
			}
			
			var dragOverHandler = function(e) {
				if (e.preventDefault) {
					e.preventDefault(); // Necessary. Allows us to drop.
				}
				e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
				return false;
			};
			
			var dragEnterHandler = function(e) {
				// this / e.target is the current hover target.
				angular.element(e.target).addClass('hjc-over');
			};
			
			var dragLeaveHandler = function(e) {
				angular.element(e.target).removeClass('hjc-over');  // this / e.target is previous target element.
			};
			
			var dropHandler = function(e) {
				if (e.preventDefault) {
					e.preventDefault(); // Necessary. Allows us to drop.
				}
				if (e.stopPropogation) {
					e.stopPropogation(); // Necessary. Allows us to drop.
				}
				var data = e.dataTransfer.getData("text");
				var dest=id;
				var src=data;
				scope.onDrop({dragEl: src, dropEl: dest});
			};
			
			var dragStartListener = $rootScope.$on("HJC-DRAG-START", function() {
				var targetEl = document.getElementById(id);
				if (targetEl) {
					angular.element(targetEl).addClass("hjc-target");
				}
			});
			
			var dragEndListener = $rootScope.$on("HJC-DRAG-END", function() {
				var targetEl = document.getElementById(id);
				if (targetEl) {
					angular.element(targetEl).removeClass("hjc-target");
					angular.element(targetEl).removeClass("hjc-over");
				}
			});
			
			// Function to update drop target state
			var updateDropTarget = function(value) {
				// Remove existing handlers
				el.unbind("dragover", dragOverHandler);
				el.unbind("dragenter", dragEnterHandler);
				el.unbind("dragleave", dragLeaveHandler);
				el.unbind("drop", dropHandler);
				
				// Check if drop target should be enabled
				// Only enable when attribute value is explicitly 'true'
				// For backward compatibility: if attribute is not present or is empty string, enable by default
				if (value !== undefined && value !== '' && value !== 'true') {
					// Disabled, don't bind events
				} else {
					// Enable drop target
					el.bind("dragover", dragOverHandler);
					el.bind("dragenter", dragEnterHandler);
					el.bind("dragleave", dragLeaveHandler);
					el.bind("drop", dropHandler);
				}
			};
			
			// Observe attribute changes
			attrs.$observe('hjcDropTarget', function(value) {
				updateDropTarget(value);
			});
			
			// Initialize with current value
			updateDropTarget(attrs.hjcDropTarget);
			
			// Cleanup listeners on scope destroy
			scope.$on('$destroy', function() {
				if (dragStartListener) {
					dragStartListener();
				}
				if (dragEndListener) {
					dragEndListener();
				}
			});
		}
	}
}]);