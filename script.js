const foods = [];
const buyables = [];

let isNotSaving = false;

const images = {
  Pizza: null,
  Bread: null
};
const prices = {
  Pizza: 100,
  Bread: 200
}
const payout = {
  Pizza: 1,
  Bread: 2
}

const buyingHandler = {
  isBuying: false,
  buying: null
}

let money = 0.0;

const movingTexts = [];
const moneyParticles = [];
let moneyImage;
let lastClickTick = 0;

function preload() {
  images.Pizza = loadImage('Pizza.png', (img) => img.resize(128, 128))
  images.Bread = loadImage('Bread.png', (img) => img.resize(128, 128))
  moneyImage = loadImage('Money.png', (img) => img.resize(64, 64))
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  const loadedFoods = localStorage.getItem("foods");
  if (loadedFoods) {
    let datas = JSON.parse(loadedFoods);
    for (let data of datas) {
      foods.push(new Food(data.x, data.y, data.type, data))
    }
  }
  const loadedMoney = localStorage.getItem("money")
  if (loadedMoney) {
    money = parseFloat(loadedMoney);
  }
  let y = 20;
  for (let type of Object.keys(prices)) {
    buyables.push(new BuyableFood(y, type))
    y += 160;
  }
}

function draw() {
  background(40)

  if (frameRate() < 10) {
    movingTexts.splice(0, movingTexts.length)
    moneyParticles.splice(0, moneyParticles.length)
  }

  fill(30)
  stroke(0)
  strokeWeight(5)
  rect(windowWidth - 160, 10, 150, windowHeight - 20, 10)
  for (let buyable of buyables) {
    buyable.draw()
  }

  for (let food of foods) {
    food.draw()
  }

  for (let i = 0; i < movingTexts.length; i++) {
    let drawable = movingTexts[i];
    drawable.update();
    if (!drawable.doDraw) {
      movingTexts.splice(i, 1);
      i--;
    } else {
      drawable.draw();
    }
  }
  for (let i = 0; i < moneyParticles.length; i++) {
    let drawable = moneyParticles[i];
    drawable.update();
    if (!drawable.doDraw) {
      moneyParticles.splice(i, 1);
      i--;
    } else {
      drawable.draw();
    }
  }

  if (buyingHandler.isBuying) {
    push()
    imageMode(CENTER)
    let b = !(mouseX >= windowWidth - 200 || mouseX <= 0 || mouseY >= windowHeight || mouseY <= 0)
    for (let food of foods) {
      if (dist(food.data.x, food.data.y, mouseX, mouseY) <= 60) {
        b = false;
        break;
      }
    }
    if (b) {
      tint(0, 255, 0, 100)
    } else {
      tint(255, 0, 0, 100)
    }
    image(buyingHandler.buying.image, mouseX, mouseY);
    pop()
  }

  push()
  fill(0)
  strokeWeight(5)
  stroke(255)
  textSize(60)
  textAlign(LEFT, CENTER)
  textFont('AloneOnEarth')
  text('$' + money.toLocaleString('en', {maximumFractionDigits: 2}), 50, 50)
  pop()

  push()
  fill(255, 40)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  textFont('AloneOnEarth')
  text('Click for money!', 300, 50)
  pop()

  saveData()
  lastClickTick++;
}

function saveData() {
  if (isNotSaving) {
    return;
  }
  let datas = [];
  for (let food of foods) {
    datas.push(food.data)
  }
  localStorage.setItem("foods", JSON.stringify(datas));
  localStorage.setItem("money", "" + money);
}

function specialClearData() {
  isNotSaving = true;
  localStorage.removeItem("foods")
  localStorage.removeItem("save")
  localStorage.removeItem("money")
  window.location.reload()
}

function mousePressed() {
  for (let buyable of buyables) {
    if (buyable.isMouseOver()) {
      buyable.buy();

      return;
    }
  }

  if (lastClickTick >= 10) {
    money++;
    movingTexts.push(new MovingText(mouseX, mouseY, mouseX, mouseY - 50, '+1', 0, 40, true, 1))
    lastClickTick = 0;
  }

  for (let i = 0; i < foods.length; i++) {
    let food = foods[i]
    if (dist(food.data.x, food.data.y, mouseX, mouseY) > 60) {
      continue;
    }

    if (keyIsPressed && keyCode === 16) {
      food.deleted = true;
      foods.splice(i, 1);
      i--;
    }
  }
}

