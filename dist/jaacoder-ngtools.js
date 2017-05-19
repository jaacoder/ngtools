/**
 * @license
 * (c) 2017 jaacoder
 * License: MIT
 */
/* global moment, numeral, Function, Inputmask */
(function () {

    var ngtoolsModule = angular.module('jaacoder-ngtools', [])

    ngtoolsModule.config(['$controllerProvider', '$qProvider', function ($controllerProvider, $qProvider) {
            // save controller register function for later use
            ngtoolsModule.$controllerProvider = $controllerProvider
            
            // do not throw error on unhandled rejections
            $qProvider.errorOnUnhandledRejections(false)
        }])
            .run(['$rootScope', '$location', function ($rootScope, $location) {

                    // save controller register function for later use
                    var mainModule = angular.module(jQuery('[ng-app]:first').attr('ng-app'))
                    mainModule.controller = ngtoolsModule.$controllerProvider.register

                    // globals
                    $rootScope.window = window
                    numeral.locale('pt-br')
                    moment.locale('pt-br')

                    // proxy config
                    Function.prototype.proxyConfig({methods: ['then']})

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
        Inputmask.extendAliases({
            phone: {
                mask: "(99) 9999-9999[9]",

                onBeforeWrite: function(event, buffer, caretPos, opts) {
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
        
//        // sync menu with url
//        // split into hash symbol
//        var parts = window.location.href.split('#')
//        var href = ''
//
//        // is there a hash ?
//        if (parts.length > 1) {
//            href = '#' + parts[1].split('?')[0].split('/', 3).join('/')
//
//        } else {
//            href = parts[0]
//        }
//
//        $sidebarMenu = jQuery('#sidebar-menu')
//
//        // remove 'active' class from all menu items
//        $lis = jQuery('li', $sidebarMenu)
//        $lis.removeClass('active')
//
//        // add 'active' class to all current link parents
//        var $link = jQuery('a[href="' + href + '"]', $sidebarMenu)
//        $link.parents('li').addClass('active')
//
//        // slide down its parents
//        $link.parents('ul').slideDown()
//
//        // add listener to remove 'active' from old links
//        $sidebarMenu.on('click', function ($event) {
//            $link = jQuery($event.target)
//            $currentLinkParents = $link.parents('li')
//            
//            // remove class 'active' from other items
//            $lis.not($currentLinkParents).removeClass('active')
//        })

                }])

})()


jQuery(function() {
    
    var $ = jQuery
    var $document = $(document)
    
    // simulate tab with enter
    $document.on('keypress', ':input', function(e) {
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
                $tabbable.each(function(index, element) {

                    if (element == e.target) {
                        
                        setTimeout(function() {
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
    
//    // Corrige o redimensionamento da tela quando abre um modal
//    $(document.body).on('hide.bs.modal', function () {
//        $('body').css('padding-right','0')
//    })
//    $(document.body).on('hidden.bs.modal', function () {
//        $('body').css('padding-right','')
//    })
})
(function () {
    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule.run(['$rootScope', '$http', '$location', '$q', function ($rootScope, $http, $location, $q) {

            var $ = jQuery

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

            .factory('Pagination', function () {

                return {
                    nextPage: function (paging) {
                        if (!paging) {
                            return;
                        }

                        if (paging.currentPage >= paging.lastPage) {
                            return paging.currentPage;
                        }

                        return paging.currentPage + 1;
                    },

                    previousPage: function (paging) {
                        if (!paging) {
                            return;
                        }

                        if (paging.currentPage <= 1) {
                            return 1;
                        }

                        return paging.currentPage - 1;
                    },

                    isLastPage: function (paging) {
                        if (!paging) {
                            return;
                        }

                        return paging.lastPage <= paging.currentPage;
                    },

                    isFirstPage: function (paging) {
                        if (!paging) {
                            return;
                        }

                        return (paging.currentPage == 1);
                    },

                    updatePagingToPrevious: function (paging, perPage) {
                        var previousPaging = {
                            currentPage: paging.currentPage > 1 ? Number(paging.currentPage) - 1 : paging.currentPage,
                            perPage: perPage === undefined ? paging.perPage : perPage
                        };

                        return angular.extend(paging, previousPaging);
                    },

                    updatePaging: function (paging, page, perPage) {
                        var newPaging = {
                            currentPage: page,
                            perPage: perPage === undefined ? paging.perPage : perPage
                        };

                        return angular.extend(paging, newPaging);
                    },

                    updatePagingToNext: function (paging, perPage) {
                        var nextPaging = {
                            currentPage: paging.currentPage < paging.lastPage ? Number(paging.currentPage) + 1 : paging.currentPage,
                            perPage: perPage === undefined ? paging.perPage : perPage
                        };

                        return angular.extend(paging, nextPaging);
                    },

                    alternateOrderBy: function (paging, newOrderBy) {

                        var currentOrderBy = paging.orderBy;

                        var parts = (currentOrderBy || '').split(' ');
                        if (parts.length === 1) {
                            parts.push('ASC');
                        }

                        if (parts[0] === newOrderBy) {
                            newOrderBy += ' ' + (parts[1] === 'DESC' ? 'ASC' : 'DESC');
                        } else {
                            newOrderBy += ' ASC';
                        }

                        paging.orderBy = newOrderBy;
                    },

                    getSortingClass: function (paging, orderBy) {

                        if (paging && paging.orderBy) {

                            var parts = paging.orderBy.split(' ');
                            if (parts.length == 1) {
                                parts.push('ASC');
                            }

                            if (parts[0] === orderBy) {
                                if (parts[1] === 'ASC') {
                                    return 'sorting_asc';
                                } else {
                                    return 'sorting_desc';
                                }
                            }
                        }

                        return 'sorting';

                    }
                };

            })

            .directive('pagination', ['Pagination', function (Pagination) {

                    return {

                        restrict: 'E',

                        scope: {
                            paging: '=',
                            action: '&'
                        },

                        link: function (scope, $element, attrs) {
                            scope.Pagination = Pagination;
                        },

                        template:
                                '<div class="row">' +
                                '<div class="col-sm-4 info-number">Exibindo: {{paging.from || 0}} até {{paging.to || 0}} de {{paging.total || 0}} registro(s)</div>' +
                                '<div class="col-sm-8 text-center">' +
                                '<div class="page-number alignright" ng-if="paging.total > 0">' +
                                '<span><a href="javascript:void(0)" class="btn btn-dark btn-xs" ng-click="!Pagination.isFirstPage(paging) && Pagination.updatePagingToPrevious(paging) && action()"><i class="glyphicon glyphicon-chevron-left"></i></a></span>' +
                                '<span>página:</span>' +
                                '<input type="text" class="form-control form-group" ng-model="paging.currentPage" onchange="$(this).scope().action()">' +
                                '<span>de {{paging.lastPage || 1}}</span>' +
                                '<span><a href="javaScript:void(0);" class="btn btn-dark btn-xs" ng-click="!Pagination.isLastPage(paging) && Pagination.updatePagingToNext(paging) && action()"><i class="glyphicon glyphicon-chevron-right"></i></a></span>' +
                                '</div>' +
                                '</div>' +
                                '</div>'
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

            // interceptor: messages
            .factory('messagesInterceptor', ['$rootScope', '$q', function ($rootScope, $q) {

                    $rootScope.showMessages = function (messages) {

                        var globalMessageDisplayed = false;

                        var specificMessages = {};
                        var cssClass = 'validation-error';

                        // find previous divs with cssClass
                        $divs = $('div.' + cssClass);

                        // remove all titles for tooltip
                        $divs.removeClass(cssClass).attr('data-original-title', '')/*.children('[data-original-title]').attr('data-original-title', '')*/;

                        // remove all exclamation signs
                        $divs.children('label').children('span.' + cssClass).remove();


                        for (var i in messages) {

                            var message = messages[i];

                            if (!message.propertyPath) {
                                $rootScope.showMessage(message);

                            } else {

                                if (!globalMessageDisplayed) {
                                    $rootScope.showMessage({message: 'Verifique o(s) erro(s) no(s) campo(s) em destaque.', type: 'error'});
                                    globalMessageDisplayed = true;
                                }

                                if (!specificMessages[message.propertyPath]) {
                                    specificMessages[message.propertyPath] = [];
                                }

                                specificMessages[message.propertyPath].push(message.message);
                            }
                        }


                        for (var propertyPath in specificMessages) {

                            var messagesHtml = '<span style="margin-top: 10px; text-align: left; display: inline-block"><ul><li>'
                                    + specificMessages[propertyPath].join('</li><li>')
                                    + '</li></ul></span>';

                            var $formField = $(':tabbable[ng-model="vm.' + propertyPath + '"]').not(':disabled').not('select.select2-hidden-accessible');
                            if ($formField.length === 0) {
                                // select2-like combobox
                                $formField = $('select.select2-hidden-accessible[ng-model="vm.' + propertyPath + '"]').next();
                            }

                            var $div = $formField.closest('div');

                            $div.attr('data-original-title', messagesHtml)
                                    .attr('data-html', 'true')
                                    .attr('data-placement', 'bottom')
                                    .attr('data-animation', 'false')
                                    .tooltip();

                            $div.children('label').append('<span class="glyphicon glyphicon-exclamation-sign validation-error" style="margin-left: 8px"></span>');
                            $div.addClass(cssClass);
                        }
                    }

                    $rootScope.showMessage = function (message) {

                        var delay = {
                            error: 4000,
                            warning: 4000,
                            info: 2000,
                            success: 2000
                        };

                        var title = {
                            error: 'Erro:',
                            warning: 'Alerta:',
                            info: 'Informação:',
                            success: 'Sucesso:'
                        };

                        PNotify.prototype.options.styling = "bootstrap3";
                        new PNotify({
                            title: title[message['type']],
                            text: message['message'],
                            type: message['type'],
                            animation: 'fade',
                            hide: true,
                            delay: delay[message['type']],
                            buttons: {sticker: false},
                            sound: false
                        });
                    }

                    return {

                        response: function (response) {

                            appHelper.error = false

                            if (response && response.data && response.data.messages) {
                                $rootScope.showMessages(response.data.messages);

                                for (i in response.data.messages) {
                                    // modify response status so http-action will not trigger 'http-success' callback
                                    if (response.data.messages[i].type === 'error') {

                                        // reject response
                                        return $q.reject(response)
                                    }
                                }
                            }

                            return response
                        }
                    };

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
angular.module('app')

    .filter('cpf', function() {
        return appHelper.fm.cpf
    })
    
    .filter('cnpj', function() {
        return appHelper.fm.cnpj
    })
    
    .filter('date', function() {
        return appHelper.fm.date
    })
    
    .filter('time', function() {
        return appHelper.fm.time
    })
    
    .filter('cep', function() {
        return appHelper.fm.cep
    })
    
    .filter('cns', function() {
        return appHelper.fm.cns
    })
    
    .filter('phone', function() {
        return appHelper.fm.phone
    })
    
    .filter('numeric', function() {
        return appHelper.fm.numeric
    })
    
    .filter('count', function() {
        return appHelper.fm.count
    })
    
    .filter('decimal', function() {
        return appHelper.fm.decimal
    })
    
    .filter('currency', function() {
        return appHelper.fm.currency
    })
    
    .filter('decimal4', function() {
        return appHelper.fm.decimal4
    })
    
    .filter('currency4', function() {
        return appHelper.fm.currency4
    })
    
    .filter('flag', function() {
        return appHelper.fm.flag
    })
    
    .filter('upper', function() {
        return appHelper.fm.upper
    })
    
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