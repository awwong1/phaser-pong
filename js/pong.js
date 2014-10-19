var game = new Phaser.Game(360, 600, 
                         Phaser.AUTO, 'gameDiv', 
                         { preload: preload, create: create, update: update });

function preload() {

  game.load.atlas('breakout', 'assets/breakout.png', 'assets/breakout.json');
  game.load.image('starfield', 'assets/starfield.jpg');
}

var ball;
var paddle;
var enemyPaddle;
var bricks;

var ballOnPaddle = true;
var ballDirection = 0;

var lives = 3;
var enemyLives = 3;

var livesText;
var enemyLivesText;
var introText;

var s;

function create() {

  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  We check bounds collisions against all walls other than the bottom one
  game.physics.arcade.checkCollision.down = false;
  game.physics.arcade.checkCollision.up = false;

  s = game.add.tileSprite(0, 0, 800, 600, 'starfield');

  paddle = createPaddle(paddle, 500);
  enemyPaddle = createPaddle(enemyPaddle, 100);
  
  ball = game.add.sprite(game.world.centerX, paddle.y - 16, 'breakout', 'ball_1.png');
  ball.anchor.set(0.5);
  ball.checkWorldBounds = true;

  game.physics.enable(ball, Phaser.Physics.ARCADE);

  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  ball.animations.add('spin', [ 'ball_1.png', 'ball_2.png', 'ball_3.png', 'ball_4.png', 'ball_5.png' ], 50, true, false);

  ball.events.onOutOfBounds.add(ballLost, this);

  livesText = game.add.text(0, 0, 'lives: 3', { font: "20px Arial", fill: "#ffffff", align: "left" });
  enemyLivesText = game.add.text(230, 0, 'enemy lives: 3', { font: "20px Arial", fill: "#ffffff", align: "right" });
  introText = game.add.text(game.world.centerX, 400, '- click to start -', { font: "40px Arial", fill: "#ffffff", align: "center" });
  introText.anchor.setTo(0.5, 0.5);

  game.input.onDown.add(releaseBall, this);

}

function update () {

  //  Fun, but a little sea-sick inducing :) Uncomment if you like!
  // s.tilePosition.x += (game.input.speed.x / 2);

  paddle.body.x = game.input.x;
  
  if (paddle.x < 24)
  {
      paddle.x = 24;
  }
  else if (paddle.x > game.width - 24)
  {
      paddle.x = game.width - 24;
  }

  if (ballOnPaddle)
  {
      ball.body.x = paddle.x;
  }
  else
  {
      game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
      game.physics.arcade.collide(ball, enemyPaddle, ballHitPaddle, null, this);
  }
  if (ballOnPaddle === false)
  {
    ballDirection = ball.deltaY;
  }
  // move enemy paddle towards the ball
  game.add.tween(enemyPaddle).to({x:ball.body.x}, 300, Phaser.Easing.Quadratic.Out, true);
  
}

function releaseBall () {

  if (ballOnPaddle)
  {
      ballOnPaddle = false;
      ball.body.velocity.y = -300;
      ball.body.velocity.x = -75;
      ball.animations.play('spin');
      introText.visible = false;
  }

}

function ballLost () {
  
  if (ballDirection > 0)
  { // you lost a point
    lives--;
    livesText.text = 'lives: ' + lives;
  }
  else
  { // you gained a point
    enemyLives--;
    enemyLivesText.text = 'enemy lives: ' + enemyLives;
  }
  if (lives === 0)
  {
    gameOver(false);
  }
  else if (enemyLives === 0)
  {
    gameOver(true)
  }
  else
  {
    ballOnPaddle = true;
    ball.reset(paddle.body.x + 16, paddle.y - 16);
    ball.animations.stop();
  }
}

function gameOver (_playerWin) {

  ball.body.velocity.setTo(0, 0);
  if (_playerWin)
  {
    introText.text = 'Game Over!\nYou Win!';
  }
  else
  {
    introText.text = 'Game Over!\nYou Lose!'; 
  }
  introText.visible = true;

}

function ballHitPaddle (_ball, _paddle) {

  var diff = 0;

  if (_ball.x < _paddle.x)
  {
      //  Ball is on the left-hand side of the paddle
      diff = _paddle.x - _ball.x;
      _ball.body.velocity.x = (-10 * diff);
  }
  else if (_ball.x > _paddle.x)
  {
      //  Ball is on the right-hand side of the paddle
      diff = _ball.x -_paddle.x;
      _ball.body.velocity.x = (10 * diff);
  }
  else
  {
      //  Ball is perfectly in the middle
      //  Add a little random X to stop it bouncing straight up!
      _ball.body.velocity.x = 2 + Math.random() * 8;
  }

}

function createPaddle(_paddle, y_val) {
  _paddle = game.add.sprite(game.world.centerX, y_val, 'breakout', 'paddle_big.png');
  _paddle.anchor.setTo(0.5, 0.5);

  game.physics.enable(_paddle, Phaser.Physics.ARCADE);

  _paddle.body.collideWorldBounds = true;
  _paddle.body.immovable = true;
  
  return _paddle;
}