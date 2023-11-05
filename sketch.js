//CMPO385 - MAJOR ASSIGNMENT - OBSCURITY

//declare variables------------------------------------------------------

//ambience variables
let ambienceNo = 3; //how many ambience synths
let ambience = [];
//let ambienceNotes = ["G2", "C3", "G3", "C4", "G4", "D3", "F3", "D4", "F4"]; //notes for ambience
let ambienceNotes = [43, 48, 50, 53, 55, 60, 62, 65, 67, 70, 72];
let ambiencePlayStore = []; //velocity, note change prob, base note, final note
let ambiencePlayStoreLength = 4;
let ambVerb;
let oldestNote = "G2";
let finalNote1, finalNote2, finalNote3;
let backgroundVal = 255;

//trigger variables
//trigger arguments (startVect, endVect, key, random colour, random fade time, random saturation, id)
let trig = [];
let synthVerb;
let minRandAlpha = 100, //colour intensity scale
  maxRandAlpha = 240;
let minFrametime = 2, //fade in timing
  maxFrametime = 22;
let idGen = 0,
  id = NaN;

//trigger control variables
let trigControl;
let trigMoveNo;
let resizeHitbox = 8, //resize hitbox size
  resizeInactive = true;
let setupMode = true;
let keyError = false;
let errorClearTimeout;

//current positions for timing
let mousePos,
  currentFrame,
  keysPressed = 0;

//saving and loading data
let json = {};
let trigJSONData = [];
let input;

json.total = idGen;
json.trigData = trigJSONData;

//SETUP----------------------------------------
function setup() {
  createCanvas(1920, 1200); //projector size
  background(backgroundVal); //total whiteout

  //setup verbs
  ambVerb = new p5.Reverb();
  ambVerb.set(4, 2);
  ambVerb.drywet(0.8);

  synthVerb = new p5.Reverb();
  synthVerb.set(3, 10);
  synthVerb.drywet(0.75);

  //create a trigger controler object to control the back end of triggers
  trigControl = new TrigControl();
  for (let i = 0; i < ambienceNo; i++) {
    ambience.push(new p5.PolySynth());
    ambience[i].setADSR(0.3, 0.3, 0.6, 0.8);
    ambience[i].disconnect();
    ambience[i].connect(ambVerb);
    ambiencePlayStore.push([0, 0, 0, 0, 0]); //init play storage array
  }

  //create a file input for uploading JSON configs
  input = createFileInput(handleFile);
  input.position(0, 0);
}

//DRAW------------------------------------------------------------------------------
function draw() {
  //set background and check for errors
  background(backgroundVal);
  trigControl.errors();

  //if in setup mode----------------------------------------
  if (setupMode) {
    //display text stating as such
    fill(0);
    textAlign(CENTER);
    text("SETUP MODE", width / 2, 15);

    trigControl.showTrig(); //show all triggers

    for (let i = 0; i < trig.length; i++) {
      trig[i].mouseFinder(); //resize box
    }
    noStroke();
    trigControl.mouseFinder(); //check where mouse is

    //show new rectangle being drawn
    if (mouseIsPressed && resizeInactive) {
      fill(255, 0, 0);
      rect(mousePos.x, mousePos.y, mouseX - mousePos.x, mouseY - mousePos.y);
    }
    input.show(); //show the JSON file upload
  }
  //if not in setup mode-------------------------------------
  else {
    input.hide(); //hide JSON upload

    noStroke();

    //check if key is down and which it is to trigger alpha adjustment
    for (let i = 0; i < trig.length; i++) {
      if (keyIsDown(unchar(trig[i].keyLetter) - 32)) {
        trig[i].updateAlpha();
      }
      trig[i].sound(); //play sound
      trig[i].clearAlpha(); //reduce alpha
      trig[i].show(); //show the box acording to alpha
    }

    playAmb(); //play the ambience to be manipulated
  }
}

