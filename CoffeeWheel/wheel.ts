/// <reference path="./d3.d.ts"/>;

class Wheel {
    // get board(): ChessEngineAPI.ChessboardUI { return this.chessboard }

    // get fields() { return this.board.fields }

    // constructor(private chessboard:ChessEngineAPI.ChessboardUI) {}

    greet(): string {
      return "Hallo"
    }

    showWheel() {
      var divs : d3.Selection<HTMLDivElement> = d3.select("#wheel");
      divs.text(this.greet());
    }
}

new Wheel().showWheel();
