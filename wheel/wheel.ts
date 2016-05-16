/// <reference path="./d3.d.ts"/>;

interface Segment {
    name: string;
    colour: string;
    children: Segment[];
}


class Wheel {
  _size: number;
  chart: d3.Selection<any>;

  get size(): number { return this._size }

    constructor() {

      var w = document.getElementById("wheel").clientWidth;
      this._size = document.getElementById("wheel").clientHeight;;
      if (w < this._size) {
        this._size=w;
      }
      console.log(this._size)
      this.chart = d3.select("#wheel").append("svg:svg")
          .attr("class", "chart")
          .attr("width", w)
          .attr("height", this._size).append("svg:g")
          .attr("transform", "translate(400,300) rotate(-35)")
          ;
      this.readData();
    }

    readData() {
      var request = new XMLHttpRequest();
      request.onload = () => {
        if (request.readyState==4 && request.status==200)
        {
          var segments: Segment[] = JSON.parse(request.responseText);
          this.showWheel(segments);
        }
      };
      request.open("get", "wheel.json", true);
      request.send();
    }

    drawArc(innerRadius: number, outerRadius: number, startAngle:number, endAngle:number, color: string, name: string) {
      var arc = d3.svg.arc()
          .innerRadius(innerRadius)
          .outerRadius(outerRadius)
          .startAngle(startAngle)
          .endAngle(endAngle);
      this.chart
          .append("svg:path")
          .attr("fill", function(d: any, index: number, outerindex: number) {
              return color;
          })
          .attr("d", arc);

      var x = (innerRadius + 5) * Math.sin((startAngle+endAngle)/2)
      var y = (innerRadius + 5) + Math.cos((startAngle+endAngle)/2)
      this.chart
          .append("text")

          .property("x", x)
          .property("y", y)
          .property("font-family", "sans-serif")
          .property("font-size", "10px")
          .property("fill", "red")
          .text(name)
    }

    drawSegment(level: number, startAngle:number, endAngle:number, name:string) {
      var innerRadius = this._size * level / 5 / 2;
      if (level<1) {
        innerRadius=0;
      }
      var outerRadius = this.size * (level+1) / 5 / 2;
      var color = d3.hsl((startAngle+endAngle)*90*level/Math.PI, 0.3 + level / 5, 0.50).rgb();
      this.drawArc(innerRadius, outerRadius, startAngle, endAngle, color.toString(), name);
    }


    showWheel(segments: Segment[], level: number = 0, startAngle: number = 0, endAngle: number = Math.PI *2 ) {
      var count = segments.length
      var startSection = startAngle
      var endSection = startSection
      var range = endAngle - startAngle
      for (var segment of segments) {
        endSection += range / count
        this.drawSegment(level, startSection , endSection, segment.name)
        if (segment.children && segment.children.length > 0) {
          this.showWheel(segment.children, level+1, startSection, endSection)
        }
        startSection = endSection
      }
    }
}

new Wheel();
