const foods = [];
const buyables = [];

let isNotSaving = false;

const images = {
  Pizza: null,
  Bread: null,
  Chicken: null,
  Sandwich: null,
  Salad: null,
  Pasta: null,
  Hamburger: null,
  Soup: null,
  Oatmeal: null,
  Fish: null,
  Potato: null,
  Apple: null,
  EnchantedApple: null,
  ChugJug: null,
  PBJ: null,
  Dino: null
};
const prices = {
  Pizza: 100,
  Bread: 200,
  Chicken: 300,
  Sandwich: 500,
  Salad: 1_000,
  Pasta: 5_000,
  Hamburger: 7_500,
  Soup: 10_000,
  Oatmeal: 100_000,
  Fish: 1_000_000,
  Potato: 100_000_000,
  Apple: 1_000_000_000_000,
  EnchantedApple: 1_000_000_000_000_000,
  ChugJug: 1_000_000_000_000_000_000_000,
  PBJ: 1_000_000_000_000_000_000_000_000_000_000_000,
  Dino: 1e96
}
const payout = {
  Pizza: 1,
  Bread: 2,
  Chicken: 3,
  Sandwich: 5,
  Salad: 10,
  Pasta: 50,
  Hamburger: 75,
  Soup: 100,
  Oatmeal: 1_000,
  Fish: 10_000,
  Potato: 1_000_000,
  Apple: 10_000_000_000,
  EnchantedApple: 10_000_000_000_000,
  ChugJug: 10_000_000_000_000_000_000,
  PBJ: 10_000_000_000_000_000_000_000_000_000_000,
  Dino: 69
}

const buyingHandler = {
  isBuying: false,
  buying: null
}

const movingHandler = {
  isMoving: false,
  moving: null,
  start: Date.now()
}

let money = 100.0;
let multiplier = 1.0;
let clickPower = 1;

let sidebarY = 0;
let maxSidebarY = 0;

const movingTexts = [];
const moneyParticles = [];
let moneyImage;
let lastClickTick = 0;

let lastMoney = money;
let lastDifference = money - lastMoney;

function preload() {
  // images.Pizza = loadImage('img/Pizza.png', (img) => img.resize(128, 128))
  // images.Bread = loadImage('img/Bread.png', (img) => img.resize(128, 128))
  // images.Sandwich = loadImage('img/Sandwich.png', (img) => img.resize(128, 128))
  // images.Salad = loadImage('img/Salad.png', (img) => img.resize(128, 128))
  for (let image of Object.keys(images)) {
    images[image] = loadImage('img/' + image + ".png") // (img) => img.resize(128, 128)
  }
  moneyImage = loadImage('img/Money.png', (img) => img.resize(64, 64))
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
  const loadedMultiplier = localStorage.getItem("multiplier")
  if (loadedMultiplier) {
    multiplier = parseFloat(loadedMultiplier)
  }
  const loadedPower = localStorage.getItem("click")
  if (loadedPower) {
    clickPower = parseInt(loadedPower)
  }
  let y = 20;
  for (let type of Object.keys(prices)) {
    buyables.push(new BuyableFood(y, type))
    y += 160;
  }
  maxSidebarY = 160 * (buyables.length - 4);
  updateLastMoney()
  lastMoney = money;
  updateFoods()
}

function updateFoods() {
  for (let food of foods) {
    food.update()
  }

  shuffleArr(movingTexts)
  setTimeout(updateFoods, 1000)
}

