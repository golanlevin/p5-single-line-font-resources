// By Jared Schiffman https://www.perchinteractive.com/
// MIT Media Lab ACG (Aesthetics and Computation Group), 1999
// Ported by Golan Levin, 2017

class jsVectorLetter {

  int numPoints;
  char pointTypes[];
  float x[];
  float y[];

  jsVectorLetter() {
    numPoints = 0;
  }

  void draw(float tx, float ty, float size) {
    for (int i = 0; i < numPoints - 1; i++) {
      if (pointTypes[i + 1] != 'm') {
        line(
          (tx + x[i] * size), 
          (ty - y[i] * size), 
          (tx + x[i + 1] * size), 
          (ty - y[i + 1] * size));
      }
    }
  }

  void drawAtAngle(float tx, float ty, float cosA, float sinA, float size) {
    for (int i = 0; i < numPoints - 1; i++) {
      if (pointTypes[i + 1] != 'm') {
        line(
          (tx + (cosA * x[i] + sinA * y[i]) * size), 
          (ty - (cosA * y[i] - sinA * x[i]) * size), 
          (tx + (cosA * x[i + 1] + sinA * y[i + 1]) * size), 
          (ty - (cosA * y[i + 1] - sinA * x[i + 1]) * size));
      }
    }
  }
}
