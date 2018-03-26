import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  return (
    // While we’re cleaning up the code, we also changed onClick={() => props.onClick()} to just onClick={props.onClick},
    // as passing the function down is enough for our example. Note that onClick={props.onClick()} would not work because
    // it would call props.onClick immediately instead of passing it down.
    <button className="square" onClick={props.onClick} style={props.style}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winSquares = this.props.winSquares;

    let highlight;
    if (winSquares && winSquares.includes(i)) {
      highlight = {backgroundColor: 'green'};
    }

    return (
      <Square
        key={Math.floor(i % this.props.size)}
        style={highlight}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const rows = [];

    for (let y = 0; y < this.props.size; y++) {
      const cols = [];

      for (let x = 0; x < this.props.size; x++) {
        cols.push(this.renderSquare(y * this.props.size + x));
      }

      rows.push(
        <div className="board-row" key={y}>
          {cols}
        </div>
      )
    }

    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastMove: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      isAsc: true,
    }
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner2(squares, current.lastMove, this.props.size, this.props.win) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastMove: {
          x: Math.floor(i % this.props.size),
          y: Math.floor(i / this.props.size),
        },
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      orderIsAsc: true,
    });
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  changeOrder() {
    this.setState({isAsc: !this.state.isAsc});
  }
  render() {
    console.log('render');
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    // const winner = calculateWinner(current.squares);
    const winner = calculateWinner2(current.squares, current.lastMove, this.props.size, this.props.win);
    const moves = history.map((step, move) => {
      const font = (move === this.state.stepNumber) ? {fontWeight: 'bold'} : {fontWeight: 'normal'};
      const desc = move ?
        `Go to move #${move} = (${step.lastMove.x + 1}, ${step.lastMove.y + 1})`:
        `Go to game start`;
      return {
        move: move,
        jsx: (
            <li key={move}>
              <button style={font} onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
        ),
      }
    });

    if (!this.state.isAsc) {
      moves.sort((a, b) => {
        if (a.move > b.move) return -1;
        else return 1;
      });
    }

    let status;
    if (winner) {
      status = 'Winner ' + winner.symbol;
    } else if (current.squares.some((square) => !square)) {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    } else {
      status = 'Game over! Draw !'
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            winSquares={winner && winner.squares}
            onClick={(i) => this.handleClick(i)}
            size={this.props.size}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.changeOrder()}>Sort {this.state.isAsc ? 'descending' : 'ascending'}</button>
          <ol reversed={!this.state.isAsc}>{moves.map(move => move.jsx)}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game size={10} win={5}/>,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        symbol: squares[a],
        squares: [a, b, c],
      }
    }
  }

  return null;
}

function calculateWinner2(squares, lastMove, size = 3, win = 3) {
  if (!lastMove) return null;
  const symbol = squares[lastMove.x + lastMove.y * size];
  const vectors = [
    {x: 1, y: 0},
    {x: 1, y: 1},
    {x: 1, y: -1},
    {x: 0, y: 1},
    {x: 0, y: -1},
    {x: -1, y: 0},
    {x: -1, y: 1},
    {x: -1, y: -1},
  ];

  for (let {x, y} of vectors) {
    let winSquares = [lastMove.x + lastMove.y * size];
    let moveX = lastMove.x + x, moveY = lastMove.y + y;
    while(moveX >= 0 && moveX < size && moveY >= 0 && moveY < size
       && squares[moveX + moveY * size] === symbol) {
      winSquares.push(moveX + moveY * size);
      if (winSquares.length === win) {
        return {
          symbol: symbol,
          squares: winSquares,
        }
      } else {
        moveX += x;
        moveY += y;
      }
    }
  }

  return null;
}
