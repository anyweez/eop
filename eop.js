/* jslint browser: true */

var _Array = {
    map: Array.prototype.map,
    filter: Array.prototype.filter,
    reduce: Array.prototype.reduce,
};
/*
// TODO: String.split() leads to an infinitely recursive loop in the Operation constructor.
var _String = {
    split: String.prototype.split,
};
*/

var eop = (function () {
    var nextNode = 0;
    var nextOp = 0;
    var nodes = new vis.DataSet();
    var edges = new vis.DataSet();

    function Operation(name) {
        var id = nextNode++;
        var opCount = nextOp++;

        var op = {
            name: name + '-' + id,
            node: {
                id: id,
                label: opCount + ' : ' + name,
                group: 0,
                order: opCount,
                level: (opCount * 3) + 1,
                shape: 'box',
            },

            addInput: function (val) {
                var label = (val instanceof Object) ? JSON.stringify(val) : val;
                var node = {
                    id: nextNode++,
                    label: label,
                    group: 1,
                    level: (opCount * 3),
                };

                nodes.add(node);
                edges.add({
                    from: node.id,
                    to: this.node.id,
                });
            },

            addOutput: function (val) {
                var label = (val instanceof Object) ? JSON.stringify(val) : val;

                var node = {
                    id: nextNode++,
                    label: label,
                    group: 2,
                    level: (opCount * 3) + 2,
                };

                nodes.add(node);
                edges.add({
                    from: this.node.id,
                    to: node.id,
                });
            },
        };

        nodes.add(op.node);

        return op;
    }

    /**
     * Array.map() with injection points before and after the map call.
     */
    Array.prototype.map = function (callback, thisArg) {
        var op = new Operation('map');

        for (var i = 0; i < this.length; i++) op.addInput(this[i]);
        var result = _Array.map.call(this, callback, thisArg);
        for (var j = 0; j < result.length; j++) op.addOutput(result[j]);

        return result;
    };

    Array.prototype.filter = function (callback, thisArg) {
        var op = new Operation('filter');

        for (var i = 0; i < this.length; i++) op.addInput(this[i]);
        var result = _Array.filter.call(this, callback, thisArg);
        for (var j = 0; j < result.length; j++) op.addOutput(result[j]);

        return result;
    };

    Array.prototype.reduce = function (callback, initial) {
        var op = new Operation('reduce');

        for (var i = 0; i < this.length; i++) op.addInput(this[i]);
        var result = _Array.reduce.call(this, callback, initial);
        op.addOutput(result);

        return result;
    };

    /*
    String.prototype.split = function (separator, limit) {
        var op = new Operation('split');

        //        op.addInput(this);
        var result = _String.split.call(this, separator, limit);
        //        for (var i = 0; i < result.length; i++) op.addOutput(result[i]);

        return result;
    };
    */

    // TODO: this isn't being preserved when primitives are used (common case).
    Number.prototype._eopid = null;

    // TODO: currently only allows a single parameter. The last `args` param should really
    // accept all params after #2 but I'm pretty sure ES6's ... is the only way to do that.
    return function (elementId, func, args) {
        func(args);

        new vis.Network(document.getElementById(elementId), {
            nodes: nodes,
            edges: edges,
        }, {
            nodes: {
                shape: 'dot',
                size: 30,
                font: {
                    size: 32,
                    color: '#333'
                },
                borderWidth: 2,
                shadow: true,
            },
            edges: {
                width: 2,
                shadow: true,
                arrows: {
                    to: {
                        scaleFactor: 0.5,
                    },
                },
            },
            layout: {
                hierarchical: {
                    direction: 'LR',
                }
            },

        });
    };
}());