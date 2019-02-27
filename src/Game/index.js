// Import outside libraries
const Phaser = require('phaser');
const Player = require('./Player');
const Bullet = require('./Bullet');
// Local Modules
const SerialPortReader = require('./SerialPortReader');

let shoot;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
};

let graphics;
let keys;

const p1 = new Player(config.width / 2, config.height / 2);

const bullets = [];
for (let i = 0; i < 20; i ++) {
  bullets.push(new Bullet());
}

const serial = new SerialPortReader();

// Phaser setup
function create() {
  keys = {
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
    space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  graphics = this.add.graphics({
    fillStyle: { color: 0xeeeeee },
    lineStyle: { width: 3, color: 0xeeeeee }
  });
}

function update(totalTime, deltaTime) {
  p1.update(deltaTime, keys);

  // Keep player on screen
  if (p1.x > config.width + 15) {
    p1.setX(0);
  }

  if (p1.x < -5) {
    p1.setX(config.width - 15);
  }

  if (p1.y > config.height + 15) {
    p1.setY(0);
  }

  if (p1.y < -5) {
    p1.setY(config.height - 15);
  }

  if(shoot == 's'){
    const newBullet = bullets.find(b => !b.isActive);
    if (newBullet) newBullet.activate(p1.x, p1.y, p1.cannonRot);
  }
  bullets.forEach(b => b.update(deltaTime));

  graphics.clear();
  p1.draw(graphics);
  bullets.forEach(b => b.draw(graphics));
}

function onSerialMessage(msg) {
  // Put your serial reading code in here. msg will be a string
  // console.log(msg.split(':'));
  let vars = msg.split(':');
  shoot =  vars[0];

}


config.scene = {
  create: create,
  update: update
}

let game;
  
// Exported Module so game can be initialized elseware
const GameManager = {
  init: () => {
    // Set serial port listener. To keep the code clean we use a helper function defined above
    serial.setListener(onSerialMessage);
    // The openPort function takes a callback function for finding the correct arduino from a list
    // and whatever you want your delimiter to be between packets
    serial.openPort(p => /Arduino/.test(p.manufacturer), '-');
    
    game = new Phaser.Game(config);
  },
};

module.exports = GameManager;