function mouseReleased() {
  if (buyingHandler.isBuying) {
    let b = true;
    for (let food of foods) {
      if (dist(food.data.x, food.data.y, mouseX, mouseY) <= 60) {
        b = false;
        break;
      }
    }
    if ((mouseX >= windowWidth - 200 || mouseX <= 0 || mouseY >= windowHeight || mouseY <= 0) || !b) {
      buyingHandler.isBuying = false;
      buyingHandler.buying = null;
      return;
    }
    // handle buy system
    buyingHandler.isBuying = false;
    foods.push(new Food(mouseX, mouseY + 5, buyingHandler.buying.type))
    money -= buyingHandler.buying.price;
    buyingHandler.buying = null;
    saveData()
  }
}

class ManageGUI {
  constructor() {
    this.opened = false;
  }

  draw() {

  }
}

class MovingText {
  constructor(startX, startY, endX, endY, text, color, size = 24, centered = false, speed = 0) {
    this.endX = endX;
    this.endY = endY;
    this.text = text;
    this.x = startX;
    this.y = startY;
    this.doDraw = true;
    this.color = color;
    this.size = size;
    this.centered = centered;
    this.speed = speed;
  }

  update() {
    let d = dist(this.x, this.y, this.endX, this.endY)
    if (d <= 2) {
      this.doDraw = false;
    }

    let vec = createVector(this.x - this.endX, this.y - this.endY);
    vec.normalize();
    this.x -= vec.x * this.speed;
    this.y -= vec.y * this.speed;
  }

  draw() {
    fill(this.color)
    strokeWeight(5)
    stroke(255)
    textSize(this.size)
    textAlign(this.centered ? CENTER : LEFT, CENTER)
    textFont('AloneOnEarth')
    text(this.text, this.x, this.y)
  }
}

class MoneyParticle {
  constructor(startX, startY, endX, endY) {
    this.endX = endX;
    this.endY = endY;
    this.x = startX;
    this.y = startY;
    this.alpha = 255;
    this.doDraw = true;
    this.speed = 2;
    this.rotation = random(-45, 45);
  }

  update() {
    let d = dist(this.x, this.y, this.endX, this.endY)
    if (d <= 2) {
      this.doDraw = false;
    }
    if (this.alpha === 0) {
      this.doDraw = false;
    }

    let vec = createVector(this.x - this.endX, this.y - this.endY);
    vec.normalize();
    this.x -= vec.x * this.speed;
    this.y -= vec.y * this.speed;
    this.alpha -= Math.max(0, this.speed * 2);
  }

  draw() {
    push()
    imageMode(CENTER)
    angleMode(DEGREES)
    translate(this.x, this.y);
    rotate(this.rotation)
    tint(255, this.alpha);
    image(moneyImage, 0, 0);
    pop()
  }
}

class Food {
  constructor(x, y, type, data) {
    this.data = data ? data : {
      speed: 0, // how much time between updates
      type: type,
      x: x,
      y: y
    };
    this.data.x = x;
    this.data.y = y;
    this.image = images[type];
    this.deleted = false;
    //this.price = prices[type];
    setTimeout(() => this.update(), random(500, 1000))
  }

  update() {
    if (this.deleted) {
      return;
    }
    money += payout[this.data.type]
    movingTexts.push(new MovingText(this.data.x, this.data.y, this.data.x, this.data.y - 50, '+' + payout[this.data.type], 0, 40, true, 1))
    if (Math.random() > 0.8) {
      moneyParticles.push(new MoneyParticle(this.data.x, this.data.y, this.data.x, this.data.y + 150))
      money += random(0.1, 3)
    }

    setTimeout(() => this.update(), 1000 - this.data.speed + random(-50, 50))
  }

  draw() {
    //console.log(this)
    imageMode(CENTER)
    image(this.image, this.data.x, this.data.y)
  }
}

class BuyableFood {
  constructor(y, type) {
    this.y = y;
    this.image = images[type];
    this.price = prices[type];
    this.type = type;
  }

  buy() {
    if (buyingHandler.isBuying) {
      return;
    }
    if (money < this.price) {
      return;
    }

    buyingHandler.isBuying = true;
    buyingHandler.buying = this;
  }

  isMouseOver() {
    return dist(mouseX, mouseY, windowWidth - 150 + 64, this.y + 64) <= 60;
  }

  draw() {
    imageMode(CORNER)
    image(this.image, windowWidth - 150, this.y)
    fill(0)
    strokeWeight(5)
    stroke(255)
    textSize(24)
    textAlign(CENTER, CENTER)
    textFont('AloneOnEarth')
    text('$' + this.price, windowWidth - 85, this.y + 140)
  }
}