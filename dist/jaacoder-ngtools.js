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
            $rootScope.processResponse = function (response, config) {
                var scope = response.scope
                config = angular.merge({copyMethod: 'extend', dest: 'vm'}, config || {})

                if (response.data && angular.isObject(response.data)) {

                    var oldView = (scope.vm && scope.vm.view) || null;
                    if (config.copyMethod) {
                        if (!_.hasIn(scope, config.dest)) {
                            _.set(scope, config.dest, angular.isArray(response.data) ? [] : {})
                        }
                        
                        angular[config.copyMethod](_.get(scope, config.dest), response.data)
                    }

                    if (!scope.modal && response.data.view /*&& response.data.view != oldView*/) {
                        //$location.skipResolving(scope.vm).path(S(response.config.url).ensureLeft('/').s)
                        $location.skipResolving(scope.vm)
                        location.hash = S(response.config.url).ensureLeft('#/').s
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

                if (url.substr(0, 4) !== 'http') {
                    if (url.substr(0, 1) !== '/') {
                        url = S(scope.baseUrl + '/' + url).chompLeft('/').s
                    } else {
                        url = S(url).chompLeft('/').s
                    }
                }

                return $http[method.toLowerCase()](url, data, config).then(function (response) {

                    // save scope for custom use
                    response.scope = scope

                    if (scope.processResponse && angular.isFunction(scope.processResponse)) {
                        return scope.processResponse(response, config)
                        //
                    } else {
                        return response
                    }

                    //
                }, function (response) {

                    // save scope for custom use
                    response.scope = scope

                    if (scope.processResponse && angular.isFunction(scope.processResponse) && response.config.processingResponse !== false) {
                        return $q.reject(scope.processResponse(response, config))
                        //
                    } else {
                        return $q.reject(response)
                    }

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

                var view = ngtoolsModule.mainModule.viewPathWithSlash() + module + '/' + controller + '/' + (queryParams.view || controller) + '.html'

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
                            
                            $scope.closeModal = function () {
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
                
                return modal
            }
        }])
})();
(function () {
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$location', function ($location) {

            // skip resolving data in next route dispatch
            $location.skipResolving = function (vm) {
                this.vm = vm
                return this
            }

        }])

            .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

                    // remove '!' as hash prefix
                    $locationProvider.hashPrefix('')

                    // view path could be customized
                    ngtoolsModule.mainModule.viewPath = 'views'
                    ngtoolsModule.mainModule.viewPathWithSlash = function () {
                        if (!ngtoolsModule.mainModule.viewPath) {
                            return ''
                        } else {
                            return ngtoolsModule.mainModule.viewPath + '/'
                        }
                    }


                    $routeProvider.when('/:page*.html', {
                        templateUrl: function (params) {
                            return params.page + '.html'
                        }
                    })

                            .when('/:module/:controller/:method?/:p0?/:p1?/:p2?/:p3?/:p4?/:p5?/:p6?/:p7?/:p8?/:p9?', {
                                resolve: {
                                    data: ['$http', '$q', '$location', function ($http, $q, $location) {

                                            if ($location.vm) {
                                                var vm = $location.vm
                                                $location.vm = null
                                                return vm
                                            }

                                            var deferred = $q.defer()

                                            //$http.get($location.$$path.substr(1)).then(function (response) {
                                            $http.get(location.hash.substr(2)).then(function (response) {
                                                routeResolution = angular.isObject(response.data) ? response.data : {}
                                                deferred.resolve(routeResolution)
                                            })

                                            return deferred.promise
                                        }]
                                },
                                templateUrl: function (params) {
                                    return ngtoolsModule.mainModule.viewPathWithSlash() + params.module + '/' + params.controller + '/' + params.controller + '.html'
                                }
                            })

                }])

})();
(function () {

    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule
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
/* global moment */
/* global numeral */
(function () {

    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule
            .config([function () {
                    // locale
                    var numeral = numeral || null
                    numeral && numeral.locale('pt-br')
                    
                    // moment
                    var moment = moment || null
                    moment && moment.locale('pt-br')
                    
                    // mask aliases
                    var maskAliases = {
                        phone: {
                            mask: "(99) 9999-9999[9]",

                            onBeforeWrite: function (event, buffer, caretPos, opts) {
                                if (buffer.length == 15 && buffer[9] == "-") {
                                    buffer[9] = buffer[10]
                                    buffer[10] = "-"
                                }
                                
                                return {}
                            },

                            greedy: false
                        },

                        numeric: {
                            mask: "9{0,+}"
                        }
                    }
                    
                    if (window.Inputmask) {
                        window.Inputmask.extendAliases(maskAliases)
                    } else if ($.inputmask) {
                        $.extend($.inputmask.defaults.aliases, maskAliases)
                    }
                    
                }])

            .value('formatter', {

                cpf: function (input) {
                    input = input || ''
                    
                    if (input.length && input.length < 11) {
                        input = _.padStart(input, 11, '0')
                    }

                    var out = input.substr(0, 3) + '.' + input.substr(3, 3) + '.' + input.substr(6, 3) + '-' + input.substr(9, 2)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cnpj: function (input) {
                    input = input || ''
                    
                    if (input.length && input.length < 14) {
                        input = _.padStart(input, 14, '0')
                    }

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
                    
                    if (input.length && input.length < 8) {
                        input = _.padStart(input, 8, '0')
                    }

                    var out = input.substr(0, 2) + '.' + input.substr(2, 3) + '-' + input.substr(5, 3)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cns: function (input) {
                    input = input || ''
                    
                    if (input.length && input.length < 15) {
                        input = _.padStart(input, 15, '0')
                    }

                    var out = input.substr(0, 3) + '.' + input.substr(3, 4) + '.' + input.substr(7, 4) + '.' + input.substr(11, 4)
                    return out.replace(/[\.\-]*$/g, '')
                },

                phone: function (input) {
                    input = input || ''

                    if (input.length == 0) {
                        return ''
                    } else if (input.length < 10) {
                        input = _.padStart(input, 10, '0')
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

                cnpj: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                cep: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                cns: function (input) {
                    return (input || '').replace(/\D/g, '')
                },

                upper: function (input) {
                    input = (input || '')
                    return input.toUpperCase()
                },
            })

            .filter('cpf', ['formatter', function (formatter) {
                    return formatter.cpf
                }])

            .filter('cnpj', ['formatter', function (formatter) {
                    return formatter.cnpj
                }])

            .filter('date', ['formatter', function (formatter) {
                    return formatter.date
                }])

            .filter('time', ['formatter', function (formatter) {
                    return formatter.time
                }])

            .filter('cep', ['formatter', function (formatter) {
                    return formatter.cep
                }])

            .filter('cns', ['formatter', function (formatter) {
                    return formatter.cns
                }])

            .filter('phone', ['formatter', function (formatter) {
                    return formatter.phone
                }])

            .filter('numeric', ['formatter', function (formatter) {
                    return formatter.numeric
                }])

            .filter('count', ['formatter', function (formatter) {
                    return formatter.count
                }])

            .filter('decimal', ['formatter', function (formatter) {
                    return formatter.decimal
                }])

            .filter('currency', ['formatter', function (formatter) {
                    return formatter.currency
                }])

            .filter('decimal4', ['formatter', function (formatter) {
                    return formatter.decimal4
                }])

            .filter('currency4', ['formatter', function (formatter) {
                    return formatter.currency4
                }])

            .filter('upper', ['formatter', function (formatter) {
                    return formatter.upper
                }])

            .directive('mask', ['formatter', 'parser', function (formatter, parser) {

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

})();
