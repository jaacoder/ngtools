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