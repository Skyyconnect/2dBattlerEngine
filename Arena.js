 
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
     down:  40,
     up:    38,
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

function distanceBetween(a,b){ 
	return Math.sqrt(((a.x*a.x)-(b.x*b.x))+((a.y*a.y)-(b.y*b.y)))
}

function distanceBetweenPoints(x1,y1,x2,y2){ 
	return Math.sqrt((x1*x1)-(x2*x2))+((y1*y1)-(y2*y2))
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
            a.y + a.height > b.y-a.height);
     },
    
    
     boundry:function walls(obj){
        if (obj.y > CENTER_HEIGHT - obj.height) { 
            obj.y = CENTER_HEIGHT - obj.height;
            obj.velocity.y *= obj.kx; 
            obj.x = 0;
            obj.y = -100;

            return true;
        }else if (obj.x > CENTER_WIDTH - obj.height){
            obj.x = CENTER_WIDTH - obj.height;
            return true;
        }else if (obj.x < -CENTER_WIDTH) {
            obj.x = -CENTER_WIDTH+obj.height;
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
                    obj.y = game.platforms[i].y-obj.height;
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
        this.density = 1.0;
        this.gravity = 7.8;       
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
    constructor(x,y,mass,radius,kx, type, id){           
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
        this.jumpsLeft = 3;
        this.maxVelocity = this.velocity.y*this.vector.magnitude*this.velocity.x;
        this.onGround = false; 
        this.projectiles = [];
        this.image = document.getElementById(id);
        this.animation = new Animation(this,id,4,this.width*this.height);
        this.tension = .001;
    }
  
  draw(){ 
    if(this.shouldAnimate){
        this.animation.draw();
    }else{
        ctx.save();     
        ctx.beginPath();
        if (this.color == 1)   
        ctx.fillStyle = "red";  
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, true);
        ctx.fill();
        ctx.translate(this.x, this.y);  
        ctx.restore(); 
    }




  }


  jumpCount(){
      if(this.onGround){
         this.jumpsLeft = 3;
      }else if(this.jumpsLeft > 0){
        this.jumpsLeft--;
      }else{
          this.jumpsLeft = 1;
      }
  }
  

  keys(){
    if ((keyMap.right in keysDown) || (keyMap.space in keysDown && keyMap.right in keysDown)){ //right arrow or right-space
    this.x += this.velocity.x*physics.accelerationX(this)*frameRate*200;
    this.vector.direction = 1;
    }else if((keyMap.left in keysDown) || (keyMap.space in keysDown && keyMap.left in keysDown )){ //left arrow or left-space
    this.x -= this.velocity.x*physics.accelerationX(this)*frameRate*200;
    this.vector.direction = 3;
    }else if(keyMap.up in keysDown){
        this.vector.direction = 4;
    }else if(keyMap.space in keysDown){ // space 
        this.jump(); 
    }else if(keyMap.q in keysDown || (keyMap.q in keysDown && keyMap.space in keysDown)){ // q
        this.shoot();
        
    } else if(keyMap.w in keysDown){ //  w 
        //shield
        
    }  else if(keyMap.e in keysDown){ // e 
        //use items
        
    } else if(keyMap.r in keysDown){ //  r 
        //use weapon
    }
    
    
    if(keyMap.space in keysDown && keyMap.up in keysDown){ //space and up
        this.doubleJump();   
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
          if(!this.onGround)
            this.jumpCount();
      }    
  }

  doubleJump(){
    if(this.jumpsLeft > 1){
        console.log(this.y)
        this.velocity.y = -(this.mass*constant.gravity)-(physics.accelerationY(this)*this.kx)*this.tension;
        this.velocity.y += -physics.accelerationY(this)*this.maxVelocity*this.tension;
        console.log(this.velocity.y)
        this.jumpCount();
  }
}

  jump(){
      
    if(this.onGround && this.jumpsLeft > 0){
        this.velocity.y = -(this.mass*constant.gravity)-(physics.accelerationY(this)*this.kx);
        this.velocity.y += -physics.accelerationY(this)*this.maxVelocity;
        this.y += -this.velocity.y*this.velocity.y
        this.jumpCount();
    }else{
       //this.velocity.y = -physics.accelerationY(this)*this.kx*frameRate;   
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


class Animation{
    constructor(obj, id, numFrames, scale){
        this.image = document.getElementById(id);
        this.obj = obj;
        this.delay = 3;
        this.delayCount = 0;
        this.frameX = 1;
        this.frameY = 1;
        this.shouldAnimate = true;
        this.numberOfFrames = numFrames;
        this.scale = scale;


    }


    draw(){
        if(this.shouldAnimate){ 
           ctx.drawImage(this.image,this.frameX*this.obj.height, this.obj.height*this.frameY, this.scale, this.scale,this.obj.x,this.obj.y, this.scale, this.scale);
           this.incrementFrame(this.numberOfFrames,this.delay);
        }else{
            ctx.save();     
            ctx.beginPath();
            ctx.fillStyle = "red";  
            ctx.arc(this.obj.x, this.obj.y, this.obj.radius, 0, Math.PI*2, true);
            ctx.fill();
            ctx.translate(this.obj.x, this.obj.y);  
            ctx.restore(); 
        }
      }

    incrementFrame(numFrames, delayAmount) {
        if (this.delayCount < delayAmount) {
          this.delayCount += 1;
         
        } else {
          if (this.frameX < this.numberOfFrames ) {
             this.frameX += 1;
          } else {
            this.frameX = 0;
            this.delayCount = 0;
           
          }
         
        }
        
      }




} //end of Animation




class Camera{
    constructor(x, y, width, height, offsetX, offsetY){
		this.x = x;
		this.y = y;
		this.width = width;
		this.hight = height;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.totalZoom =  1; 
		this.scale = 1;
		this.centerX = 0;
		this.centerY = 0;
}
draw(){
    ctx.save();     
    ctx.beginPath();
    ctx.fillStyle =  "rgba(255, 255, 255, 0.25)";  
    ctx.arc(this.x, this.y, this.width, 0, Math.PI*2, true);
    ctx.fill();
    ctx.translate(this.x, this.y);  
    ctx.restore(); 
   
}


hitMax(){
    if(this.x > this.distanceFromCenter() > CENTER_WIDTH || this.y > this.distanceFromCenter() > CENTER_HEIGHT){
        this.resetZoom();
        this.x -= this.distanceFromCenter();
    }   this.y -= this.distanceFromCenter();
}


reset(){
    this.offsetX = 0;
    this.offsetY = 0;
}


distanceFromCenter(){
    let origin = new Point(0,0),
    cameraPos = new Point(this.x, this.y);
    return distanceBetweenPoints(origin.x,origin.y,cameraPos.x,cameraPos.y);
}

scaleView(players){
    let centerOfZoom = new Point(0,0),//temporary
    pointsOfInterest = new Array(),
    zoomScale,
    minDistance,
    minDistanceSquared,
    tempDist,
    viewWidth,
    viewHeight,
    i;
    pointsOfInterest.push(new Point(players[0].x, players[0].y));  
    pointsOfInterest.push(new Point(players[1].x, players[1].y));
    for(i = 0; i < pointsOfInterest.length; ++i){
    centerOfZoom.x += pointsOfInterest[i].x;
    centerOfZoom.y += pointsOfInterest[i].y;
    
    }
    
    centerOfZoom.x /= pointsOfInterest.length-1;
    centerOfZoom.y /= pointsOfInterest.length-1;
    minDistance = (this.width > this.height ? this.width/2 : this.height/2);
    minDistanceSquared = minDistance * minDistance;
    for(i = 0; i < pointsOfInterest.length; ++i){
        tempDist = (pointsOfInterest[i].x - centerOfZoom.x) * (pointsOfInterest[i].x - centerOfZoom.x) + (pointsOfInterest[i].y - centerOfZoom.y) * (pointsOfInterest[i].y - centerOfZoom.y);
        if(tempDist > minDistanceSquared){
            minDistanceSquared = tempDist;
        }
    }
    zoomScale= (Math.sqrt(minDistanceSquared)+minDistance/2)/minDistance;
    this.scale += 0.05 * (Math.abs(this.scale-zoomScale)/(this.scale-zoomScale)); 


    let zoomWidthView = this.width * this.scale,
    zoomHeightView = this.height * this.scale,
    viewX = centerOfZoom.x - zoomWidthView / 2,
    viewY = centerOfZoom.y - zoomHeightView / 2;
    
    //if view less 
    this.width -= Math.abs(viewX);
    this.height -= Math.abs(viewY);
           
}






zoomIn(amount){
    let zoomWidth = WIDTH * this.scale,
    zoomHeight = HEIGHT * this.scale;
	this.width = zoomWidth;
	this.height = zoomHeight;
	if(this.scale < 0.01){
		this.resetZoom();
	}else{
	    this.scale = amount;;
    }
    
    ctx.save();
    ctx.translate(-((zoomWidth-WIDTH)/2), -((zoomHeight-HEIGHT)/2));
    ctx.scale(this.scale, this.scale);
    ctx.restore();
	return this.scale;
}

zoomOut(amount){
    let zoomWidth = WIDTH * this.scale,
    zoomHeight = HEIGHT * this.scale; 
	if(this.scale > 1){
		this.resetZoom(); 
	}else{
		this.scale = amount;
	}
   ctx.save();
    ctx.translate(-((zoomWidth-WIDTH)/2), -((zoomHeight-HEIGHT)/2));
    ctx.scale(this.scale, this.scale);
    
    ctx.restore();
		return this.scale;
}

moveTo(obj){
	this.x = ((obj.x-this.offsetX)/2);
	this.y = ((obj.y-this.offsetX)/2);   
	return [this.x,this.y]
}

moveBetween(a,b){
	this.x = distanceBetween(a,b)/2+((a.x-b.x)/2);
	this.y = distanceBetween(a,b)/2+((a.y-b.y)/2);
}
	
 
resetZoom(){
	this.scale = 1;
}



}// end of Camera


class Point{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}
}//end of Point


class Game{
    constructor(state){
        this.state = state;
        this.platforms = [];
        this.players = [];
        this.items = [];
        this.sprites = [];
        this.updateKeys = true;
        this.frameCount = 0;
        this.camera = new Camera(0,0,100,100,0,0);
       
        

    }

    setup(){
       this.platforms.push(new Asset(-200,0, 100, 50, "plaform", 4));
       this.platforms.push(new Asset(100,0,100,50, "plaform", 4));
       this.platforms.push(new Asset(-50,50,100,50, "plaform", 4));
       this.players.push(new Sprite(0,-100,1,10,-0.5, "player", 'player'));
       this.players.push(new Sprite(0,200,1,10,-0.5, "playerB", 'player'));
    }


    render(){
        drawAll(this.players);
        drawAll(this.platforms);
        this.camera.draw();
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
                physics.all(this.players[1]);
                this.camera.zoomIn(.5);
                this.camera.moveBetween(this.players[0], this.players[1])
                this.camera.hitMax();
               

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
    ctx.clearRect(-CENTER_WIDTH, -CENTER_HEIGHT, WIDTH, HEIGHT);
    game.stateMachine();
  
}

requestInterval(update, frameRate);
