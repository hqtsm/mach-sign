import {describe, it} from 'node:test';
import {strictEqual, throws} from 'node:assert';

import {cast, subview} from './util.ts';

void describe('util', () => {
	void describe('cast', () => {
		void it('all', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = cast(DataView, b);
			strictEqual(dv.byteOffset, 0);
			strictEqual(dv.byteLength, 3);
			strictEqual(dv.getUint8(0), 0x61);
			strictEqual(dv.getUint8(1), 0x62);
			strictEqual(dv.getUint8(2), 0x63);
		});

		void it('sub', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63, 0x64]);
			const dv = cast(DataView, b.subarray(1));
			strictEqual(dv.byteOffset, 1);
			strictEqual(dv.byteLength, 3);
			strictEqual(dv.getUint8(0), 0x62);
			strictEqual(dv.getUint8(1), 0x63);
			strictEqual(dv.getUint8(2), 0x64);
		});
	});

	void describe('subview', () => {
		void it('all', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b);
			strictEqual(dv.byteOffset, 0);
			strictEqual(dv.byteLength, 3);
			strictEqual(dv.getUint8(0), 0x61);
			strictEqual(dv.getUint8(1), 0x62);
			strictEqual(dv.getUint8(2), 0x63);
		});

		void it('offset', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 1);
			strictEqual(dv.byteOffset, 1);
			strictEqual(dv.byteLength, 2);
			strictEqual(dv.getUint8(0), 0x62);
			strictEqual(dv.getUint8(1), 0x63);
		});

		void it('offset: end', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 3);
			strictEqual(dv.byteOffset, 3);
			strictEqual(dv.byteLength, 0);
		});

		void it('offset: over', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			throws(() => {
				subview(DataView, b, 4);
			});
		});

		void it('offset: under', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			throws(() => {
				subview(DataView, b, -1);
			});
		});

		void it('length', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 0, 1);
			strictEqual(dv.byteOffset, 0);
			strictEqual(dv.byteLength, 1);
			strictEqual(dv.getUint8(0), 0x61);
		});

		void it('length: end', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 0, 3);
			strictEqual(dv.byteOffset, 0);
			strictEqual(dv.byteLength, 3);
			strictEqual(dv.getUint8(0), 0x61);
			strictEqual(dv.getUint8(1), 0x62);
			strictEqual(dv.getUint8(2), 0x63);
		});

		void it('length: over', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			throws(() => {
				subview(DataView, b, 0, 4);
			});
		});

		void it('length: negative', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 0, -1);
			strictEqual(dv.byteOffset, 0);
			strictEqual(dv.byteLength, 3);
			strictEqual(dv.getUint8(0), 0x61);
			strictEqual(dv.getUint8(1), 0x62);
			strictEqual(dv.getUint8(2), 0x63);
		});

		void it('offset + length', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 1, 1);
			strictEqual(dv.byteOffset, 1);
			strictEqual(dv.byteLength, 1);
			strictEqual(dv.getUint8(0), 0x62);
		});

		void it('offset + length: end', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 1, 2);
			strictEqual(dv.byteOffset, 1);
			strictEqual(dv.byteLength, 2);
			strictEqual(dv.getUint8(0), 0x62);
			strictEqual(dv.getUint8(1), 0x63);
		});

		void it('offset + length: over', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			throws(() => {
				subview(DataView, b, 2, 2);
			});
		});

		void it('offset + length: negattive', () => {
			const b = new Uint8Array([0x61, 0x62, 0x63]);
			const dv = subview(DataView, b, 2, -1);
			strictEqual(dv.byteOffset, 2);
			strictEqual(dv.byteLength, 1);
			strictEqual(dv.getUint8(0), 0x63);
		});
	});
});
