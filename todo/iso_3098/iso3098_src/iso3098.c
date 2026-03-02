/* iso3098.c */
/* Programed by AZO */
/* This code is free. At Your Own Risk. */

/* Build: gcc iso3098.c iso3098_stroke_line.c iso3098_stroke_svg.c iso3098i_stroke_svg.c -lm -o iso3098 */
/* PreRun: chmod +x iso3098 */
/* Run: ./iso3098 > iso3098.lff */
/* Run: ./iso3098 1 > iso3098_i.lff */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "iso3098_stroke_line.h"

static ISO3098_Line_GlyphsData_t g_tISO3098GlyphsData;

typedef struct AZO_Vector {
	signed int FromX;
	signed int FromY;
	signed int ToX;
	signed int ToY;
} AZO_Vector_t;

typedef struct AZO_Glyph {
	unsigned int Code8;
	unsigned int Code16;
	unsigned int VectorsCount;
	AZO_Vector_t Vectors[256];
} AZO_Glyph_t;

typedef struct AZO_GlyphData {
	unsigned int GlyphsCount;
	AZO_Glyph_t Glyphs[10000];
} AZO_GlyphsData_t;

AZO_GlyphsData_t g_tGlyphsData;

typedef enum {
	AUTOCAD_COMMAND_END = 0,
	AUTOCAD_COMMAND_PENDOWN = 1,
	AUTOCAD_COMMAND_PENUP = 2,
	AUTOCAD_COMMAND_SINGLEVECTOR = 8,
	AUTOCAD_COMMAND_MULTIVECTOR = 9,
	AUTOCAD_COMMAND_VARTICAL = 14,
} AutoCAD_Command_t;

typedef struct AutoCAD_Pos {
	signed int X;
	signed int Y;
} AutoCAD_Pos_t;

typedef struct AutoCAD_CommandOnly {
	AutoCAD_Command_t Command;
} AutoCAD_CommandOnly_t;

typedef struct AutoCAD_Vector {
	AutoCAD_Command_t Command;
	unsigned int PosesCount;
	AutoCAD_Pos_t Poses[120];
} AutoCAD_Vector_t;

typedef struct AutoCAD_Vartical {
	AutoCAD_Command_t Command;
	AutoCAD_Pos_t Pos;
} AutoCAD_Vartical_t;

typedef union AutoCAD_Item {
	AutoCAD_CommandOnly_t CommandOnly;
	AutoCAD_Vector_t Vector;
	AutoCAD_Vartical_t Vartical;
} AutoCAD_Item_t;

typedef struct AutoCAD_Shape {
	unsigned int Code;
	unsigned int Code8;
	unsigned int Bytes;
	unsigned int ItemsCount;
	AutoCAD_Item_t Items[120];
	char Name[32];
} AutoCAD_Shape_t;

typedef struct AutoCAD_ShapesData {
	unsigned int ShapesCount;
	AutoCAD_Shape_t Shapes[10000];
} AutoCAD_ShapesData_t;

AutoCAD_ShapesData_t g_tShapesData;

