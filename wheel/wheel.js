/// <reference path="./d3.d.ts"/>;
function isParentOf(p, c) {
    if (p === c)
        return true;
    if (p.children) {
        return p.children.some(function (d) {
            return isParentOf(d, c);
        });
    }
    return false;
}
function maxY(d) {
    return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}
var Wheel = (function () {
    function Wheel() {
        this.colors = new Colors();
    }
    Wheel.prototype.showWheelFunctional = function (json) {
        var _this = this;
        var width = 840;
        var height = width;
        var radius = width / 2;
        var x = d3.scale.linear().range([0, 2 * Math.PI]);
        var y = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);
        var padding = 5;
        var duration = 1000;
        d3.select("#wheel").select("img").remove();
        var chart = d3.select("#wheel").append("svg")
            .attr("width", width + padding * 2)
            .attr("height", height + padding * 2)
            .append("g")
            .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");
        var partition = d3.layout.partition()
            .sort(null)
            .value(function (d) { return 5.8 - d.depth; });
        var arc = d3.svg.arc()
            .startAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
        })
            .endAngle(function (d) {
            return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
        })
            .innerRadius(function (d) {
            return Math.max(0, d.y ? y(d.y) : d.y);
        })
            .outerRadius(function (d) {
            return Math.max(0, y(d.y + d.dy));
        });
        var nodes = partition.nodes(json[0]);
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            if (node.children == undefined) {
                var d = node;
                d.colour = this.colors.getNextColor();
                d.textColor = this.brightness(d3.rgb(d.colour)) < 125 ? "#eee" : "#000";
            }
        }
        this.interpolateColors(nodes);
        var path = chart.selectAll("path").data(nodes);
        path.enter().append("path")
            .attr("id", function (d, i) { return "path-" + i; })
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", function (d) {
            d.textColor = _this.brightness(d3.rgb(d.colour)) < 125 ? "#eee" : "#000";
            return d.colour;
        })
            .on("click", function (d) { return _this.click(d, x, y, radius, arc, padding, path, text, duration); });
        var text = chart.selectAll("text").data(nodes);
        var textEnter = text.enter().append("text")
            .style("fill-opacity", 1)
            .style("fill", function (d) {
            return d.textColor;
        })
            .attr("text-anchor", function (d) {
            return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
        })
            .attr("dy", ".2em")
            .attr("transform", function (d) {
            var multiline = (d.name || "").split(" ").length > 1, angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90, rotate = angle + (multiline ? -.5 : 0);
            return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
        })
            .on("click", function (d) { return _this.click(d, x, y, radius, arc, padding, path, text, duration); });
        textEnter.append("tspan")
            .attr("x", 0)
            .text(function (d) { return d.depth ? d.name.split(" ")[0] : ""; });
        textEnter.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(function (d) { return d.depth ? d.name.split(" ")[1] || "" : ""; });
    };
    // *********************************************************************
    Wheel.prototype.click = function (d, x, y, radius, arc, padding, path, text, duration) {
        path.transition()
            .duration(duration)
            .attrTween("d", this.arcTween(d, x, y, radius, arc));
        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function (e) {
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
            .transition()
            .duration(duration)
            .attrTween("text-anchor", function (d) {
            return function () {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            };
        })
            .attrTween("transform", function (d) {
            var multiline = (d.name || "").split(" ").length > 1;
            return function () {
                var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90, rotate = angle + (multiline ? -.5 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
            };
        })
            .style("fill-opacity", function (e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function (e) {
            d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
        });
    };
    // Interpolate the scales!
    Wheel.prototype.arcTween = function (d, x, y, radius, arc) {
        var my = maxY(d);
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
        var yd = d3.interpolate(y.domain(), [d.y, my]);
        var yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function (d) {
            return function (t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    };
    // *********************************************************************
    Wheel.prototype.brightness = function (rgb) {
        return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
    };
    Wheel.prototype.interpolateColors = function (nodes) {
        for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
            var node = nodes_2[_i];
            var d = node;
            if (d.children) {
                this.interpolateColors(d.children);
                // There is a maximum of two children!
                var colors = d.children.map(function (child) { return child.colour; });
                var a = d3.hsl((colors[0]));
                var b = d3.hsl((colors[1]));
                // L*a*b* might be better here...
                d.colour = d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2).toString();
            }
        }
    };
    return Wheel;
}());
// ***********************************************************************
var Colors = (function () {
    function Colors() {
        this.lastIndex = 0;
        this.colorPalette = [
            "#f9f0ab",
            "#e8e596",
            "#f0e2a3",
            "#ede487",
            "#efd580",
            "#f1cb82",
            "#f1c298",
            "#e8b598",
            "#d5dda1",
            "#c9d2b5",
            "#aec1ad",
            "#a7b8a8",
            "#b49a3d",
            "#b28647",
            "#a97d32",
            "#b68334",
            "#d6a680",
            "#dfad70",
            "#a2765d",
            "#9f6652",
            "#b9763f",
            "#bf6e5d",
            "#af643c",
            "#9b4c3f",
            "#72659d",
            "#8a6e9e",
            "#8f5c85",
            "#934b8b",
            "#9d4e87",
            "#92538c",
            "#8b6397",
            "#716084",
            "#2e6093",
            "#3a5988",
            "#4a5072",
            "#393e64",
            "#aaa1cc",
            "#e0b5c9",
            "#e098b0",
            "#ee82a2",
            "#ef91ac",
            "#eda994",
            "#eeb798",
            "#ecc099",
            "#f6d5aa",
            "#f0d48a",
            "#efd95f",
            "#eee469",
            "#dbdc7f",
            "#dfd961",
            "#ebe378",
            "#f5e351"
        ];
    }
    Colors.prototype.getNextColor = function () {
        return this.colorPalette[this.lastIndex++];
    };
    return Colors;
}());
// ***********************************************************************
d3.json("wheel.json", function (error, json) {
    var w = new Wheel();
    w.showWheelFunctional(json);
});
//# sourceMappingURL=wheel.js.map