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

interface WheelNode extends d3.layout.tree.Node {
  name: string;
  color: string;
  treeSize: number;
  startAngle: number;
  endAngle: number;
  id: number;
  innerRadius: number;
  outerRadius: number;
  angleInDegrees: number;
}


class Wheel {
  _size: number;
  _maxDepth = 0;
  chart: d3.Selection<any>;

  get size(): number { return this._size }

    constructor() {

      var w = document.getElementById("wheel").clientWidth;
      this._size = document.getElementById("wheel").clientHeight;;
      if (w < this._size) {
        this._size=w;
      }
      this.chart = d3.select("#wheel").append("svg:svg")
          .attr("class", "chart")
          .attr("viewBox", "-100 -100 200 200")
          .attr("width", this._size)
          .attr("height", this._size)
          .append("svg:g")
          ;
      this.readData();
    }

    readData() {
      var request = new XMLHttpRequest();
      request.onload = () => {
        if (request.readyState==4 && request.status==200)
        {
          var segments: Segment[] = JSON.parse(request.responseText);
          this.showWheelFunctional(segments);
        }
      };
      request.open("get", "wheel.json", true);
      request.send();
    }

    showWheelFunctional(segments: Segment[]) {
      var tree = d3.layout.tree()
      	.size([this._size, this._size]);
      var root = segments[0]
      this.calculateTreeDepth(root)
      this.calculateTreeSize(root)
      this.calculateSegmentSize(root, 0, Math.PI * 2)

      var nodes = tree.nodes(root)
      nodes.forEach(node => {
        let w = <WheelNode>node;
        w.innerRadius = w.depth == 0 ? 0 : (100 * w.depth) / (this._maxDepth+2);
        w.outerRadius = 100 * (1+w.depth) / (this._maxDepth+2);
        if (w.depth == this._maxDepth) {
          w.outerRadius = 100;
        }
        w.x=0;
        w.y=0;
      });
      var node = this.chart.selectAll("g.node")
        .data(nodes);


      var nodeEnter = node.enter().append("svg:path")
            .attr("fill", d => this.color(<WheelNode>d))
            .attr("d", (d) => this.drawArc(d));

      var textEnter = node.enter().append("text")
          .attr("x", 0)
          .attr("y", d => 0)
      	  .attr("dy", ".15em")
      	  .attr("text-anchor", "start")
      	  .text(d => (<WheelNode>d).name)
      	  .style("fill-opacity", 1)
          .attr("transform", d => this.textPosition(<WheelNode>d))
    }

    textPosition(d: WheelNode) : string {
      var radius = d.innerRadius + ((d.outerRadius-d.innerRadius) / 2) - 3
      var dy = -(<WheelNode>d).name.length
      var textRotation = 90;
      if (d.depth == this._maxDepth) {
        textRotation = 0
        dy = 0
        radius = d.innerRadius +5
      }
      if (d.depth == 0) {
        textRotation = -90;
        dy = 0
        radius = 0
        return "translate(-12)"
      }

      return "rotate(" +((<WheelNode>d).angleInDegrees) + ") translate(" + radius + ", " + dy +")"
            + "rotate(" + textRotation +")";
    }

    drawArc (d: d3.layout.tree.Node): string {
      var segment = <WheelNode>d;
      var result = d3.svg.arc()
          .innerRadius(a => { return segment.innerRadius; })
          .outerRadius(a => { return segment.outerRadius;})
          .startAngle(a => segment.startAngle)
          .endAngle(a => segment.endAngle)
          ;
      return result();
    }

    color(d: WheelNode) {
        return d3.hsl((d.startAngle+d.endAngle)*90*d.depth/Math.PI, 0.3 + d.depth / 5, 0.50).rgb().toString();
    };

    calculateTreeDepth(segment: Segment, level: number=0) {
      if (segment.children) {
        for (var child of segment.children) {
          this.calculateTreeDepth(child, level+1)
        }
      }
      else {
        if (level > this._maxDepth) {
          this._maxDepth = level;
        }
      }
    }


    calculateTreeSize(segment: Segment, level: number=0) {
      segment.treeSize = 0;
      if (segment.children) {
        segment.children.forEach(segment => this.calculateTreeSize(segment, level+1))
        for (var child of segment.children) {
          segment.treeSize += child.treeSize
        }
      }
      else {
        segment.treeSize = (this._maxDepth-level+1);
      }
    }

    calculateSegmentSize(segment: Segment, startAngle: number, endAngle: number) {
      segment.startAngle = startAngle;
      segment.endAngle = endAngle;
      var center = segment.startAngle + ((segment.endAngle - segment.startAngle) / 2)
      segment.angleInDegrees = (center * 180 / Math.PI)-90;
      console.log(segment.angleInDegrees + " " + segment.name)
    //  segment.angleInDegrees = (segment.startAngle) * 180 / Math.PI-90;
      if (segment.children) {
        var slice = (segment.endAngle - segment.startAngle) / segment.treeSize
        var start = startAngle;
        for (var child of segment.children) {
          var end = start + child.treeSize * slice;
          this.calculateSegmentSize(child, start, end)
          start = end

        }
      }
    }
}

new Wheel();
