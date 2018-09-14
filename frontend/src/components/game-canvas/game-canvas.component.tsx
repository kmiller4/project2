import * as React from 'react';
import * as io from 'socket.io-client';
// import * as $ from 'jquery';

// interface IProps extends IPokemonState {
//   fetchPokemon: (id: number) => any,
//   updateId: (id: number) => any
// }

export class GameCanvasComponent extends React.Component<any, {}> {

  public canvas: any;
  public isDrawing = false;

  constructor(props: any) {
    super(props);
    this.canvas = React.createRef();
  }

  public getContext(): CanvasRenderingContext2D {
    return this.canvas.current.getContext("2d");
  }

  public draw = (e: any) => {
    if (this.isDrawing) {
      const current = this.canvas.current;
      const context: CanvasRenderingContext2D = current.getContext("2d");
      context.strokeStyle = '#ff4141';
      context.lineWidth = 4;
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


  public componentDidMount() {
    const socket = io('http://localhost:3001');

    socket.on('connected', (payload: any) => {
      console.log(`You are user #${payload.count}`);

      const users = payload.users;

      console.log(`All users:`);

      for (const id in users) {
        if (id) {
          console.log(id);
        }
      }

      socket.on('quit', (id: any) => {
        console.log(`${id} disconnected`)
      })
    });
    
    }
    
  

  // public updateCanvas(x: any, y: any, type: any) {
  //   // console.log(`x=${x} y=${y}`)
  //   const canvas = this.canvasRef.current;
  //   if (canvas) {
  //     const ctx = canvas.getContext("2d")
  //     if (ctx) {
  //       if (type === 'dragstart') {
  //         this.lastX = x;
  //         this.lastY = y;
  //         ctx.beginPath();
  //         ctx.moveTo(x, y);
  //       }
  //       else if (type === 'drag') {
  //         if ((this.lastX - x) > 20 || (this.lastY - y) > 20) { return; }
  //         ctx.lineTo(x, y);
  //         ctx.stroke();
  //         this.lastX = x;
  //         this.lastY = y;
  //       }
  //       else {
  //         ctx.closePath();
  //       }
  //       return;
  //     }
  //   }
  // }

  // public handleDrag(e: any) {
  //   e.dataTransfer.setDragImage(document.createElement('canvas'), 0, 0);
  //   // $('canvas').on( 'dragstart', )


  //   const type = e.type;
  //   // if (type === 'dragstart') {e.dataTransfer.effectAllowed = "copyMove";}
  //   // if (type === 'drag') {e.dataTransfer.dropEffect = "copy";}
  //   console.log(type);
  //   const canvas = this.canvasRef.current;
  //   if (canvas) {
  //     const offset = $(canvas).offset();
  //     // console.log(offset);
  //     if (offset) {
  //       e.offsetX = e.clientX - offset.left;
  //       e.offsetY = e.clientY - offset.top;
  //       const x = e.offsetX;
  //       const y = e.offsetY;
  //       this.updateCanvas(x, y, type);
  //     }
  //   }
  // }

  public render() {
    return (
      <div id="gameCanvasContainer">
        <canvas id="gameCanvas" width={600} height={600} className="bg-light" ref={this.canvas}
          onMouseMove={this.draw}
          onMouseDown={(e: any) => { this.toggleDraw(); this.startDraw(e); }}
          onMouseUp={this.toggleDraw}>
        </canvas>
        <button className="btn btn-primary">Send Art</button>
      </div>

    );
  }
}

// const mapStateToProps = (state: IState) => (state.signIn);

// const mapDispatchToProps = {
//   updateError: signInActions.updateError,
//   updatePassword: signInActions.updatePassword,
//   updateUsername: signInActions.updateUsername,
// }

// export default connect(mapStateToProps, mapDispatchToProps)(SignInComponent);