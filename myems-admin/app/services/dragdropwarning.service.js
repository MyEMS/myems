'use strict';

/**
 * DragDropWarningService
 * 
 * Service for handling drag-and-drop warning messages when dragging/dropping is disabled.
 * Provides a unified way to show warnings based on active tab index.
 * 
 * Usage:
 *   dragDropWarningService.showWarningIfActive($scope, tabIndexKey, messageKey);
 */
app.service('DragDropWarningService', function($timeout, $translate, toaster) {
    
    /**
     * Show warning message if the specified tab is currently active
     * 
     * @param {Object} scope - The controller scope
     * @param {String|Number} tabIndexKey - The tab index key from TAB_INDEXES (e.g., 'BIND_METER') or fallback index
     * @param {String} messageKey - Translation key for the warning message (e.g., 'SETTING.PLEASE_SELECT_TENANT_FIRST')
     * @param {Object} fallbackTabIndexes - Fallback TAB_INDEXES object if $scope.$parent.TAB_INDEXES is not available
     */
    this.showWarningIfActive = function(scope, tabIndexKey, messageKey, fallbackTabIndexes) {
        // Get TAB_INDEXES from parent scope or use fallback
        var TAB_INDEXES = (scope.$parent && scope.$parent.TAB_INDEXES) || fallbackTabIndexes || {};
        
        // Get the actual tab index value
        var tabIndex = typeof tabIndexKey === 'string' 
            ? (TAB_INDEXES[tabIndexKey] !== undefined ? TAB_INDEXES[tabIndexKey] : null)
            : tabIndexKey;
        
        // Check if this tab is currently active
        if (scope.$parent && scope.$parent.activeTabIndex === tabIndex) {
            $timeout(function() {
                try {
                    toaster.pop({
                        type: "warning",
                        body: $translate.instant(messageKey),
                        showCloseButton: true,
                    });
                } catch(err) {
                    console.error('Error showing toaster:', err);
                    // Use toaster error instead of alert for better UX
                    try {
                        toaster.pop({
                            type: "error",
                            title: $translate.instant("TOASTER.ERROR_TITLE") || "Error",
                            body: $translate.instant(messageKey),
                            showCloseButton: true,
                        });
                    } catch(innerErr) {
                        // Last resort: log to console
                        console.error('Failed to show warning message:', messageKey, innerErr);
                    }
                }
            }, 0);
        }
    };
    
    /**
     * Show warning message without checking active tab
     * Useful for direct calls from pair/delete functions
     * 
     * @param {String} messageKey - Translation key for the warning message
     */
    this.showWarning = function(messageKey) {
        $timeout(function() {
            try {
                toaster.pop({
                    type: "warning",
                    body: $translate.instant(messageKey),
                    showCloseButton: true,
                });
            } catch(err) {
                console.error('Error showing toaster:', err);
                // Use toaster error instead of alert for better UX
                try {
                    toaster.pop({
                        type: "error",
                        title: $translate.instant("TOASTER.ERROR_TITLE") || "Error",
                        body: $translate.instant(messageKey),
                        showCloseButton: true,
                    });
                } catch(innerErr) {
                    // Last resort: log to console
                    console.error('Failed to show warning message:', messageKey, innerErr);
                }
            }
        }, 0);
    };
    
    /**
     * Register drag and drop warning event listeners for a tab
     * This method encapsulates the common pattern of listening to HJC-DRAG-DISABLED 
     * and HJC-DROP-DISABLED events, reducing code duplication across controllers.
     * 
     * @param {Object} scope - The controller scope
     * @param {String} tabIndexKey - The tab index key from TAB_INDEXES (e.g., 'BIND_METER')
     * @param {String} messageKey - Translation key for the warning message (e.g., 'SETTING.PLEASE_SELECT_TENANT_FIRST')
     * @param {Object} fallbackTabIndexes - Fallback TAB_INDEXES object if $scope.$parent.TAB_INDEXES is not available
     */
    this.registerTabWarnings = function(scope, tabIndexKey, messageKey, fallbackTabIndexes) {
        var self = this;
        
        // Register HJC-DRAG-DISABLED event listener
        scope.$on('HJC-DRAG-DISABLED', function(event) {
            self.showWarningIfActive(scope, tabIndexKey, messageKey, fallbackTabIndexes);
        });
        
        // Register HJC-DROP-DISABLED event listener
        scope.$on('HJC-DROP-DISABLED', function(event) {
            self.showWarningIfActive(scope, tabIndexKey, messageKey, fallbackTabIndexes);
        });
    };
});

