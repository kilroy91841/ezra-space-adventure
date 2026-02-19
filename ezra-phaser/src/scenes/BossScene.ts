// src/scenes/BossScene.ts
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, NORMAL_SPEED, SHOOT_RATE,
  MAX_HEALTH, INVULNERABLE_DURATION, RESPAWN_INVULNERABLE,
} from '../config/constants';
import { DIMENSION_ORDER } from '../config/dimensions';
import { DimensionDef, GameData } from '../config/types';
import { Player } from '../entities/Player';
import { Boss } from '../entities/Boss';
import { AlienBoss } from '../entities/AlienBoss';
import { DragonBoss } from '../entities/DragonBoss';
import { MiniDragonBoss } from '../entities/MiniDragonBoss';
import { IceShooter } from '../weapons/IceShooter';
import { FireShooter } from '../weapons/FireShooter';
import { GiantSword } from '../weapons/GiantSword';
import { BigBomb } from '../weapons/BigBomb';
import { Weapon } from '../weapons/Weapon';

export class BossScene extends Phaser.Scene {
  private player1!: Player;
  private player2?: Player;
  private gameData!: GameData;
  private boss!: Boss;
  private dimensionDef!: DimensionDef;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<string, Phaser.Input.Keyboard.Key>;
  private shootKey!: Phaser.Input.Keyboard.Key;
  private tabKey!: Phaser.Input.Keyboard.Key;

  private bossProjectiles!: Phaser.Physics.Arcade.Group;
  private p1Weapons: Weapon[] = [];
  private p2Weapons: Weapon[] = [];
  private lastShotTime: number = 0;

  private invulnerableUntil: number = 0;
  private shieldUntil: number = 0;

  private bossEntryComplete: boolean = false;
  private victoryTriggered: boolean = false;
  private allyTriggered: boolean = false;