//TRIGGER CLASS---------------------------------------------------------------------
class Trigger {
  //construct trigger
  constructor(start, end, keyLetter, colour, maxAlpha, frameTime, myID) {
    this.start = start; //start rect
    this.end = end; //end rect
    this.endTemp = end; //temp data storage for end
    this.keyLetter = keyLetter; //which key
    this.colour = colour; //which colour
    this.maxAlpha = maxAlpha; //max alpha can reach
    this.frameTime = frameTime; //the time of fade
    this.id = myID; //which trigger is this
    this.alphaHolder = 0; //holds current alpha
    this.fadeState = false; //indicated if it is fading up
    this.redMult = random(-1.2, 1.2); //how much each colour's output is multiplied by
    this.greenMult = random(-1.2, 1.2);
    this.blueMult = random(-1.2, 1.2);

    //make and init oscs for a litte extra texture
    this.osc1 = new p5.Oscillator("sine");
    this.osc2 = new p5.Oscillator("triangle");

    this.osc1.disconnect();
    this.osc1.connect(synthVerb);
    this.osc1.amp(0);
    this.osc1.freq(random(110, 440));
    this.osc1.start();

    this.osc2.disconnect();
    this.osc2.connect(synthVerb);
    this.osc2.amp(0);
    this.osc2.freq(random(110, 440));
    this.osc2.start();
  }

  //change fade state
  updateFade(u) {
    this.fadeState = u;
  }

  //click and drag to move trigger
  moveTrig() {
    let currentPos = createVector(mouseX, mouseY);
    let move = currentPos.sub(mousePos);
    this.start.add(move);
    mousePos = createVector(mouseX, mouseY);
  }

  //reduce alpha
  clearAlpha() {
    if (
      this.alphaHolder != 0 &&
      this.fadeState &&
      frameCount % this.frameTime === 0
    ) {
      this.alphaHolder--;
      this.colour.setAlpha(this.alphaHolder);
    }
  }

  //show when mouse is hovering over
  showHover() {
    noStroke();
    fill(255, 0, 0);
    rect(this.start.x, this.start.y, this.end.x, this.end.y);
  }

  //show when slowly fading up
  show() {
    noStroke();
    fill(this.colour);
    rect(this.start.x, this.start.y, this.end.x, this.end.y);
  }

  //update alpha to fade up/down
  updateAlpha() {
    if (frameCount % this.frameTime === 0 && this.fadeState === false) {
      if (this.alphaHolder < 255) {
        this.alphaHolder += 1;
      }
      this.colour.setAlpha(map(this.alphaHolder, 0, 255, 0, this.maxAlpha));
    }
  }

  //update previous end coordinates
  updateEndTemp() {
    this.endTemp = this.end;
  }

  //fade in sound when fading up
  sound() {
    let ampSetting = map(this.alphaHolder, 0, 255, 0.0, 0.053);
    this.osc1.amp(ampSetting);
    this.osc2.amp(ampSetting);
  }

  //locate mouse in order to resuze box
  mouseFinder() {
    //top left
    if (
      mouseX > this.start.x - resizeHitbox &&
      mouseX < this.start.x + resizeHitbox &&
      mouseY > this.start.y - resizeHitbox &&
      mouseY < this.start.y + resizeHitbox
    ) {
      fill(0, 255, 0);
      strokeWeight(2);
      stroke(140);
      ellipse(this.start.x, this.start.y, 14);
      if (mouseIsPressed) {
        resizeHitbox = 50;
        resizeInactive = false;
        id = this.id;
        this.start = createVector(mouseX, mouseY);
        this.end = createVector(
          this.endTemp.x + (mouseX - mousePos.x) * -1,
          this.endTemp.y + (mouseY - mousePos.y) * -1
        );
      } else {
        resizeHitbox = 8;
        resizeInactive = true;
      }
    }
  }
}

//TRIGGER CONTROL CLASS----------------------------------------------------------------
class TrigControl {
  //need not constructing
  constructor() {}

  //make a new trigger
  createTrig() {
    trig.push(
      new Trigger(
        createVector(mousePos.x, mousePos.y),
        createVector(mouseX - mousePos.x, mouseY - mousePos.y),
        key,
        color(random(0, 255), random(0, 255), random(0, 255), 0),
        random(minRandAlpha, maxRandAlpha),
        int(random(minFrametime, maxFrametime)),
        idGen
      )
    );

    idGen++; //increment which position it is (makes it easier to find)
  }

  //show where triggers are in setup mode
  showTrig() {
    for (let i = 0; i < trig.length; i++) {
      fill(0);
      rect(trig[i].start.x, trig[i].start.y, trig[i].end.x, trig[i].end.y);
    }
  }

