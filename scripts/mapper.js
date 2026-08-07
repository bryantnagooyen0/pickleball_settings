export function mapPaddleFields(raw) {
  const name = raw.name?.trim() || null;
  const brand = raw.brand?.trim() || null;

  let model = null;
  if (name && brand && name.toLowerCase().startsWith(brand.toLowerCase())) {
    model = name.slice(brand.length).trim() || name;
  } else if (name) {
    model = name;
  }

  return {
    name,
    brand,
    model,
    shape: raw.shape?.trim() || null,
    thickness: raw.thickness?.trim() || null,
    handleLength: raw.handleLength?.trim() || null,
    length: raw.length?.trim() || null,
    width: raw.width?.trim() || null,
    weight: raw.weight?.trim() || null,
    core: raw.core?.trim() || null,
    image: raw.image?.trim() || null,
    description: raw.description?.trim() || null,
    priceLink: raw.priceLink?.trim() || null,
  };
}
