require('../../../node_modules/pivottable/dist/pivot.min.js');
require('../../../node_modules/subtotal/dist/subtotal.min.js');
require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/layer.service.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/pivot.service.js');

describe('pivot', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.layers'));

    let pivot;
    let $httpBackend;

    beforeEach(inject(function (_pivot_, _$httpBackend_) {
        pivot = _pivot_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('createGrid', function () {
        it('should create a table', function () {
            document.body.innerHTML = '<div id="main"></div>';
            const element = $('#main');
            const column = {
                elementID: 'quux',
                id: 'equuxraw',
            };
            const row = {
                elementID: 'quuz',
                id: 'equuzraw',
            };
            const ykey = {
                elementID: 'quuy',
                id: 'equuyavg',
                elementType: 'number',
                aggregation: 'avg',
            };

            const report = {
                selectedLayerID: 'foo',
                properties: {
                    pivotKeys: {
                        columns: [ column ],
                        rows: [ row ],
                    },
                    ykeys: [ ykey ],
                },
                query: {
                    columns: [ column, row, ykey ],
                },
            };
            const rows = [
                {
                    equuxraw: 'A',
                    equuzraw: 'a',
                    equuyavg: 10,
                },
                {
                    equuxraw: 'A',
                    equuzraw: 'a',
                    equuyavg: 20,
                },
                {
                    equuxraw: 'A',
                    equuzraw: 'b',
                    equuyavg: 40,
                },
            ];

            $httpBackend.expect('GET', '/api/layers/find-one?id=foo')
                .respond({
                    result: 1,
                    item: {
                        objects: [
                            {
                                elementID: 'quux',
                                elementLabel: 'Bar',
                                elementType: 'string',
                            },
                            {
                                elementID: 'quuz',
                                elementLabel: 'Baz',
                                elementType: 'string',
                            },
                            {
                                elementID: 'quuy',
                                elementLabel: 'Bay',
                                elementType: 'number',
                                format: '0.0',
                            },
                        ],
                    },
                });

            pivot.createPivotTable(element, report, rows);

            $httpBackend.flush();

            const table = element.find('table');
            expect(table).toHaveLength(1);
            expect(table.find('thead')).toHaveLength(1);
            expect(table.find('thead > tr')).toHaveLength(2);
            expect(table.find('thead > tr:eq(0) > th')).toHaveLength(4);
            expect(table.find('thead > tr:eq(0) > th:eq(1)').text()).toBe('Bar');
            expect(table.find('thead > tr:eq(0) > th:eq(2)').text()).toBe('A');
            expect(table.find('thead > tr:eq(0) > th:eq(3)').text()).toBe('Totals');
            expect(table.find('thead > tr:eq(1) > th')).toHaveLength(2);
            expect(table.find('thead > tr:eq(1) > th:eq(0)').text()).toBe('Baz');
            expect(table.find('tbody')).toHaveLength(1);
            expect(table.find('tbody > tr')).toHaveLength(3);
            expect(table.find('tbody > tr:eq(0) > th')).toHaveLength(1);
            expect(table.find('tbody > tr:eq(0) > th').text()).toBe('a');
            expect(table.find('tbody > tr:eq(0) > td')).toHaveLength(2);
            expect(table.find('tbody > tr:eq(0) > td:eq(0)').text()).toBe('15.0');
            expect(table.find('tbody > tr:eq(0) > td:eq(1)').text()).toBe('15.0');
            expect(table.find('tbody > tr:eq(1) > th')).toHaveLength(1);
            expect(table.find('tbody > tr:eq(1) > th').text()).toBe('b');
            expect(table.find('tbody > tr:eq(1) > td')).toHaveLength(2);
            expect(table.find('tbody > tr:eq(1) > td:eq(0)').text()).toBe('40.0');
            expect(table.find('tbody > tr:eq(1) > td:eq(1)').text()).toBe('40.0');
            expect(table.find('tbody > tr:eq(2) > th')).toHaveLength(1);
            expect(table.find('tbody > tr:eq(2) > th').text()).toBe('Totals');
            expect(table.find('tbody > tr:eq(2) > td')).toHaveLength(2);
            expect(table.find('tbody > tr:eq(2) > td:eq(0)').text()).toBe('23.3');
            expect(table.find('tbody > tr:eq(2) > td:eq(1)').text()).toBe('23.3');
        });
    });
});