  //show any errors encountered
  errors() {
    if (keyError) {
      fill(255, 0, 0);
      textAlign(CENTER);
      text("KEY IS USED, TRY ANOTHER", width / 2, height - 15);
    }
  }

  //find the mouse and move trigger if clicked
  mouseFinder() {
    for (let i = 0; i < trig.length; i++) {
      if (
        mouseX > trig[i].start.x &&
        mouseX < trig[i].end.x + trig[i].start.x &&
        mouseY > trig[i].start.y &&
        mouseY < trig[i].end.y + trig[i].start.y
      ) {
        trig[i].showHover();
        if (mouseIsPressed === true) {
          trig[trigMoveNo].moveTrig();
        }
      }
    }
  }
}

//play ammbience notes------------------------------------------------------
function playAmb() {
  //setup vars
  let ambRand = int(random(30, 60));
  let dur = ambRand / 10;
  let redChange = 0;
  let greenChange = 0;
  let blueChange = 0;

  //set up freq changes for each colour
  for (let j = 0; j < trig.length; j++) {
    if (trig[j].alphaHolder > 0) {
      redChange =
        redChange + trig[j].redMult * map(trig[j].alphaHolder, 0, 255, 0, 3);
      greenChange =
        redChange + trig[j].greenMult * map(trig[j].alphaHolder, 0, 255, 0, 3);
      blueChange =
        redChange + trig[j].blueMult * map(trig[j].alphaHolder, 0, 255, 0, 3);
    }
  }

  //step through each ambience synth to set the piece
  for (let k = 0; k < ambienceNo; k++) {
    let faders = 0; //no faders - init value

    //set array of data
    ambiencePlayStore[k][0] = random(0, 0.68); //velocity
    ambiencePlayStore[k][1] = random(); //trigger note or regular note

    ambiencePlayStore[k][2] = midiToFreq(ambienceNotes[int(random(0, 8))]); //base freq

    ambiencePlayStore[k][3] = ambiencePlayStore[k][2]; //make base final freq for when trig arr empty

    for (let l = 0; l < trig.length; l++) {
      if (trig[l].alphaHolder > 0) {
        faders++; //determine amount of currently fading trigs
      }
    }

    //total the frequencies and put in variable
    for (let j = 0; j < trig.length; j++) {
      if (trig[j].alphaHolder > 0 && ambiencePlayStore[k][1] > 0.5) {
        if (k % 3 === 0) {
          ambiencePlayStore[k][3] =
            ambiencePlayStore[k][2] * (redChange / faders);
        } else if (k % 3 === 1) {
          ambiencePlayStore[k][3] =
            ambiencePlayStore[k][2] * (greenChange / faders);
        } else {
          ambiencePlayStore[k][3] =
            ambiencePlayStore[k][2] * (blueChange / faders);
        }
      }
    }

    //if two keys pressed, become detuned
    if (keysPressed === 2) {
      ambiencePlayStore[k][3] -= random(-10, 10);
      ambiencePlayStore[k][0] += random(0.02, 0.13);
    }
    
    //if two keys pressed, become very detuned and quieter
    if (keysPressed === 3) {
      ambiencePlayStore[k][3] -= random(-140, 140);
      ambiencePlayStore[k][0] -= random(0.31, 0.52);
    }

    //if more than 3 keys are pressed, blackout and play low tone
    if (keysPressed > 3) {
      if (backgroundVal > 0) {
        backgroundVal -= 12;
      }
      ambiencePlayStore[k][3] = 55 + random(-6, 6);
      ambiencePlayStore[k][0] = 1;
      background(backgroundVal);
    } else if (backgroundVal < 255) {
      if (frameCount % 4 === 0) {
        backgroundVal++;
      }
    }

    //generate ambient music
    if (frameCount % ambRand === 0) {
      ambience[k].play(
        ambiencePlayStore[k][3],
        ambiencePlayStore[k][0],
        0,
        dur
      );
    }
  }
}

