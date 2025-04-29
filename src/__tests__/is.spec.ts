import {
  isIP,
  isPort,
  isDomain,
  isAbsolute,
  isEmail,
  isBase64,
  isPromise,
  isPromiseLike,
  isByteLength,
} from '../index';

describe('is.ts', () => {
  it('isAbsolute', () => {
    expect(isAbsolute('a.js')).toBe(false);
    expect(isAbsolute('/a.js')).toBe(false);
    expect(isAbsolute('./a.js')).toBe(false);
    expect(isAbsolute('http://x.com/a.js')).toBe(true);
    expect(isAbsolute('http://x.com/a.js?x=1')).toBe(true);
    expect(isAbsolute('data:text/html;base64,YQ==')).toBe(true);
    expect(
      isAbsolute('blob:https://a.com/832a2821-8580-4099-85c8-509bf48aee50'),
    ).toBe(true);
  });

  it('isPromiseLike', () => {
    expect(isPromiseLike({ then() {} })).toBe(true);
    expect(isPromiseLike({ then1() {} })).toBe(false);
    expect(isPromiseLike(Promise.resolve())).toBe(true);
  });

  it('isPromise', () => {
    expect(isPromise(Promise.resolve())).toBe(true);
    expect(isPromise({ then() {} })).toBe(false);
  });

  it('should validate ports', () => {
    const obj = {
      valid: [0, -0, 22, 80, 443, 3000, 8080, 65535],
      invalid: [65536, 80.1, -1, -80.1],
    };
    obj.valid.forEach((p) => {
      expect(isPort(+p)).toBe(true);
    });
    obj.invalid.forEach((p) => {
      expect(isPort(+p)).toBe(false);
    });
  });

  it('should validate domain names.', () => {
    expect(isDomain('127.0.0.1.com')).toBe(true);
    expect(isDomain('google.com')).toBe(true);
    expect(isDomain('google.l33t')).toBe(false);
  });

  it('should validate domain', () => {
    const domains = {
      valid: [
        'domain.com',
        'dom.plato',
        'a.domain.co',
        'foo--bar.com',
        'xn--froschgrn-x9a.com',
        'rebecca.blackfriday',
        '1337.com',
      ],
      invalid: [
        'abc',
        '256.0.0.0',
        '_.com',
        '*.some.com',
        's!ome.com',
        'domain.com/',
        '/more.com',
        'domain.com�',
        'domain.co\u00A0m',
        'domain.co\u1680m',
        'domain.co\u2006m',
        'domain.co\u2028m',
        'domain.co\u2029m',
        'domain.co\u202Fm',
        'domain.co\u205Fm',
        'domain.co\u3000m',
        'domain.com\uDC00',
        'domain.co\uEFFFm',
        'domain.co\uFDDAm',
        'domain.co\uFFF4m',
        'domain.com©',
        'example.0',
        '192.168.0.9999',
        '192.168.0',
      ],
    };
    domains.valid.forEach((domain) => {
      expect(isDomain(domain)).toBe(true);
    });
    domains.invalid.forEach((domain) => {
      expect(isDomain(domain)).toBe(false);
    });
  });

  it('should validate email addresses', () => {
    const obj = {
      valid: [
        'foo@bar.com',
        'x@x.au',
        'foo@bar.com.au',
        'foo+bar@bar.com',
        'hans.m端ller@test.com',
        'hans@m端ller.com',
        'test|123@m端ller.com',
        'test123+ext@gmail.com',
        'some.name.midd.leNa.me.and.locality+extension@GoogleMail.com',
        '"foobar"@example.com',
        '"  foo  m端ller "@example.com',
        '"foo\\@bar"@example.com',
        `${'a'.repeat(64)}@${'a'.repeat(63)}.com`,
        `${'a'.repeat(64)}@${'a'.repeat(63)}.com`,
        `${'a'.repeat(31)}@gmail.com`,
        'test@gmail.com',
        'test.1@gmail.com',
        'test@1337.com',
      ],
      invalid: [
        'invalidemail@',
        'invalid.com',
        '@invalid.com',
        'foo@bar.com.',
        'foo@_bar.com',
        'somename@ｇｍａｉｌ.com',
        'foo@bar.co.uk.',
        'z@co.c',
        'ｇｍａｉｌｇｍａｉｌｇｍａｉｌｇｍａｉｌｇｍａｉｌ@gmail.com',
        `${'a'.repeat(64)}@${'a'.repeat(251)}.com`,
        `${'a'.repeat(65)}@${'a'.repeat(250)}.com`,
        `${'a'.repeat(64)}@${'a'.repeat(64)}.com`,
        `${'a'.repeat(64)}@${'a'.repeat(63)}.${'a'.repeat(63)}.${'a'.repeat(
          63,
        )}.${'a'.repeat(58)}.com`,
        'test1@invalid.co m',
        'test2@invalid.co m',
        'test3@invalid.co m',
        'test4@invalid.co m',
        'test5@invalid.co m',
        'test6@invalid.co m',
        'test7@invalid.co m',
        'test8@invalid.co m',
        'test9@invalid.co m',
        'test10@invalid.co m',
        'test11@invalid.co m',
        'test12@invalid.co　m',
        'test13@invalid.co　m',
        'multiple..dots@stillinvalid.com',
        'test123+invalid! sub_address@gmail.com',
        'gmail...ignores...dots...@gmail.com',
        'ends.with.dot.@gmail.com',
        'multiple..dots@gmail.com',
        'wrong()[]",:;<>@@gmail.com',
        '"wrong()[]",:;<>@@gmail.com',
        'username@domain.com�',
        'username@domain.com©',
        'nbsp test@test.com',
        'nbsp_test@te st.com',
        'nbsp_test@test.co m',
      ],
    };
    obj.valid.forEach((email) => {
      expect(isEmail(email)).toBe(true);
    });
    obj.invalid.forEach((email) => {
      expect(isEmail(email)).toBe(false);
    });
  });

  it('should validate email addresses with allowed IPs', () => {
    const obj = {
      valid: ['email@[123.123.123.123]', 'email@255.255.255.255'],
      invalid: [
        'email@0.0.0.256',
        'email@26.0.0.256',
        'email@[266.266.266.266]',
      ],
    };
    obj.valid.forEach((email) => {
      expect(isEmail(email)).toBe(true);
      expect(isEmail(email, { disableIPDomain: true })).toBe(false);
    });
    obj.invalid.forEach((email) => {
      expect(isEmail(email)).toBe(false);
      expect(isEmail(email, { disableIPDomain: true })).toBe(false);
    });
  });

  it('Verify long emails', () => {
    expect(
      isEmail(
        'Deleted-user-id-19430-Team-5051deleted-user-id-19430-team-5051XX@example.com',
      ),
    ).toBe(true);
    expect(
      isEmail(
        'Deleted-user-id-19430-Team-5051deleted-user-id-19430-team-5051XXX@example.com',
      ),
    ).toBe(false);
  });

  it('should validate IP addresses', () => {
    const obj = {
      valid: [
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
        '1.2.3.4',
        '::1',
        '2001:db8:0000:1:1:1:1:1',
        '2001:db8:3:4::192.0.2.33',
        '2001:41d0:2:a141::1',
        '::ffff:127.0.0.1',
        '::0000',
        '0000::',
        '1::',
        '1111:1:1:1:1:1:1:1',
        'fe80::a6db:30ff:fe98:e946',
        '::',
        '::8',
        '::ffff:127.0.0.1',
        '::ffff:255.255.255.255',
        '::ffff:0:255.255.255.255',
        '::2:3:4:5:6:7:8',
        '::255.255.255.255',
        '0:0:0:0:0:ffff:127.0.0.1',
        '1:2:3:4:5:6:7::',
        '1:2:3:4:5:6::8',
        '1::7:8',
        '1:2:3:4:5::7:8',
        '1:2:3:4:5::8',
        '1::6:7:8',
        '1:2:3:4::6:7:8',
        '1:2:3:4::8',
        '1::5:6:7:8',
        '1:2:3::5:6:7:8',
        '1:2:3::8',
        '1::4:5:6:7:8',
        '1:2::4:5:6:7:8',
        '1:2::8',
        '1::3:4:5:6:7:8',
        '1::8',
        'fe80::7:8%eth0',
        'fe80::7:8%1',
        '64:ff9b::192.0.2.33',
        '0:0:0:0:0:0:10.0.0.1',
      ],
      invalid: [
        'abc',
        '256.0.0.0',
        '0.0.0.256',
        '26.0.0.256',
        '0200.200.200.200',
        '200.0200.200.200',
        '200.200.0200.200',
        '200.200.200.0200',
        '::banana',
        'banana::',
        '::1banana',
        '::1::',
        '1:',
        ':1',
        ':1:1:1::2',
        '1:1:1:1:1:1:1:1:1:1:1:1:1:1:1:1',
        '::11111',
        '11111:1:1:1:1:1:1:1',
        '2001:db8:0000:1:1:1:1::1',
        '0:0:0:0:0:0:ffff:127.0.0.1',
        '0:0:0:0:ffff:127.0.0.1',
      ],
    };
    obj.valid.forEach((ip) => {
      expect(isIP(ip)).toBe(true);
    });
    obj.invalid.forEach((ip) => {
      expect(isIP(ip)).toBe(false);
    });

    const ipv4 = {
      valid: [
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
        '1.2.3.4',
        '255.0.0.1',
        '0.0.1.1',
      ],
      invalid: [
        '::1',
        '2001:db8:0000:1:1:1:1:1',
        '::ffff:127.0.0.1',
        '137.132.10.01',
        '0.256.0.256',
        '255.256.255.256',
      ],
    };
    ipv4.valid.forEach((ip) => {
      expect(isIP(ip, '4')).toBe(true);
    });
    ipv4.invalid.forEach((ip) => {
      expect(isIP(ip, '4')).toBe(false);
    });

    const ipv6 = {
      valid: [
        '::1',
        '2001:db8:0000:1:1:1:1:1',
        '::ffff:127.0.0.1',
        'fe80::1234%1',
        'ff08::9abc%10',
        'ff08::9abc%interface10',
        'ff02::5678%pvc1.3',
      ],
      invalid: [
        '127.0.0.1',
        '0.0.0.0',
        '255.255.255.255',
        '1.2.3.4',
        '::ffff:287.0.0.1',
        '%',
        'fe80::1234%',
        'fe80::1234%1%3%4',
        'fe80%fe80%',
      ],
    };
    ipv6.valid.forEach((ip) => {
      expect(isIP(ip, '6')).toBe(true);
    });
    ipv6.invalid.forEach((ip) => {
      expect(isIP(ip, '6')).toBe(false);
    });
  });

  it('should validate base64 strings', () => {
    const strs = {
      valid: [
        '',
        'Zg==',
        'Zm8=',
        'Zm9v',
        'Zm9vYg==',
        'Zm9vYmE=',
        'Zm9vYmFy',
        'TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2NpbmcgZWxpdC4=',
        'Vml2YW11cyBmZXJtZW50dW0gc2VtcGVyIHBvcnRhLg==',
        'U3VzcGVuZGlzc2UgbGVjdHVzIGxlbw==',
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuMPNS1Ufof9EW/M98FNw' +
          'UAKrwflsqVxaxQjBQnHQmiI7Vac40t8x7pIb8gLGV6wL7sBTJiPovJ0V7y7oc0Ye' +
          'rhKh0Rm4skP2z/jHwwZICgGzBvA0rH8xlhUiTvcwDCJ0kc+fh35hNt8srZQM4619' +
          'FTgB66Xmp4EtVyhpQV+t02g6NzK72oZI0vnAvqhpkxLeLiMCyrI416wHm5Tkukhx' +
          'QmcL2a6hNOyu0ixX/x2kSFXApEnVrJ+/IxGyfyw8kf4N2IZpW5nEP847lpfj0SZZ' +
          'Fwrd1mnfnDbYohX2zRptLy2ZUn06Qo9pkG5ntvFEPo9bfZeULtjYzIl6K8gJ2uGZ' +
          'HQIDAQAB',
      ],
      invalid: [
        '12345',
        'Vml2YW11cyBmZXJtZtesting123',
        'Zg=',
        'Z===',
        'Zm=8',
        '=m9vYg==',
        'Zm9vYmFy====',
      ],
    };
    strs.valid.forEach((str) => {
      expect(isBase64(str)).toBe(true);
    });
    strs.invalid.forEach((str) => {
      expect(isBase64(str)).toBe(false);
    });

    const safeStrs = {
      args: [{ urlSafe: true }],
      valid: [
        '',
        'bGFkaWVzIGFuZCBnZW50bGVtZW4sIHdlIGFyZSBmbG9hdGluZyBpbiBzcGFjZQ',
        '1234',
        'bXVtLW5ldmVyLXByb3Vk',
        'PDw_Pz8-Pg',
        'VGhpcyBpcyBhbiBlbmNvZGVkIHN0cmluZw',
      ],
      invalid: [
        ' AA',
        '\tAA',
        '\rAA',
        '\nAA',
        'This+isa/bad+base64Url==',
        '0K3RgtC+INC30LDQutC+0LTQuNGA0L7QstCw0L3QvdCw0Y8g0YHRgtGA0L7QutCw',
      ],
      error: [null, undefined, {}, [], 42],
    };
    safeStrs.valid.forEach((str) => {
      expect(isBase64(str, true)).toBe(true);
    });
    safeStrs.invalid.forEach((str) => {
      expect(isBase64(str, true)).toBe(false);
    });

    for (let i = 0, str = '', encoded; i < 1000; i++) {
      str += String.fromCharCode((Math.random() * 26) | 97);
      encoded = Buffer.from(str).toString('base64');
      expect(isBase64(encoded)).toBe(true);
    }
  });

  it('should validate strings by byte length', () => {
    const obj1 = {
      valid: ['abc', 'de', 'abcd', 'ｇｍａｉｌ'],
      invalid: ['', 'a'],
    };
    obj1.valid.forEach((v) => {
      expect(isByteLength(v, { min: 2 })).toBe(true);
    });
    obj1.invalid.forEach((v) => {
      expect(isByteLength(v, { min: 2 })).toBe(false);
    });

    const obj2 = {
      valid: ['abc', 'de', 'ｇ'],
      invalid: ['', 'a', 'abcd', 'ｇｍ'],
    };
    obj2.valid.forEach((v) => {
      expect(isByteLength(v, { min: 2, max: 3 })).toBe(true);
    });
    obj2.invalid.forEach((v) => {
      expect(isByteLength(v, { min: 2, max: 3 })).toBe(false);
    });

    const obj3 = {
      valid: ['abc', 'de', 'ｇ', 'a', ''],
      invalid: ['abcd', 'ｇｍ'],
    };
    obj3.valid.forEach((v) => {
      expect(isByteLength(v, { max: 3 })).toBe(true);
    });
    obj3.invalid.forEach((v) => {
      expect(isByteLength(v, { max: 3 })).toBe(false);
    });

    const obj4 = {
      valid: [''],
      invalid: ['ｇ', 'a'],
    };
    obj4.valid.forEach((v) => {
      expect(isByteLength(v, { max: 0 })).toBe(true);
    });
    obj4.invalid.forEach((v) => {
      expect(isByteLength(v, { max: 0 })).toBe(false);
    });
  });
});
