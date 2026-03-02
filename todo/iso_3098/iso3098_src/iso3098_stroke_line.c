#include "iso3098_stroke_svg.h"
#include "iso3098_stroke_line.h"

#include <string.h>
#include <math.h>

typedef struct pos2d {
	double x;
	double y;
} pos2d_t;

static ISO3098_GlyphsData_t g_tGlyphsData;
static ISO3098_Line_Glyph_t tGlyph;

#define DEG2RAD(deg) (deg * 3.1415926535897931/180.0)

static void svg_arc(pos2d_t* o_ptCenter, double* o_pdTheta, double* o_pdDelta, const pos2d_t* i_ptFrom, const double i_dRa, const double i_dRb, const double i_dAngle, int i_ifA, int i_ifS, const pos2d_t* i_ptTo) {
	double x1d, y1d;
	double d;
	double cxd, cyd;
	double cx, cy;
	double t1, dtd, dt;
	double ra, rb;
	double rambda;

	if(i_dRa == 0 || i_dRb == 0) {
		return;
	}

	ra = fabs(i_dRa);
	rb = fabs(i_dRb);

	// phase 1
	x1d = (   cos(DEG2RAD(i_dAngle)) * (i_ptFrom->x - i_ptTo->x) / 2) + (sin(DEG2RAD(i_dAngle)) * (i_ptFrom->y - i_ptTo->y) / 2);
	y1d = (-1*sin(DEG2RAD(i_dAngle)) * (i_ptFrom->x - i_ptTo->x) / 2) + (cos(DEG2RAD(i_dAngle)) * (i_ptFrom->y - i_ptTo->y) / 2);

	rambda = (x1d*x1d/(ra*ra)) + (y1d*y1d/(rb*rb));
	if(rambda > 1) {
		ra = sqrt(rambda)*ra;
		rb = sqrt(rambda)*rb;
	}

	// phase 2
	d = 1;
	if(i_ifA == i_ifS) {
		d = -1;
	}
	cxd = d * sqrt(fabs((ra*ra*rb*rb - ra*ra*y1d*y1d - rb*rb*x1d*x1d) / (ra*ra*y1d*y1d + rb*rb*x1d*x1d)))     *ra*y1d/rb;
	cyd = d * sqrt(fabs((ra*ra*rb*rb - ra*ra*y1d*y1d - rb*rb*x1d*x1d) / (ra*ra*y1d*y1d + rb*rb*x1d*x1d))) * -1*rb*x1d/ra;

	// phase 3
	cx = (cos(DEG2RAD(i_dAngle))*cxd) + (-1*sin(DEG2RAD(i_dAngle))*cyd) + ((i_ptFrom->x + i_ptTo->x) / 2);
	cy = (sin(DEG2RAD(i_dAngle))*cxd) + (   cos(DEG2RAD(i_dAngle))*cyd) + ((i_ptFrom->y + i_ptTo->y) / 2);

	// phase 4
	d = (y1d-cyd)/rb;
	t1 = ((d < 0) ? -1.0 : 1.0) * acos((x1d-cxd)/ra / sqrt(((x1d-cxd)/ra)*((x1d-cxd)/ra) + ((y1d-cyd)/rb)*((y1d-cyd)/rb)));
	d = ((x1d-cxd)/ra)*((-1*y1d-cyd)/rb) - ((y1d-cyd)/rb)*((-1*x1d-cxd)/ra);
	dtd = ((d < 0) ? -1.0 : 1.0) * acos( round((((x1d-cxd)/ra)*((-1*x1d-cxd)/ra)+((y1d-cyd)/rb)*((-1*y1d-cyd)/rb)) / (sqrt( ((x1d-cxd)/ra)*((x1d-cxd)/ra) + ((y1d-cyd)/rb)*((y1d-cyd)/rb) ) * sqrt( ((-1*x1d-cxd)/ra)*((-1*x1d-cxd)/ra) + ((-1*y1d-cyd)/rb)*((-1*y1d-cyd)/rb) )) * 100000) / 100000);
	dtd = fmod(dtd, 2*3.1415926535897931);
	dt = dtd;
	if(i_ifS == 0 && dtd >= 0) {
		dt = -1 * dtd;
	} else if (i_ifS == 1 && dtd <= 0) {
		dt = -1 * dtd;
	}
	if(i_ifS == 0 && dtd >= 0) {
		t1 -= 2*3.1415926535897931;
	} else if (i_ifS == 1 && dtd <= 0) {
		t1 += 2*3.1415926535897931;
	}

	o_ptCenter->x = cx;
	o_ptCenter->y = cy;
	*o_pdTheta = t1;
	*o_pdDelta = dt;
}

