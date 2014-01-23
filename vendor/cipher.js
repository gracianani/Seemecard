﻿/*
* Written by Joseph K. Myers on 2001/05/18
* e_mayilme@hotmail.com; http://www.angelfire.com/yt/jmyers/
*/
var cipher_block_size = 64, encoding_buffer = 1024;
function b0f(c) {
    return c < 16 ? '0' + c.toString(16) : c.toString(16);
}
function bff(c) {
    return parseInt(c, 16);
}
function salt(s) {
    var n = 0;
    for (var i = 0; i < s.length; i++) n += i & s.charCodeAt(i);
    return b0f(n % 256);
}
function encrypt(s, k) {
    if (s.length > cipher_block_size) {
        var m = parseInt(s.length / cipher_block_size), t = Math.round(m / 2) * cipher_block_size;
        return encrypt(s.substr(0, t), k) + encrypt(s.substr(t), k);
    }
    var r = parseInt(Math.random() * 256), o = b0f(r), i;
    for (i = 0; i < s.length; i++) {
        o += b0f(s.charCodeAt(i) ^ r ^ k.charCodeAt(i % k.length));
    }
    return o;
}
function decrypt(s, k) {
    var dbs = (cipher_block_size + 1) * 2;
    if (s.length > dbs) {
        var m = parseInt(s.length / dbs), t = Math.round(m / 2) * dbs;
        return decrypt(s.substr(0, t), k) + decrypt(s.substr(t), k);
    }
    var n = bff(s.substr(0, 2)), o = '';
    for (var i = 2; i < s.length; i += 2) {
        o += String.fromCharCode(bff(s.substr(i, 2)) ^ n ^ k.charCodeAt((i - 2) / 2 % k.length));
    }
    return o;
}
function encipher(f) {
    var s = f.stream.value, k = salt(f.key.value), r = k, b = encoding_buffer,
		p = 0, n = Math.floor(s.length / b) + 1;
    while (n > p++) {
        self.status = 'Encrypting block ' + p + '/' + n;
        r += encrypt(s.substr((p - 1) * b, b), f.key.value);
    }
    f.stream.value = r;
    self.status = 'Done';
}
function decipher(f) {
    var s = f.stream.value.substr(2), k = salt(f.key.value), r = '',
		b = 2 * (encoding_buffer + encoding_buffer / cipher_block_size), p = 0, n = Math.floor(s.length / b) + 1;
    if (k != f.stream.value.substr(0, 2)) {
        if (!confirm('The key is probably incorrect.\nContinue decryption?'))
            return;
    }
    while (p++ < n) {
        self.status = 'Decrypting block ' + p + '/' + n;
        r += decrypt(s.substr((p - 1) * b, b), f.key.value);
    }
    f.stream.value = r;
    return self.status = 'Done';
}