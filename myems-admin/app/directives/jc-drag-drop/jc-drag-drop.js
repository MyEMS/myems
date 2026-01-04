var module = angular.module("hjc.directives.dragdrop", ['hjc.services']);

/**
 * hjcDraggable Directive
 * 
 * Makes an element draggable. Supports conditional enabling/disabling.
 * 
 * Usage:
 *   - x-hjc-draggable="true"  - Enable dragging (default behavior)
 *   - x-hjc-draggable="false" - Disable dragging, shows warning when attempted
 *   - x-hjc-draggable=""      - Enable dragging (backward compatible, default)
 *   - x-hjc-draggable="{{condition ? 'true' : 'false'}}" - Conditional dragging
 * 
 * When dragging is disabled and user attempts to drag:
 *   - Drag operation is prevented
 *   - HJC-DRAG-DISABLED event is broadcasted via $rootScope
 *   - Controllers can listen to this event to show warning messages
 * 
 * Backward Compatibility:
 *   - All existing pages using x-hjc-draggable="true" continue to work
 *   - Pages without the attribute (or empty value) default to enabled (backward compatible)
 *   - Only pages explicitly using "false" will have dragging disabled
 */
module.directive('hjcDraggable', ['$rootScope', '$timeout', 'uuid', function($rootScope, $timeout, uuid) {
	return {
		restrict: 'A',
		link: function(scope, el, attrs, controller) {
			var id = angular.element(el).attr("id");
			if (!id) {
				id = uuid.new()
				angular.element(el).attr("id", id);
			}
			
			// Track if draggable is enabled
			// Default to true for backward compatibility
			var isDraggableEnabled = true;
			
			var dragStartHandler = function(e) {
				// Check if draggable is enabled
				if (!isDraggableEnabled) {
					// Prevent drag operation completely
					e.preventDefault();
					e.stopPropagation();
					// Set effectAllowed to 'none' to show it's not allowed
					if (e.dataTransfer) {
						e.dataTransfer.effectAllowed = 'none';
					}
					// Broadcast event to show warning
					// Use $timeout to ensure Angular digest cycle
					// Note: This event is broadcasted to all scopes. Pages that don't listen to it
					// will simply ignore it, so it doesn't break existing functionality.
					// To show warnings, controllers should listen: $scope.$on('HJC-DRAG-DISABLED', ...)
					$timeout(function() {
						$rootScope.$broadcast("HJC-DRAG-DISABLED");
					}, 0);
					return false;
				}
				// Normal drag operation - enabled
				e.dataTransfer.setData('text', id);
				$rootScope.$emit("HJC-DRAG-START");
			};
			
			var dragEndHandler = function(e) {
				$rootScope.$emit("HJC-DRAG-END");
			};
			
			// Function to update draggable state
			// This function is backward compatible:
			//   - x-hjc-draggable="true"  -> enabled (existing pages work as before)
			//   - x-hjc-draggable=""     -> enabled (backward compatible, default behavior)
			//   - x-hjc-draggable="false" -> disabled (new feature for conditional dragging)
			var updateDraggable = function(value) {
				// Remove existing handlers
				el.unbind("dragstart", dragStartHandler);
				el.unbind("dragend", dragEndHandler);
				
				// Update enabled state
				// Only enable when attribute value is explicitly 'true'
				// For backward compatibility: if attribute is not present or is empty string, enable by default
				// Convert to string and trim to handle any whitespace
				var stringValue = value ? String(value).trim() : '';
				isDraggableEnabled = (stringValue === '' || stringValue === 'true');
				
				// Always set draggable to "true" to allow dragstart event to fire
				// We'll check isDraggableEnabled in dragStartHandler and prevent if disabled
				// This ensures the dragstart event always fires, allowing us to show warnings when disabled
				angular.element(el).attr("draggable", "true");
				
				// Always bind handlers to allow checking and showing warning when disabled
				el.bind("dragstart", dragStartHandler);
				el.bind("dragend", dragEndHandler);
			};
			
			// Observe attribute changes
			// $observe will trigger immediately on initialization with the interpolated value
			// So we don't need to call updateDraggable(attrs.hjcDraggable) separately
			// as attrs.hjcDraggable might not be interpolated yet at initialization time
			attrs.$observe('hjcDraggable', function(value) {
				updateDraggable(value);
			});
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
						
			// Track if drop target is enabled
			// Initialize to false to be safe - $observe will update it with the correct value
			var isDropTargetEnabled = false;
			
			var dragOverHandler = function(e) {
				e.preventDefault(); // Necessary. Allows us to drop.
				// Check if drop target is enabled
				if (!isDropTargetEnabled) {
					// Disabled: set dropEffect to 'none' to show it's not allowed
					// But still allow drop event to fire so we can show warning
					e.dataTransfer.dropEffect = 'none';
				} else {
					// Enabled: set dropEffect to 'move'
					e.dataTransfer.dropEffect = 'move';
				}
				return false;
			};
			
			var dragEnterHandler = function(e) {
				// Check if drop target is enabled
				if (!isDropTargetEnabled) {
					// Disabled: don't add visual feedback
					return;
				}
				// Enabled: add visual feedback
				angular.element(e.target).addClass('hjc-over');
			};
			
			var dragLeaveHandler = function(e) {
				// Remove visual feedback regardless of state
				angular.element(e.target).removeClass('hjc-over');
			};
			
			var dropHandler = function(e) {
				e.preventDefault(); // Necessary. Allows us to drop.
				e.stopPropagation(); // Necessary. Allows us to drop.
				
				// Check if drop target is enabled
				// Always use the $observe-updated variable which is guaranteed to have the correct interpolated value
				if (!isDropTargetEnabled) {
					// Drop target is disabled, broadcast event to show warning
					// Always broadcast the event - let the controller decide whether to show the warning
					// Use $apply to ensure Angular knows about this event
					try {
						if (!scope.$$phase && !scope.$root.$$phase) {
							scope.$apply(function() {
								$rootScope.$broadcast("HJC-DROP-DISABLED");
							});
						} else {
							$rootScope.$broadcast("HJC-DROP-DISABLED");
						}
					} catch(err) {
						// If $apply fails, try without it
						$rootScope.$broadcast("HJC-DROP-DISABLED");
					}
					return false; // Prevent drop
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
				
				// Update enabled state
				// Only enable when attribute value is explicitly 'true'
				// For backward compatibility: if attribute is not present or is empty string, enable by default
				// Convert to string and trim to handle any whitespace
				var stringValue = value ? String(value).trim() : '';
				isDropTargetEnabled = (stringValue === '' || stringValue === 'true');
				
				// Always bind all events to allow drop detection and show warning when disabled
				// The handlers will check the current state and behave accordingly
				// Use on() instead of bind() for better compatibility
				el.on("dragover", dragOverHandler);
				el.on("dragenter", dragEnterHandler);
				el.on("dragleave", dragLeaveHandler);
				el.on("drop", dropHandler);
			};
			
			// Observe attribute changes
			// $observe will trigger with the interpolated value after Angular processes the template
			// It will trigger immediately on initialization with the interpolated value
			attrs.$observe('hjcDropTarget', function(value) {
				updateDropTarget(value);
			});
			
			// Initialize event handlers immediately (even before $observe fires)
			// This ensures drop events can be caught even if $observe hasn't fired yet
			// The handlers will check isDropTargetEnabled which will be updated by $observe
			el.on("dragover", dragOverHandler);
			el.on("dragenter", dragEnterHandler);
			el.on("dragleave", dragLeaveHandler);
			el.on("drop", dropHandler);
			
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