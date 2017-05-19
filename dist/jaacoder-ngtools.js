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
        }])
            .run(['$rootScope', '$location', function ($rootScope, $location) {

                    // save controller register function for later use
                    var mainModule = angular.module($('[ng-app]:first').attr('ng-app'))
                    mainModule.controller = ngtoolsModule.$controllerProvider.register

                    // globals
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
                        }, 50)
                    }

                    // mask
                    $.inputmask && $.extend($.inputmask.defaults.aliases, {
                        phone: {
                            mask: "(99) 9999-9999[9]",

                            onBeforeWrite: function (event, buffer, caretPos, opts) {
                                if (buffer.length == 15 && buffer[9] == "-") {
                                    buffer[9] = buffer[10]
                                    buffer[10] = "-"
                                }
                            },

                            greedy: false
                        },

                        numeric: {
                            mask: "9{0,+}"
                        }
                    })

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
                $tabbable.filter('.btn-primary').trigger('click')

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
(function () {
    
    var ngtoolsModule = angular.module('jaacoder-ngtools')
    
    ngtoolsModule.value('formatter', {

                cpf: function (input) {
                    input = input || ''

                    var out = input.substr(0, 3) + '.' + input.substr(3, 3) + '.' + input.substr(6, 3) + '-' + input.substr(9, 2)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cnpj: function (input) {
                    input = input || ''

                    var out = input.substr(0, 2) + '.' + input.substr(2, 3) + '.' + input.substr(5, 3) + '/' + input.substr(8, 4) + '-' + input.substr(12, 2)

                    return out.replace(/[\.\-]*$/g, '')
                },

                date: function (input) {
                    output = (input || '').split(' ')[0].split('-').reverse().join('/')
                    return output
                },

                time: function (input) {
                    return (input || '').split(':', 2).join(':')
                },

                cep: function (input) {
                    input = input || ''

                    var out = input.substr(0, 2) + '.' + input.substr(2, 3) + '-' + input.substr(5, 3)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cns: function (input) {
                    input = input || ''

                    var out = input.substr(0, 3) + '.' + input.substr(3, 4) + '.' + input.substr(7, 4) + '.' + input.substr(11, 4)
                    return out.replace(/[\.\-]*$/g, '')
                },

                phone: function (input) {
                    input = input || ''

                    if (input.length == 0) {
                        return ''
                    }

                    var out = ''
                    if (input.length == 11) {
                        out = '(' + input.substr(0, 2) + ') ' + input.substr(2, 5) + '-' + input.substr(7, 4)
                    } else {
                        out = '(' + input.substr(0, 2) + ') ' + input.substr(2, 4) + '-' + input.substr(6, 4)
                    }

                    return out.replace(/[\.\-]*$/g, '')
                },

                count: function (input) {
                    if (input === undefined || input === null) {
                        return null
                    }

                    return numeral(input).format('0,000')
                },

                numeric: function (input) {
                    if (input === undefined || input === null) {
                        return null
                    }

                    return (input + '' || '').replace(/\D/g, '')
                },

                decimal: function (input) {
                    return numeral(Number(input || '')).format('0.00')
                },

                decimal4: function (input) {
                    return numeral(Number(input || '')).format('0.0000')
                },

                currency: function (input) {
                    return numeral(Number(input || '')).format('0,000.00')
                },

                currency4: function (input) {
                    return numeral(Number(input || '')).format('0,000.0000')
                },

                flag: function (input) {
                    input = (input || '')
                    return (input === 'T') ? 'Sim' : (input === 'F') ? 'Não' : ''
                },

                apac: function (input) {
                    input = (input || '')
                    return (input == '2') ? 'Programa' : (input == '1') ? 'Não Programa' : ''
                },

                upper: function (input) {
                    input = (input || '')
                    return input.toUpperCase()
                },
            })

            .value('parser', {
                date: function (input) {
                    output = (input || '').split(' ')[0].split('/').reverse().join('-')
                    return output
                },

                decimal: function (input) {
                    return numeral(input || '').value()
                },

                decimal4: function (input) {
                    return numeral(input || '').value()
                },

                currency: function (input) {
                    return numeral(input || '').value()
                },

                currency4: function (input) {
                    return numeral(input || '').value()
                },

                count: function (input) {
                    return Number((input || '').replace(/\./, ''))
                },

                phone: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                cpf: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                cep: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                upper: function (input) {
                    input = (input || '')
                    return input.toUpperCase()
                },
            })
})();
(function () {
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$rootScope', '$http', '$location', '$q', function ($rootScope, $http, $location, $q) {

            // avoid caching JS file on refresh, but caching it between refreshs
            var $ajax = $.ajax; // save the original $.ajax
            $.ajax = function (settings) { // wrap the old $.ajax so set cache to true...
                if (settings.dataType === 'script') {
                    settings.cache = true;
                    if (settings.url.indexOf('?') === -1) {
                        settings.url += '?'
                    } else {
                        settings.url += '&'
                    }

                    settings.url += 'noCache=' + ngtoolsModule.noCache
                }

                $ajax(settings); // call old $.ajax
            }

            /**
             * Process response if success.
             * 
             * @param {Object} response
             * @param {Object} config
             * @return {Object}
             */
            $rootScope.httpSuccess = function (response, config) {
                var scope = response.scope
                config = angular.merge({copyMethod: 'extend'}, config || {})

                if (response.data && angular.isObject(response.data)) {

                    var oldView = (scope.vm && scope.vm.view) || null;

                    angular[config.copyMethod](scope.vm, response.data)

                    if (!scope.modal && response.data.view && response.data.view != oldView) {
                        $location.skipResolving(scope.vm).path(S(response.config.url).ensureLeft('/').s)
                    }
                }

                return response
            }

            /**
             * Send ajax call.
             * 
             * @param {String} method
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.send = function (method, url, data, config) {
                var scope = this
                var url = '' + url // convert url to string

                if (url.substr(0, 1) !== '/') {
                    url = S(scope.baseUrl + '/' + url).chompLeft('/').s
                } else {
                    url = S(url).chompLeft('/').s
                }

                return $http[method.toLowerCase()](url, data, config).then(function (response) {

                    // save scope for custom use
                    response.scope = scope

                    if (scope.httpSuccess && angular.isFunction(scope.httpSuccess)) {
                        return scope.httpSuccess(response, config)
                        //
                    } else {
                        return response
                    }

                    //
                }, function (response) {

                    return $q.reject(response)
                })
            }

            /**
             * Do a GET request.
             * 
             * @param {String} url
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.get = function (url, config) {
                return this.send('get', url, null, config)
            }

            /**
             * Do a POST request.
             * 
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.post = function (url, data, config) {
                return this.send('post', url, data, config)
            }

            /**
             * Do a PUT request.
             * 
             * @param {String} url
             * @param {Object} data
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.put = function (url, data, config) {
                return this.send('put', url, data, config)
            }

            /**
             * Do a DELETE request.
             * 
             * @param {String} url
             * @param {Object} config
             * @returns {Object}
             */
            $rootScope.delete = function (url, config) {
                return this.send('delete', url, null, config)
            }

        }])

})();
(function () {

    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.directive('mask', ['formatter', 'parser', function (formatter, parser) {

                    var masks = {
                        cpf: '999.999.999-99',
                        cnpj: '99.999.999/9999-99',
                        date: '99/99/9999',
                        time: '99:99',
                        cep: '99.999-999',
                        cns: '999.9999.9999.9999',
                        phone: 'phone',
                        numeric: 'numeric',
                        decimal: 'decimal',
                        decimal4: 'decimal4',
                        currency: 'currency',
                        currency4: 'currency4',
                        upper: 'upper',
                    }

                    return {
                        restrict: 'A',
                        require: 'ngModel',

                        link: function ($scope, $element, attrs, ngModel) {
                            ngModel.$formatters.push(formatter[attrs.mask] || function (a) {
                                return a
                            })
                            ngModel.$parsers.push(parser[attrs.mask] || function (a) {
                                return a
                            })

                            // skip some masks
                            if (['upper'].indexOf(attrs.mask) >= 0) {
                                $element.css('text-transform', 'uppercase')
                                return
                            }

                            if (['decimal', 'decimal4', 'currency', 'currency4'].indexOf(attrs.mask) != -1) {

                                var decimals = attrs.mask.substr(-1) === '4' ? 4 : 2;
                                $element.maskMoney({
                                    thousands: '.',
                                    decimal: ',',
                                    precision: decimals,
                                    allowZero: true
                                });

                            } else {
                                $element.inputmask(masks[attrs.mask]);
                            }
                        }
                    }
                }])


            // thanks to: https://www.tutorialspoint.com/angularjs/angularjs_upload_file.htm
            .directive('fileModel', ['$parse', function ($parse) {
                    return {
                        restrict: 'A',
                        link: function (scope, $element, attrs) {
                            var model = $parse(attrs.fileModel);
                            var modelSetter = model.assign;

                            $element.bind('change', function () {
                                scope.$apply(function () {
                                    modelSetter(scope, $element[0].files[0]);
                                });
                            });
                        }
                    };
                }]);

})();
(function () {
    
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.factory('noCacheInterceptor', [function () {
            return {
                request: function (request) {

                    if (request.url.indexOf('.html') >= 0 && request.url.indexOf('uib/') === -1) {
                        var sign = (request.url.indexOf('?') < 0) ? '?' : '&'
                        request.url += sign + 'noCache=' + ngtoolsModule.noCache
                    }

                    return request
                }
            }
        }])

            .factory('redirectInterceptor', ['$q', function ($q) {
                    return {
                        response: function (response) {

                            if (response && angular.isObject(response.data) && response.data._redirect) {
                                var redirect = response.data._redirect

                                if (redirect.substr(0, 1) === '#') {
                                    location.hash = redirect
                                    //
                                } else {
                                    location.href = redirect
                                }

                                return $q.reject(response)
                            }

                            return response
                        }
                    }
                }])

            // interceptor: loading modal
            .factory('loadingModalInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {

                    // show loading modal
                    $rootScope.showLoadingModal = function () {
                        $('#modalLoading').modal('show')
                    };

                    // hide loading modal
                    $rootScope.hideLoadingModal = function () {
                        $('#modalLoading').modal('hide')
                    };

                    var activeRequests = 0;

                    var showLoadingModal = function () {

                        if (activeRequests == 0) {
                            $rootScope.showLoadingModal()
                        }

                        activeRequests++;
                    };

                    var hideLoadingModal = function () {

                        if (activeRequests > 0) {
                            activeRequests--
                        }

                        if (activeRequests <= 0) {
                            activeRequests = 0
                            $rootScope.hideLoadingModal()
                        }
                    };


                    return {

                        request: function (config) {
                            // confirm workaround 
                            if (!config.url.match(/backdrop\.html$/) && !config.url.match(/window\.html/)) {
                                showLoadingModal()
                            }
                            return config
                        },

                        requestError: function (rejection) {
                            setTimeout(hideLoadingModal, 100)
                            return $q.reject(rejection)
                        },

                        response: function (response) {
                            setTimeout(hideLoadingModal, 100)
                            return response
                        },

                        responseError: function (rejection) {
                            setTimeout(hideLoadingModal, 100)
                            return $q.reject(rejection)
                        }
                    };
                }])

            .config([function () {
                    // register one 'nocache' for refresh (F5)
                    ngtoolsModule.noCache = (new Date().getTime())
                }])

})();
angular.module('jaacoder-ngtools')

    .filter('cpf', ['formatter', function(formatter) {
        return formatter.cpf
    }])
    
    .filter('cnpj', ['formatter', function(formatter) {
        return formatter.cnpj
    }])
    
    .filter('date', ['formatter', function(formatter) {
        return formatter.date
    }])
    
    .filter('time', ['formatter', function(formatter) {
        return formatter.time
    }])
    
    .filter('cep', ['formatter', function(formatter) {
        return formatter.cep
    }])
    
    .filter('cns', ['formatter', function(formatter) {
        return formatter.cns
    }])
    
    .filter('phone', ['formatter', function(formatter) {
        return formatter.phone
    }])
    
    .filter('numeric', ['formatter', function(formatter) {
        return formatter.numeric
    }])
    
    .filter('count', ['formatter', function(formatter) {
        return formatter.count
    }])
    
    .filter('decimal', ['formatter', function(formatter) {
        return formatter.decimal
    }])
    
    .filter('currency', ['formatter', function(formatter) {
        return formatter.currency
    }])
    
    .filter('decimal4', ['formatter', function(formatter) {
        return formatter.decimal4
    }])
    
    .filter('currency4', ['formatter', function(formatter) {
        return formatter.currency4
    }])
    
    .filter('flag', ['formatter', function(formatter) {
        return formatter.flag
    }])
    
    .filter('upper', ['formatter', function(formatter) {
        return formatter.upper
    }]);
    

