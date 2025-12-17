// By Jared Schiffman https://www.perchinteractive.com/
// MIT Media Lab ACG (Aesthetics and Computation Group), 1999
// Ported by Golan Levin, 2017

class jsVectorFont {

  int numLetters;
  jsVectorLetter letters[];

  jsVectorFont() {
    letters = new jsVectorLetter[256];
    for (int i = 0; i < 256; i++) {
      letters[i] = new jsVectorLetter();
      letters[i].numPoints = 0;
    }
  }

  void drawString(String S, float px, float py, float size) {
    for (int i = 0; i < S.length(); i++) {
      char a = S.charAt(i);
      px = (float)((double)px + 170.0D * (double)size);
      letters[(int)a].draw(px, py, size);
    }
  }

  void drawStringInArc(String S, float cx, float cy, float radius, 
    float startAngle, float angleInc, float size, boolean flip) {

    float A = startAngle;
    if (flip) {
      for (int i = 0; i < S.length(); i++) {
        char a = S.charAt(i);
        float px = cx + (float)Math.cos(A) * radius;
        float py = cy + (float)Math.sin(A) * radius;
        letters[a].drawAtAngle(px, py, -1F * (float)Math.cos((double)A - 1.57D), -1F * (float)Math.sin((double)A - 1.57D), size);
        A -= angleInc;
      }
    } else {
      for (int i = 0; i < S.length(); i++) {
        char a = S.charAt(i);
        float px = cx + (float)Math.cos(A) * radius;
        float py = cy + (float)Math.sin(A) * radius;
        letters[a].drawAtAngle(px, py, (float)Math.cos((double)A - 1.57D), (float)Math.sin((double)A - 1.57D), size);
        A += angleInc;
      }
    }
  }
}
