function toBoundedText(value, maxLength) {
  if (value === undefined || value === null) return '';
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const text = typeof serialized === 'string' ? serialized : String(serialized);
  return text.length <= maxLength ? text : text.slice(0, maxLength).trim();
}

module.exports = { toBoundedText };
