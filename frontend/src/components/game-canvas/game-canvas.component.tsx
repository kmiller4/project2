import * as React from 'react';
import * as io from 'socket.io-client';
import { RouteComponentProps } from 'react-router';
// import * as $ from 'jquery';

// interface IProps extends IPokemonState {
//   fetchPokemon: (id: number) => any,
//   updateId: (id: number) => any
// }
interface IProps extends RouteComponentProps<{}> {

}

export class GameCanvasComponent extends React.Component<IProps, any> {

  public canvas: any;
  // public users: any[];
  public imageContainer: any;
  public isDrawing = false;
  public socket = io('http://localhost:3001');
  public drawColor = '#ff4141';
  public lineWidth = 4;
  public user = {
    art: '',
    id: 0,
    message: '',
    messages: [],
    pId: 0,
    score: 0,
    upgrades: []
  };


  constructor(props: any) {
    super(props);
    this.canvas = React.createRef();
    this.imageContainer = React.createRef();
    this.state = {
      author: '',
      message: '',
      messages: [],
      score: 0,
      showCanvas: false,
      showImages: false,
      showWaiting: true,
      showWinner: false,
      timer: '',
      topic: '',
      upgrades: [],
      users: [],
      winners: []
    }
  }

  

  public getContext(): CanvasRenderingContext2D {
    return this.canvas.current.getContext("2d");
  }

  public sendMessage = (ev: any) => {
    ev.preventDefault();
    this.socket.emit('SEND_MESSAGE', {
        author: this.state.username,
        message: this.state.message
    })
    this.setState({message: ''});

}

  public draw = (e: any) => {
    if (this.isDrawing) {
      const current = this.canvas.current;
      const context: CanvasRenderingContext2D = current.getContext("2d");
      context.strokeStyle = this.drawColor;
      context.lineWidth = this.lineWidth;
      context.lineCap = "round";
      context.lineTo(e.pageX - current.offsetLeft, e.pageY - current.offsetTop)
      context.stroke()
    }
  }

  public toggleDraw = () => {
    this.isDrawing = !this.isDrawing;
  }

  public startDraw = (e: any) => {
    const context = this.getContext();
    const current = this.canvas.current;
    context.moveTo(e.pageX - current.offsetLeft, e.pageY - current.offsetTop);
    context.beginPath();
  }

  public handleVote = (pId: any) => {
    this.socket.emit('user vote', pId);
    this.setState({
      ...this.state,
      showImages: false
    });
    console.log('voted');
  }

  public resetGame = () => {
    this.setState({
      ...this.state,
      showCanvas: true,
      showImages: false,
      showWinner: false
    });
    const ctx = this.getContext();
    ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
    this.isDrawing = false;
  }

  public buyUpgrade = (e: any) => {
    console.log(e.target.value);
    this.setState({
      ...this.state,
      upgrades: ['blue']
    })
  }


  public componentDidMount() {
    this.socket.emit('new player');

    this.socket.on('show art', (players: any[]) => {
      console.log('in show art');
      console.log(players);
      this.setState({
        ...this.state,
        showCanvas: false,
        showImages: true,
        users: players
      })

    })

    // receiving messages
    this.socket.on('RECEIVE_MESSAGE', (data:any) => {
      addMessage(data);
    })

    const addMessage = (data:any) => {
      // console.log(data);
      this.setState({messages: [...this.state.messages, data]});
      // console.log(this.state.messages);
    }

    this.socket.on('state', (serverState: any) => {
      this.setState({
        ...this.state,
        timer: 'Draw: ' + serverState.time,
        topic: serverState.topic
      });
    })

    this.socket.on('vote state', (serverState: any) => {
      this.setState({
        ...this.state,
        timer: 'Vote For Another Octopus: ' + serverState.time,
        topic: serverState.topic
      });
    })

    this.socket.on('wait state', (serverState: any) => {
      this.setState({
        ...this.state,
        timer: 'New Match In : ' + serverState.time,
        topic: serverState.topic
      });
    })

    this.socket.on('await players', () => {
      this.setState({
        ...this.state,
        timer: 'Waiting For More Players To Start Match'
      });

    })

    this.socket.on('finish', () => {
      this.setState({
        timer: "Time's Up!"
      })
      const current = this.canvas.current;
      if (current) {
        const image = new Image();
        image.src = current.toDataURL("image/png");
        this.socket.emit('art transfer', image.src);
      }

    })

    this.socket.on('player data', (player: any) => {
      console.log('setting player data');
      this.user = player;
      this.setState({
        ...this.state,
        score: 'Sacks: ' + this.user.score,
        upgrades: player.upgrades
      })
      console.log(this.user);
    })

    this.socket.on('winners', (winners: any[]) => {
      console.log('in winner');
      console.log(winners);
      this.setState({
        ...this.state,
        showImages: false,
        showWinner: true,
        winners
      });
      this.socket.emit('get data');
    })

    this.socket.on('done waiting', () => {
      this.resetGame();
    })

    this.socket.on('game start', () => {
      this.setState({
        ...this.state,
        showCanvas: true,
        showWaiting: false
      })
    })



  }

