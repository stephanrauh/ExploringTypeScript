/// <reference path="./d3.d.ts"/>;
var Wheel = (function () {
    function Wheel() {
        var w = document.getElementById("wheel").clientWidth;
        this._size = document.getElementById("wheel").clientHeight;
        ;
        if (w < this._size) {
            this._size = w;
        }
        console.log(this._size);
        this.chart = d3.select("#wheel").append("svg:svg")
            .attr("class", "chart")
            .attr("width", w)
            .attr("height", this._size).append("svg:g")
            .attr("transform", "translate(400,300) rotate(-35)");
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
                _this.showWheel(segments);
            }
        };
        request.open("get", "wheel.json", true);
        request.send();
    };
    Wheel.prototype.drawArc = function (innerRadius, outerRadius, startAngle, endAngle, color, name) {
        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(startAngle)
            .endAngle(endAngle);
        this.chart
            .append("svg:path")
            .attr("fill", function (d, index, outerindex) {
            return color;
        })
            .attr("d", arc);
        var x = (innerRadius + 5) * Math.sin((startAngle + endAngle) / 2);
        var y = (innerRadius + 5) + Math.cos((startAngle + endAngle) / 2);
        this.chart
            .append("text")
            .property("x", x)
            .property("y", y)
            .property("font-family", "sans-serif")
            .property("font-size", "10px")
            .property("fill", "red")
            .text(name);
    };
    Wheel.prototype.drawSegment = function (level, startAngle, endAngle, name) {
        var innerRadius = this._size * level / 5 / 2;
        if (level < 1) {
            innerRadius = 0;
        }
        var outerRadius = this.size * (level + 1) / 5 / 2;
        var color = d3.hsl((startAngle + endAngle) * 90 * level / Math.PI, 0.3 + level / 5, 0.50).rgb();
        this.drawArc(innerRadius, outerRadius, startAngle, endAngle, color.toString(), name);
    };
    Wheel.prototype.showWheel = function (segments, level, startAngle, endAngle) {
        if (level === void 0) { level = 0; }
        if (startAngle === void 0) { startAngle = 0; }
        if (endAngle === void 0) { endAngle = Math.PI * 2; }
        var count = segments.length;
        var startSection = startAngle;
        var endSection = startSection;
        var range = endAngle - startAngle;
        for (var _i = 0, segments_1 = segments; _i < segments_1.length; _i++) {
            var segment = segments_1[_i];
            endSection += range / count;
            this.drawSegment(level, startSection, endSection, segment.name);
            if (segment.children && segment.children.length > 0) {
                this.showWheel(segment.children, level + 1, startSection, endSection);
            }
            startSection = endSection;
        }
    };
    return Wheel;
}());
new Wheel();
//# sourceMappingURL=wheel.js.map