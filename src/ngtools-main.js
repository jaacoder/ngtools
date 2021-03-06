/**
 * @license
 * (c) 2017 jaacoder
 * License: MIT
 */
/* global moment, numeral, Function, Inputmask */

(function ($) {

    var ngtoolsModule = angular.module('jaacoder-ngtools', [])
    ngtoolsModule.config(['$controllerProvider', '$qProvider', function ($controllerProvider, $qProvider) {
            // save controller register function for later use
            ngtoolsModule.$controllerProvider = $controllerProvider

            // do not throw error on unhandled rejections
            $qProvider.errorOnUnhandledRejections(false)
            
            // save main module for later use
            ngtoolsModule.mainModule = angular.module($('[ng-app]:first').attr('ng-app'))
        }])
            .run(['$rootScope', '$location', '$window', function ($rootScope, $location, $window) {

                    // save controller register function for later use
                    ngtoolsModule.mainModule.controller = ngtoolsModule.$controllerProvider.register

                    // globals
                    $rootScope.$window = $window
                    $rootScope.window = window
                    
                    // proxy config
                    Function.proxyConfig && Function.proxyConfig({methods: ['then']})

                    // init function
                    $rootScope.init = $rootScope.init || function (options) {
                        options = angular.extend({focus: true}, options || {})

                        this.vm = (this.$resolve || {}).data || {}
                        if (!this.modal) {
                            this.baseUrl = S($location.$$path.split('/', 3).join('/')).chompLeft('/').s
                        }

                        // focus
                        options.focus && this.focus()

                        // reach the window top
                        window.scroll(0, 0)
                    }

                    // indicate if inside a modal div
                    $rootScope.modal = false

                    // automatic focus
                    $rootScope.focus = function () {
                        setTimeout(function () {
                            $(':input:focusable:tabbable:first').focus().select()
                        }, 200)
                    }

                }])

})(jQuery);


jQuery(function () {

    var $ = jQuery

    // simulate tab with enter
    $(document).on('keypress', ':input', function (e) {
        var $element = $(e.target)

        var buttonSelector = ':button, :submit, [type=\'reset\']'
        var textareaSelector = 'textarea'

        if ((e.keyCode == 13 || e.keyCode == 10)
                && !$element.is(buttonSelector)
                && !$element.is(textareaSelector)) {

            var $tabbable = $(':tabbable').filter(':input')

            // lost focus to trigger handler events
            $element.trigger('blur')

            // if ctrl pressed, find primary button and trigger it
            if (e.ctrlKey) {
                $tabbable.filter('.btn-primary:eq(0)').trigger('click')

            } else {
                $tabbable.each(function (index, element) {

                    if (element == e.target) {

                        setTimeout(function () {
                            $tabbable.eq(index + 1).focus().select()
                        }, 30)

                        return false
                    }

                })
            }

            return false
        }

        return true
    })

});