void LoadISO3098Stroke_Line(ISO3098_Line_GlyphsData_t* o_ptGlyphsData) {
	int i, j;

	LoadISO3098Stroke(&g_tGlyphsData);

	o_ptGlyphsData->glyphscount = g_tGlyphsData.glyphscount;

	for(i = 0; i < g_tGlyphsData.glyphscount; i++) {
		memset(&tGlyph, 0, sizeof(ISO3098_Line_Glyph_t));
		o_ptGlyphsData->glyphs[i].code = g_tGlyphsData.glyphs[i].code;
		o_ptGlyphsData->glyphs[i].code8 = g_tGlyphsData.glyphs[i].code8;
		o_ptGlyphsData->glyphs[i].linescount = 0;

		for(j = 0; j < g_tGlyphsData.glyphs[i].itemscount; j++) {
			switch(g_tGlyphsData.glyphs[i].items[j].top.ItemType) {
			case ISO3098_ITEMTYPE_LINE:
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = g_tGlyphsData.glyphs[i].items[j].line.pos1.x;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = g_tGlyphsData.glyphs[i].items[j].line.pos1.y;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = g_tGlyphsData.glyphs[i].items[j].line.pos2.x;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = g_tGlyphsData.glyphs[i].items[j].line.pos2.y;
				o_ptGlyphsData->glyphs[i].linescount++;
				break;
			case ISO3098_ITEMTYPE_ARC:
				{
					pos2d_t tCenter;
					double dTheta, dDelta;
					pos2d_t tFrom, tTo;
					double dRa, dRb, dAngle;
					int iFa, iFs;
					pos2d_t tPrv, tPre, tPos;
					double dCurrent;
					int iFinal = 0;
					double dLength;

					tFrom.x = g_tGlyphsData.glyphs[i].items[j].arc.pos1.x;
					tFrom.y = g_tGlyphsData.glyphs[i].items[j].arc.pos1.y;
					dRa    = g_tGlyphsData.glyphs[i].items[j].arc.ra;
					dRb    = g_tGlyphsData.glyphs[i].items[j].arc.rb;
					dAngle = g_tGlyphsData.glyphs[i].items[j].arc.angle;
					iFa = g_tGlyphsData.glyphs[i].items[j].arc.fA;
					iFs = g_tGlyphsData.glyphs[i].items[j].arc.fS;
					tTo.x   = g_tGlyphsData.glyphs[i].items[j].arc.pos2.x;
					tTo.y   = g_tGlyphsData.glyphs[i].items[j].arc.pos2.y;

					if(tFrom.x == tTo.x && tFrom.y == tTo.y) {
						break;
					}
					if(dRa == 0 || dRb == 0) {
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = tFrom.x;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = tFrom.y;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = tTo.x;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = tTo.y;
						o_ptGlyphsData->glyphs[i].linescount++;
						break;
					}

					svg_arc(&tCenter, &dTheta, &dDelta, &tFrom, dRa, dRb, dAngle, iFa, iFs, &tTo);

					dCurrent = dTheta;
					tPre.x = (cos(DEG2RAD(dAngle)) * dRa*cos(dTheta) + -1*sin(DEG2RAD(dAngle)) * dRb*sin(dTheta)) + tCenter.x;
					tPre.y = (sin(DEG2RAD(dAngle)) * dRa*cos(dTheta) +    cos(DEG2RAD(dAngle)) * dRb*sin(dTheta)) + tCenter.y;
					tPrv.x = tPre.x;
					tPrv.y = tPre.y;

					while(1) {
						if(dDelta < 0) {
							if(dCurrent - 3.1415926535897931/180.0 <= dTheta + dDelta) {
								dCurrent = dTheta + dDelta;
								iFinal = 1;
							} else {
								dCurrent -= 3.1415926535897931/180.0;
							}
						} else {
							if(dCurrent + 3.1415926535897931/180.0 >= dTheta + dDelta) {
								dCurrent = dTheta + dDelta;
								iFinal = 1;
							} else {
								dCurrent += 3.1415926535897931/180.0;
							}
						}

						tPos.x = (cos(DEG2RAD(dAngle)) * dRa*cos(dCurrent) + -1*sin(DEG2RAD(dAngle)) * dRb*sin(dCurrent)) + tCenter.x;
						tPos.y = (sin(DEG2RAD(dAngle)) * dRa*cos(dCurrent) +    cos(DEG2RAD(dAngle)) * dRb*sin(dCurrent)) + tCenter.y;

						dLength = sqrt((tPrv.x - tPos.x) * (tPrv.x - tPos.x) + (tPrv.y - tPos.y) * (tPrv.y - tPos.y));
						if(dLength >= 1.0 || iFinal != 0) {
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = tPrv.x;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = tPrv.y;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = tPos.x;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = tPos.y;
							o_ptGlyphsData->glyphs[i].linescount++;
							tPrv.x = tPos.x;
							tPrv.y = tPos.y;
						}

						if(iFinal == 0) {
							tPre.x = tPos.x;
							tPre.y = tPos.y;
						} else {
							break;
						}
					}
				}
				break;
			}
		}
	}
}

