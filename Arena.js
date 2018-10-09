 
 var canvas = document.getElementById("canvas"),  
 ctx = canvas.getContext("2d"),
 WIDTH = canvas.width,
 HEIGHT = canvas.height,  
 frameRate = 1/80, // Seconds
 frameDelay = frameRate * 1000, // ms       
 loopTimer = false,
 CENTER_WIDTH = WIDTH*0.5,
 CENTER_HEIGHT = HEIGHT * 0.5,
 keysDown = {};
 canvas.onmousedown = myDown;
 canvas.onmouseup = myUp;
 keyMap = {
     space: 32,
     right: 39,
     left:  37,
     q:     81,
     w:     87,
     e:     69,
     r:     82,

 }

ctx.translate(CENTER_WIDTH, CENTER_HEIGHT); // translate to 0,0 (origin)

 addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);                                    // add key handler
  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);


  requestInterval = function (fn, delay) { // render engine
    var requestAnimFrame = (function () {
      return window.requestAnimationFrame || function (callback, element) {
        window.setTimeout(callback,  frameDelay);
      };
    })(),
        start = new Date().getTime(),
        handle = {};
    function loop() {
      handle.value = requestAnimFrame(loop);
      var current = new Date().getTime(),
          delta = current - start;
      if (delta >= delay) {
        fn.call();
        start = new Date().getTime();
      }
    }
    handle.value = requestAnimFrame(loop);
    return handle;
  }
 
function myUp(){
    canvas.onmousemove = null;
  }
                                            // add mouse handler
function myDown(e){
    mouseX = (e.pageX - canvas.offsetLeft);
    mouseY = (e.pageY - canvas.offsetTop);
    //game code 
  }

function drawAll(items){ // draw all items and player to keys
    let i,j;
    for( i = 0; i < items.length; i++){
      items[i].draw();
      if(items[i].type === "player"){
          items[i].keys();
          items[i].project();
          
      }

    }
}

function random(num){
    return Math.floor(Math.random()*num);
  }


const physics = {  //physics engine
    ballCollision:function collision(objA,objB){
        if (objA.x < objB.x + objB.radius &&
        objA.x + objA.radius > objB.x &&
        objA.y < objB.y + objB.radius &&
        objA.radius + objA.y > objB.y) {
          return true;
        }else{
          return false; 
        }
     },

    collisionBetweenRect: function collideRect(a,b){
         return (a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y);
     },
    
    
     boundry:function walls(obj){
        if (obj.y > CENTER_HEIGHT - obj.radius) { 
            obj.y = CENTER_HEIGHT - obj.radius;
            obj.velocity.y *= obj.kx; 
            obj.x = 0;
            obj.y = -100;

            return true;
        }else if (obj.x > CENTER_WIDTH - obj.radius){
            obj.x = CENTER_WIDTH - obj.radius;
            return true;
        }else if (obj.x < -CENTER_WIDTH) {
            obj.x = -CENTER_WIDTH+obj.radius;
            return true;
        }else{
            return false;
        }
     },
    
    
    drag: function drag(obj){
      let Fx = -0.5 * constant.drag * obj.area * constant.density * obj.velocity.x **3 /  Math.abs(obj.velocity.x),
      Fy = -0.5 * constant.drag * obj.area * constant.density * obj.velocity.y **3 / Math.abs(obj.velocity.y);
      Fx = (isNaN(Fx) ? 0 : Fx);
      Fy = (isNaN(Fy) ? 0 : Fy);
      return [Fx, Fy];
    },
       
    
    accelerationX: function accelerationX(obj){
       let ax = this.drag(obj)[0] / obj.mass;
        obj.velocity.x += ax*frameRate;
       return obj.velocity.x;                                    
    } , 

    accelerationY: function accelerationY(obj){
        let ay = constant.gravity + (this.drag(obj)[1] / obj.mass);
        obj.velocity.y += ay*frameRate;
        return obj.velocity.y;
    },

   
     
    
    
    massCollide:function massCollision(a,b){          
      if(collision(a,b)) {                            
        b.velocity.x = (((2*a.mass)/a.mass+b.mass)*b.velocity.x) + (((b.mass-a.mass)/(a.mass+b.mass))*b.velocity.x)*frameRate*100;    
        a.velocity.x = (((2*b.mass)/a.mass+b.mass)*a.velocity.x) + (((a.mass-b.mass)/(a.mass+b.mass))*a.velocity.x)*frameRate*100; 
           
      } 
    },
    
    
    
    
    all:function allPhysics(obj) {
            let i;
            for(i = 0; i < game.platforms.length; i++){
                if ((this.collisionBetweenRect(obj, game.platforms[i])) ){
                    //obj.velocity.y *= obj.kx; 
                    obj.y = game.platforms[i].y;
                    //obj.vector.direction = 0;
                    obj.onGround = true;
                    return
                                        
                }else{
                    if(!this.boundry(obj)){
                    obj.onGround = false;
                    }   
                }
            }if (!obj.onGround) {
                let Fy = this.drag(obj)[1];  
                Fy = (isNaN(Fy) ? 0 : Fy); 
                obj.y += this.accelerationY(obj)*frameRate*100-Fy;  
            }
    },
    
    balls: function makeBalls(items, num){
      let i;
      for(i = 0; i < num; i++){
        items.push(new Entity(1*i*random(15),1*i*random(6)  , random(2), random(40),-0.7)); 
      }
      
    },
    
    
    drawAllSprites: function drawAll(items){
      let i;
      for( i = 0; i < items.length; i++){
        items[i].draw();
        items[i].move();  
        
      }
    }
}




