#ifndef _ISO3098STROKESVG_H_

typedef enum {
	ISO3098_ITEMTYPE_LINE = 0,
	ISO3098_ITEMTYPE_ARC,
} ISO3098_ItemType_t;

typedef struct ISO3098_Item_Pos {
	double x;
	double y;
} ISO3098_Pos_t;

typedef struct ISO3098_Item_Top {
	ISO3098_ItemType_t ItemType;
} ISO3098_Item_Top_t;

typedef struct ISO3098_Item_Line {
	ISO3098_ItemType_t ItemType;
	ISO3098_Pos_t pos1;
	ISO3098_Pos_t pos2;
} ISO3098_Item_Line_t;

typedef struct ISO3098_Item_Arc {
	ISO3098_ItemType_t ItemType;
	ISO3098_Pos_t pos1;
	double ra;
	double rb;
	double angle;
	int fA;
	int fS;
	ISO3098_Pos_t pos2;
} ISO3098_Item_Arc_t;

typedef union ISO3098_Item {
	ISO3098_Item_Top_t top;
	ISO3098_Item_Line_t line;
	ISO3098_Item_Arc_t arc;
} ISO3098_Item_t;

typedef struct ISO3098_Glyph {
	unsigned int code;
	unsigned int code8;
	unsigned int itemscount;
	ISO3098_Item_t items[256];
} ISO3098_Glyph_t;

typedef struct ISO3098_GlyphData {
	unsigned int glyphscount;
	ISO3098_Glyph_t glyphs[512];
} ISO3098_GlyphsData_t;

extern void LoadISO3098Stroke(ISO3098_GlyphsData_t* o_ptGlyphsData);
extern void LoadISO3098iStroke(ISO3098_GlyphsData_t* o_ptGlyphsData);

#endif /* _ISO3098STROKESVG_H_ */
