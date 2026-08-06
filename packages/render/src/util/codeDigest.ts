const CODE_DIGEST_CACHE_LIMIT = 500;
const codeDigestCache = new Map<string, string>();

export const getCodeExecutorDigest = (value: string) => {
  const cachedDigest = codeDigestCache.get(value);
  if (cachedDigest) {
    return cachedDigest;
  }

  let firstHash = 2166136261;
  let secondHash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    const charCode = value.charCodeAt(index);
    firstHash = Math.imul(firstHash ^ charCode, 16777619);
    secondHash = Math.imul(secondHash ^ charCode, 33);
  }

  const digest = `${(firstHash >>> 0).toString(36)}-${(secondHash >>> 0).toString(36)}-${value.length.toString(36)}`;
  if (codeDigestCache.size >= CODE_DIGEST_CACHE_LIMIT) {
    codeDigestCache.delete(codeDigestCache.keys().next().value!);
  }
  codeDigestCache.set(value, digest);
  return digest;
};
