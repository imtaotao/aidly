import { isObject, unindent, jsonParse, jsonStringify } from '../index';

describe('json.ts', () => {
  it('nomarl stringify', () => {
    const obj = { a: 1, b: [1, 2, { num: 2 }], c: {} };
    const json = jsonStringify(obj);
    expect(json.includes(jsonStringify._ref)).toBe(false);
  });

  it('simple stringify', () => {
    const obj = {} as any;
    obj.self = obj;
    expect(obj.self === obj).toBe(true);
    const json = jsonStringify(obj);
    expect(json.includes(jsonStringify._ref)).toBe(true);
  });

  it('should handle simple circular references', () => {
    const obj = {} as any;
    obj.self = obj;
    const json = jsonStringify(obj);
    const parsed = jsonParse(json);
    expect(parsed.self).toStrictEqual(parsed);
  });

  it('should handle nested circular references', () => {
    const obj = { child: { parent: null } } as any;
    obj.child.parent = obj;
    const json = jsonStringify(obj);
    const parsed = jsonParse(json);
    expect(parsed.child.parent).toStrictEqual(parsed);
  });

  it('should handle arrays with circular references', () => {
    const obj = {} as any;
    obj.arr = [obj, obj];
    const json = jsonStringify(obj);
    const parsed = jsonParse(json);

    expect(obj !== parsed).toBe(true);
    expect(parsed.arr[0] !== obj.arr[0]).toBe(true);
    expect(parsed.arr[1] !== obj.arr[1]).toBe(true);

    expect(obj.arr[0]).toStrictEqual(obj);
    expect(obj.arr[1]).toStrictEqual(obj);

    expect(parsed.arr[0]).toStrictEqual(parsed);
    expect(parsed.arr[1]).toStrictEqual(parsed);
  });

  it('should handle numbers, strings, and booleans correctly', () => {
    const obj = {
      number: 123,
      string: 'hello',
      boolean: true,
    };
    const json = jsonStringify(obj);
    const parsed = jsonParse(json);

    expect(parsed.number).toBe(123);
    expect(parsed.string).toBe('hello');
    expect(parsed.boolean).toBe(true);
  });

  it('should handle null correctly', () => {
    const obj = { nullable: null };
    const json = jsonStringify(obj);
    const parsed = jsonParse(json);
    expect(parsed.nullable).toBeNull();
  });

  it('handles complex nested objects with multiple cross-references', () => {
    const obj: any = {
      user: {
        name: 'Alice',
        address: {
          city: 'Wonderland',
        },
      },
      posts: [
        {
          title: 'My journey with JSON',
          author: null,
        },
        {
          title: 'Understanding Circular References',
          author: null,
        },
      ],
      favorites: {
        color: 'Blue',
        activity: 'Coding',
      },
    };

    // Setting circular and multiple references
    obj.user.posts = obj.posts;
    obj.posts[0].author = obj.user;
    obj.posts[1].author = obj.user;
    obj.favorites.user = obj.user;

    // More complex reference: user's favorite post
    obj.user.favoritePost = obj.posts[1];

    const json = jsonStringify(obj);
    const parsed = jsonParse(json);

    // Check the root object and nested structures
    expect(obj === parsed).toBe(false);
    expect(parsed.user.name).toBe('Alice');
    expect(parsed.user.address.city).toBe('Wonderland');
    expect(parsed.user.posts[0].title).toBe('My journey with JSON');
    expect(parsed.posts[1].author.name).toBe('Alice');
    expect(parsed.user.favoritePost.title).toBe(
      'Understanding Circular References',
    );

    // Check back-references and cross-references
    expect(obj.user).toStrictEqual(obj.posts[0].author);
    expect(obj.user).toStrictEqual(obj.posts[1].author);
    expect(obj.user.favoritePost).toStrictEqual(obj.posts[1]);
    expect(obj.favorites.user).toStrictEqual(obj.user);

    expect(parsed.user).toStrictEqual(parsed.posts[0].author);
    expect(parsed.user).toStrictEqual(parsed.posts[1].author);
    expect(parsed.user.favoritePost).toStrictEqual(parsed.posts[1]);
    expect(parsed.favorites.user).toStrictEqual(parsed.user);

    expect(parsed.user !== obj.user).toBe(true);
    expect(parsed.user.favoritePost !== obj.user.favoritePost).toBe(true);
    expect(parsed.favorites.user !== obj.favorites.user).toBe(true);
  });

  it('correctly replacer alters the behavior of the stringification process', () => {
    const obj = {
      name: 'Alice',
      age: 30,
      skills: ['JSON', 'JavaScript', null],
    };
    function replacer(_: string, value: unknown) {
      if (value === null) return 'Null';
      return value;
    }
    const jsonString = jsonStringify(obj, replacer);
    expect(jsonString).toBe(
      '{"name":"Alice","age":30,"skills":["JSON","JavaScript","Null"]}',
    );
  });

  it('correctly reviver modifies the structure of the parsed object', () => {
    const jsonString = '{"name":"Alice","age":"30"}';
    function reviver(key: string, value: unknown) {
      if (key === 'age') return parseInt(value as any);
      return value;
    }
    const parsedObj = jsonParse(jsonString, reviver);
    expect(typeof parsedObj.age).toBe('number');
    expect(parsedObj.age).toBe(30);
  });

  it('handles circular references with custom replacer and reviver functions', () => {
    const obj: any = {
      name: 'Alice',
      nested: {
        relation: 'friend',
      },
      age: 1,
    };
    obj.nested.self = obj;

    function replacer(key: string, value: unknown) {
      // Create ref
      if (key === 'age') return obj;
      if (key === 'relation') return undefined;
      return value;
    }
    function reviver(_: string, value: unknown) {
      if (isObject(value)) {
        (value as any).recovered = true;
      }
      return value;
    }

    const jsonString = jsonStringify(obj, replacer);
    const parsedObj = jsonParse(jsonString, reviver);

    expect(parsedObj !== obj).toBe(true);
    expect(parsedObj.recovered).toBe(true);
    expect(parsedObj.nested.recovered).toBe(true);
    expect(parsedObj.age === parsedObj).toBe(true);
    expect(parsedObj.nested.self === parsedObj).toBe(true);
    expect(parsedObj.nested.relation).toBeUndefined();
  });

  it('correctly formats JSON with numeric space argument', () => {
    const obj = {
      name: 'Alice',
      details: {
        age: 30,
        location: 'Wonderland',
      },
    };

    const expectedOutput = unindent(`
      {
        "name": "Alice",
        "details": {
          "age": 30,
          "location": "Wonderland"
        }
      }
  `);

    const jsonString = jsonStringify(obj, null, 2);
    expect(jsonString).toBe(expectedOutput);
  });

  it('correctly formats JSON with string space argument', () => {
    const obj = {
      name: 'Alice',
      details: {
        age: 30,
        location: 'Wonderland',
      },
    };

    const expectedOutput = unindent(`
      {
      --"name": "Alice",
      --"details": {
      ----"age": 30,
      ----"location": "Wonderland"
      --}
      }
    `);

    const jsonString = jsonStringify(obj, null, '--');
    expect(jsonString).toBe(expectedOutput);
  });
});