//END OF UTILITY DECLERATIONS

class Constant{   
    constructor(){
        this.drag = 0.47; //0.47
        this.density = 1.22;
        this.gravity = 9.8;       
    }
} //end constant

class Vector { 
	constructor(x, y, z, direction) { 
		this.y = y;
		this.x = x;
		this.z = z;
		this.magnitude = Math.abs(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
		this.direction = direction;  
		this.values = [];
		this.frequency = 1;
  }


	dotProductAngle(vector, theta) {
		return this.magnitude * vector.magnitude * Math.cos(theta);
	}  

	dotProduct(vector) {
		return (this.x * vector.x + this.y * vector.y + this.z * vector.z);
	}

	twoDrotate(theta, i, j) {
		let iRot = this.values[i] * Math.cos(theta) - this.values[j] * Math.sin(theta),
		jRot = this.values[i] * Math.sin(theta) + this.values[j] * Math.cos(theta);
		return [iRot, jRot];
	}


	threeD_Rotoate_X(theta, i, j, k) {
		let jRot = this.values[j] * Math.cos(theta) - this.values[k] * Math.sin(theta),
		kRot = this.values[j] * Math.sin(theta) + this.values[k] * Math.cos(theta);
		return [i, jRot, kRot];
	}

	threeD_Rotate_Y(theta, i, j, k) {
		let iRot = this.values[i] * Math.cos(theta) - this.values[k] * Math.sin(theta),
		kRot = -this.value[i] * Math.cos(theta) + this.values[k] * Math.cos(theta);
		return [iRot, j, kRot];
	}

	threeD_Rotoate_Z(theta, i, j, k) {
		let iRot = this.values[i] * Math.cos(theta) - this.values[j] * Math.sin(theta),
		jRot = this.values[i] * Math.sin(theta) + this.values[j] * Math.cos(theta);
		return [iRot, jRot, k];
	}

	isOrthogonal(vector, theta) {
		return (this.dotProduct(vector, theta) == 0);
	}
  
  flip(){

    switch(this.direction){
        case 1:
            this.direction = 3;
            break;
        case 2:
            this.direction = 4;
            break;
        case 3:
            this.direction = 1;
            break;
        case 4:
            this.direction = 2;
            break;
    }
    
     
  }
    
}// end Vector

class Sprite{
    constructor(x,y,mass,radius,kx, type){           
        this.x = x; 
        this.y = y;  
        this.mass = mass; 
        this.radius = radius;
        this.height = radius;
        this.width = radius;
        this.type = type;  
        this.kx = kx;
        this.velocity = {x:1, y:0}
        this.vector = new Vector(this.x, this.y, 0, 2) ;       
        this.area =  Math.PI * this.radius * this.radius / (10000); 
        this.color = 2; 
        this.jumpsLeft = 1;
        this.onGround = false; 
        this.projectiles = [];
    }
  