(function() {
    var ngtoolsModule = angular.module('jaacoder-ngtools')
        
    ngtoolsModule.run(['$location', function($location) {
            
            // skip resolving data in next route dispatch
            $location.skipResolving = function(vm) {
                this.vm = vm
                return this
            }
            
        }])
        
        .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
                
                // remove '!' as hash prefix
                $locationProvider.hashPrefix('')
                
                $routeProvider.when('/:module/:controller/:method?/:p0?/:p1?/:p2?/:p3?/:p4?/:p5?/:p6?/:p7?/:p8?/:p9?', {
                    resolve: {
                        data: ['$http', '$q', '$location', function($http, $q, $location) {
                                
                            if ($location.vm) {
                                var vm = $location.vm
                                $location.vm = null
                                return vm
                            }
                                
                            var deferred = $q.defer()
                            
                            $http.get($location.$$path.substr(1)).then(function(response) {
                                routeResolution = angular.isObject(response.data) ? response.data : {}
                                deferred.resolve(routeResolution)
                            })
                            
                            return deferred.promise
                        }]
                    },
                    templateUrl: function(params) {
                        return 'views/' + params.module + '/' + params.controller + '/' + params.controller + '.html'
                    }
                })
                
            }])
        
})();
/* global appHelper, numeral */