void OutputLFF(const AZO_GlyphsData_t* i_ptGlyphsData) {
	unsigned int uiCount1, uiCount2;
	AZO_Glyph_t* ptGlyph;
	AZO_Vector_t* ptVector;
	char str[16];
	unsigned int uiEnableGlyph = 0;

	printf("# Format:            LibreCAD Font 1\n");
	printf("# Creator:           AZO\n");
	printf("# Version:           master\n");
	printf("# Name:              ISO3098\n");
	printf("# Encoding:          UTF-8\n");
	printf("# LetterSpacing:     0\n");
	printf("# WordSpacing:       6.75\n");
	printf("# LineSpacingFactor: 1\n");
	printf("# Created:           2015-09-26\n");
	printf("# Last modified:     2015-09-26\n");
	printf("# Author:            AZO <typesylph@gmail.com> (convert)\n");
	printf("# Author:            User:K7 (ISO3098.svg, Wikimedia Commons)\n");
	printf("# License:           GPL v2 or later\n");
	printf("\n");

	for(uiCount1 = 0; uiCount1 < i_ptGlyphsData->GlyphsCount; uiCount1++) {
		ptGlyph = (AZO_Glyph_t*)&(i_ptGlyphsData->Glyphs[uiCount1]);

		if(ptGlyph->Code16 == 0) {
			continue;
		}

		if(ptGlyph->Code16 < 0x100) {
			printf("# UTF-16 : %02x\n", ptGlyph->Code16 & 0xFF);
		} else {
			printf("# UTF-16 : %02x %02x\n", (ptGlyph->Code16 >> 8) & 0xFF, ptGlyph->Code16 & 0xFF);
		}
		if(ptGlyph->Code8 < 0x100) {
			printf("# UTF-8  : %02x\n", ptGlyph->Code8 & 0xFF);
		} else {
			if(ptGlyph->Code8 < 0x10000) {
				printf("# UTF-8  : %02x %02x\n", ptGlyph->Code8 & 0xFF, (ptGlyph->Code8 >> 8) & 0xFF);
			} else {
				printf("# UTF-8  : %02x %02x %02x\n", ptGlyph->Code8 & 0xFF, (ptGlyph->Code8 >> 8) & 0xFF, (ptGlyph->Code8 >> 16) & 0xFF);
			}
		}

		sprintf(str, "[%04x]", ptGlyph->Code16);
		str[6] = ' ';
		if(ptGlyph->Code8 < 0x10000) {
			if(ptGlyph->Code8 < 0x100) {
				str[7] = (ptGlyph->Code8) & 0xFF;
				str[8] = '\0';
			} else {
				str[7] = (ptGlyph->Code8 >>  8) & 0xFF;
				str[8] = (ptGlyph->Code8      ) & 0xFF;
				str[9] = '\0';
			}
		} else {
			str[7] = (ptGlyph->Code8 >> 16) & 0xFF;
			str[8] = (ptGlyph->Code8 >>  8) & 0xFF;
			str[9] = (ptGlyph->Code8      ) & 0xFF;
			str[10] = '\0';
		}
		printf(str);
		printf("\n");

		for(uiCount2 = 0; uiCount2 < ptGlyph->VectorsCount; uiCount2++) {
			ptVector = &(ptGlyph->Vectors[uiCount2]);
			printf("%.2f,%.2f;%.2f,%.2f\n", (double)(ptVector->FromX)/32*10, (double)(ptVector->FromY)/32*10, (double)(ptVector->ToX)/32*10, (double)(ptVector->ToY)/32*10);
		}
		printf("\n");

		uiEnableGlyph++;
	}
	printf("# Enable glyphs  : %d\n", uiEnableGlyph);
}