  draw(){       
    ctx.save();     
    ctx.beginPath();
    if (this.color == 1)   
    ctx.fillStyle = "red";  
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
    ctx.fill();
    ctx.translate(this.x, this.y);  
    ctx.restore();         
  }
  
  autoMove(){
    
     this.x += physics.acceleration(this)[0]*frameRate*100;
     this.y += physics.acceleration(this)[1]*frameRate*100;
    
  }

  keys(){
    if ((keyMap.right in keysDown) || (keyMap.space in keysDown && keyMap.right in keysDown)){ //right arrow or right-space
    this.x += this.velocity.x*physics.accelerationX(this)*frameRate*200;
    this.vector.direction = 1;
    }else if((keyMap.left in keysDown) || (keyMap.space in keysDown && keyMap.left in keysDown )){ //left arrow or left-space
    this.x -= this.velocity.x*physics.accelerationX(this)*frameRate*200;
    this.vector.direction = 3;
    }else if(keyMap.space in keysDown){ // space 
        this.jump();    
    } else if(keyMap.q in keysDown){ // q
        this.shoot();
        
    } else if(keyMap.w in keysDown){ //  w 
        
    }  else if(keyMap.e in keysDown){ // e 
        
    } else if(keyMap.r in keysDown){ //  r 
           
    }  
  }


project(){
    let i;
    if(this.projectiles.length > 0){
        for(i = 0; i < this.projectiles.length; i++){
            this.projectiles[i].toss();
            if (this.projectiles[i].x > CENTER_WIDTH || this.projectiles[i].x < -CENTER_WIDTH || this.projectiles[i].y > CENTER_HEIGHT || this.projectiles[i].y < -CENTER_HEIGHT){
                this.projectiles.pop();
            }
        }
    }
}
 

  shoot(){
      if(this.projectiles.length < this.jumpsLeft){
          this.projectiles.push(new Asset(this.x, this.y-this.radius, 5, 5, "projectile", this.vector.direction));
      }    
  }


  jump(){
    if(this.onGround){
        this.velocity.y = -(this.mass*this.velocity.x+constant.gravity*this.mass*this.velocity.x+constant.gravity)*2;
        this.velocity.y += physics.accelerationY(this);
        this.y -= this.velocity.y;
        this.vector.direction = 4;
    }else{
       this.velocity.y = -this.jumpsLeft*physics.accelerationY(this)*this.kx;   
    }
  }

}// end of Sprite

class Asset{
    constructor(x,y, width, height, type, direction){
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.type = type;
        this.id = "";
        this.image = document.getElementById(this.id);
        this.vector = new Vector(1.0,1.0,0,4);
        this.radius = height;
        this.vector.direction = direction;
    }

    draw(){
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }


    toss(){
            this.draw();
            switch(this.vector.direction){
                case 1:
                  this.x += this.vector.magnitude
                  break;
                case 2:
                  this.y += this.vector.magnitude;
                  break;
                case 3:
                  this.x -= this.vector.magnitude;
                  break;
              case 4:
                  this.y -= this.vector.magnitude;
              break;
                  
            }
    
        
        }
      
    
    

}// end Asset

class Game{
    constructor(state){
        this.state = state;
        this.platforms = [];
        this.players = [];
        this.items = [];
        this.sprites = [];
        this.updateKeys = true;
        

    }

    setup(){
       this.platforms.push(new Asset(-200,0, 100, 50, "plaform", 4));
       this.platforms.push(new Asset(100,0,100,50, "plaform", 4));
       this.platforms.push(new Asset(-50,50,100,50, "plaform", 4));
       this.players.push(new Sprite(0,-100,1,10,-0.5, "player"));
    }


    render(){
        drawAll(this.players);
        drawAll(this.platforms);
    }

    stateMachine(){
        switch(this.state){
            case -1://menu state
                break;
            case 0: //setup state
            this.setup();
            this.switchState(1);
                break;
            
            case 1: //game state
                this.render();
                physics.all(this.players[0]);
                break;

            case 2: //end state
                break;
            
            case 3: //restart state
                break;

        }
    }

    switchState(newState){
        this.state = newState;
        
    }

}// end Game

var constant = new Constant(),
game = new Game(0);

function update(){
    ctx.clearRect(-WIDTH,-HEIGHT,WIDTH*2,HEIGHT*2);
    game.stateMachine();
}

requestInterval(update, frameRate);