  private bossNameText?: Phaser.GameObjects.Text;
  private victoryText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BossScene' });
  }

  init(data: { dimensionIndex: number }): void {
    const dim = DIMENSION_ORDER[data.dimensionIndex];
    if (dim) {
      this.dimensionDef = dim;
    }
  }

  create(): void {
    this.gameData = this.registry.get('gameData') as GameData;
    this.cameras.main.setBackgroundColor('#1a0a2e');

    // Reset state
    this.bossEntryComplete = false;
    this.victoryTriggered = false;
    this.allyTriggered = false;
    this.lastShotTime = 0;

    // Create players
    this.player1 = new Player(this, GAME_WIDTH / 2, GAME_HEIGHT - 100, this.gameData.character1);
    this.p1Weapons = [
      new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
    ];
    this.player1.weapon = this.p1Weapons[0];
    this.player1.inventory = this.p1Weapons;

    if (this.gameData.playerCount === 2 && this.gameData.character2) {
      this.player2 = new Player(this, GAME_WIDTH / 2 + 60, GAME_HEIGHT - 70, this.gameData.character2, true);
      this.p2Weapons = [
        new IceShooter(this), new FireShooter(this), new GiantSword(this), new BigBomb(this),
      ];
      this.player2.weapon = this.p2Weapons[0];
      this.player2.inventory = this.p2Weapons;
    }

    // Create boss based on type
    this.boss = this.createBoss();

    // Boss projectile group
    this.bossProjectiles = this.physics.add.group();

    // Input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = this.input.keyboard!.addKeys('W,A,S,D') as Record<string, Phaser.Input.Keyboard.Key>;
    this.shootKey = this.input.keyboard!.addKey('SPACE');
    this.tabKey = this.input.keyboard!.addKey('TAB');

    // Weapon switching
    this.input.keyboard!.on('keydown-ONE', () => this.switchWeapon(1, 0));
    this.input.keyboard!.on('keydown-TWO', () => this.switchWeapon(1, 1));
    this.input.keyboard!.on('keydown-THREE', () => this.switchWeapon(1, 2));
    this.input.keyboard!.on('keydown-FOUR', () => this.switchWeapon(1, 3));
    this.input.keyboard!.on('keydown-Q', () => this.switchWeapon(2, 0));
    this.input.keyboard!.on('keydown-E', () => this.switchWeapon(2, 1));
    this.input.keyboard!.on('keydown-R', () => this.switchWeapon(2, 2));
    this.input.keyboard!.on('keydown-T', () => this.switchWeapon(2, 3));

    // Collisions
    this.setupCollisions();

    // Boss name label
    this.bossNameText = this.add.text(GAME_WIDTH / 2, 20, this.boss.bossName, {
      fontSize: '24px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.events.emit('sceneReady', { sceneName: 'BossScene' });
  }

  private createBoss(): Boss {
    const bossType = this.dimensionDef?.bossType ?? 'alien';
    const startX = GAME_WIDTH / 2;
    const startY = -100; // Start above screen

    switch (bossType) {
      case 'alien':
        return new AlienBoss(this, startX, startY);
      case 'dragon':
        return new DragonBoss(this, startX, startY);
      case 'minidragon':
        return new MiniDragonBoss(this, startX, startY);
      default:
        return new AlienBoss(this, startX, startY);
    }
  }

  private setupCollisions(): void {
    const players = [this.player1, this.player2].filter(Boolean) as Player[];

    // Player bullets vs boss
    this.p1Weapons.forEach(w => {
      this.physics.add.overlap(w.getBulletGroup(), this.boss, (bullet) => {
        this.hitBoss(bullet as Phaser.Physics.Arcade.Sprite, w);
      });
    });

    if (this.p2Weapons.length > 0) {
      this.p2Weapons.forEach(w => {
        this.physics.add.overlap(w.getBulletGroup(), this.boss, (bullet) => {
          this.hitBoss(bullet as Phaser.Physics.Arcade.Sprite, w);
        });
      });
    }

    // Boss projectiles vs players
    players.forEach(p => {
      this.physics.add.overlap(p, this.bossProjectiles, (_player, proj) => {
        this.playerHitByBossProjectile(p, proj as Phaser.Physics.Arcade.Sprite);
      });
    });
  }

  private hitBoss(bullet: Phaser.Physics.Arcade.Sprite, weapon: Weapon): void {
    if (this.victoryTriggered) return;
    if (this.boss instanceof AlienBoss && this.boss.isAlly) return;

    const damage = bullet.getData('damage') as number ?? weapon.damage;
    const hit = this.boss.takeDamage(damage);
    bullet.destroy();

    if (hit) {
      this.gameData.score += 10;
      this.cameras.main.shake(80, 0.003);
    }
  }

  private playerHitByBossProjectile(player: Player, proj: Phaser.Physics.Arcade.Sprite): void {
    // Don't take damage from ally projectiles
    if (proj.getData('isAllyProjectile')) return;

    if (this.time.now < this.invulnerableUntil) return;
    if (this.time.now < this.shieldUntil) return;

    const damage = proj.getData('damage') as number ?? 15;
    this.gameData.health -= damage;
    this.invulnerableUntil = this.time.now + INVULNERABLE_DURATION;
    proj.destroy();
    this.cameras.main.shake(100, 0.01);

    if (this.gameData.health <= 0) this.handleDeath();
  }

  update(time: number, delta: number): void {
    if (this.victoryTriggered) {
      this.registry.set('gameData', this.gameData);
      return;
    }

    // Player 1 movement
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown) vx = -this.player1.playerSpeed;
    if (this.cursors.right.isDown) vx = this.player1.playerSpeed;
    if (this.cursors.up.isDown) vy = -this.player1.playerSpeed;
    if (this.cursors.down.isDown) vy = this.player1.playerSpeed;
    this.player1.setVelocity(vx, vy);

    // Player 1 shooting
    let shootDirX = 0, shootDirY = 0;
    let shouldShoot = false;
    if (this.shootKey.isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['W']!.isDown) { shouldShoot = true; shootDirY = -1; }
    if (this.wasd['S']!.isDown) { shouldShoot = true; shootDirY = 1; }
    if (this.wasd['A']!.isDown) { shouldShoot = true; shootDirX = -1; }
    if (this.wasd['D']!.isDown) { shouldShoot = true; shootDirX = 1; }

    if (shouldShoot && time > this.lastShotTime + SHOOT_RATE && this.player1.weapon) {
      this.player1.weapon.fire(this.player1, shootDirX, shootDirY);
      this.lastShotTime = time;
    }

    // Player 2 follow + shoot
    if (this.player2) {
      const dx = this.player1.x - this.player2.x;
      const dy = this.player1.y - this.player2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 70) {
        this.physics.moveToObject(this.player2, this.player1, this.player2.playerSpeed);
      } else {
        this.player2.setVelocity(this.player1.body!.velocity.x, this.player1.body!.velocity.y);
      }

      if (this.tabKey.isDown && time > this.lastShotTime + SHOOT_RATE && this.player2.weapon) {
        // Aim at boss
        const edx = this.boss.x - this.player2.x;
        const edy = this.boss.y - this.player2.y;
        const elen = Math.sqrt(edx * edx + edy * edy);
        let p2dx = 0, p2dy = -1;
        if (elen > 0) {
          p2dx = edx / elen;
          p2dy = edy / elen;
        }
        this.player2.weapon.fire(this.player2, p2dx, p2dy);
        this.lastShotTime = time;
      }
    }

    // Invulnerability visual
    const isInvulnerable = time < this.invulnerableUntil;
    if (isInvulnerable) {
      this.player1.setAlpha(Math.floor(time / 80) % 2 === 0 ? 1 : 0.3);
      if (this.player2) this.player2.setAlpha(this.player1.alpha);
    } else {
      this.player1.setAlpha(1);
      if (this.player2) this.player2.setAlpha(1);
    }

    // Boss entry animation
    if (!this.bossEntryComplete) {
      if (this.boss.y < 80) {
        this.boss.setVelocity(0, 120);
      } else {
        this.boss.setVelocity(0, 0);
        this.bossEntryComplete = true;
      }
      this.registry.set('gameData', this.gameData);
      return;
    }

    // Boss update
    this.boss.updateBoss(time, delta, this.player1);

    // Boss shooting
    const projectiles = this.boss.shoot();
    for (const proj of projectiles) {
      // Add enemy projectiles to group, but not ally ones
      if (!proj.getData('isAllyProjectile')) {
        this.bossProjectiles.add(proj);
      }
    }

    // Check boss defeat
    if (this.boss instanceof AlienBoss) {
      if (this.boss.defeated && !this.allyTriggered) {
        this.allyTriggered = true;
        this.boss.becomeAlly();
        this.showVictory();
      }
    } else if (this.boss.defeated && !this.victoryTriggered) {
      this.showVictory();
    }

    // Clean up off-screen projectiles
    this.bossProjectiles.getChildren().forEach(child => {
      const proj = child as Phaser.Physics.Arcade.Sprite;
      if (proj.y > GAME_HEIGHT + 50 || proj.y < -50 || proj.x < -50 || proj.x > GAME_WIDTH + 50) {
        proj.destroy();
      }
    });

    this.registry.set('gameData', this.gameData);
  }

  private showVictory(): void {
    this.victoryTriggered = true;

    // Drop 3 power-ups in a circle around where boss was
    const cx = this.boss.x;
    const cy = this.boss.y;
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const px = cx + Math.cos(angle) * 60;
      const py = cy + Math.sin(angle) * 60;
      const powerup = this.physics.add.sprite(px, py, 'powerup_star');
      powerup.setData('type', 'regular');

      // Collect on overlap with player
      const players = [this.player1, this.player2].filter(Boolean) as Player[];
      players.forEach(p => {
        this.physics.add.overlap(p, powerup, () => {
          p.addPowerup();
          this.gameData.score += 100;
          powerup.destroy();
        });
      });
    }

    // "VICTORY!" text
    this.victoryText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50, 'VICTORY!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Animate it
    this.tweens.add({
      targets: this.victoryText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 500,
      yoyo: true,
      repeat: 2,
    });

    // Score bonus
    this.gameData.score += 500;

    // Countdown to next dimension
    let countdown = 3;
    const countdownText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, `Next dimension in ${countdown}...`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        countdown--;
        if (countdown > 0) {
          countdownText.setText(`Next dimension in ${countdown}...`);
        } else {
          countdownText.setText('Go!');
          this.advanceToNextDimension();
        }
      },
    });
  }

  private advanceToNextDimension(): void {
    this.gameData.currentDimension++;
    this.registry.set('gameData', this.gameData);

    const nextDim = DIMENSION_ORDER[this.gameData.currentDimension];
    if (nextDim) {
      this.cameras.main.fade(500, 0, 0, 0, false, (_cam: unknown, progress: number) => {
        if (progress === 1) {
          this.scene.start(nextDim.sceneKey, { dimensionIndex: this.gameData.currentDimension });
        }
      });
    } else {
      this.scene.start('VictoryScene');
    }
  }

  private handleDeath(): void {
    this.gameData.lives--;
    if (this.gameData.lives <= 0) {
      this.scene.stop('HUDScene');
      this.scene.start('PlayerCountScene');
    } else {
      this.gameData.health = MAX_HEALTH;
      this.player1.setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 100);
      if (this.player2) this.player2.setPosition(GAME_WIDTH / 2 + 60, GAME_HEIGHT - 70);
      this.invulnerableUntil = this.time.now + RESPAWN_INVULNERABLE;
    }
  }

  private switchWeapon(playerNum: 1 | 2, index: number): void {
    if (playerNum === 1 && index < this.p1Weapons.length) {
      this.player1.weapon = this.p1Weapons[index];
    } else if (playerNum === 2 && this.player2 && index < this.p2Weapons.length) {
      this.player2.weapon = this.p2Weapons[index];
    }
  }
}
