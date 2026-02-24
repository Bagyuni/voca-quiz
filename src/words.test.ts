import { describe, expect, test } from 'bun:test';
import { parseSheetResponse } from './words';

describe('parseSheetResponse', () => {
  type CellVal = string | number | null;
  const makeRow = (
    day: CellVal,
    kanji: CellVal,
    hira: CellVal,
    mean: CellVal,
    ex: CellVal,
    exKr: CellVal,
  ) => ({
    c: [
      { v: day },
      { v: kanji },
      { v: hira },
      { v: mean },
      { v: ex },
      { v: exKr },
    ],
  });

  test('parses standard gviz response', () => {
    const response = {
      table: {
        rows: [
          makeRow(
            '1',
            '今日',
            'きょう',
            '오늘',
            '今日は天気がいいです。',
            '오늘은 날씨가 좋습니다.',
          ),
        ],
      },
    };
    const words = parseSheetResponse(response);
    expect(words).toHaveLength(1);
    expect(words[0]).toEqual({
      id: 'w_今日_きょう',
      day: '1',
      kanji: '今日',
      hira: 'きょう',
      mean: '오늘',
      ex: '今日は天気がいいです。',
      exKr: '오늘은 날씨가 좋습니다.',
    });
  });

  test('skips header rows', () => {
    const response = {
      table: {
        rows: [
          makeRow('Day', '한자', '히라가나', '뜻', '예문', '예문 해석'),
          makeRow('1', '今日', 'きょう', '오늘', '', ''),
        ],
      },
    };
    expect(parseSheetResponse(response)).toHaveLength(1);
  });

  test('skips rows with null c array', () => {
    const response = {
      table: {
        rows: [{ c: null }, makeRow('1', '今日', 'きょう', '오늘', '', '')],
      },
    };
    expect(parseSheetResponse(response)).toHaveLength(1);
  });

  test('skips rows with empty day', () => {
    const response = {
      table: {
        rows: [makeRow('', '今日', 'きょう', '오늘', '', '')],
      },
    };
    expect(parseSheetResponse(response)).toHaveLength(0);
  });

  test('handles null cell values gracefully', () => {
    const response = {
      table: {
        rows: [
          {
            c: [{ v: '1' }, { v: '犬' }, { v: null }, { v: '개' }, null, null],
          },
        ],
      },
    };
    const words = parseSheetResponse(response);
    expect(words).toHaveLength(1);
    expect(words[0].hira).toBe('');
    expect(words[0].ex).toBe('');
  });

  test('normalizes kanji "-" to hira value', () => {
    const response = {
      table: {
        rows: [makeRow('2', '-', 'おば', '이모', '', '')],
      },
    };
    const words = parseSheetResponse(response);
    expect(words[0].kanji).toBe('おば');
    expect(words[0].hira).toBe('');
  });

  test('coerces numeric day to string', () => {
    const response = {
      table: {
        rows: [makeRow(3, '靴', 'くつ', '신발', '', '')],
      },
    };
    expect(parseSheetResponse(response)[0].day).toBe('3');
  });
});
