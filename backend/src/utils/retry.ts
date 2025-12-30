export async function retry<T>(fn: () => Promise<T>, attempts = 3, delay = 1200): Promise<T> {
  let lastError: any;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.log(`Retry ${i + 1}/${attempts} failed…`);

      if (i < attempts - 1)
        await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError;
}
