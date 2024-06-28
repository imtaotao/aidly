import { uuid } from '../index';

describe('uuid.ts', () => {
  it('uuid', () => {
    const last = new Set(['00000000-0000-0000-0000-000000000000']);
    for (let i = 0; i < 1000; i++) {
      const id = uuid();
      expect(!last.has(id)).toBe(true);
      last.add(id);
      expect(id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      // Check that version 4 identifier was populated.
      expect(id.charAt(14)).toStrictEqual('4');
      // Check that clock_seq_hi_and_reserved was populated with reserved bits.
      expect(id.charAt(19)).toMatch(/[89ab]/);
    }
  });
});