//mouse pressed--------------------------------------------------------------
function mousePressed() {
  currentFrame = frameCount; //create a time reference
  mousePos = createVector(mouseX, mouseY); // create an original position reference

  //helper to move the triggers
  for (let i = 0; i < trig.length; i++) {
    if (
      mouseX > trig[i].start.x &&
      mouseX < trig[i].end.x + trig[i].start.x &&
      mouseY > trig[i].start.y &&
      mouseY < trig[i].end.y + trig[i].start.y
    ) {
      trigMoveNo = i;
    }
  }
}

//mouse released-----------------------------------------------------------
function mouseReleased() {
  if (setupMode) {
    if (isNaN(id)) {
    } else {
      trig[id].updateEndTemp(); //update where the rectangle now is
      id = NaN;
    }
    //check what key is released so it is assigned tp the person
    if (keyIsPressed) {
      for (let i = 0; i < trig.length; i++) {
        if (key === trig[i].keyLetter) {
          console.log("KEY IS USED, TRY ANOTHER.");
          keyError = true;
          errorClearTimeout = setTimeout(errorClear, 2000); //to clear any errors
          return;
        }
      }
      trigControl.createTrig();
    }
  }
}

//any key pressed-----------------------------------------------------------
function keyPressed() {
  keysPressed++; //show how many have been pressed

  //check control and switch between setup modes
  if (keyCode === CONTROL) {
    setupMode = !setupMode;
    console.log("Setup Mode =", setupMode);
    userStartAudio();
  }
  //check option and switch between fullscreen
  if (keyCode === OPTION) {
    let fs = fullscreen();
    fullscreen(!fs);
  }
  //check return and save JSON
  if (keyCode === RETURN && setupMode) {
    trigJSONData = [];
    for (let i = 0; i < trig.length; i++) {
      trigJSONData.push([
        trig[i].start.x,
        trig[i].start.y,
        trig[i].end.x,
        trig[i].end.y,
        trig[i].keyLetter,
        trig[i].colour.levels[0],
        trig[i].colour.levels[1],
        trig[i].colour.levels[2],
        trig[i].colour.levels[3],
        trig[i].maxAlpha,
        trig[i].frameTime,
        trig[i].id,
      ]);
    }

    //set json data sources
    json.total = idGen;
    json.trigData = trigJSONData;

    //finde date for string
    let date = new Date();
    let dateString =
      date.toDateString().slice(4) + " " + date.toTimeString().slice(0, 8);

    //save json
    saveJSON(json, "obscurityData " + dateString + ".json");
  }

  //step through trig array
  for (let i = 0; i < trig.length; i++) {
    //if the trig letter === key released
    if (trig[i].keyLetter === key) {
      if (trig[i].fadeState) {
        trig[i].updateFade(false);
      }
    }
  }
}

//any key released--------------------------------------------------------------
function keyReleased() {
  keysPressed--; //determine number of keys released
  //step through trig array
  for (let i = 0; i < trig.length; i++) {
    //if the trig letter === key released
    if (trig[i].keyLetter === key) {
      trig[i].updateFade(true);
    }
  }
}

//clear errors
function errorClear() {
  keyError = false;
}

//handle load file
function handleFile(file) {
  print(file);
  if (file.type === "application") {
    //0 out current data
    trig = [];
    trigJSONData = [];
    idGen = file.data.total; //set id to total triggers in file

    print("importing", file.data.total, " triggers");

    //pull in data and overwrite arrays
    for (let i = 0; i < file.data.total; i++) {
      //create trigger
      trig.push(
        new Trigger(
          createVector(file.data.trigData[i][0], file.data.trigData[i][1]),
          createVector(file.data.trigData[i][2], file.data.trigData[i][3]),
          file.data.trigData[i][4],
          color(
            file.data.trigData[i][5],
            file.data.trigData[i][6],
            file.data.trigData[i][7],
            file.data.trigData[i][8]
          ),
          file.data.trigData[i][9],
          file.data.trigData[i][10],
          file.data.trigData[i][11]
        )
      );

      //push the json data
      trigJSONData.push([
        file.data.trigData[i][0],
        file.data.trigData[i][1],
        file.data.trigData[i][2],
        file.data.trigData[i][3],
        file.data.trigData[i][4],
        file.data.trigData[i][5],
        file.data.trigData[i][6],
        file.data.trigData[i][7],
        file.data.trigData[i][8],
        file.data.trigData[i][9],
        file.data.trigData[i][10],
        file.data.trigData[i][11],
      ]);
    }
  }
}
