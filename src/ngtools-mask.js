/* global moment */
/* global numeral */
(function () {

    var ngtoolsModule = angular.module('jaacoder-ngtools')

    ngtoolsModule
            .config([function () {
                    // locale
                    numeral && numeral.locale('pt-br')
                    
                    if (moment) {
                        if (moment.updateLocale) {
                            moment.updateLocale('pt-br')
                        } else {
                            moment.locale('pt-br')
                        }
                    }
                    
                    // mask aliases
                    var maskAliases = {
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
                    
                    if (input.length < 11) {
                        input = _.padStart(input, 11, '0')
                    }

                    var out = input.substr(0, 3) + '.' + input.substr(3, 3) + '.' + input.substr(6, 3) + '-' + input.substr(9, 2)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cnpj: function (input) {
                    input = input || ''
                    
                    if (input.length < 14) {
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
                    
                    if (input.length < 8) {
                        input = _.padStart(input, 8, '0')
                    }

                    var out = input.substr(0, 2) + '.' + input.substr(2, 3) + '-' + input.substr(5, 3)
                    return out.replace(/[\.\-]*$/g, '')
                },

                cns: function (input) {
                    input = input || ''
                    
                    if (input.length < 15) {
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

                cep: function (input) {
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