void VectorToShape(AutoCAD_ShapesData_t* o_ptShapesData, const AZO_GlyphsData_t* i_ptVectorGlyphsData) {
	AZO_Glyph_t* ptVectorGlyph;
	AutoCAD_Shape_t* ptShape;
	AZO_Vector_t* ptVector;
	unsigned int uiVectorCount;
	unsigned int uiCount1, uiCount2;
	int iLastDrawX, iLastDrawY;
	int iFromX, iFromY;
	int iToX, iToY;
	unsigned int uiVector, uiPen;
	int res;
	unsigned int uiFirst;

	ptShape = &(o_ptShapesData->Shapes[0]);
	ptShape->Code = 0xA;
	ptShape->ItemsCount = 0;
	/* pen up */
	ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_PENUP;
	ptShape->ItemsCount++;
	/* vartical start */
	ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_VARTICAL;
	ptShape->ItemsCount++;
	ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
	ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = -24;
	ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = 0;
	ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
	ptShape->ItemsCount++;
	/* move */
	ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
	ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = 0;
	ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = -32;
	ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
	ptShape->ItemsCount++;
	/* end */
	ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_END;
	ptShape->ItemsCount++;
	ptShape->Bytes = 9;

	uiFirst = 1;
	for(uiCount1 = 0; uiCount1 < i_ptVectorGlyphsData->GlyphsCount; uiCount1++) {
		ptVectorGlyph = (AZO_Glyph_t*)&(i_ptVectorGlyphsData->Glyphs[uiCount1]);
		ptShape = &(o_ptShapesData->Shapes[uiCount1 + 1]);

		if(ptVectorGlyph->Code16 == 0) {
			continue;
		}

		ptShape->Code = ptVectorGlyph->Code16;
		ptShape->Code8 = ptVectorGlyph->Code8;
		strcpy(ptShape->Name, "noname");

		iLastDrawX = 0;
		iLastDrawY = 0;
		iFromX = 0;
		iFromY = 0;
		iToX = 0;
		iToY = 0;
		uiVector = 0;
		uiPen = 0;

		/* pen up */
		ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_PENUP;
		ptShape->ItemsCount++;

//		if(ptShape->Code8 >= 0x00 && ptShape->Code8 <= 0x7F) {
			/* vartical start */
			ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_VARTICAL;
			ptShape->ItemsCount++;
			ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = -12;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = -32;
			ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
			ptShape->ItemsCount++;
/*		} else {*/
			/* vartical start */
/*			ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_VARTICAL;
			ptShape->ItemsCount++;
			ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = -16;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = -32;
			ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
			ptShape->ItemsCount++;
		}
*/
		for(uiCount2 = 0; uiCount2 < ptVectorGlyph->VectorsCount; uiCount2++) {
			ptVector = &(ptVectorGlyph->Vectors[uiCount2]);
			iFromX = (int)((ptVector->FromX / 32.0) * 32.0);
			iFromY = (int)((ptVector->FromY / 32.0) * 32.0);
			iToX   = (int)((ptVector->ToX   / 32.0) * 32.0);
			iToY   = (int)((ptVector->ToY   / 32.0) * 32.0);

			/* same point */
			if(iFromX == iToX && iFromY == iToY) {
				continue;
			}
			/* continuas vector */
			if(iLastDrawX == iFromX && iLastDrawY == iFromY) {
				ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_MULTIVECTOR;
				if(ptShape->Items[ptShape->ItemsCount].Vector.PosesCount > 20) {
					ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].X = 0;
					ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].Y = 0;
					ptShape->Items[ptShape->ItemsCount].Vector.PosesCount++;
					ptShape->ItemsCount++;
					ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
					ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 0;
				}
			} else {
				if(uiPen) {
					if(ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_MULTIVECTOR) {
						ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].X = 0;
						ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].Y = 0;
						ptShape->Items[ptShape->ItemsCount].Vector.PosesCount++;
					}
					ptShape->ItemsCount++;
					/* pen up */
					ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_PENUP;
					ptShape->ItemsCount++;
					uiPen = 0;
				}
				/* move */
				ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
				ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = iFromX - iLastDrawX;
				ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = iFromY - iLastDrawY;
				ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
				ptShape->ItemsCount++;
				/* pen down */
				ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_PENDOWN;
				ptShape->ItemsCount++;
				uiPen = 1;
				/* draw vector */
				ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
				ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 0;
			}
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].X = iToX - iFromX;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].Y = iToY - iFromY;
			ptShape->Items[ptShape->ItemsCount].Vector.PosesCount++;
			iLastDrawX = iToX;
			iLastDrawY = iToY;
		}
		if(ptShape->Items[ptShape->ItemsCount].Vector.Command == AUTOCAD_COMMAND_SINGLEVECTOR) {
			ptShape->ItemsCount++;
		} else if(ptShape->Items[ptShape->ItemsCount].Vector.Command == AUTOCAD_COMMAND_MULTIVECTOR) {
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].X = 0;
			ptShape->Items[ptShape->ItemsCount].Vector.Poses[ptShape->Items[ptShape->ItemsCount].Vector.PosesCount].Y = 0;
			ptShape->Items[ptShape->ItemsCount].Vector.PosesCount++;
			ptShape->ItemsCount++;
		}

		/* pen up */
		ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_PENUP;
		ptShape->ItemsCount++;

		/* shape end */
		ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
		ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = 24 - iLastDrawX;
		ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = 0 - iLastDrawY;
		ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
		ptShape->ItemsCount++;

		/* vartical end */
		ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_VARTICAL;
		ptShape->ItemsCount++;
		ptShape->Items[ptShape->ItemsCount].Vector.Command = AUTOCAD_COMMAND_SINGLEVECTOR;
		ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].X = -12;
		ptShape->Items[ptShape->ItemsCount].Vector.Poses[0].Y = 0;
		ptShape->Items[ptShape->ItemsCount].Vector.PosesCount = 1;
		ptShape->ItemsCount++;

		/* end */
		ptShape->Items[ptShape->ItemsCount].CommandOnly.Command = AUTOCAD_COMMAND_END;
		ptShape->ItemsCount++;

		ptShape->Bytes = 0;
		for(uiCount2 = 0; uiCount2 < ptShape->ItemsCount; uiCount2++) {
			switch(ptShape->Items[uiCount2].CommandOnly.Command) {
				case AUTOCAD_COMMAND_END:
				case AUTOCAD_COMMAND_PENUP:
				case AUTOCAD_COMMAND_PENDOWN:
				case AUTOCAD_COMMAND_VARTICAL:
					ptShape->Bytes++;
					break;
				case AUTOCAD_COMMAND_SINGLEVECTOR:
					ptShape->Bytes += 3;
					break;
				case AUTOCAD_COMMAND_MULTIVECTOR:
					ptShape->Bytes += ptShape->Items[uiCount2].Vector.PosesCount * 2 + 1;
					break;
			}
		}
	}
	o_ptShapesData->ShapesCount = i_ptVectorGlyphsData->GlyphsCount;
}

