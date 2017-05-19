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