  public render() {
    return (
      <div id="canvasComponentContainer"
        onMouseMove={(this.state.showCanvas ? this.draw : () => { console.log() })}
        onMouseDown={(e: any) => { if (this.state.showCanvas) { this.isDrawing = true; this.startDraw(e); } }}
        onMouseUp={(this.state.showCanvas ? this.toggleDraw : () => { console.log() })}>
        >
        <div className="chatContainer">
                <div className="row">
                    <div className="col-2">
                        <div className="card">
                            <div className="card-body">
                                <div className="card-title">Chat</div>
                                <hr/>
                                <div className="messages">
                                    {this.state.messages.map((message: any) => {
                                        return (
                                            <div key = {message}>{this.user.id}: {message.message}</div>
                                        )
                                    })}
                                </div>

                            </div>
                            <div className="card-footer">
                                
                                <input type="text" placeholder="Message" className="form-control" value={this.state.message} onChange={ev => this.setState({message: ev.target.value})}/>
                                <br/>
                                <button onClick={this.sendMessage} className="btn btn-primary form-control">Send</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
      <div id="gameCanvasContainer">
          {this.state.showWaiting && <h5 className="gameTimer">Waiting For More Octopi...</h5>}
          {!this.state.showWaiting && <h5 className="gameTimer">{this.state.timer}</h5>}
          {(this.state.showCanvas || this.state.showImages) && <h5 className="gameTimer">Topic: {this.state.topic}</h5>}
          {!this.state.showWaiting && <h5 className="gameTimer">{this.state.score}</h5>}
          {this.state.showCanvas && <canvas id="gameCanvas" width={600} height={600} className="bg-light" ref={this.canvas}>
          </canvas>}
          <br />
          {this.state.showCanvas && <button onClick={() => { this.drawColor = '#f8f9fa'; this.lineWidth = 20; }} className="btn btn-dark eraseButton">Eraser</button>}
          {this.state.showCanvas && <button onClick={() => { this.drawColor = '#ff4141'; this.lineWidth = 4; }} className="btn btn-danger eraseButton">Red</button>}
          {this.state.showCanvas && this.state.upgrades && this.state.upgrades.includes('blue') && <button className="btn btn-primary eraseButton"
            onClick={() => {
              this.drawColor = '#007bff';
              this.lineWidth = 4;
            }}>Blue</button>}
        </div>

        <div className="container resultsContainer">
          <div className="row">
            {this.state.showImages && this.state.users.map((user: any) =>
              user && (user.pId !== this.user.pId) &&
              <div key={user.id} className="col-4">
                <div className="bg-light refImage text-light">
                  <img src={user.art} onClick={() => { this.handleVote(user.pId) }} className="resultImage"></img>
                  {user.pId + 1}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="container winnerContainer">
          <div className="row">
            {this.state.showWinner && this.state.winners.map((winner: any) =>

              <div key={winner.pId} className="col">
                <div className="bg-light refImage text-light">
                  <img className="resultImage" src={winner.art}></img>
                </div>
                <h2 className="text-light winnerLabel">User {winner.pId + 1} Wins!</h2>
                <h3 className="text-light winnerLabel">Topic: {this.state.topic}</h3>
              </div>

            )}
          </div>
        </div>

        <br />
        <div className="container upgradeContainer">
          <div className="row">
            <div className="col">
              <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                Buy Upgrades
              </button>
              <div className="collapse" id="collapseExample">
                <button value="blue" className="btn btn-primary" onClick={(e) => { this.buyUpgrade(e) }}>Buy Blue</button>
              </div>
            </div>
          </div>
        </div>


      </div>

    );
  }
}

/* this was used for username display <input type="text" placeholder="Username" value={this.state.username} onChange={ev => this.setState({username: ev.target.value})} className="form-control"/>
                                <br/> */

// const mapStateToProps = (state: IState) => (state.signIn);

// const mapDispatchToProps = {
//   updateError: signInActions.updateError,
//   updatePassword: signInActions.updatePassword,
//   updateUsername: signInActions.updateUsername,
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SignInComponent);