void OutputSHP(const AutoCAD_ShapesData_t* i_ptShapesData) {
	unsigned int uiCount1, uiCount2, uiCount3;
	AutoCAD_Shape_t* ptShape;
	AutoCAD_Item_t* ptItem;

	printf(";;\n");
	printf(";; iso3098.shp - iso3098\n");
	printf(";;\n");
	printf(";; Copyright 2015 by AZO <typesylph@gmail.com> (convert).\n");
	printf(";; Author User:K7 (ISO3098.svg, Wikimedia Commons).\n");
	printf(";;\n");
	printf("\n");
	printf("*UNIFONT,6,iso3098\n");
	printf("32,0,2,0,0,0\n");
	printf("\n");

	for(uiCount1 = 0; uiCount1 < i_ptShapesData->ShapesCount; uiCount1++) {
		ptShape = (AutoCAD_Shape_t*)&(i_ptShapesData->Shapes[uiCount1]);

		if(ptShape->Code == 0) {
			continue;
		}

		printf("; UTF-16:%04X UTF-8:%06X Bytes:%d Items:%d\n", ptShape->Code, ((ptShape->Code8 & 0xFF) << 16) + (((ptShape->Code8 >> 8) & 0xFF) << 8) + ((ptShape->Code8 >> 16) & 0xFF), ptShape->Bytes, ptShape->ItemsCount);

		printf("*0%04X,%d,%s\n", ptShape->Code, ptShape->Bytes, ptShape->Name);

		for(uiCount2 = 0; uiCount2 < ptShape->ItemsCount; uiCount2++) {
			ptItem = &(ptShape->Items[uiCount2]);

			switch(ptItem->CommandOnly.Command) {
				case AUTOCAD_COMMAND_PENUP:
				case AUTOCAD_COMMAND_PENDOWN:
				case AUTOCAD_COMMAND_VARTICAL:
				case AUTOCAD_COMMAND_END:
					printf("%d\n", ptItem->CommandOnly.Command);
					break;
				case AUTOCAD_COMMAND_SINGLEVECTOR:
					printf("%d,(%d,%d)\n", ptItem->Vector.Command, ptItem->Vector.Poses[0].X, ptItem->Vector.Poses[0].Y);
					break;
				case AUTOCAD_COMMAND_MULTIVECTOR:
					printf("%d", ptItem->Vector.Command);
					for(uiCount3 = 0; uiCount3 < ptItem->Vector.PosesCount; uiCount3++) {
						printf(",%d,%d", ptItem->Vector.Poses[uiCount3].X, ptItem->Vector.Poses[uiCount3].Y);
					}
					printf("\n");
					break;
			}
		}
		printf("\n");
	}
}

int main(int i_iArgc, char* i_lstrArgv[]) {
	unsigned int i, j;
	unsigned int iAlready;
	unsigned int code8, code16;

	/* ISO3098 */
	if(i_iArgc > 1) {
		LoadISO3098iStroke_Line(&g_tISO3098GlyphsData);
	} else {
		LoadISO3098Stroke_Line(&g_tISO3098GlyphsData);
	}

	g_tGlyphsData.GlyphsCount = 0;

	/* ISO3098 */
	for(i = 0; i < g_tISO3098GlyphsData.glyphscount; i++) {
		g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Code8 = g_tISO3098GlyphsData.glyphs[i].code8;
		g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Code16 = g_tISO3098GlyphsData.glyphs[i].code;
		g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].VectorsCount = g_tISO3098GlyphsData.glyphs[i].linescount;
		for(j = 0; j < g_tISO3098GlyphsData.glyphs[i].linescount; j++) {
			g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Vectors[j].FromX = ((g_tISO3098GlyphsData.glyphs[i].lines[j].pos1.x) / 17.0) * 53.20;
			g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Vectors[j].FromY = ((15.0 - g_tISO3098GlyphsData.glyphs[i].lines[j].pos1.y) / 17.0) * 53.20;
			g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Vectors[j].ToX = ((g_tISO3098GlyphsData.glyphs[i].lines[j].pos2.x) / 17.0) * 53.20;
			g_tGlyphsData.Glyphs[g_tGlyphsData.GlyphsCount].Vectors[j].ToY = ((15.0 - g_tISO3098GlyphsData.glyphs[i].lines[j].pos2.y) / 17.0) * 53.20;
		}
		g_tGlyphsData.GlyphsCount++;
	}

	/* output */
	OutputLFF(&g_tGlyphsData);
//	VectorToShape(&g_tShapesData, &g_tGlyphsData);
//	OutputSHP(&g_tShapesData);

	return 0;
}		



