/// <reference path="./d3.d.ts"/>;

class Wheel {
  _size: number;
  chart: d3.Selection<any>;

  get size(): number { return this._size }

    constructor() {
      var w = window.innerWidth;
      this._size = window.innerHeight;
      if (w < this.size) {
        this._size=w;
      }
    }

    drawArc(innerRadius: number, outerRadius: number, startAngle:number, endAngle:number, color: string) {
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

    }

    drawSegment(level: number, startAngle:number, endAngle:number) {
      var innerRadius = this.size * level / 5 / 2 / 2;
      var outerRadius = this.size * (level+1) / 5 / 2 / 2;
      var color = d3.hsl(startAngle*180/Math.PI, 0.50, 0.50).rgb();
      this.drawArc(innerRadius, outerRadius, startAngle, endAngle, color.toString());
    }


    showWheel() {
        this.chart = d3.select("#wheel").append("svg:svg")
            .attr("class", "chart")
            .attr("width", this.size)
            .attr("height", this.size).append("svg:g")
            .attr("transform", "translate(200,200)")
            ;
            this.drawSegment(1, 0, 1)
            this.drawSegment(1, 1, 2)
            this.drawSegment(1, 2, 3)
            this.drawSegment(1, 3, 4)
            this.drawSegment(1, 4, 5)
            this.drawSegment(1, 5, Math.PI * 2)

            this.drawSegment(2, 0, 0.5)
            this.drawSegment(2, 0.5, 1)
            this.drawSegment(2, 1, 1.5)
            this.drawSegment(2, 1.5, 2)
            this.drawSegment(2, 2, 2.5)
            this.drawSegment(2, 2.5, 3)
            this.drawSegment(2, 3, 3.5)
            this.drawSegment(2, 3.5, 4)
            this.drawSegment(2, 4, 4.5)
            this.drawSegment(2, 4.5, 5)
            this.drawSegment(2, 5, 5.5)
            this.drawSegment(2, 5.5, Math.PI * 2)

    }
}

new Wheel().showWheel();
