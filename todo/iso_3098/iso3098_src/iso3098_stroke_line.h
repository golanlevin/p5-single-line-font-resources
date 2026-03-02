#ifndef _ISO3098STROKELINE_H_

typedef struct ISO3098_Line_Item_Pos {
	double x;
	double y;
} ISO3098_Line_Pos_t;

typedef struct ISO3098_Line_Item_Line {
	ISO3098_Line_Pos_t pos1;
	ISO3098_Line_Pos_t pos2;
} ISO3098_Line_Line_t;

typedef struct ISO3098_Line_Glyph {
	unsigned int code;
	unsigned int code8;
	unsigned int linescount;
	ISO3098_Line_Line_t lines[1024];
} ISO3098_Line_Glyph_t;

typedef struct ISO3098_Line_GlyphData {
	unsigned int glyphscount;
	ISO3098_Line_Glyph_t glyphs[512];
} ISO3098_Line_GlyphsData_t;

extern void LoadISO3098Stroke_Line(ISO3098_Line_GlyphsData_t* o_ptGlyphsData);
extern void LoadISO3098iStroke_Line(ISO3098_Line_GlyphsData_t* o_ptGlyphsData);

#endif /* _ISO3098STROKELINE_H_ */
