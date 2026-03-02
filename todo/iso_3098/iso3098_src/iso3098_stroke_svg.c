/* ISO3098 SVG */

#include "iso3098_stroke_svg.h"

#include <stdio.h>
#include <string.h>

static char line[1024];

void LoadISO3098Stroke(ISO3098_GlyphsData_t* o_ptGlyphsData) {
	FILE* pFile;
	int i;
	ISO3098_Glyph_t tGlyph;
	int codeline = 0;
	int linecount = 0;

	pFile = fopen("azo_iso3098.svg", "r");
	if(pFile == NULL) {
		return;
	}

	while(fgets(line, 1024, pFile)) {
		linecount++;
		if(line[0] == '<' && line[1] == '?') {
			continue;
		}
		if(line[0] == '<' && line[1] == 's') {
			continue;
		}
		if(line[0] == '<' && line[1] == '/') {
			continue;
		}

		int codemode = 0;
		int datamode = 0;
		int posmode = 0;
		float posdepth = 1;
		char str[4] = {0};
		int bEnd;

		if(codeline == 0) {
			memset(&tGlyph, 0, sizeof(ISO3098_Glyph_t));

			for(i = 0; i < strlen(line); i++) {
				switch(codemode) {
				// start UTF16
				case 0:
					bEnd = 0;
					if(line[i] == ':') {
						codemode = 1;
					}
					break;
				case 1:
					if(line[i] == ' ') {
						codemode = 2;
					} else {
						tGlyph.code <<= 4;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.code += line[i] - '0';
						} else if(line[i] - 'a' >= 0 && line[i] - 'a' <= 5) {
							tGlyph.code += line[i] - 'a' + 10;
						} else if(line[i] - 'A' >= 0 && line[i] - 'A' <= 5) {
							tGlyph.code += line[i] - 'A' + 10;
						}
					}
					break;
				// start UTF8
				case 2:
					if(line[i] == ':') {
						codemode = 3;
					}
					break;
				case 3:
					if(line[i] == ' ') {
						codemode = 4;
						datamode = 0;
					} else {
						tGlyph.code8 <<= 4;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.code8 += line[i] - '0';
						} else if(line[i] - 'a' >= 0 && line[i] - 'a' <= 5) {
							tGlyph.code8 += line[i] - 'a' + 10;
						} else if(line[i] - 'A' >= 0 && line[i] - 'A' <= 5) {
							tGlyph.code8 += line[i] - 'A' + 10;
						}
					}
					break;
				case 4:
					codeline = 1;
					break;
				}
				if(codeline == 1) {
					break;
				}
			}
			if(codeline == 1) {
				continue;
			}
		}

		if(codeline == 1) {
			for(i = 0; i < strlen(line); i++) {
				switch(datamode) {
				case 0:
					str[2] = line[i];
					if(str[0] == 'd' && str[1] == '=' && str[2] == '\"') {
						datamode = 1;
					} else {
						str[0] = str[1];
						str[1] = str[2];
					}
					break;
				case 1:
					if(line[i] == 'M' || line[i] == 'm') {
						datamode = 2;
					}
					if(line[i] == '\"') {
						bEnd = 1;
					}
					break;
				case 2:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos1.x *= 10.0;
							tGlyph.items[tGlyph.itemscount].line.pos1.x += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 3;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos1.x += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 3;
						}
					}
					break;
				case 3:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos1.y *= 10.0;
							tGlyph.items[tGlyph.itemscount].line.pos1.y += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 4;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos1.y += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 4;
						}
					}
					break;
				case 4:
					if(line[i] == 'A' || line[i] == 'a') {
						datamode = 5;
					} else if(line[i] == 'L' || line[i] == 'l') {
						datamode = 12;
					}
					break;
				case 5:
					tGlyph.items[tGlyph.itemscount].arc.ItemType = ISO3098_ITEMTYPE_ARC;
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.ra *= 10.0;
							tGlyph.items[tGlyph.itemscount].arc.ra += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 6;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.ra += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 6;
						}
					}
					break;
				case 6:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.rb *= 10.0;
							tGlyph.items[tGlyph.itemscount].arc.rb += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 7;
						}
					} else {
						posdepth /= 10;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.rb += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 7;
						}
					}
					break;
				case 7:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.angle *= 10.0;
							tGlyph.items[tGlyph.itemscount].arc.angle += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 8;
						}
					} else {
						posdepth /= 10;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.angle += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 8;
						}
					}
					break;
				case 8:
					if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
						tGlyph.items[tGlyph.itemscount].arc.fA *= 10;
						tGlyph.items[tGlyph.itemscount].arc.fA += line[i] - '0';
					} else if(line[i] == ' ') {
						posmode = 0;
						datamode = 9;
					}
					break;
				case 9:
					if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
						tGlyph.items[tGlyph.itemscount].arc.fS *= 10;
						tGlyph.items[tGlyph.itemscount].arc.fS += line[i] - '0';
					} else if(line[i] == ' ') {
						posmode = 0;
						datamode = 10;
					}
					break;
				case 10:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.pos2.x *= 10.0;
							tGlyph.items[tGlyph.itemscount].arc.pos2.x += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 11;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.pos2.x += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 11;
						}
					}
					break;
				case 11:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.pos2.y *= 10.0;
							tGlyph.items[tGlyph.itemscount].arc.pos2.y += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							tGlyph.itemscount++;
							datamode = 1;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].arc.pos2.y += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							tGlyph.itemscount++;
							datamode = 1;
						}
					}
					break;
				case 12:
					tGlyph.items[tGlyph.itemscount].line.ItemType = ISO3098_ITEMTYPE_LINE;
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos2.x *= 10.0;
							tGlyph.items[tGlyph.itemscount].line.pos2.x += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 13;
						}
					} else {
						posdepth /= 10;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos2.x += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							datamode = 13;
						}
					}
					break;
				case 13:
					if(posmode == 0) {
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos2.y *= 10.0;
							tGlyph.items[tGlyph.itemscount].line.pos2.y += line[i] - '0';
						} else if(line[i] == '.') {
							posmode = 1;
							posdepth = 1;
						} else if(line[i] == ' ') {
							posmode = 0;
							tGlyph.itemscount++;
							datamode = 1;
						}
					} else {
						posdepth /= 10.0;
						if(line[i] - '0' >= 0 && line[i] - '0' <= 9) {
							tGlyph.items[tGlyph.itemscount].line.pos2.y += (line[i] - '0') * posdepth;
						} else if(line[i] == ' ') {
							posmode = 0;
							tGlyph.itemscount++;
							datamode = 1;
						}
					}
					break;
				}
				if(bEnd) {
					codeline = 0;
					break;
				}
			}
		}
		if(bEnd) {
			memcpy(&(o_ptGlyphsData->glyphs[o_ptGlyphsData->glyphscount]), &tGlyph, sizeof(ISO3098_Glyph_t));
			o_ptGlyphsData->glyphscount++;
		}
	}

	return;
}
