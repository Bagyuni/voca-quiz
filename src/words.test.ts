import { describe, expect, test } from 'bun:test';
import { parseSheetResponse, parseTSV, toTSV } from './words';

describe('parseTSV', () => {
  test('parses standard rows and skips header', () => {
    const tsv = [
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석',
      '1\t今日\tきょう\t오늘\t今日は天気がいいです。\t오늘은 날씨가 좋습니다.',
    ].join('\n');
    const words = parseTSV(tsv);
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

  test('normalizes kanji "-" → copies hira into kanji, clears hira', () => {
    const tsv =
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석\n2\t-\tおば\t이모\t\t';
    const words = parseTSV(tsv);
    expect(words[0].kanji).toBe('おば');
    expect(words[0].hira).toBe('');
  });

  test('normalizes empty kanji → copies hira into kanji, clears hira', () => {
    const tsv =
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석\n2\t\tなる\t울리다\t\t';
    const words = parseTSV(tsv);
    expect(words[0].kanji).toBe('なる');
    expect(words[0].hira).toBe('');
  });

  test('normalizes hira "-" → clears hira', () => {
    const tsv = 'Day\t한자\t히라가나\t뜻\t예문\t예문 해석\n1\t万\t-\t만\t\t';
    const words = parseTSV(tsv);
    expect(words[0].kanji).toBe('万');
    expect(words[0].hira).toBe('');
  });

  test('generates correct id', () => {
    const tsv =
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석\n1\t今日\tきょう\t오늘\t\t';
    expect(parseTSV(tsv)[0].id).toBe('w_今日_きょう');
  });

  test('handles missing optional fields', () => {
    const tsv = 'Day\t한자\t히라가나\t뜻';
    // only header, no data
    expect(parseTSV(tsv)).toEqual([]);
  });

  test('skips rows with Day/DAY header values', () => {
    const tsv = [
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석',
      'DAY\ttest\ttest\ttest\t\t',
      'Day\ttest\ttest\ttest\t\t',
      '1\t今日\tきょう\t오늘\t\t',
    ].join('\n');
    expect(parseTSV(tsv)).toHaveLength(1);
  });

  test('parses multiple rows across different days', () => {
    const tsv = [
      'Day\t한자\t히라가나\t뜻\t예문\t예문 해석',
      '1\t今日\tきょう\t오늘\t\t',
      '1\t明日\tあした\t내일\t\t',
      '2\t秘密\tひみつ\t비밀\t\t',
    ].join('\n');
    const words = parseTSV(tsv);
    expect(words).toHaveLength(3);
    expect(words[0].day).toBe('1');
    expect(words[2].day).toBe('2');
  });
});

describe('toTSV', () => {
  test('round-trips through parseTSV', () => {
    const words = [
      {
        id: 'w_今日_きょう',
        day: '1',
        kanji: '今日',
        hira: 'きょう',
        mean: '오늘',
        ex: '今日は天気がいいです。',
        exKr: '오늘은 날씨가 좋습니다.',
      },
    ];
    const result = parseTSV(toTSV(words));
    expect(result).toEqual(words);
  });

  test('writes "-" for empty hira', () => {
    const words = [
      {
        id: 'w_おば_',
        day: '2',
        kanji: 'おば',
        hira: '',
        mean: '이모',
        ex: '',
        exKr: '',
      },
    ];
    const tsv = toTSV(words);
    expect(tsv).toContain('おば\t-\t');
  });
});

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

  test('applies same normalization as parseTSV', () => {
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
