import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mapPaddleFields } from './mapper.js';

describe('mapPaddleFields', () => {
  it('maps all fields from a complete raw object', () => {
    const raw = {
      name: 'Joola Hyperion CFS 16',
      brand: 'Joola',
      shape: 'Elongated',
      thickness: '16mm',
      handleLength: '5.5"',
      weight: null,
      length: null,
      width: null,
      core: 'Carbon Fiber',
      image: 'https://example.com/paddle.jpg',
      description: 'A great paddle.',
      priceLink: null,
    };

    const result = mapPaddleFields(raw);

    assert.equal(result.name, 'Joola Hyperion CFS 16');
    assert.equal(result.brand, 'Joola');
    assert.equal(result.model, 'Hyperion CFS 16');
    assert.equal(result.shape, 'Elongated');
    assert.equal(result.thickness, '16mm');
    assert.equal(result.handleLength, '5.5"');
    assert.equal(result.length, null);
    assert.equal(result.width, null);
    assert.equal(result.weight, null);
    assert.equal(result.core, 'Carbon Fiber');
    assert.equal(result.image, 'https://example.com/paddle.jpg');
    assert.equal(result.description, 'A great paddle.');
    assert.equal(result.priceLink, null);
  });

  it('derives model by stripping brand prefix from name', () => {
    const raw = { name: 'Selkirk Vanguard Power Air', brand: 'Selkirk' };
    const result = mapPaddleFields(raw);
    assert.equal(result.model, 'Vanguard Power Air');
  });

  it('sets missing optional fields to null', () => {
    const raw = { name: 'Some Paddle', brand: 'SomeBrand' };
    const result = mapPaddleFields(raw);
    assert.equal(result.shape, null);
    assert.equal(result.thickness, null);
    assert.equal(result.handleLength, null);
    assert.equal(result.length, null);
    assert.equal(result.width, null);
    assert.equal(result.weight, null);
    assert.equal(result.core, null);
    assert.equal(result.image, null);
    assert.equal(result.description, null);
    assert.equal(result.priceLink, null);
  });

  it('uses full name as model when brand is not a prefix of name', () => {
    const raw = { name: 'Mystery Paddle', brand: 'Joola' };
    const result = mapPaddleFields(raw);
    assert.equal(result.model, 'Mystery Paddle');
  });

  it('trims whitespace from all string fields', () => {
    const raw = { name: '  Joola Pro  ', brand: '  Joola  ', shape: '  Elongated  ' };
    const result = mapPaddleFields(raw);
    assert.equal(result.name, 'Joola Pro');
    assert.equal(result.brand, 'Joola');
    assert.equal(result.shape, 'Elongated');
  });
});
