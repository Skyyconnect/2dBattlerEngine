var canvas = document.getElementById("canvas"),  
ctx = canvas.getContext("2d"),
WIDTH = canvas.width,
HEIGHT = canvas.height,  
frameRate = 1/80, // Seconds
frameDelay = frameRate * 1000, // ms       
loopTimer = false; 
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;


module.exports = {


 request: requestInterval = function (fn, delay) {
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
},

 mouseUp: function myUp(){
  canvas.onmousemove = null;
},

mouseDown:  function myDown(e){
  mouseX = (e.pageX - canvas.offsetLeft);
  mouseY = (e.pageY - canvas.offsetTop);
  //game code 
},
      
constant:  class Constant{   
    constructor(){
        this.drag = 0.47; //0.47
        this.density = 1.22;
        this.gravity = 9.8;       
    }
},


Vector: class Vector { 
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
		if (this.dotProduct(vector, theta) == 0) {  
			return true; 
		} else {
			return false;
		}
	}
  
  flip(){
    if (this.direction == 1){
      this.direction = 3; 
    } else if (this.direction == 3){
      this.direction = 1;
    }else if (this.direction == 2){
      this.direction = 4;
    }else if (this.direction == 4){
      this.direction = 2;
    }
     
  }
    
},




Entity: class Entity{
    constructor(x,y,mass,radius,kx){           
        this.x = x; 
        this.y = y;  
        this.mass = mass; 
        this.radius = radius;  
        this.kx = kx;
        this.velocity = {x:random(5), y:0}
        this.vector = new Vector(this.x, this.y, 0, 1) ;       
        this.area =  Math.PI * this.radius * this.radius / (10000); 
        this.color = random(2);  
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
  
  move(){
    
     this.x += acceleration(this)[0]*frameRate*100;
     this.y += acceleration(this)[1]*frameRate*100;
    
  }
},

random:function random(num){
  return Math.floor(Math.random()*num);
},




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


 boundry:function walls(obj){
    if (obj.y > HEIGHT - obj.radius) { 
        obj.velocity.y *= obj.kx;  
        obj.y = HEIGHT - obj.radius;
      
    }
    else if (obj.x > WIDTH - obj.radius) {
        obj.velocity.x *= obj.kx;
        obj.x = WIDTH - obj.radius;
      
    }
    else if (obj.x < obj.radius) {
        obj.velocity.x *= obj.kx;
        obj.x = obj.radius;
      
    }
 },


drag: function drag(obj){
  let Fx = -0.5 * constant.drag * obj.area * constant.density * obj.velocity.x **3 /  Math.abs(obj.velocity.x),
  Fy = -0.5 * constant.drag * obj.area * constant.density * obj.velocity.y **3 / Math.abs(obj.velocity.y);
  Fx = (isNaN(Fx) ? 0 : Fx);
  Fy = (isNaN(Fy) ? 0 : Fy);
  return [Fx, Fy];
},
   

acceleration: function acceleration(obj){
   let ax = drag(obj)[0] / obj.mass,
   ay = constant.gravity + (drag(obj)[1] / obj.mass);  
   obj.velocity.x += ax*frameRate;
   obj.velocity.y += ay*frameRate;  
   return [obj.velocity.x, obj.velocity.y];                                     
} , 
 


massCollide:function massCollision(a,b){          
  if(collision(a,b)) {                            
    b.velocity.x = (((2*a.mass)/a.mass+b.mass)*b.velocity.x) + (((b.mass-a.mass)/(a.mass+b.mass))*b.velocity.x)*frameRate*100;    
    a.velocity.x = (((2*b.mass)/a.mass+b.mass)*a.velocity.x) + (((a.mass-b.mass)/(a.mass+b.mass))*a.velocity.x)*frameRate*100; 
       
  } 
},




all:  function allPhysics(obj) {
  let Fx = drag(obj)[0],
  Fy = drag(obj)[1];  

  Fx = (isNaN(Fx) ? 0 : Fx);
  Fy = (isNaN(Fy) ? 0 : Fy); 

  obj.x += acceleration(obj)[0]*frameRate*100-Fx;
  obj.y += acceleration(obj)[1]*frameRate*100-Fy;   
  walls(obj);
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
    walls(items[i]); 
   // massCollision(items[i],items[i-1]);      
  }
}
}

var ball = new Entity(0,0,1,10, -.75);
function update(){
  ctx.clearRect(0,0,WIDTH,HEIGHT);
  ball.draw();
  allPhysics(ball);
} 


export const  constant = new Constant(); 
requestInterval(update, frameDelay); 
