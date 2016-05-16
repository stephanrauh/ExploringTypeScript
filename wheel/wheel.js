/// <reference path="./d3.d.ts"/>;
var Wheel = (function () {
    function Wheel() {
        this._maxDepth = 0;
        var w = document.getElementById("wheel").clientWidth;
        this._size = document.getElementById("wheel").clientHeight;
        ;
        if (w < this._size) {
            this._size = w;
        }
        this.chart = d3.select("#wheel").append("svg:svg")
            .attr("class", "chart")
            .attr("viewBox", "-100 -100 200 200")
            .attr("width", this._size)
            .attr("height", this._size)
            .append("svg:g");
        this.readData();
    }
    Object.defineProperty(Wheel.prototype, "size", {
        get: function () { return this._size; },
        enumerable: true,
        configurable: true
    });
    Wheel.prototype.readData = function () {
        var _this = this;
        var request = new XMLHttpRequest();
        request.onload = function () {
            if (request.readyState == 4 && request.status == 200) {
                var segments = JSON.parse(request.responseText);
                _this.showWheelFunctional(segments);
            }
        };
        request.open("get", "wheel.json", true);
        request.send();
    };
    Wheel.prototype.showWheelFunctional = function (segments) {
        var _this = this;
        var tree = d3.layout.tree()
            .size([this._size, this._size]);
        var root = segments[0];
        this.calculateTreeDepth(root);
        this.calculateTreeSize(root);
        this.calculateSegmentSize(root, 0, Math.PI * 2);
        var nodes = tree.nodes(root);
        nodes.forEach(function (node) {
            var w = node;
            w.innerRadius = w.depth == 0 ? 0 : (100 * w.depth) / (_this._maxDepth + 2);
            w.outerRadius = 100 * (1 + w.depth) / (_this._maxDepth + 2);
            if (w.depth == _this._maxDepth) {
                w.outerRadius = 100;
            }
            w.x = 0;
            w.y = 0;
        });
        var node = this.chart.selectAll("g.node")
            .data(nodes);
        var nodeEnter = node.enter().append("svg:path")
            .attr("fill", function (d) { return _this.color(d); })
            .attr("d", function (d) { return _this.drawArc(d); });
        var textEnter = node.enter().append("text")
            .attr("x", 0)
            .attr("y", function (d) { return 0; })
            .attr("dy", ".15em")
            .attr("text-anchor", "start")
            .text(function (d) { return d.name; })
            .style("fill-opacity", 1)
            .attr("transform", function (d) { return _this.textPosition(d); });
    };
    Wheel.prototype.textPosition = function (d) {
        var radius = d.innerRadius + ((d.outerRadius - d.innerRadius) / 2) - 3;
        var dy = -d.name.length;
        var textRotation = 90;
        if (d.depth == this._maxDepth) {
            textRotation = 0;
            dy = 0;
            radius = d.innerRadius + 5;
        }
        if (d.depth == 0) {
            textRotation = -90;
            dy = 0;
            radius = 0;
            return "translate(-12)";
        }
        return "rotate(" + (d.angleInDegrees) + ") translate(" + radius + ", " + dy + ")"
            + "rotate(" + textRotation + ")";
    };
    Wheel.prototype.drawArc = function (d) {
        var segment = d;
        var result = d3.svg.arc()
            .innerRadius(function (a) { return segment.innerRadius; })
            .outerRadius(function (a) { return segment.outerRadius; })
            .startAngle(function (a) { return segment.startAngle; })
            .endAngle(function (a) { return segment.endAngle; });
        return result();
    };
    Wheel.prototype.color = function (d) {
        return d3.hsl((d.startAngle + d.endAngle) * 90 * d.depth / Math.PI, 0.3 + d.depth / 5, 0.50).rgb().toString();
    };
    ;
    Wheel.prototype.calculateTreeDepth = function (segment, level) {
        if (level === void 0) { level = 0; }
        if (segment.children) {
            for (var _i = 0, _a = segment.children; _i < _a.length; _i++) {
                var child = _a[_i];
                this.calculateTreeDepth(child, level + 1);
            }
        }
        else {
            if (level > this._maxDepth) {
                this._maxDepth = level;
            }
        }
    };
    Wheel.prototype.calculateTreeSize = function (segment, level) {
        var _this = this;
        if (level === void 0) { level = 0; }
        segment.treeSize = 0;
        if (segment.children) {
            segment.children.forEach(function (segment) { return _this.calculateTreeSize(segment, level + 1); });
            for (var _i = 0, _a = segment.children; _i < _a.length; _i++) {
                var child = _a[_i];
                segment.treeSize += child.treeSize;
            }
        }
        else {
            segment.treeSize = (this._maxDepth - level + 1);
        }
    };
    Wheel.prototype.calculateSegmentSize = function (segment, startAngle, endAngle) {
        segment.startAngle = startAngle;
        segment.endAngle = endAngle;
        var center = segment.startAngle + ((segment.endAngle - segment.startAngle) / 2);
        segment.angleInDegrees = (center * 180 / Math.PI) - 90;
        console.log(segment.angleInDegrees + " " + segment.name);
        //  segment.angleInDegrees = (segment.startAngle) * 180 / Math.PI-90;
        if (segment.children) {
            var slice = (segment.endAngle - segment.startAngle) / segment.treeSize;
            var start = startAngle;
            for (var _i = 0, _a = segment.children; _i < _a.length; _i++) {
                var child = _a[_i];
                var end = start + child.treeSize * slice;
                this.calculateSegmentSize(child, start, end);
                start = end;
            }
        }
    };
    return Wheel;
}());
new Wheel();
//# sourceMappingURL=wheel.js.map