void LoadISO3098iStroke_Line(ISO3098_Line_GlyphsData_t* o_ptGlyphsData) {
	int i, j;

	LoadISO3098iStroke(&g_tGlyphsData);

	o_ptGlyphsData->glyphscount = g_tGlyphsData.glyphscount;

	for(i = 0; i < g_tGlyphsData.glyphscount; i++) {
		memset(&tGlyph, 0, sizeof(ISO3098_Line_Glyph_t));
		o_ptGlyphsData->glyphs[i].code = g_tGlyphsData.glyphs[i].code;
		o_ptGlyphsData->glyphs[i].code8 = g_tGlyphsData.glyphs[i].code8;
		o_ptGlyphsData->glyphs[i].linescount = 0;

		for(j = 0; j < g_tGlyphsData.glyphs[i].itemscount; j++) {
			switch(g_tGlyphsData.glyphs[i].items[j].top.ItemType) {
			case ISO3098_ITEMTYPE_LINE:
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = g_tGlyphsData.glyphs[i].items[j].line.pos1.x;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = g_tGlyphsData.glyphs[i].items[j].line.pos1.y;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = g_tGlyphsData.glyphs[i].items[j].line.pos2.x;
				o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = g_tGlyphsData.glyphs[i].items[j].line.pos2.y;
				o_ptGlyphsData->glyphs[i].linescount++;
				break;
			case ISO3098_ITEMTYPE_ARC:
				{
					pos2d_t tCenter;
					double dTheta, dDelta;
					pos2d_t tFrom, tTo;
					double dRa, dRb, dAngle;
					int iFa, iFs;
					pos2d_t tPrv, tPre, tPos;
					double dCurrent;
					int iFinal = 0;
					double dLength;

					tFrom.x = g_tGlyphsData.glyphs[i].items[j].arc.pos1.x;
					tFrom.y = g_tGlyphsData.glyphs[i].items[j].arc.pos1.y;
					dRa    = g_tGlyphsData.glyphs[i].items[j].arc.ra;
					dRb    = g_tGlyphsData.glyphs[i].items[j].arc.rb;
					dAngle = g_tGlyphsData.glyphs[i].items[j].arc.angle;
					iFa = g_tGlyphsData.glyphs[i].items[j].arc.fA;
					iFs = g_tGlyphsData.glyphs[i].items[j].arc.fS;
					tTo.x   = g_tGlyphsData.glyphs[i].items[j].arc.pos2.x;
					tTo.y   = g_tGlyphsData.glyphs[i].items[j].arc.pos2.y;

					if(tFrom.x == tTo.x && tFrom.y == tTo.y) {
						break;
					}
					if(dRa == 0 || dRb == 0) {
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = tFrom.x;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = tFrom.y;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = tTo.x;
						o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = tTo.y;
						o_ptGlyphsData->glyphs[i].linescount++;
						break;
					}

					svg_arc(&tCenter, &dTheta, &dDelta, &tFrom, dRa, dRb, dAngle, iFa, iFs, &tTo);

					dCurrent = dTheta;
					tPre.x = (cos(DEG2RAD(dAngle)) * dRa*cos(dTheta) + -1*sin(DEG2RAD(dAngle)) * dRb*sin(dTheta)) + tCenter.x;
					tPre.y = (sin(DEG2RAD(dAngle)) * dRa*cos(dTheta) +    cos(DEG2RAD(dAngle)) * dRb*sin(dTheta)) + tCenter.y;
					tPrv.x = tPre.x;
					tPrv.y = tPre.y;

					while(1) {
						if(dDelta < 0) {
							if(dCurrent - 3.1415926535897931/180.0 <= dTheta + dDelta) {
								dCurrent = dTheta + dDelta;
								iFinal = 1;
							} else {
								dCurrent -= 3.1415926535897931/180.0;
							}
						} else {
							if(dCurrent + 3.1415926535897931/180.0 >= dTheta + dDelta) {
								dCurrent = dTheta + dDelta;
								iFinal = 1;
							} else {
								dCurrent += 3.1415926535897931/180.0;
							}
						}

						tPos.x = (cos(DEG2RAD(dAngle)) * dRa*cos(dCurrent) + -1*sin(DEG2RAD(dAngle)) * dRb*sin(dCurrent)) + tCenter.x;
						tPos.y = (sin(DEG2RAD(dAngle)) * dRa*cos(dCurrent) +    cos(DEG2RAD(dAngle)) * dRb*sin(dCurrent)) + tCenter.y;

						dLength = sqrt((tPrv.x - tPos.x) * (tPrv.x - tPos.x) + (tPrv.y - tPos.y) * (tPrv.y - tPos.y));
						if(dLength >= 1.0 || iFinal != 0) {
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.x = tPrv.x;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos1.y = tPrv.y;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.x = tPos.x;
							o_ptGlyphsData->glyphs[i].lines[o_ptGlyphsData->glyphs[i].linescount].pos2.y = tPos.y;
							o_ptGlyphsData->glyphs[i].linescount++;
							tPrv.x = tPos.x;
							tPrv.y = tPos.y;
						}

						if(iFinal == 0) {
							tPre.x = tPos.x;
							tPre.y = tPos.y;
						} else {
							break;
						}
					}
				}
				break;
			}
		}
	}
}
