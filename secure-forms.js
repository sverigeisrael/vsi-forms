/* A link grants a limited, expiring form session. It contains no member dataset. */
window.VsiSecure = (() => {
  const token = new URLSearchParams(location.hash.slice(1)).get('t') || '';
  const endpoint = 'https://sverigeisrael.se/wp-json/vsi/v1/forms/';
  let submissionId = null;
  const post = async (route, data) => {
    const response = await fetch(endpoint + route, { method: 'POST', credentials: 'omit',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), cache: 'no-store', referrerPolicy: 'no-referrer' });
    const value = await response.json();
    if (!response.ok) throw new Error(value.message || 'Formuläret kunde inte behandlas.');
    return value;
  };
  return {
    async load(type) {
      if (!/^[a-f0-9]{64}$/.test(token)) throw new Error('Be administrationen om en ny säker formulärlänk.');
      history.replaceState(null, '', location.pathname);
      const result = await post('data', { token });
      if (result.type !== type) throw new Error('Länken gäller ett annat formulär.');
      return result.data;
    },
    async submit(data) {
      if (!submissionId) submissionId = [...crypto.getRandomValues(new Uint8Array(16))].map(value => value.toString(16).padStart(2, '0')).join('');
      const result = await post('submit', { token, submission_id: submissionId, data });
      submissionId = null;
      return result;
    },
  };
})();