(function () {


    // if ui.boostrap does not exist, exit
    try {
        angular.module('ui.bootstrap')
    } catch (e) {
        return
    }
    
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$rootScope', '$uibModal', function ($rootScope, $uibModal) {

            $rootScope.openModal = function (url, callback) {

                var parentScope = this

                if (url[0] == '/') {
                    url = url.substr(1)
                }

                var urlAndQuery = url.split('?')

                var segments = urlAndQuery[0].split('/')
                var module = segments.shift()
                var controller = segments.shift()

                var query = urlAndQuery[1]
                var querySegments = query ? query.split('&') : []
                var queryParams = {}

                for (var i in querySegments) {

                    var nameAndValue = querySegments[i].split('=')

                    if (!nameAndValue) {
                        continue
                    }

                    var paramName = unescape(nameAndValue[0])
                    var paramValue = unescape(nameAndValue[1])

                    queryParams[paramName] = paramValue
                }

                if (!module || !controller) {
                    console.log('Url should be in format: \'/{module}/{controller}/{action}/{params:.*}\'')
                    return
                }

                var view = 'views/' + module + '/' + controller + '/' + (queryParams.view || controller) + '.html'

                // prepare callback function
                var realCallback = function () {}

                if (angular.isFunction(callback)) {
                    realCallback = callback

                } else {
                    var callbackObject = null

                    if (angular.isObject(callback)) {
                        callbackObject = callback
                        //
                    } else if (angular.isString(callback)) {
                        callbackObject = eval('parentScope.' + callback)
                        if (!callbackObject) {
                            callbackObject = eval('parentScope.' + callback + ' = {}')
                        }
                    }

                    if (callbackObject) {
                        realCallback = function (object) {
                            angular.copy(object, callbackObject)
                        }
                    }
                }

                var modal = $uibModal.open({
                    animation: true,
                    templateUrl: view,
                    bindToController: false,
                    appendTo: angular.element($('[ng-view]')),
                    controller: ['$scope', function ($scope) {
                            $scope.modal = true
                            $scope.modalCallback = function () {
                                realCallback.apply(parentScope, arguments)
                                modal.close()
                            }

                            $scope.baseUrl = module + '/' + controller
                        }],
//                    controllerAs: 'ctrl',
                    resolve: {
                        data: ['$http', '$q', '$location', function ($http, $q, $location) {

                                if ($location.vm) {
                                    var vm = $location.vm
                                    $location.vm = null
                                    return vm
                                }

                                var deferred = $q.defer()

                                $http.get(url).then(function (response) {
                                    routeResolution = angular.isObject(response.data) ? response.data : {}
                                    deferred.resolve(routeResolution)
                                })

                                return deferred.promise
                            }]
                    },
                    size: 'lg'
                })

//            $rootScope.openPopup = true
//            $rootScope.popupInstance = modal
//
//            modal.closed.then(function() {
//                $rootScope.openPopup = false
//                $rootScope.popupInstance = null
//            })
            }
        }])
})();