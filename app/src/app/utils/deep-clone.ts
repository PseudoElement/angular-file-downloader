export function clone<T extends object>(obj: T, hash = new WeakMap()): T {
    if (Object(obj) !== obj) return obj; // primitives
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    const result =
        obj instanceof Set
            ? new Set(obj) // See note about this!
            : obj instanceof Map
            ? new Map(Array.from(obj, ([key, val]) => [key, clone(val, hash)]))
            : obj instanceof Date
            ? new Date(obj)
            : obj instanceof RegExp
            ? new RegExp(obj.source, obj.flags)
            : // ... add here any specific treatment for other classes ...
            // and finally a catch-all:
            'constructor' in obj
            ? //@ts-ignore
              new obj.constructor()
            : Object.create(null);

    hash.set(obj, result);

    //@ts-ignore
    return Object.assign(result, ...Object.keys(obj).map((key): any => ({ [key]: clone(obj[key as any], hash) })));
}
