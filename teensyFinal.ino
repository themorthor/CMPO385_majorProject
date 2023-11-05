int zPin = 0;
int xPin = 1;
int cPin = 15;
int vPin = 16;
int bPin = 17;
int nPin = 18;
int mPin = 19;
int aPin = 22;
int sPin = 23;
int dPin = 25;
int fPin = 32;
int gPin = 33;

int zPinData;
int xPinData;
int cPinData;
int vPinData;
int bPinData;
int nPinData;
int mPinData;
int aPinData;
int sPinData;
int dPinData;
int fPinData;
int gPinData;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(57600);
}

void loop() {
  // put your main code here, to run repeatedly:
  zPinData = touchRead(zPin);
  xPinData = touchRead(xPin);
  cPinData = touchRead(cPin);
  vPinData = touchRead(vPin);
  bPinData = touchRead(bPin);
  nPinData = touchRead(nPin);
  mPinData = touchRead(mPin);
  aPinData = touchRead(aPin);
  sPinData = touchRead(sPin);
  dPinData = touchRead(dPin);
  fPinData = touchRead(fPin);
  gPinData = touchRead(gPin);

  //Serial.println(zPinData);
  //Serial.println(xPinData);
  //Serial.println(cPinData);
  //*/

  if (zPinData > 1800) {
    Keyboard.press(KEY_Z);
  } else {
    Keyboard.release(KEY_Z);
  }
  if (xPinData > 1000) {
    Keyboard.press(KEY_X);
  } else {
    Keyboard.release(KEY_X);
  }
  if (cPinData > 1000) {
    Keyboard.press(KEY_C);
  } else {
    Keyboard.release(KEY_C);
  }
  if (vPinData > 1000) {
    Keyboard.press(KEY_V);
  } else {
    Keyboard.release(KEY_V);
  }
  if (bPinData > 1000) {
    Keyboard.press(KEY_B);
  } else {
    Keyboard.release(KEY_B);
  }
  if (nPinData > 1000) {
    Keyboard.press(KEY_N);
  } else {
    Keyboard.release(KEY_N);
  }
  if (mPinData > 1000) {
    Keyboard.press(KEY_M);
  } else {
    Keyboard.release(KEY_M);
  }
  if (aPinData > 1000) {
    Keyboard.press(KEY_A);
  } else {
    Keyboard.release(KEY_A);
  }
  if (sPinData > 1000) {
    Keyboard.press(KEY_S);
  } else {
    Keyboard.release(KEY_S);
  }
  if (dPinData > 1000) {
    Keyboard.press(KEY_D);
  } else {
    Keyboard.release(KEY_D);
  }
  if (fPinData > 1000) {
    Keyboard.press(KEY_F);
  } else {
    Keyboard.release(KEY_F);
  }
  if (gPinData > 1000) {
    Keyboard.press(KEY_G);
  } else {
    Keyboard.release(KEY_G);
  }

  delay(1);
}