import { describe, it, expect } from 'vitest';
import { getMaterial, listMaterials } from '../structural/materials';

describe('getMaterial', () => {
  it('should find A36 steel by partial name', () => {
    const result = getMaterial('A36');
    expect(result.name).toBe('ASTM A36 Steel');
    expect(result.E).toBe(200e9);
    expect(result.fy).toBe(250e6);
    expect(result.fu).toBe(400e6);
    expect(result.density).toBe(7850);
    expect(result.poissonsRatio).toBe(0.26);
  });

  it('should find A992 steel', () => {
    const result = getMaterial('A992');
    expect(result.name).toBe('ASTM A992 Steel');
    expect(result.fy).toBe(345e6);
  });

  it('should find stainless steel 304', () => {
    const result = getMaterial('304');
    expect(result.name).toBe('Stainless Steel 304');
    expect(result.E).toBe(193e9);
  });

  it('should find aluminum 6061-T6', () => {
    const result = getMaterial('6061');
    expect(result.name).toBe('Aluminum 6061-T6');
    expect(result.E).toBe(68.9e9);
    expect(result.fy).toBe(276e6);
  });

  it('should find concrete C30/37', () => {
    const result = getMaterial('C30');
    expect(result.name).toBe('Concrete C30/37');
    expect(result.E).toBe(33e9);
  });

  it('should find Douglas Fir', () => {
    const result = getMaterial('douglas');
    expect(result.name).toBe('Douglas Fir');
    expect(result.category).toBe('timber');
  });

  it('should be case-insensitive', () => {
    const result = getMaterial('a36');
    expect(result.name).toBe('ASTM A36 Steel');
  });

  it('should return a copy (not mutate internal data)', () => {
    const a = getMaterial('A36');
    a.E = 0;
    const b = getMaterial('A36');
    expect(b.E).toBe(200e9);
  });

  it('should throw for unknown material', () => {
    expect(() => getMaterial('unobtanium')).toThrow('not found');
  });

  it('should include units in result', () => {
    const result = getMaterial('A36');
    expect(result.Eunit).toBe('Pa');
    expect(result.fyUnit).toBe('Pa');
    expect(result.fuUnit).toBe('Pa');
    expect(result.densityUnit).toBe('kg/m³');
    expect(result.thermalExpansionUnit).toBe('1/°C');
  });
});

describe('listMaterials', () => {
  it('should list all materials when no category given', () => {
    const result = listMaterials();
    expect(result.length).toBeGreaterThanOrEqual(11);
  });

  it('should filter by steel category', () => {
    const result = listMaterials('steel');
    expect(result.length).toBeGreaterThanOrEqual(3);
    result.forEach((m) => expect(m.category).toBe('steel'));
  });

  it('should filter by aluminum category', () => {
    const result = listMaterials('aluminum');
    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach((m) => expect(m.category).toBe('aluminum'));
  });

  it('should filter by concrete category', () => {
    const result = listMaterials('concrete');
    expect(result.length).toBeGreaterThanOrEqual(3);
    result.forEach((m) => expect(m.category).toBe('concrete'));
  });

  it('should filter by timber category', () => {
    const result = listMaterials('timber');
    expect(result.length).toBeGreaterThanOrEqual(2);
    result.forEach((m) => expect(m.category).toBe('timber'));
  });

  it('should be case-insensitive for category', () => {
    const result = listMaterials('Steel');
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  it('should return copies (not mutate internal data)', () => {
    const list = listMaterials('steel');
    list[0].E = 0;
    const list2 = listMaterials('steel');
    expect(list2[0].E).toBeGreaterThan(0);
  });

  it('should throw for unknown category', () => {
    expect(() => listMaterials('plastic')).toThrow('No materials found');
  });
});
