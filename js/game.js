const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            // Add arcade physics settings if needed
        }
    },
    scene: {
        preload: preload,
        create: createGameScene,
        update: updateGameScene
    }
};

// Rest of the code...

const game = new Phaser.Game(config);
let player;
let cursors;
let score = 0;
let laserTimer;
let rockTimer;
let health = 100;
let healthBar;
let rocks;
let lasers;
let healthItems;
let healthItemsTimer;
let pauseScreen;
let startButton;
let backgroundMusic;
let rockSound;
let hitSound;
let healthSound;

function preload() {
    this.load.image('player', 'assets/player.png');
    this.load.image('sky', 'assets/sky.png');  // load the 'sky' image
    this.load.image('title', 'assets/title.png');  // load the 'title' image
    this.load.image('rock1', 'assets/rock1.png'); // load the 'rock' image
    this.load.image('rock2', 'assets/rock2.png'); // load the 'rock' image
    this.load.image('rock3', 'assets/rock3.png'); // load the 'rock' image
    this.load.image('laser', 'assets/laser.png'); // load the 'laser' image
    this.load.image('health', 'assets/health.png'); // load the 'health' image
    this.load.audio('backgroundMusic', 'assets/spacerwmnloop.mp3');
    this.load.audio('rockSound', 'assets/rock.mp3');
    this.load.audio('hitSound', 'assets/hit.mp3');
    this.load.audio('healthSound', 'assets/health.mp3');
}

function createGameScene() {

    let sky = this.add.image(config.width / 2, config.height / 2, 'sky');
    // Scale the 'sky' image to fit the size of the game
    let scaleX = config.width / sky.width;
    let scaleY = config.height / sky.height;
    let scale = Math.max(scaleX, scaleY);
    sky.setScale(scale).setScrollFactor(0);
    player = this.physics.add.sprite(400, 500, 'player');
    player.setScale(0.1);
    player.setCollideWorldBounds(true);
    player.setImmovable(true); // prevent the player from being moved by the rocks
    cursors = this.input.keyboard.createCursorKeys();

    let newImage = this.add.image(config.width / 2, config.height / 2, 'title');
    newImage.setScale(scale).setScrollFactor(0);
    newImage.setScrollFactor(0);
    newImage.setInteractive();
    newImage.on('pointerdown', () => {
        
    newImage.visible = false;
    this.physics.resume();
    this.input.keyboard.enabled = true; // Enable arrow keys
    // Create the rocks, lasers, and health items
    backgroundMusic = this.sound.add('backgroundMusic');
    backgroundMusic.play({ loop: true });
    
    rocks = this.physics.add.group();
    rockTimer = this.time.addEvent({
        delay: 1000,
        callback: function() {
            let rockImage = 'rock' + Phaser.Math.Between(1, 3);
            let rock = rocks.create(Phaser.Math.Between(0, config.width), 0, rockImage);
            rock.setScale(0.05);
            rock.setVelocityY(200);
        },
        callbackScope: this,
        loop: true,
    });

    lasers = this.physics.add.group();
    laserTimer = this.time.addEvent({
        delay: 1000,
        callback: function() {
            let laser = lasers.create(Phaser.Math.Between(0, config.width), 0, 'laser');
            laser.setScale(0.15);
            let velocity = Math.min(200 + score * 10, 600);
            laser.setVelocityY(velocity);
        },
        callbackScope: this,
        loop: true,
    });

    healthItems = this.physics.add.group();
    healthItemsTimer = this.time.addEvent({
        delay: 10000,
        callback: function() {
            let healthItem = healthItems.create(Phaser.Math.Between(0, config.width), 0, 'health');
            healthItem.setScale(0.15);
            healthItem.setVelocityY(200);
        },
        callbackScope: this,
        loop: true,
    });
    this.physics.add.collider(player, rocks, increaseScore, null, this);
    this.physics.add.collider(player, lasers, decreaseHealth, null, this);
    this.physics.add.collider(player, healthItems, increaseHealth, null, this);
    document.fonts.load('30pt "Genos"').then(() => {
        // The font is loaded, now you can use it in your game
        scoreText = this.add.text(10, 10, 'Rocks: 0', { fontSize: '32px', fill: '#fff', fontFamily: 'Genos' });
        scoreText.setScrollFactor(0);
    });


healthBar = this.add.graphics();
healthBar.fillStyle(0x00ff00); // green color
healthBar.fillRect(10, 50, health, 20); // initial 
});

    
        // Create a text object to display the score
   

    // Add a collider between the player and the rocks


    pauseScreen = this.add.graphics();
    pauseScreen.fillStyle(0x000000, 0.7); // black color with 50% opacity
    pauseScreen.fillRect(0, 0, config.width, config.height);
    pauseScreen.setScrollFactor(0);
    pauseScreen.visible = false;    

    document.fonts.load('30pt "Genos"').then(() => {
    restartButton = this.add.text(config.width / 2, config.height / 2 + 70, 'Retry', { fontSize: '32px', fill: '#00ff00', fontFamily: 'Genos' })
        .setOrigin(0.5);
    restartButton.setScrollFactor(0);
    restartButton.setInteractive();
    restartButton.visible = false;
    restartButton.on('pointerdown', () => {
        // Restart the game
        this.scene.restart();
        location.reload();
    });
});

}

