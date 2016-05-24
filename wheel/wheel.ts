/// <reference path="./d3.d.ts"/>;

interface Segment {
    name: string;
    color: string;
    treeSize: number;
    startAngle: number;
    endAngle: number;
    children: Segment[];
    angleInDegrees: number;
}

interface WheelNode extends d3.layout.partition.Node {
    name: string;
    colour: string;
    textColor: string;
    treeSize: number;
    startAngle: number;
    endAngle: number;
    id: number;
    innerRadius: number;
    outerRadius: number;
    angleInDegrees: number;
}

interface D3Arc extends d3.svg.arc.Arc {
    x: number;
    y: number;
    dx: number;
    dy: number;
}

function isParentOf(p: d3.layout.partition.Node, c: d3.layout.partition.Node): boolean {
    if (p === c) return true;
    if (p.children) {
        return p.children.some(function(d) {
            return isParentOf(d, c);
        });
    }
    return false;
}

function maxY(d: d3.layout.partition.Node): number {
    return d.children ? Math.max.apply(Math, d.children.map(maxY)) : d.y + d.dy;
}



class Wheel {
    colors = new Colors();

    constructor() {

    }

    showWheelFunctional(json: Array<WheelNode>) {
        var width = 840;
        var height = width;
        var radius = width / 2;
        var x: d3.scale.Linear<number, number> = d3.scale.linear().range([0, 2 * Math.PI]);
        var y: d3.scale.Pow<number, number> = d3.scale.pow().exponent(1.3).domain([0, 1]).range([0, radius]);
        var padding = 5;
        var duration = 1000;
        d3.select("#wheel").select("img").remove();
        var chart: d3.Selection<any> = d3.select("#wheel").append("svg")
            .attr("width", width + padding * 2)
            .attr("height", height + padding * 2)
            .append("g")
            .attr("transform", "translate(" + [radius + padding, radius + padding] + ")");

        var partition = d3.layout.partition()
            .sort(null)
            .value(function(d) { return 5.8 - d.depth; });

        var arc = d3.svg.arc()
            .startAngle(function(d: D3Arc) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x)));
            })
            .endAngle(function(d: D3Arc) {
                return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx)));
            })
            .innerRadius(function(d: D3Arc) {
                return Math.max(0, d.y ? y(d.y) : d.y);
            })
            .outerRadius(function(d: D3Arc) {
                return Math.max(0, y(d.y + d.dy));
            });

        var nodes = partition.nodes(json[0]);

        for (var node of nodes) {
            if (node.children == undefined) {
                var d = <WheelNode>node;
                d.colour = this.colors.getNextColor();
                d.textColor = this.brightness(d3.rgb(d.colour)) < 125 ? "#eee" : "#000";
            }
        }

        this.interpolateColors(nodes);

        var path = chart.selectAll("path").data(nodes);
        path.enter().append("path")
            .attr("id", function(d, i) { return "path-" + i; })
            .attr("d", arc)
            .attr("fill-rule", "evenodd")
            .style("fill", (d: WheelNode) => {
                d.textColor = this.brightness(d3.rgb(d.colour)) < 125 ? "#eee" : "#000";
                return d.colour;
            })
            .on("click", (d) => this.click(d, x, y, radius, arc, padding, path, text, duration));

        var text = chart.selectAll("text").data(nodes);
        var textEnter = text.enter().append("text")
            .style("fill-opacity", 1)
            .style("fill", function(d: WheelNode) {
                return d.textColor;
            })
            .attr("text-anchor", function(d) {
                return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
            })
            .attr("dy", ".2em")
            .attr("transform", function(d: WheelNode) {
                var multiline = (d.name || "").split(" ").length > 1,
                    angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                    rotate = angle + (multiline ? -.5 : 0);
                return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
            })
            .on("click", (d) => this.click(d, x, y, radius, arc, padding, path, text, duration));
        textEnter.append("tspan")
            .attr("x", 0)
            .text(function(d: WheelNode) { return d.depth ? d.name.split(" ")[0] : ""; });
        textEnter.append("tspan")
            .attr("x", 0)
            .attr("dy", "1em")
            .text(function(d: WheelNode) { return d.depth ? d.name.split(" ")[1] || "" : ""; });




    }

    // *********************************************************************

    click(d: d3.layout.partition.Node, x: d3.scale.Linear<number, number>,
        y: d3.scale.Linear<number, number>, radius: number,
        arc: any, padding: number,
        path: d3.selection.Update<d3.layout.partition.Node>,
        text: d3.selection.Update<d3.layout.partition.Node>, duration: number) {
        path.transition()
            .duration(duration)
            .attrTween("d", this.arcTween(d, x, y, radius, arc));

        // Somewhat of a hack as we rely on arcTween updating the scales.
        text.style("visibility", function(e) {
            return isParentOf(d, e) ? null : d3.select(this).style("visibility");
        })
            .transition()
            .duration(duration)
            .attrTween("text-anchor", function(d) {
                return function() {
                    return x(d.x + d.dx / 2) > Math.PI ? "end" : "start";
                };
            })
            .attrTween("transform", function(d: WheelNode) {
                var multiline = (d.name || "").split(" ").length > 1;
                return function() {
                    var angle = x(d.x + d.dx / 2) * 180 / Math.PI - 90,
                        rotate = angle + (multiline ? -.5 : 0);
                    return "rotate(" + rotate + ")translate(" + (y(d.y) + padding) + ")rotate(" + (angle > 90 ? -180 : 0) + ")";
                };
            })
            .style("fill-opacity", function(e) { return isParentOf(d, e) ? 1 : 1e-6; })
            .each("end", function(e) {
                d3.select(this).style("visibility", isParentOf(d, e) ? null : "hidden");
            });

    }

    // Interpolate the scales!
    arcTween(d: d3.layout.partition.Node, x: d3.scale.Linear<number, number>,
        y: d3.scale.Linear<number, number>, radius: number,
        arc: any) {
        var my = maxY(d);
        var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]);
        var yd = d3.interpolate(y.domain(), [d.y, my]);
        var yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);
        return function(d: d3.layout.partition.Node) {
            return function(t: number) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); return arc(d); };
        };
    }


    // *********************************************************************

    brightness(rgb: d3.Rgb) {
        return rgb.r * .299 + rgb.g * .587 + rgb.b * .114;
    }

    interpolateColors(nodes: Array<d3.layout.partition.Node>) {
        for (var node of nodes) {
            var d = <WheelNode>node;
            if (d.children) {
                this.interpolateColors(d.children);
                // There is a maximum of two children!
                var colors = d.children.map((child: WheelNode) => child.colour);
                var a = d3.hsl(<string>(colors[0]));
                var b = d3.hsl(<string>(colors[1]));
                // L*a*b* might be better here...
                d.colour = d3.hsl((a.h + b.h) / 2, a.s * 1.2, a.l / 1.2).toString();
            }
        }

    }
}




// ***********************************************************************

class Colors {
    getNextColor() {
        return this.colorPalette[this.lastIndex++]
    }

    lastIndex = 0;

    colorPalette = [
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


// ***********************************************************************

d3.json("wheel.json", (error: any, json: Array<WheelNode>) => {
    var w = new Wheel();
    w.showWheelFunctional(json);
});