function draw() {
  background(40)

  if (frameRate() < 20) {
    movingTexts.splice(0, movingTexts.length)
    moneyParticles.splice(0, moneyParticles.length)
  }

  fill(30)
  stroke(0)
  strokeWeight(5)
  rect(windowWidth - 160, -10, 170, windowHeight + 20, 10)
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
    } else if (i < 100) {
      drawable.draw();
    }
  }
  for (let i = 0; i < moneyParticles.length; i++) {
    let drawable = moneyParticles[i];
    drawable.update();
    if (!drawable.doDraw) {
      moneyParticles.splice(i, 1);
      i--;
    } else if (i < 100) {
      drawable.draw();
    }
  }

  if (buyingHandler.isBuying) {
    push()
    imageMode(CENTER)
    let b = !(mouseX >= windowWidth - 200 || mouseX <= 32 || mouseY >= windowHeight - 32 || mouseY <= 32)
    for (let food of foods) {
      if (dist(food.data.x, food.data.y, mouseX, mouseY) <= 80) {
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
  text('$' + formatMoney(money), 50, 50)
  textSize(32)
  let amt = calculateMoneyPerSecond()
  let pAmt = parseFloat(amt)
  fill(pAmt >= 0 ? [0, 255, 0] : [255, 0, 0])
  stroke(0)
  text((pAmt > 0 ? ("+" + amt) : amt) + " $/sec", 50, 100)
  fill(0)
  stroke(255)
  text('X: ' + formatMoney(multiplier), 50, 150)
  pop()

  push()
  fill(255, 80)
  noStroke()
  textSize(32)
  textAlign(LEFT, CENTER)
  textFont('AloneOnEarth')
  text('Click for money! \nScroll list of food!', 350, 50)
  pop()

  saveData()
  lastClickTick++;

  push()

  fill(0)
  strokeWeight(5)
  stroke(255)
  textSize(24)
  textAlign(LEFT, CENTER)
  textFont('AloneOnEarth')
  let nextCost = ((multiplier + 1) * 1000000)
  let txt = 'Rebirth: $' + formatMoney(nextCost)

  if (nextCost <= money) {
    fill(0, 255, 0, 100)
  } else {
    fill(255, 0, 0, 100)
  }
  rect(10, windowHeight - 70, 40 + textWidth(txt), 60, 5)
  fill(0)
  text(txt, 30, windowHeight - 38)
  nextCost = clickPower * 1000 * (keyIsPressed && keyCode === 16 ? 100 : 1)
  txt = 'Click Power: $' + formatMoney(nextCost)
  if (nextCost <= money) {
    fill(0, 255, 0, 100)
  } else {
    fill(255, 0, 0, 100)
  }
  rect(10, windowHeight - 170, 40 + textWidth(txt), 60, 5)
  fill(0)
  text(txt, 30, windowHeight - 138)

  pop()

  if (movingHandler.isMoving && Date.now() - movingHandler.start > 100) {
    movingHandler.moving.data.x = mouseX
    movingHandler.moving.data.y = mouseY
  }
}

function mouseWheel(event) {
  if (mouseX <= windowWidth && mouseX >= windowWidth - 160) {
    sidebarY = Math.max(0, Math.min(maxSidebarY, sidebarY + event.delta))
  }
}

function updateLastMoney() {
  lastDifference = money - lastMoney;
  lastMoney = money;

  setTimeout(updateLastMoney, 1000)
}

function calculateMoneyPerSecond() {
  return formatMoney(lastDifference)
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
  localStorage.setItem("multiplier", multiplier);
  localStorage.setItem("click", clickPower);
}

function specialClearData() {
  isNotSaving = true;
  localStorage.removeItem("foods")
  localStorage.removeItem("multiplier")
  localStorage.removeItem("money")
  window.location.reload()
}

function keyPressed() {
  if (keyCode === 32) {
    let toAdd = multiplier * clickPower
    money += toAdd;
    movingTexts.push(new MovingText(mouseX, mouseY, mouseX, mouseY - 50, '+' + formatMoney(toAdd), [0, 255, 0], 40, true, 1))
    lastClickTick = 0;
  }
}

function mousePressed() {
  for (let buyable of buyables) {
    if (buyable.isMouseOver()) {
      buyable.buy();

      return;
    }
  }

  let nextCost = ((multiplier + 1) * 1000000)
  let width = textWidth('Rebirth: $' + formatMoney(nextCost))
  if (isMouseOverRect(10, windowHeight - 70, 40 + width, 60) && nextCost <= money) {
    multiplier += ((money - nextCost + 1) / 10);
    //money -= nextCost;
    money = 100;
    clickPower = 1;
    sidebarY = 0;
    for (let food of foods) {
      food.deleted = true;
    }
    foods.splice(0, foods.length);

    return;
  }

  nextCost = (clickPower * 1000 * (keyIsPressed && keyCode === 16 ? 100 : 1))
  width = textWidth('Click Power: $' + formatMoney(nextCost))
  if (isMouseOverRect(10, windowHeight - 170, 40 + width, 60) && nextCost <= money) {
    clickPower++;
    if (keyIsPressed && keyCode === 16) {
      clickPower += 99
    }
    money -= nextCost;

    return;
  }

  if (!movingHandler.isMoving && !buyingHandler.isBuying) {
    for (let i = 0; i < foods.length; i++) {
      let food = foods[i]
      if (dist(food.data.x, food.data.y, mouseX, mouseY) > 60) {
        continue;
      }

      movingHandler.isMoving = true;
      movingHandler.moving = food;
      movingHandler.moving.isMoving = true;
      movingHandler.moving.previous = { x: food.data.x, y: food.data.y }
      movingHandler.start = Date.now()

      return;
    }
  }

  if (lastClickTick >= 10) {
    let toAdd = multiplier * clickPower
    money += toAdd;
    movingTexts.push(new MovingText(mouseX, mouseY, mouseX, mouseY - 50, '+' + formatMoney(toAdd), [0, 255, 0], 40, true, 1))
    lastClickTick = 0;
  }
}

function mouseReleased() {
  if (movingHandler.isMoving) {
    let b = true;
    if (Date.now() - movingHandler.start < 100) {
      b = false;
    }
    for (let food of foods) {
      if (food !== movingHandler.moving && dist(food.data.x, food.data.y, mouseX, mouseY) <= 80) {
        b = false;
        break;
      }
    }
    if ((mouseX >= windowWidth - 200 || mouseX <= 32 || mouseY >= windowHeight - 32 || mouseY <= 32)) {
      for (let i = 0; i < foods.length; i++) {
        if (foods[i] === movingHandler.moving) {
          foods.splice(i, 1)
          break;
        }
      }
      movingHandler.moving.deleted = true;
      let amt = (prices[movingHandler.moving.data.type] / 2)
      money += amt
      movingTexts.push(new MovingText(mouseX, mouseY, mouseX, mouseY - 50, '+' + formatMoney(amt), [0, 255, 0], 40, true, 1))
    }
    if (!b) {
      let prevL = movingHandler.moving.previous
      movingHandler.moving.data.x = prevL.x
      movingHandler.moving.data.y = prevL.y
    }
    movingHandler.isMoving = false;
    movingHandler.moving.isMoving = false;
    movingHandler.moving = null;

    return;
  }
  if (buyingHandler.isBuying) {
    let b = true;
    for (let food of foods) {
      if (dist(food.data.x, food.data.y, mouseX, mouseY) <= 80) {
        b = false;
        break;
      }
    }
    if ((mouseX >= windowWidth - 200 || mouseX <= 32 || mouseY >= windowHeight - 32 || mouseY <= 32) || !b) {
      buyingHandler.isBuying = false;
      buyingHandler.buying = null;
      return;
    }
    // handle buy system
    buyingHandler.isBuying = false;
    foods.push(new Food(mouseX, mouseY + 5, buyingHandler.buying.type))
    movingTexts.push(new MovingText(mouseX, mouseY, mouseX, mouseY + 50, '-' + formatMoney(buyingHandler.buying.price), [255, 0, 0], 40, true, 1))
    money -= buyingHandler.buying.price;
    buyingHandler.buying = null;
    saveData()
  }
}

function isMouseOverRect(x, y, w, h) {
  return mouseX >= x && mouseY >= y && mouseX <= x + w && mouseY <= y + h;
}

const lookup = [
  { value: 1, symbol: "" },
  { value: 1e3, symbol: " K^" },
  { value: 1e6, symbol: " M^" },
  { value: 1e9, symbol: " B^" },
  { value: 1e12, symbol: " t" },
  { value: 1e15, symbol: " q" },
  { value: 1e18, symbol: " Q^" },
  { value: 1e21, symbol: " s" },
  { value: 1e24, symbol: " S^" },
  { value: 1e27, symbol: " o" },
  { value: 1e30, symbol: " n" },
  { value: 1e33, symbol: " d" },
  { value: 1e36, symbol: " U^" },
  { value: 1e39, symbol: " D^" },
  { value: 1e42, symbol: " T^" },
  { value: 1e45, symbol: " Qt" },
  { value: 1e48, symbol: " Qd" },
  { value: 1e51, symbol: " Sd" },
  { value: 1e54, symbol: " St" },
  { value: 1e57, symbol: " O^" },
  { value: 1e60, symbol: " N^" },
  { value: 1e63, symbol: " V^" },
  { value: 1e66, symbol: " UV^" },
  { value: 1e69, symbol: " DV^" },
  { value: 1e72, symbol: " TV^" },
  { value: 1e75, symbol: " QTV^" },
  { value: 1e78, symbol: " QNV^" },
  { value: 1e81, symbol: " SEV^" },
  { value: 1e84, symbol: " SPG^" },
  { value: 1e87, symbol: " OVG^" },
  { value: 1e90, symbol: " NVG^" },
  { value: 1e93, symbol: " TGN^" },
  { value: 1e96, symbol: " UTG^" }
];
const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;

function formatMoney(num, digits = 1) {
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toLocaleString('en', { maximumFractionDigits: digits }).replace(rx, "$1") + item.symbol : "0";
}

function shuffleArr(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
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
    push()
    fill(this.color)
    strokeWeight(5)
    stroke(this.color !== 0 ? 0 : 255)
    textSize(this.size)
    textAlign(this.centered ? CENTER : LEFT, CENTER)
    textFont('AloneOnEarth')
    text(this.text, this.x, this.y)
    pop()
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
    this.isMoving = false;
    this.previous = { x: 0, y: 0 }
    //this.price = prices[type];
    //setTimeout(() => this.update(), random(500, 1000))
  }

  update() {
    if (this.deleted) {
      return;
    }
    let howMuchPaying = payout[this.data.type] * multiplier
    if (Math.random() > 0.8) {
      moneyParticles.push(new MoneyParticle(this.data.x, this.data.y, this.data.x, this.data.y + 150))
      howMuchPaying += (random(0.1, 3) + (prices[this.data.type] / random(100, 1000)))
    }
    if(payout[this.data.type] === 69) {
      howMuchPaying = 69
    }
    money += howMuchPaying
    movingTexts.push(new MovingText(this.data.x, this.data.y, this.data.x, this.data.y - 50, '+' + formatMoney(howMuchPaying), [0, 255, 0], 40, true, 1))

    //setTimeout(() => this.update(), 1000 - this.data.speed + random(-50, 50))
  }

  draw() {
    push()
    imageMode(CENTER)
    image(this.image, this.data.x, this.data.y)
    pop()
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
    return dist(mouseX, mouseY, windowWidth - 140 + 64, this.y + 64 - sidebarY) <= 60;
  }

  draw() {
    push()
    if (this.price > money) {
      tint(80, 200)
    } else {
      noTint()
    }

    imageMode(CORNER)
    image(this.image, windowWidth - 140, this.y - sidebarY)
    strokeWeight(5)
    if (this.price > money) {
      fill(80, 200)
      noStroke()
    } else {
      fill(0)
      stroke(255)
    }
    textSize(24 - ((('$' + formatMoney(this.price)).length / 12) * 5))
    textAlign(CENTER, CENTER)
    textFont('AloneOnEarth')
    text('$' + formatMoney(this.price), windowWidth - 75, this.y + 140 - sidebarY)
    pop()
  }
}