function increaseScore(player, rock) {
    // Increase the score by 1
    score++;
    // Update the score text
    scoreText.setText('Rocks: ' + score);
    // Remove the rock
    rock.disableBody(true, true);
    if (laserTimer.delay > 400) { // don't let the delay go below 200
        laserTimer.delay -= 20;
    }

    player.setTint(0x808080);
    player.alpha = 0.8;

    // Set a timer to stop the blinking effect after a certain duration
    this.time.addEvent({
        delay: 200, // duration of the blinking effect in milliseconds
        callback: function() {
            player.clearTint();
            player.alpha = 1;
        },
        callbackScope: this,
        loop: false
    });

    rockSound = this.sound.add('rockSound');
    rockSound.play();
}

function decreaseHealth(player, laser) {
    // Decrease health by 10
    health -= 10;

    // Remove the laser
    laser.disableBody(true, true);

    // Update the health bar
    updateHealthBar();

    // Make the player blink red
    player.setTint(0xff0000);
    player.alpha = 0.8;

    // Set a timer to stop the blinking effect after a certain duration
    this.time.addEvent({
        delay: 200, // duration of the blinking effect in milliseconds
        callback: function() {
            player.clearTint();
            player.alpha = 1;
        },
        callbackScope: this,
        loop: false
    });

    if (health <= 0) {
        // Game over logic
        // Stop the game
        scoreText.setText('');
        lasers.clear(true, true);
        laserTimer.remove(false);
        healthItems.clear(true, true);
        healthItemsTimer.remove(false);
        rocks.clear(true, true);
        rockTimer.remove(false);
        this.physics.pause();
        pauseScreen.visible = true;
        restartButton.visible = true;
        // Show the final score
        document.fonts.load('30pt "Genos"').then(() => {

        this.add.text(config.width / 2, config.height / 2, 'Game Over\n' + score + ' Rocks Collected!', { fontSize: '32px', fill: '#fff', fontFamily: 'Genos', align: 'center'})
            .setOrigin(0.5);
        });
    }
    hitSound = this.sound.add('hitSound');
    hitSound.play();
}


function increaseHealth(player, healthItem) {
    // Increase health by 10
    health += 10;
    // Update the health text
    // Remove the health item
    healthItem.disableBody(true, true);
    updateHealthBar();

    player.setTint(0x00ff00);
    player.alpha = 0.8;

    // Set a timer to stop the blinking effect after a certain duration
    this.time.addEvent({
        delay: 200, // duration of the blinking effect in milliseconds
        callback: function() {
            player.clearTint();
            player.alpha = 1;
        },
        callbackScope: this,
        loop: false
    });
    healthSound = this.sound.add('healthSound');
    healthSound.play();
}

function updateHealthBar() {
    // Clear the previous health bar
    healthBar.clear();

    // Determine the color based on the health value
    let color;
    if (health > 70) {
        color = 0x00ff00; // green
    } else if (health > 30) {
        color = 0xffff00; // yellow
    } else {
        color = 0xff0000; // red
    }

    // Draw the health bar with the appropriate color
    healthBar.fillStyle(color);
    healthBar.fillRect(10, 50, health, 20); // adjust size and position as needed
}



function updateGameScene() {
    if (!this.physics.world.isPaused) {
        if (cursors.left.isDown) {
            player.setVelocityX(-600);
            player.setFlipX(false); // flip the sprite to the right
        } else if (cursors.right.isDown) {
            player.setVelocityX(600);
            player.setFlipX(true); // flip the sprite to the left
        } else {
            player.setVelocityX(0);
        }
    }
}
