var module = angular.module("hjc.directives.dragdrop", ['hjc.services']);

module.directive('hjcDraggable', ['$rootScope', 'uuid', function($rootScope, uuid) {
	return {
		restrict: 'A',
		link: function(scope, el, attrs, controller) {
			//console.log("linking draggable element");

			angular.element(el).attr("draggable", "true");
			var id = angular.element(el).attr("id");
			if (!id) {
				id = uuid.new()
				angular.element(el).attr("id", id);
			}
			
			el.bind("dragstart", function(e) {
				//console.log("The dragstart event handler fired, and evt.target = " + e.target);
				e.dataTransfer.setData('text', id);

				$rootScope.$emit("HJC-DRAG-START");
			});
			
			el.bind("dragend", function(e) {
				$rootScope.$emit("HJC-DRAG-END");
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
						
			el.bind("dragover", function(e) {
				if (e.preventDefault) {
				e.preventDefault(); // Necessary. Allows us to drop.
				}
				
				e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
				return false;
			});
			
			el.bind("dragenter", function(e) {
				// this / e.target is the current hover target.
				angular.element(e.target).addClass('hjc-over');
			});
			
			el.bind("dragleave", function(e) {
				angular.element(e.target).removeClass('hjc-over');  // this / e.target is previous target element.
			});
			
			el.bind("drop", function(e) {
				if (e.preventDefault) {
				e.preventDefault(); // Necessary. Allows us to drop.
				}

				if (e.stopPropogation) {
				e.stopPropogation(); // Necessary. Allows us to drop.
				}
				var data = e.dataTransfer.getData("text");
				//var dest = document.getElementById(id);
				//var src = document.getElementById(data);
				var dest=id;
				var src=data;
				
				scope.onDrop({dragEl: src, dropEl: dest});
			});

			$rootScope.$on("HJC-DRAG-START", function() {
				var el = document.getElementById(id);
				angular.element(el).addClass("hjc-target");
			});
			
			$rootScope.$on("HJC-DRAG-END", function() {
				var el = document.getElementById(id);
				angular.element(el).removeClass("hjc-target");
				angular.element(el).removeClass("hjc-over");
			});
		}
	}
}]);