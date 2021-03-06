/// <reference path="./d3.d.ts"/>;

module charting {
    export class chart {
        private _group: d3.Selection<any>;
        private _paddingLeft = 30;
        private _paddingBottom = 30;
        private _height: number;
        constructor(container: any) {
            this.init(container);
        }

        private init(container: any) {
            var selection = d3.select(container);
            var width: number = selection.node().clientWidth;
            var height: number = selection.node().clientHeight;
            this._height = height;
            this._group = selection.append('svg')
                .attr({
                    'width': width,
                    'height': height
                })
                .append('g');
            this.draw(width, height);
        }

        draw(width: number, height: number) {
            this.drawXAxis(width);
            this.drawYAxis(height);
        }

        private drawXAxis(width: number) {
            var scale = d3.scale.linear();
            scale.domain([0, 1]);
            scale.range([0, width - this._paddingLeft]);
            var xAxis = d3.svg.axis()
                .scale(scale)
                .orient('bottom');
            this._group.append('g')
                .call(xAxis)
                .attr({
                    'transform': 'translate(' + this._paddingLeft + ',' + (this._height - this._paddingBottom) + ')'
                });

        }
        private drawYAxis(height: number) {
            var paddingLeft = 30;
            var scale = d3.scale.linear();
            scale.domain([0, 1]);
            scale.range([height - this._paddingBottom, 0]);
            var axis = d3.svg.axis()
                .scale(scale)
                .orient('left');
            this._group.append('g')
                .call(axis)
                .attr({
                    'transform': 'translate(' + this._paddingLeft + ', 0)'
                });
        }
    }
}
